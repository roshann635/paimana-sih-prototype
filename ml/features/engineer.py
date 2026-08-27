"""
PAIMANA Trajectory & Earned Value Management (EVM) Feature Engineering
(ml/features/engineer.py)

Combines Earned Value Management indicators (PV, EV, AC, SV, CV, SPI, CPI)
with longitudinal progress velocities, expenditure acceleration, and issue persistence.
"""

import os
import pandas as pd
import numpy as np
from typing import Tuple, List, Dict

FEATURE_COLUMNS = [
    # 1. EVM Core Metrics
    "pv",
    "ev",
    "ac",
    "sv",
    "cv",
    "spi",
    "cpi",
    "progress_gap",
    "critical_ratio",
    
    # 2. EVM Temporal Trends
    "spi_change_1m",
    "spi_change_3m",
    "spi_3m_avg",
    "spi_declining",
    "cpi_change_1m",
    "cpi_change_3m",
    "cpi_3m_avg",
    "cpi_declining",
    "evm_schedule_warning",
    "evm_cost_warning",

    # 3. Traditional Financial Features
    "cost_overrun_pct",
    "expenditure_pct",
    "budget_remaining",
    "cost_growth_1m",
    "cost_growth_3m",
    "expenditure_rate_1m",
    "expenditure_acceleration",
    "expenditure_to_progress_ratio",

    # 4. Schedule & Physical Milestone Features
    "schedule_slip_days",
    "schedule_slip_delta_3m",
    "days_elapsed",
    "elapsed_duration_pct",
    "days_remaining",
    "physical_progress_pct",
    "planned_progress_pct",
    "progress_velocity_1m",
    "progress_velocity_3m",
    "progress_velocity_6m",
    "progress_stagnation_months",
    "progress_to_time_ratio",

    # 5. Issue Load & Scale
    "issue_procurement",
    "issue_land",
    "issue_contractor",
    "issue_approval",
    "issue_count",
    "issue_persistence_3m",
    "log_original_cost",
    "log_revised_cost",
    "cost_band_idx",
    "sector_encoded",
    "ministry_encoded"
]

FEATURE_DISPLAY_NAMES = {
    "spi": "Schedule Performance Index (SPI)",
    "cpi": "Cost Performance Index (CPI)",
    "sv": "Schedule Variance (SV in ₹ Cr)",
    "cv": "Cost Variance (CV in ₹ Cr)",
    "progress_gap": "Physical vs Planned Progress Gap",
    "critical_ratio": "EVM Critical Ratio (SPI × CPI)",
    "spi_declining": "3-Month Declining SPI Trend",
    "cpi_declining": "3-Month Declining CPI Trend",
    "spi_change_1m": "1-Month SPI Delta",
    "spi_change_3m": "3-Month SPI Delta",
    "cpi_change_1m": "1-Month CPI Delta",
    "cpi_change_3m": "3-Month CPI Delta",
    "spi_3m_avg": "3-Month Rolling Average SPI",
    "cpi_3m_avg": "3-Month Rolling Average CPI",
    "evm_schedule_warning": "EVM Schedule Review Flag (SPI < 0.85)",
    "evm_cost_warning": "EVM Cost Review Flag (CPI < 0.90)",
    "pv": "Planned Value (PV)",
    "ev": "Earned Value (EV)",
    "ac": "Actual Cost (AC)",
    "progress_velocity_3m": "3-Month Progress Velocity",
    "schedule_slip_days": "Cumulative Schedule Slippage",
    "progress_stagnation_months": "Progress Stagnation Duration",
    "schedule_slip_delta_3m": "Recent Slippage Acceleration",
    "expenditure_to_progress_ratio": "Expenditure vs Progress Disparity",
    "cost_growth_3m": "3-Month Cost Growth Rate",
    "progress_to_time_ratio": "S-Curve Progress/Time Ratio",
    "issue_count": "Active Multi-Issue Count",
    "issue_persistence_3m": "Persistent Issue Load",
    "cost_overrun_pct": "Current Cost Overrun %",
    "elapsed_duration_pct": "Elapsed Project Lifetime %",
    "expenditure_acceleration": "Expenditure Acceleration",
    "progress_velocity_1m": "1-Month Progress Velocity",
    "cost_growth_1m": "1-Month Cost Escalation Rate",
    "expenditure_pct": "Budget Utilization %",
    "log_revised_cost": "Project Capital Exposure"
}

# Configurable illustrative thresholds (per MoSPI / SIH guidelines)
CONFIGURED_SPI_THRESHOLD = 0.85
CONFIGURED_CPI_THRESHOLD = 0.90

def compute_features(
    df_projects: pd.DataFrame,
    df_snapshots: pd.DataFrame,
    lookahead_months: int = 2
) -> pd.DataFrame:
    """
    Constructs rich trajectory, EVM, financial, and schedule features
    from master projects and longitudinal snapshots.
    """
    # Merge project static metadata into snapshots (dropping overlapping columns if present)
    meta_cols = [
        "project_id", "project_code", "project_name", "ministry",
        "sector", "state", "implementing_agency", "original_cost",
        "original_start_date", "original_end_date"
    ]
    overlap = [c for c in meta_cols if c in df_snapshots.columns and c != "project_id"]
    snap_clean = df_snapshots.drop(columns=overlap, errors="ignore")
    
    avail_meta = [c for c in meta_cols if c in df_projects.columns]
    merged = snap_clean.merge(
        df_projects[avail_meta],
        on="project_id",
        how="left"
    )
    
    # Sort chronologically
    merged = merged.sort_values(by=["project_id", "report_month"]).reset_index(drop=True)
    
    # Convert dates
    merged["snap_date"] = pd.to_datetime(merged["report_month"] + "-01")
    merged["orig_start_dt"] = pd.to_datetime(merged["original_start_date"])
    merged["orig_end_dt"] = pd.to_datetime(merged["original_end_date"])
    merged["curr_end_dt"] = pd.to_datetime(merged["current_end_date"])
    
    # Timeline Durations
    merged["days_elapsed"] = (merged["snap_date"] - merged["orig_start_dt"]).dt.days.clip(lower=1)
    orig_duration = (merged["orig_end_dt"] - merged["orig_start_dt"]).dt.days.clip(lower=30)
    merged["elapsed_duration_pct"] = (merged["days_elapsed"] / orig_duration) * 100.0
    merged["days_remaining"] = (merged["curr_end_dt"] - merged["snap_date"]).dt.days.clip(lower=0)
    
    # ----------------------------------------------------
    # 1. Earned Value Management (EVM) Core Calculations
    # ----------------------------------------------------
    # Planned progress is derived from elapsed lifetime or planned milestones
    if "planned_progress_pct" not in merged.columns or merged["planned_progress_pct"].isna().all():
        merged["planned_progress_pct"] = np.clip(
            merged["elapsed_duration_pct"],
            0.0,
            100.0
        )
    else:
        merged["planned_progress_pct"] = merged["planned_progress_pct"].fillna(merged["elapsed_duration_pct"]).clip(0.0, 100.0)

    # PV: Planned Value = Revised Project Cost * (Planned Progress % / 100)
    merged["pv"] = merged["revised_cost"] * (merged["planned_progress_pct"] / 100.0)
    
    # EV: Earned Value = Revised Project Cost * (Actual Physical Progress % / 100)
    merged["ev"] = merged["revised_cost"] * (merged["physical_progress_pct"] / 100.0)
    
    # AC: Actual Cost = Cumulative Expenditure
    merged["ac"] = merged["cumulative_expenditure"]
    
    # SV: Schedule Variance = EV - PV (₹ Cr)
    merged["sv"] = merged["ev"] - merged["pv"]
    
    # CV: Cost Variance = EV - AC (₹ Cr)
    merged["cv"] = merged["ev"] - merged["ac"]
    
    # SPI: Schedule Performance Index = EV / PV (guarded)
    # Clip between 0.05 and 2.50 to avoid infinite ratios on new projects
    pv_guarded = merged["pv"].clip(lower=1.0)
    merged["spi"] = np.clip(merged["ev"] / pv_guarded, 0.05, 2.50)
    
    # CPI: Cost Performance Index = EV / AC (guarded)
    ac_guarded = merged["ac"].clip(lower=1.0)
    merged["cpi"] = np.clip(merged["ev"] / ac_guarded, 0.05, 2.50)
    
    # Progress Gap (% points): Physical - Planned
    merged["progress_gap"] = merged["physical_progress_pct"] - merged["planned_progress_pct"]
    
    # Critical Ratio = SPI * CPI
    merged["critical_ratio"] = merged["spi"] * merged["cpi"]

    # ----------------------------------------------------
    # 2. EVM Temporal Trends & Lags
    # ----------------------------------------------------
    merged["prev_spi_1m"] = merged.groupby("project_id")["spi"].shift(1).fillna(merged["spi"])
    merged["prev_spi_3m"] = merged.groupby("project_id")["spi"].shift(3).fillna(merged["spi"])
    merged["spi_change_1m"] = merged["spi"] - merged["prev_spi_1m"]
    merged["spi_change_3m"] = merged["spi"] - merged["prev_spi_3m"]
    merged["spi_3m_avg"] = merged.groupby("project_id")["spi"].transform(
        lambda x: x.rolling(3, min_periods=1).mean()
    )
    merged["spi_declining"] = ((merged["spi_change_1m"] < 0) & (merged["spi_change_3m"] < 0)).astype(int)

    merged["prev_cpi_1m"] = merged.groupby("project_id")["cpi"].shift(1).fillna(merged["cpi"])
    merged["prev_cpi_3m"] = merged.groupby("project_id")["cpi"].shift(3).fillna(merged["cpi"])
    merged["cpi_change_1m"] = merged["cpi"] - merged["prev_cpi_1m"]
    merged["cpi_change_3m"] = merged["cpi"] - merged["prev_cpi_3m"]
    merged["cpi_3m_avg"] = merged.groupby("project_id")["cpi"].transform(
        lambda x: x.rolling(3, min_periods=1).mean()
    )
    merged["cpi_declining"] = ((merged["cpi_change_1m"] < 0) & (merged["cpi_change_3m"] < 0)).astype(int)

    # Configurable Review Triggers
    merged["evm_schedule_warning"] = (merged["spi"] < CONFIGURED_SPI_THRESHOLD).astype(int)
    merged["evm_cost_warning"] = (merged["cpi"] < CONFIGURED_CPI_THRESHOLD).astype(int)

    # ----------------------------------------------------
    # 3. Traditional Financial Features
    # ----------------------------------------------------
    merged["cost_overrun_pct"] = ((merged["revised_cost"] - merged["original_cost"]) / merged["original_cost"]) * 100.0
    merged["expenditure_pct"] = (merged["cumulative_expenditure"] / merged["revised_cost"].clip(lower=1.0)) * 100.0
    merged["budget_remaining"] = (merged["revised_cost"] - merged["cumulative_expenditure"]).clip(lower=0.0)
    
    merged["prev_revised_cost_1m"] = merged.groupby("project_id")["revised_cost"].shift(1).fillna(merged["original_cost"])
    merged["prev_revised_cost_3m"] = merged.groupby("project_id")["revised_cost"].shift(3).fillna(merged["original_cost"])
    merged["cost_growth_1m"] = (merged["revised_cost"] - merged["prev_revised_cost_1m"]) / merged["prev_revised_cost_1m"].clip(lower=1.0)
    merged["cost_growth_3m"] = (merged["revised_cost"] - merged["prev_revised_cost_3m"]) / merged["prev_revised_cost_3m"].clip(lower=1.0)
    
    merged["prev_exp_1m"] = merged.groupby("project_id")["cumulative_expenditure"].shift(1).fillna(0.0)
    merged["prev_exp_2m"] = merged.groupby("project_id")["cumulative_expenditure"].shift(2).fillna(0.0)
    merged["exp_delta_1m"] = (merged["cumulative_expenditure"] - merged["prev_exp_1m"]).clip(lower=0.0)
    merged["exp_delta_prev_1m"] = (merged["prev_exp_1m"] - merged["prev_exp_2m"]).clip(lower=0.0)
    merged["expenditure_rate_1m"] = merged["exp_delta_1m"] / merged["revised_cost"].clip(lower=1.0)
    merged["expenditure_acceleration"] = (merged["exp_delta_1m"] - merged["exp_delta_prev_1m"]) / merged["revised_cost"].clip(lower=1.0)
    
    # ----------------------------------------------------
    # 4. Schedule & Physical Velocities
    # ----------------------------------------------------
    merged["schedule_slip_days"] = merged["delay_days"].fillna(0).astype(float)
    merged["prev_delay_3m"] = merged.groupby("project_id")["schedule_slip_days"].shift(3).fillna(0.0)
    merged["schedule_slip_delta_3m"] = (merged["schedule_slip_days"] - merged["prev_delay_3m"]).clip(lower=0.0)
    
    merged["prog_1m_ago"] = merged.groupby("project_id")["physical_progress_pct"].shift(1).fillna(merged["physical_progress_pct"])
    merged["prog_3m_ago"] = merged.groupby("project_id")["physical_progress_pct"].shift(3).fillna(merged["physical_progress_pct"])
    merged["prog_6m_ago"] = merged.groupby("project_id")["physical_progress_pct"].shift(6).fillna(merged["physical_progress_pct"])
    
    merged["progress_velocity_1m"] = (merged["physical_progress_pct"] - merged["prog_1m_ago"]).clip(lower=-2.0, upper=25.0)
    merged["progress_velocity_3m"] = ((merged["physical_progress_pct"] - merged["prog_3m_ago"]) / 3.0).clip(lower=-2.0, upper=25.0)
    merged["progress_velocity_6m"] = ((merged["physical_progress_pct"] - merged["prog_6m_ago"]) / 6.0).clip(lower=-2.0, upper=25.0)
    
    # Progress Stagnation (Consecutive months with velocity < 0.3%)
    is_stagnant = (merged["progress_velocity_1m"] < 0.3).astype(int)
    merged["progress_stagnation_months"] = is_stagnant.groupby(
        (is_stagnant != is_stagnant.groupby(merged["project_id"]).shift()).cumsum()
    ).cumsum() * is_stagnant
    
    merged["progress_to_time_ratio"] = merged["physical_progress_pct"] / merged["elapsed_duration_pct"].clip(lower=1.0)
    merged["expenditure_to_progress_ratio"] = merged["expenditure_pct"] / merged["physical_progress_pct"].clip(lower=1.0)
    
    # ----------------------------------------------------
    # 5. Issue Loads & Project Scale
    # ----------------------------------------------------
    merged["issue_procurement"] = merged["issue_procurement"].fillna(0).astype(int)
    merged["issue_land"] = merged["issue_land"].fillna(0).astype(int)
    merged["issue_contractor"] = merged["issue_contractor"].fillna(0).astype(int)
    merged["issue_approval"] = merged["issue_approval"].fillna(0).astype(int)
    merged["issue_count"] = (
        merged["issue_procurement"] + merged["issue_land"] +
        merged["issue_contractor"] + merged["issue_approval"]
    )
    
    merged["issue_persistence_3m"] = merged.groupby("project_id")["issue_count"].transform(
        lambda x: x.rolling(3, min_periods=1).sum()
    )
    
    merged["log_original_cost"] = np.log1p(merged["original_cost"].clip(lower=1.0))
    merged["log_revised_cost"] = np.log1p(merged["revised_cost"].clip(lower=1.0))
    
    merged["cost_band_idx"] = pd.cut(
        merged["revised_cost"],
        bins=[-np.inf, 500.0, 2500.0, 10000.0, np.inf],
        labels=[0, 1, 2, 3]
    ).astype(int)
    
    sector_freq = merged["sector"].value_counts(normalize=True).to_dict()
    ministry_freq = merged["ministry"].value_counts(normalize=True).to_dict()
    merged["sector_encoded"] = merged["sector"].map(sector_freq).fillna(0.0)
    merged["ministry_encoded"] = merged["ministry"].map(ministry_freq).fillna(0.0)
    
    # ----------------------------------------------------
    # 6. Supervised Lookahead ML Targets
    # ----------------------------------------------------
    merged["_report_period"] = pd.to_datetime(merged["report_month"]).dt.to_period("M")
    future_lookup = merged.set_index(["project_id", "_report_period"])[["revised_cost", "delay_days"]]
    target_periods = merged["_report_period"] + lookahead_months
    target_keys = pd.MultiIndex.from_arrays([merged["project_id"], target_periods])
    future_values = future_lookup.reindex(target_keys)
    future_revised_cost = future_values["revised_cost"].set_axis(merged.index)
    future_delay_days = future_values["delay_days"].set_axis(merged.index)
    
    # Cost Overrun Target
    cost_escalation_future_pct = ((future_revised_cost - merged["revised_cost"]) / merged["revised_cost"].clip(lower=1.0)) * 100.0
    merged["target_cost_overrun"] = (cost_escalation_future_pct >= 4.0).astype(int)
    merged["target_cost_escalation_pct"] = cost_escalation_future_pct.fillna(0.0)
    
    # Time Overrun Target
    delay_delta_future = future_delay_days - merged["delay_days"]
    merged["target_time_overrun"] = (delay_delta_future >= 45).astype(int)
    merged["target_delay_delta_days"] = delay_delta_future.fillna(0.0)
    
    merged["has_future_target"] = future_revised_cost.notna().astype(int)
    merged = merged.drop(columns=["_report_period"])
    
    return merged

def generate_and_save_features(
    clean_projects_path: str = "data/processed/clean_projects.csv",
    clean_snapshots_path: str = "data/processed/clean_snapshots.csv",
    output_path: str = "data/processed/features_matrix.csv"
) -> pd.DataFrame:
    df_p = pd.read_csv(clean_projects_path)
    df_s = pd.read_csv(clean_snapshots_path)
    
    features_df = compute_features(df_p, df_s)
    features_df.to_csv(output_path, index=False)
    print(f"Feature matrix with EVM indicators computed with shape {features_df.shape} and saved to: {output_path}")
    return features_df

if __name__ == "__main__":
    generate_and_save_features()
