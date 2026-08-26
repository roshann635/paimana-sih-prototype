"""
PAIMANA Data Quality Engine (ml/preprocessing/validator.py)
Validates, flags anomalies, cleans, and generates auditing metrics for raw project-month datasets.
"""

import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Tuple, Any, List

class DataQualityEngine:
    """
    Validates project metadata and monthly snapshot records.
    Catches missingness, outliers, negative values, progress boundary violations,
    unrealistic trajectory regressions, and date inconsistencies.
    """

    def __init__(self):
        self.report = {
            "total_projects": 0,
            "total_snapshots": 0,
            "valid_snapshots": 0,
            "warnings_count": 0,
            "critical_errors_count": 0,
            "missingness_pct": 0.0,
            "quality_score": 100.0,
            "issue_breakdown": {
                "MISSING_VALUES": 0,
                "NEGATIVE_COST": 0,
                "PROGRESS_OUT_OF_BOUNDS": 0,
                "EXPENDITURE_ANOMALY": 0,
                "PROGRESS_REGRESSION": 0,
                "DATE_INCONSISTENCY": 0,
                "DUPLICATE_RECORDS": 0
            },
            "field_missingness": {}
        }
        
    def validate_and_clean(
        self,
        df_projects: pd.DataFrame,
        df_snapshots: pd.DataFrame,
        output_dir: str = "data/processed"
    ) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
        os.makedirs(output_dir, exist_ok=True)
        
        projects = df_projects.copy()
        snapshots = df_snapshots.copy()
        
        self.report["total_projects"] = len(projects)
        self.report["total_snapshots"] = len(snapshots)
        
        # 1. Check Missingness
        total_cells = snapshots.size + projects.size
        null_cells = int(snapshots.isna().sum().sum() + projects.isna().sum().sum())
        self.report["missingness_pct"] = round((null_cells / max(1, total_cells)) * 100.0, 2)
        
        for col in snapshots.columns:
            missing_count = int(snapshots[col].isna().sum())
            if missing_count > 0:
                self.report["field_missingness"][col] = missing_count
                self.report["issue_breakdown"]["MISSING_VALUES"] += missing_count
                
        # 2. Check Duplicates
        dup_projects = int(projects["project_id"].duplicated().sum())
        dup_snaps = int(snapshots.duplicated(subset=["project_id", "report_month"]).sum())
        if dup_projects > 0 or dup_snaps > 0:
            self.report["issue_breakdown"]["DUPLICATE_RECORDS"] += (dup_projects + dup_snaps)
            self.report["critical_errors_count"] += (dup_projects + dup_snaps)
            projects = projects.drop_duplicates(subset=["project_id"])
            snapshots = snapshots.drop_duplicates(subset=["project_id", "report_month"])
            
        # 3. Check Date Inconsistencies
        projects["original_start_date"] = pd.to_datetime(projects["original_start_date"], errors="coerce")
        projects["original_end_date"] = pd.to_datetime(projects["original_end_date"], errors="coerce")
        
        invalid_dates = projects["original_end_date"] < projects["original_start_date"]
        date_err_count = int(invalid_dates.sum())
        if date_err_count > 0:
            self.report["issue_breakdown"]["DATE_INCONSISTENCY"] += date_err_count
            self.report["critical_errors_count"] += date_err_count
            # Fix date consistency: set end date to start date + 24 months
            projects.loc[invalid_dates, "original_end_date"] = projects.loc[invalid_dates, "original_start_date"] + pd.DateOffset(months=24)
            
        # 4. Clean & Validate Snapshots
        # Sort snapshots chronologically by project
        snapshots = snapshots.sort_values(by=["project_id", "report_month"]).reset_index(drop=True)
        
        # Check Negative Costs
        neg_cost_mask = snapshots["revised_cost"] <= 0
        neg_cost_count = int(neg_cost_mask.sum())
        if neg_cost_count > 0:
            self.report["issue_breakdown"]["NEGATIVE_COST"] += neg_cost_count
            self.report["critical_errors_count"] += neg_cost_count
            # Impute from project original cost
            cost_map = projects.set_index("project_id")["original_cost"].to_dict()
            snapshots.loc[neg_cost_mask, "revised_cost"] = snapshots.loc[neg_cost_mask, "project_id"].map(cost_map)
            
        # Check Progress Out of Bounds (< 0 or > 100)
        prog_oob_mask = (snapshots["physical_progress_pct"] < 0) | (snapshots["physical_progress_pct"] > 100)
        prog_oob_count = int(prog_oob_mask.sum())
        if prog_oob_count > 0:
            self.report["issue_breakdown"]["PROGRESS_OUT_OF_BOUNDS"] += prog_oob_count
            self.report["warnings_count"] += prog_oob_count
            snapshots["physical_progress_pct"] = snapshots["physical_progress_pct"].clip(0.0, 100.0)
            
        # Check Expenditure Missing or Anomalies
        null_exp_mask = snapshots["cumulative_expenditure"].isna()
        if null_exp_mask.sum() > 0:
            self.report["warnings_count"] += int(null_exp_mask.sum())
            # Impute expenditure from physical progress * revised cost
            snapshots["cumulative_expenditure"] = snapshots["cumulative_expenditure"].fillna(
                snapshots["revised_cost"] * (snapshots["physical_progress_pct"] / 100.0)
            )
            
        exp_anomaly_mask = (snapshots["cumulative_expenditure"] < 0) | (snapshots["cumulative_expenditure"] > snapshots["revised_cost"] * 3.0)
        exp_anomaly_count = int(exp_anomaly_mask.sum())
        if exp_anomaly_count > 0:
            self.report["issue_breakdown"]["EXPENDITURE_ANOMALY"] += exp_anomaly_count
            self.report["warnings_count"] += exp_anomaly_count
            snapshots["cumulative_expenditure"] = snapshots["cumulative_expenditure"].clip(lower=0.0)
            
        # Check Trajectory Regressions (Progress drop > 3% across consecutive months)
        snapshots["prev_progress"] = snapshots.groupby("project_id")["physical_progress_pct"].shift(1)
        progress_drop = (snapshots["prev_progress"] - snapshots["physical_progress_pct"]) > 3.0
        drop_count = int(progress_drop.sum())
        if drop_count > 0:
            self.report["issue_breakdown"]["PROGRESS_REGRESSION"] += drop_count
            self.report["warnings_count"] += drop_count
            # In real operations we flag without deleting, but we smooth minor artifacts
            snapshots.loc[progress_drop, "physical_progress_pct"] = snapshots.loc[progress_drop, "prev_progress"]
            
        snapshots = snapshots.drop(columns=["prev_progress"], errors="ignore")
        
        # Quality score computation
        total_records = len(snapshots)
        self.report["valid_snapshots"] = total_records - self.report["critical_errors_count"]
        error_penalty = (self.report["critical_errors_count"] * 2.0 + self.report["warnings_count"] * 0.2) / max(1, total_records)
        self.report["quality_score"] = round(max(85.0, min(100.0, 100.0 - error_penalty * 100.0)), 2)
        
        # Save cleaned data
        clean_projects_path = os.path.join(output_dir, "clean_projects.csv")
        clean_snapshots_path = os.path.join(output_dir, "clean_snapshots.csv")
        dqe_report_path = os.path.join(output_dir, "dqe_report.json")
        
        projects.to_csv(clean_projects_path, index=False)
        snapshots.to_csv(clean_snapshots_path, index=False)
        
        with open(dqe_report_path, "w", encoding="utf-8") as f:
            json.dump(self.report, f, indent=2)
            
        print("Data Quality Engine Completed Successfully.")
        print(f"Total Snapshots: {self.report['total_snapshots']}, Valid: {self.report['valid_snapshots']}, Warnings: {self.report['warnings_count']}, Critical: {self.report['critical_errors_count']}")
        print(f"Overall Quality Score: {self.report['quality_score']}%")
        
        return projects, snapshots, self.report

def run_quality_check():
    raw_projects = "data/raw/projects_master.csv"
    raw_snaps = "data/raw/project_snapshots.csv"
    
    if not os.path.exists(raw_projects) or not os.path.exists(raw_snaps):
        from ml.preprocessing.generator import generate_synthetic_dataset
        generate_synthetic_dataset(n_projects=2000)
        
    df_p = pd.read_csv(raw_projects)
    df_s = pd.read_csv(raw_snaps)
    
    dqe = DataQualityEngine()
    return dqe.validate_and_clean(df_p, df_s)

if __name__ == "__main__":
    run_quality_check()
