"""
PAIMANA Trajectory Feature Engineering (ml/features/engineer.py)
Computes financial velocity, schedule slippage deltas, progress stagnation,
issue persistence, and lookahead supervision targets from monthly snapshots.
"""

import os
import pandas as pd
import numpy as np
from typing import Tuple, List, Dict

FEATURE_COLUMNS = [
    "cost_overrun_pct",
    "expenditure_pct",
    "budget_remaining",
    "cost_growth_1m",
    "cost_growth_3m",
    "expenditure_rate_1m",
    "expenditure_acceleration",
    "schedule_slip_days",
    "schedule_slip_delta_3m",
    "days_elapsed",
    "elapsed_duration_pct",
    "days_remaining",
    "physical_progress_pct",
    "progress_velocity_1m",
    "progress_velocity_3m",
    "progress_velocity_6m",
    "progress_stagnation_months",
    "progress_to_time_ratio",
    "expenditure_to_progress_ratio",
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
    "issue_contractor": "Contractor Performance Dispute",
    "issue_land": "Land Acquisition Delay",
    "issue_procurement": "Procurement Bottleneck",
    "issue_approval": "Regulatory Approval Delay",
    "progress_velocity_1m": "1-Month Progress Velocity",
    "cost_growth_1m": "1-Month Cost Escalation Rate",
    "expenditure_pct": "Budget Utilization %",
    "log_revised_cost": "Project Capital Exposure"
}

def compute_features(
    df_projects: pd.DataFrame,
    df_snapshots: pd.DataFrame,
    lookahead_months: int = 2
) -> pd.DataFrame:
    """
    Constructs rich trajectory and financial/schedule features from master projects and snapshots.
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
    
    # 1. Financial Features
    merged["cost_overrun_pct"] = ((merged["revised_cost"] - merged["original_cost"]) / merged["original_cost"]) * 100.0
    merged["expenditure_pct"] = (merged["cumulative_expenditure"] / merged["revised_cost"].clip(lower=1.0)) * 100.0
    merged["budget_remaining"] = (merged["revised_cost"] - merged["cumulative_expenditure"]).clip(lower=0.0)
    
    # Lags for cost & expenditure
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
    
    # 2. Schedule Features
    merged["schedule_slip_days"] = merged["delay_days"].fillna(0).astype(float)
    merged["prev_delay_3m"] = merged.groupby("project_id")["schedule_slip_days"].shift(3).fillna(0.0)
    merged["schedule_slip_delta_3m"] = (merged["schedule_slip_days"] - merged["prev_delay_3m"]).clip(lower=0.0)
    
    merged["days_elapsed"] = (merged["snap_date"] - merged["orig_start_dt"]).dt.days.clip(lower=1)
    orig_duration = (merged["orig_end_dt"] - merged["orig_start_dt"]).dt.days.clip(lower=30)
    merged["elapsed_duration_pct"] = (merged["days_elapsed"] / orig_duration) * 100.0
    merged["days_remaining"] = (merged["curr_end_dt"] - merged["snap_date"]).dt.days.clip(lower=0)
    
    # 3. Physical Progress & Velocities
    merged["prog_1m_ago"] = merged.groupby("project_id")["physical_progress_pct"].shift(1).fillna(merged["physical_progress_pct"])
    merged["prog_3m_ago"] = merged.groupby("project_id")["physical_progress_pct"].shift(3).fillna(merged["physical_progress_pct"])
    merged["prog_6m_ago"] = merged.groupby("project_id")["physical_progress_pct"].shift(6).fillna(merged["physical_progress_pct"])
    
    merged["progress_velocity_1m"] = (merged["physical_progress_pct"] - merged["prog_1m_ago"]).clip(lower=-2.0, upper=25.0)
    merged["progress_velocity_3m"] = ((merged["physical_progress_pct"] - merged["prog_3m_ago"]) / 3.0).clip(lower=-2.0, upper=25.0)
    merged["progress_velocity_6m"] = ((merged["physical_progress_pct"] - merged["prog_6m_ago"]) / 6.0).clip(lower=-2.0, upper=25.0)
    
    # Progress Stagnation (Consecutive months with progress velocity < 0.3%)
    is_stagnant = (merged["progress_velocity_1m"] < 0.3).astype(int)
    # Cumulative stagnation counter per project
    merged["progress_stagnation_months"] = is_stagnant.groupby(
        (is_stagnant != is_stagnant.groupby(merged["project_id"]).shift()).cumsum()
    ).cumsum() * is_stagnant
    
    # Ratios
    merged["progress_to_time_ratio"] = merged["physical_progress_pct"] / merged["elapsed_duration_pct"].clip(lower=1.0)
    merged["expenditure_to_progress_ratio"] = merged["expenditure_pct"] / merged["physical_progress_pct"].clip(lower=1.0)
    
    # 4. Issue Loads
    merged["issue_procurement"] = merged["issue_procurement"].fillna(0).astype(int)
    merged["issue_land"] = merged["issue_land"].fillna(0).astype(int)
    merged["issue_contractor"] = merged["issue_contractor"].fillna(0).astype(int)
    merged["issue_approval"] = merged["issue_approval"].fillna(0).astype(int)
    merged["issue_count"] = (
        merged["issue_procurement"] + merged["issue_land"] +
        merged["issue_contractor"] + merged["issue_approval"]
    )
    
    # 3-month rolling issue count
    merged["issue_persistence_3m"] = merged.groupby("project_id")["issue_count"].transform(
        lambda x: x.rolling(3, min_periods=1).sum()
    )
    
    # 5. Project Scale & Categoricals
    merged["log_original_cost"] = np.log1p(merged["original_cost"].clip(lower=1.0))
    merged["log_revised_cost"] = np.log1p(merged["revised_cost"].clip(lower=1.0))
    
    # Cost bands: 0: Small (<500), 1: Med (500-2500), 2: Large (2500-10000), 3: Mega (>10000)
    merged["cost_band_idx"] = pd.cut(
        merged["revised_cost"],
        bins=[-np.inf, 500.0, 2500.0, 10000.0, np.inf],
        labels=[0, 1, 2, 3]
    ).astype(int)
    
    # Frequency encoding for sector and ministry
    sector_freq = merged["sector"].value_counts(normalize=True).to_dict()
    ministry_freq = merged["ministry"].value_counts(normalize=True).to_dict()
    merged["sector_encoded"] = merged["sector"].map(sector_freq).fillna(0.0)
    merged["ministry_encoded"] = merged["ministry"].map(ministry_freq).fillna(0.0)
    
    # 6. Supervised ML Targets (Lookahead N months)
    future_revised_cost = merged.groupby("project_id")["revised_cost"].shift(-lookahead_months)
    future_delay_days = merged.groupby("project_id")["delay_days"].shift(-lookahead_months)
    
    # Cost Overrun Target: Future revised cost increases by >= 4%
    cost_escalation_future_pct = ((future_revised_cost - merged["revised_cost"]) / merged["revised_cost"].clip(lower=1.0)) * 100.0
    merged["target_cost_overrun"] = (cost_escalation_future_pct >= 4.0).astype(int)
    merged["target_cost_escalation_pct"] = cost_escalation_future_pct.fillna(0.0)
    
    # Time Overrun Target: Future delay increases by >= 45 days
    delay_delta_future = future_delay_days - merged["delay_days"]
    merged["target_time_overrun"] = (delay_delta_future >= 45).astype(int)
    merged["target_delay_delta_days"] = delay_delta_future.fillna(0.0)
    
    # Flag rows with valid future targets (for training vs inference)
    merged["has_future_target"] = future_revised_cost.notna().astype(int)
    
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
    print(f"Feature matrix computed with shape {features_df.shape} and saved to: {output_path}")
    return features_df

if __name__ == "__main__":
    generate_and_save_features()
