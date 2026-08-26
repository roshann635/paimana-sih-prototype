"""
SHAP Explainability Engine (ml/explainability/shap_engine.py)
Computes TreeSHAP feature attributions for risk models and generates
plain-English root cause diagnoses and targeted review action checklists.
"""

import os
import joblib
import numpy as np
import pandas as pd
import shap
from typing import Dict, List, Any, Tuple

from ml.features.engineer import FEATURE_COLUMNS, FEATURE_DISPLAY_NAMES

class ShapExplainabilityEngine:
    def __init__(
        self,
        cost_model_path: str = "ml/artifacts/xgb_cost_model.joblib",
        time_model_path: str = "ml/artifacts/xgb_time_model.joblib"
    ):
        self.cost_model = None
        self.time_model = None
        self.cost_explainer = None
        self.time_explainer = None
        
        if os.path.exists(cost_model_path) and os.path.exists(time_model_path):
            self.load_models(cost_model_path, time_model_path)

    def load_models(self, cost_model_path: str, time_model_path: str):
        self.cost_model = joblib.load(cost_model_path)
        self.time_model = joblib.load(time_model_path)
        self.cost_explainer = shap.TreeExplainer(self.cost_model)
        self.time_explainer = shap.TreeExplainer(self.time_model)

    def explain_snapshot(
        self,
        features_row: pd.Series or Dict[str, Any],
        top_n: int = 5
    ) -> Dict[str, Any]:
        """
        Computes SHAP feature importance for a single project-month feature vector.
        """
        if isinstance(features_row, dict):
            features_series = pd.Series(features_row)
        else:
            features_series = features_row
            
        x_vec = pd.DataFrame([features_series[FEATURE_COLUMNS].fillna(0.0)])
        
        # Calculate SHAP values
        cost_shap_vals = self.cost_explainer.shap_values(x_vec)[0]
        time_shap_vals = self.time_explainer.shap_values(x_vec)[0]
        
        # Combined weighted SHAP attribution (0.5 cost + 0.5 time)
        combined_shap = 0.5 * cost_shap_vals + 0.5 * time_shap_vals
        
        # Sort features by absolute contribution
        sorted_indices = np.argsort(np.abs(combined_shap))[::-1]
        
        attributions = []
        for rank, idx in enumerate(sorted_indices[:top_n], start=1):
            col_name = FEATURE_COLUMNS[idx]
            display_name = FEATURE_DISPLAY_NAMES.get(col_name, col_name.replace("_", " ").title())
            val = float(x_vec.iloc[0, idx])
            shap_val = float(combined_shap[idx])
            direction = "+" if shap_val > 0 else "-"
            
            attributions.append({
                "rank": rank,
                "feature_name": col_name,
                "display_name": display_name,
                "value": round(val, 2),
                "shap_value": round(shap_val, 4),
                "direction": direction,
                "impact": "Increases Risk" if direction == "+" else "Mitigates Risk"
            })
            
        # Generate Natural Language Diagnosis
        diagnosis = self.generate_narrative_diagnosis(features_series, attributions)
        recommendations = self.generate_review_checklist(features_series, attributions)
        
        return {
            "top_attributions": attributions,
            "diagnosis": diagnosis,
            "recommendations": recommendations,
            "cost_base_value": float(self.cost_explainer.expected_value),
            "time_base_value": float(self.time_explainer.expected_value)
        }

    def generate_narrative_diagnosis(
        self,
        row: pd.Series,
        attributions: List[Dict[str, Any]]
    ) -> str:
        """Generates plain-English explanation of why this project is high risk."""
        clauses = []
        
        vel_3m = row.get("progress_velocity_3m", 0.0)
        stag_months = row.get("progress_stagnation_months", 0)
        slip_days = row.get("schedule_slip_days", 0)
        slip_delta_3m = row.get("schedule_slip_delta_3m", 0)
        exp_ratio = row.get("expenditure_to_progress_ratio", 1.0)
        cost_growth = row.get("cost_growth_3m", 0.0)
        
        if stag_months >= 3:
            clauses.append(f"physical progress has stagnated with {int(stag_months)} consecutive months of near-zero velocity ({vel_3m:.1f}%/mo)")
        elif vel_3m < 1.0:
            clauses.append(f"progress velocity has slowed sharply to {vel_3m:.1f}%/month")
            
        if slip_days > 120:
            slip_months = int(round(slip_days / 30.4))
            if slip_delta_3m > 30:
                clauses.append(f"schedule slippage has widened rapidly to {slip_months} months (+{int(slip_delta_3m)} days over last quarter)")
            else:
                clauses.append(f"cumulative delay has reached {slip_months} months against original timeline")
                
        if exp_ratio > 1.4:
            clauses.append(f"financial expenditure is burning significantly ahead of physical milestones (ratio: {exp_ratio:.2f})")
        elif cost_growth > 0.05:
            clauses.append(f"revised project estimates expanded by {cost_growth*100:.1f}% over the last 3 months")
            
        # Issues
        issues = []
        if row.get("issue_contractor", 0) == 1:
            issues.append("contractor performance constraints")
        if row.get("issue_land", 0) == 1:
            issues.append("pending land acquisition clearances")
        if row.get("issue_approval", 0) == 1:
            issues.append("regulatory/statutory approval bottlenecks")
        if row.get("issue_procurement", 0) == 1:
            issues.append("equipment & material procurement delays")
            
        if issues:
            clauses.append(f"active critical path impediments include {', '.join(issues)}")
            
        if not clauses:
            return "Project risk profile is driven by baseline sector duration and capital exposure."
            
        return "Risk increased primarily because " + "; and ".join(clauses) + "."

    def generate_review_checklist(
        self,
        row: pd.Series,
        attributions: List[Dict[str, Any]]
    ) -> List[Dict[str, str]]:
        """Generates actionable review recommendations for monitoring officers."""
        checklist = []
        
        if row.get("progress_stagnation_months", 0) >= 2 or row.get("progress_velocity_3m", 0.0) < 1.0:
            checklist.append({
                "type": "Schedule Recovery",
                "action": "Convene joint site progress review with Project Management Unit to re-baseline critical path activities and evaluate deployment of catch-up crews."
            })
            
        if row.get("issue_contractor", 0) == 1:
            checklist.append({
                "type": "Contractor Review",
                "action": "Audit contractor cash flow, mobilization of specialized plant/machinery, and key sub-vendor delivery commitments."
            })
            
        if row.get("issue_land", 0) == 1:
            checklist.append({
                "type": "Land & Right-of-Way",
                "action": "Escalate unhanded encumbrance-free stretches to State Nodal Officer / District Collectorate for expedited joint measurement."
            })
            
        if row.get("issue_approval", 0) == 1:
            checklist.append({
                "type": "Inter-Agency Coordination",
                "action": "Trigger inter-ministerial coordination meeting on PM GatiShakti portal for pending environmental, forest, or railway safety approvals."
            })
            
        if row.get("expenditure_to_progress_ratio", 1.0) > 1.3 or row.get("cost_growth_3m", 0.0) > 0.04:
            checklist.append({
                "type": "Financial Audit",
                "action": "Review contract variations, price escalation clauses, and unmeasured works billing before approving additional budget sanctions."
            })
            
        if not checklist:
            checklist.append({
                "type": "Standard Monitoring",
                "action": "Continue routine monthly physical and financial verification according to standard OCMS protocols."
            })
            
        return checklist
