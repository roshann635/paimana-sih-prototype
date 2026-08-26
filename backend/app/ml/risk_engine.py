"""
Composite Risk & Intervention Priority Engine (backend/app/ml/risk_engine.py)
Computes multi-dimensional risk scores, RAGB classifications, trajectory trends,
and the Intervention Priority Index (IPI) for decision support.
"""

import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

class RiskEngine:
    """
    Computes Composite Risk (0-100), RAGB classification,
    and the Intervention Priority Index (IPI) for ranking intervention urgency.
    """

    @staticmethod
    def compute_deterioration_rate(
        schedule_slip_delta_3m: float,
        progress_stagnation_months: int,
        cost_growth_3m: float
    ) -> float:
        """Calculates trajectory deterioration rate between 0.0 and 1.0."""
        slip_component = min(1.0, max(0.0, schedule_slip_delta_3m / 90.0))
        stag_component = min(1.0, max(0.0, progress_stagnation_months / 6.0))
        cost_component = min(1.0, max(0.0, cost_growth_3m * 10.0))
        
        deterioration = 0.45 * slip_component + 0.35 * stag_component + 0.20 * cost_component
        return float(np.clip(deterioration, 0.0, 1.0))

    @staticmethod
    def compute_urgency(
        elapsed_duration_pct: float,
        physical_progress_pct: float
    ) -> float:
        """Calculates project schedule urgency / stage criticality."""
        norm_elapsed = min(1.2, max(0.1, elapsed_duration_pct / 100.0))
        prog_lag = max(0.0, (norm_elapsed * 100.0) - physical_progress_pct) / 100.0
        urgency = norm_elapsed * 0.4 + min(1.0, prog_lag) * 0.6
        return float(np.clip(urgency, 0.0, 1.0))

    @classmethod
    def compute_composite_risk(
        cls,
        cost_risk_prob: float,
        time_risk_prob: float,
        schedule_slip_delta_3m: float = 0.0,
        progress_stagnation_months: int = 0,
        cost_growth_3m: float = 0.0,
        elapsed_duration_pct: float = 50.0,
        physical_progress_pct: float = 50.0
    ) -> Tuple[float, str]:
        """
        Base Risk = 0.35 * CostRisk + 0.35 * TimeRisk + 0.20 * Deterioration + 0.10 * Urgency
        Returns (score: 0-100, level: GREEN|AMBER|ORANGE|RED)
        """
        det = cls.compute_deterioration_rate(schedule_slip_delta_3m, progress_stagnation_months, cost_growth_3m)
        urg = cls.compute_urgency(elapsed_duration_pct, physical_progress_pct)
        
        base_risk = (
            0.35 * cost_risk_prob +
            0.35 * time_risk_prob +
            0.20 * det +
            0.10 * urg
        )
        
        score = round(float(np.clip(base_risk * 100.0, 0.0, 100.0)), 1)
        
        if score < 25.0:
            level = "GREEN"
        elif score < 50.0:
            level = "AMBER"
        elif score < 75.0:
            level = "ORANGE"
        else:
            level = "RED"
            
        return score, level

    @staticmethod
    def compute_ipi(
        composite_risk: float,
        revised_cost_cr: float,
        delay_days: int,
        trend_direction: str = "stable"
    ) -> float:
        """
        Intervention Priority Index (IPI):
        IPI = Risk * ExposureFactor * CriticalityFactor * DeteriorationMultiplier
        """
        # Exposure factor: log scale of capex (50 Cr -> 0.75, 50,000 Cr -> 1.35)
        log_cost = math.log10(max(50.0, revised_cost_cr))
        exposure_factor = (log_cost / 4.7) * 0.4 + 0.7  # ~0.8 to 1.35
        
        # Schedule criticality factor
        criticality_factor = 1.0 + min(0.3, max(0.0, delay_days / 730.0))
        
        # Deterioration multiplier
        if trend_direction == "deteriorating":
            trend_mult = 1.15
        elif trend_direction == "improving":
            trend_mult = 0.88
        else:
            trend_mult = 1.0
            
        raw_ipi = (composite_risk / 100.0) * exposure_factor * criticality_factor * trend_mult * 85.0
        return round(float(np.clip(raw_ipi, 0.0, 100.0)), 1)

    @classmethod
    def evaluate_portfolio(
        cls,
        df_features: pd.DataFrame,
        cost_probs: np.ndarray,
        time_probs: np.ndarray
    ) -> pd.DataFrame:
        """
        Evaluates risk score, RAGB level, trajectory direction, and IPI ranking across all rows.
        """
        out = df_features.copy()
        out["cost_risk_probability"] = np.round(cost_probs, 4)
        out["time_risk_probability"] = np.round(time_probs, 4)
        
        composite_scores = []
        risk_levels = []
        
        for idx, row in out.iterrows():
            c_prob = row["cost_risk_probability"]
            t_prob = row["time_risk_probability"]
            slip_delta = row.get("schedule_slip_delta_3m", 0.0)
            stag_m = int(row.get("progress_stagnation_months", 0))
            cost_g = row.get("cost_growth_3m", 0.0)
            elap_pct = row.get("elapsed_duration_pct", 50.0)
            prog_pct = row.get("physical_progress_pct", 50.0)
            
            score, level = cls.compute_composite_risk(
                c_prob, t_prob, slip_delta, stag_m, cost_g, elap_pct, prog_pct
            )
            composite_scores.append(score)
            risk_levels.append(level)
            
        out["composite_risk_score"] = composite_scores
        out["risk_level"] = risk_levels
        
        # Calculate Trajectory Direction
        out["prev_risk_3m"] = out.groupby("project_id")["composite_risk_score"].shift(3).fillna(out["composite_risk_score"])
        risk_delta = out["composite_risk_score"] - out["prev_risk_3m"]
        
        directions = []
        for d in risk_delta:
            if d >= 6.0:
                directions.append("deteriorating")
            elif d <= -6.0:
                directions.append("improving")
            else:
                directions.append("stable")
        out["trend_direction"] = directions
        
        # Calculate IPI for every row
        ipis = []
        for idx, row in out.iterrows():
            ipi_val = cls.compute_ipi(
                composite_risk=row["composite_risk_score"],
                revised_cost_cr=row["revised_cost"],
                delay_days=int(row.get("delay_days", 0)),
                trend_direction=row["trend_direction"]
            )
            ipis.append(ipi_val)
            
        out["ipi_score"] = ipis
        
        # Latest snapshot rank
        latest_snaps = out.sort_values(by=["project_id", "report_month"]).groupby("project_id").last().reset_index()
        latest_snaps = latest_snaps.sort_values(by="ipi_score", ascending=False).reset_index(drop=True)
        latest_snaps["ipi_rank"] = range(1, len(latest_snaps) + 1)
        
        # Map rank back
        rank_map = latest_snaps.set_index("project_id")["ipi_rank"].to_dict()
        out["ipi_rank"] = out["project_id"].map(rank_map)
        
        return out
