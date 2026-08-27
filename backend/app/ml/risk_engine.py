"""
Composite Risk & Intervention Priority Engine with EVM Integration
(backend/app/ml/risk_engine.py)

Computes multi-dimensional risk scores, RAGB classifications, trajectory trends,
EVM performance indicators (SPI, CPI, SV, CV), and the Intervention Priority Index (IPI).
"""

import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

class RiskEngine:
    """
    Computes Composite Risk (0-100), RAGB classification, EVM indicators,
    and the Intervention Priority Index (IPI) for ranking intervention urgency.
    """

    @staticmethod
    def compute_evm_strain(spi: float, cpi: float) -> float:
        """
        Calculates EVM strain component (0.0 to 1.0).
        High strain occurs when SPI < 0.85 or CPI < 0.90.
        """
        spi_deficit = min(1.0, max(0.0, (1.0 - spi) / 0.5))  # SPI 0.5 -> 1.0 strain
        cpi_deficit = min(1.0, max(0.0, (1.0 - cpi) / 0.5))  # CPI 0.5 -> 1.0 strain
        return float(0.50 * spi_deficit + 0.50 * cpi_deficit)

    @staticmethod
    def compute_deterioration_rate(
        schedule_slip_delta_3m: float,
        progress_stagnation_months: int,
        cost_growth_3m: float,
        spi_declining: int = 0,
        cpi_declining: int = 0
    ) -> float:
        """Calculates trajectory deterioration rate between 0.0 and 1.0."""
        slip_component = min(1.0, max(0.0, schedule_slip_delta_3m / 90.0))
        stag_component = min(1.0, max(0.0, progress_stagnation_months / 6.0))
        cost_component = min(1.0, max(0.0, cost_growth_3m * 10.0))
        evm_decay = 0.5 * float(spi_declining) + 0.5 * float(cpi_declining)
        
        deterioration = (
            0.35 * slip_component +
            0.25 * stag_component +
            0.20 * cost_component +
            0.20 * evm_decay
        )
        return float(np.clip(deterioration, 0.0, 1.0))

    @staticmethod
    def compute_urgency(
        elapsed_duration_pct: float,
        physical_progress_pct: float,
        planned_progress_pct: float = None
    ) -> float:
        """Calculates project schedule urgency / stage criticality."""
        plan = planned_progress_pct if planned_progress_pct is not None else elapsed_duration_pct
        norm_elapsed = min(1.2, max(0.1, elapsed_duration_pct / 100.0))
        prog_lag = max(0.0, plan - physical_progress_pct) / 100.0
        urgency = norm_elapsed * 0.4 + min(1.0, prog_lag) * 0.6
        return float(np.clip(urgency, 0.0, 1.0))

    @classmethod
    def compute_composite_risk(
        cls,
        cost_risk_prob: float,
        time_risk_prob: float,
        spi: float = 1.0,
        cpi: float = 1.0,
        schedule_slip_delta_3m: float = 0.0,
        progress_stagnation_months: int = 0,
        cost_growth_3m: float = 0.0,
        elapsed_duration_pct: float = 50.0,
        physical_progress_pct: float = 50.0,
        planned_progress_pct: float = None,
        spi_declining: int = 0,
        cpi_declining: int = 0
    ) -> Tuple[float, str]:
        """
        Base Risk = 0.30 * CostRisk + 0.30 * TimeRisk + 0.20 * EVMStrain + 0.10 * Deterioration + 0.10 * Urgency
        Returns (score: 0-100, level: GREEN|AMBER|ORANGE|RED)
        """
        evm_strain = cls.compute_evm_strain(spi, cpi)
        det = cls.compute_deterioration_rate(
            schedule_slip_delta_3m, progress_stagnation_months, cost_growth_3m,
            spi_declining, cpi_declining
        )
        urg = cls.compute_urgency(elapsed_duration_pct, physical_progress_pct, planned_progress_pct)
        
        base_risk = (
            0.30 * cost_risk_prob +
            0.30 * time_risk_prob +
            0.20 * evm_strain +
            0.10 * det +
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
            det_multiplier = 1.25
        elif trend_direction == "improving":
            det_multiplier = 0.85
        else:
            det_multiplier = 1.0
            
        ipi = composite_risk * exposure_factor * criticality_factor * det_multiplier
        return round(float(np.clip(ipi, 0.0, 100.0)), 1)

    @classmethod
    def evaluate_portfolio(
        cls,
        df: pd.DataFrame,
        cost_probs: np.ndarray or List[float] = None,
        time_probs: np.ndarray or List[float] = None
    ) -> pd.DataFrame:
        """
        Evaluates full portfolio feature matrix, computing composite scores, RAGB, and IPI.
        """
        df_out = df.copy()
        
        if cost_probs is not None:
            df_out["pred_cost_prob"] = cost_probs
        elif "pred_cost_prob" not in df_out.columns:
            df_out["pred_cost_prob"] = 0.5
            
        if time_probs is not None:
            df_out["pred_time_prob"] = time_probs
        elif "pred_time_prob" not in df_out.columns:
            df_out["pred_time_prob"] = 0.5
            
        composite_scores = []

        risk_levels = []
        ipi_scores = []
        
        for _, row in df_out.iterrows():
            score, level = cls.compute_composite_risk(
                cost_risk_prob=row.get("pred_cost_prob", 0.5),
                time_risk_prob=row.get("pred_time_prob", 0.5),
                spi=row.get("spi", 1.0),
                cpi=row.get("cpi", 1.0),
                schedule_slip_delta_3m=row.get("schedule_slip_delta_3m", 0.0),
                progress_stagnation_months=int(row.get("progress_stagnation_months", 0)),
                cost_growth_3m=row.get("cost_growth_3m", 0.0),
                elapsed_duration_pct=row.get("elapsed_duration_pct", 50.0),
                physical_progress_pct=row.get("physical_progress_pct", 50.0),
                planned_progress_pct=row.get("planned_progress_pct", 50.0),
                spi_declining=int(row.get("spi_declining", 0)),
                cpi_declining=int(row.get("cpi_declining", 0))
            )
            
            trend = "stable"
            if row.get("schedule_slip_delta_3m", 0) > 30 or row.get("cost_growth_3m", 0) > 0.05 or row.get("spi_declining", 0) == 1:
                trend = "deteriorating"
            elif row.get("progress_velocity_3m", 0) > 3.0:
                trend = "improving"
                
            rev_cost = row.get("revised_cost", row.get("original_cost", 500.0))
            del_days = int(row.get("delay_days", row.get("schedule_slip_days", 0)))
            
            ipi = cls.compute_ipi(score, rev_cost, del_days, trend)
            
            composite_scores.append(score)
            risk_levels.append(level)
            ipi_scores.append(ipi)
            
        df_out["composite_risk_score"] = composite_scores
        df_out["risk_level"] = risk_levels
        df_out["ipi_score"] = ipi_scores
        
        # Compute IPI Rank
        df_out["ipi_rank"] = df_out["ipi_score"].rank(ascending=False, method="dense").astype(int)
        
        return df_out
