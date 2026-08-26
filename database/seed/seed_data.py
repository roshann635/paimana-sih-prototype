"""
Master Database Seeding & Pipeline Runner (database/seed/seed_data.py)
Executes the full end-to-end data lifecycle:
Dataset Ingestion -> Data Quality Engine -> Feature Engineering -> ML Training ->
Risk/IPI Calculation -> SHAP Attributions -> Alerts -> Benchmarks -> SQLite Seed.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

# Add root directory to PYTHONPATH
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.preprocessing.generator import generate_synthetic_dataset
from ml.preprocessing.validator import DataQualityEngine
from ml.features.engineer import compute_features, FEATURE_COLUMNS, FEATURE_DISPLAY_NAMES
from ml.models.trainer import train_risk_models
from ml.explainability.shap_engine import ShapExplainabilityEngine
from backend.app.ml.risk_engine import RiskEngine
from backend.app.database.session import engine, SessionLocal, init_db
from backend.app.database.schema import (
    Base, Project, ProjectSnapshot, RiskPrediction, RiskExplanation,
    EarlyWarningAlert, Intervention, Benchmark
)

def run_seed_pipeline(n_projects: int = 2000):
    print("=" * 70)
    print("PAIMANA AI DECISION SUPPORT SYSTEM - SEED & ML PIPELINE")
    print("=" * 70)
    
    # 1. Generate Synthetic & Historical Dataset
    print("\n[Step 1/7] Generating National Infrastructure Dataset (~2,000 projects)...")
    df_projects, df_snapshots = generate_synthetic_dataset(n_projects=n_projects)
    
    # 2. Validate with Data Quality Engine
    print("\n[Step 2/7] Executing Data Quality Engine (DQE)...")
    dqe = DataQualityEngine()
    clean_projects, clean_snapshots, dqe_report = dqe.validate_and_clean(df_projects, df_snapshots)
    
    # 3. Compute Trajectory Features
    print("\n[Step 3/7] Engineering Trajectory Features...")
    features_df = compute_features(clean_projects, clean_snapshots)
    features_df.to_csv("data/processed/features_matrix.csv", index=False)
    
    # 4. Train ML Models (Temporal Split)
    print("\n[Step 4/7] Training ML Models with Out-of-Time Validation...")
    train_risk_models(features_csv="data/processed/features_matrix.csv")
    
    # 5. Load Trained Models for Portfolio Inference
    print("\n[Step 5/7] Generating Risk Scores, IPI, and Trajectory Trends...")
    cost_model = joblib.load("ml/artifacts/xgb_cost_model.joblib")
    time_model = joblib.load("ml/artifacts/xgb_time_model.joblib")
    
    X_all = features_df[FEATURE_COLUMNS].fillna(0.0)
    cost_probs = cost_model.predict_proba(X_all)[:, 1]
    time_probs = time_model.predict_proba(X_all)[:, 1]
    
    portfolio_df = RiskEngine.evaluate_portfolio(features_df, cost_probs, time_probs)
    portfolio_df.to_csv("data/processed/portfolio_evaluated.csv", index=False)
    
    # 6. Initialize SHAP Explainer
    print("\n[Step 6/7] Initializing TreeSHAP Explainer...")
    shap_engine = ShapExplainabilityEngine()
    
    # 7. Seed Database
    print("\n[Step 7/7] Seeding SQLite Database with Full Relational Schema...")
    init_db()
    db = SessionLocal()
    
    # Clear existing tables
    db.query(RiskExplanation).delete()
    db.query(EarlyWarningAlert).delete()
    db.query(Intervention).delete()
    db.query(RiskPrediction).delete()
    db.query(ProjectSnapshot).delete()
    db.query(Benchmark).delete()
    db.query(Project).delete()
    db.commit()
    
    # Insert Projects
    print("  -> Inserting Projects...")
    project_records = []
    for _, row in clean_projects.iterrows():
        p = Project(
            project_id=row["project_id"],
            project_code=row["project_code"],
            project_name=row["project_name"],
            ministry=row["ministry"],
            sector=row["sector"],
            state=row["state"],
            implementing_agency=row["implementing_agency"],
            original_cost=float(row["original_cost"]),
            original_start_date=str(row["original_start_date"])[:10],
            original_end_date=str(row["original_end_date"])[:10],
            archetype=row.get("archetype", "healthy")
        )
        project_records.append(p)
    db.bulk_save_objects(project_records)
    db.commit()
    
    # Insert Project Snapshots & Risk Predictions
    print("  -> Inserting Snapshots, Predictions, and Trajectories...")
    snapshot_records = []
    prediction_records = []
    
    for _, row in portfolio_df.iterrows():
        s = ProjectSnapshot(
            project_id=row["project_id"],
            report_month=row["report_month"],
            revised_cost=float(row["revised_cost"]),
            cumulative_expenditure=float(row["cumulative_expenditure"]),
            physical_progress_pct=float(row["physical_progress_pct"]),
            delay_days=int(row.get("delay_days", 0)),
            current_end_date=str(row["current_end_date"])[:10],
            issue_procurement=int(row.get("issue_procurement", 0)),
            issue_land=int(row.get("issue_land", 0)),
            issue_contractor=int(row.get("issue_contractor", 0)),
            issue_approval=int(row.get("issue_approval", 0)),
            status=str(row.get("status", "Ongoing"))
        )
        snapshot_records.append(s)
        
        pred = RiskPrediction(
            project_id=row["project_id"],
            report_month=row["report_month"],
            cost_risk_probability=float(row["cost_risk_probability"]),
            time_risk_probability=float(row["time_risk_probability"]),
            expected_cost_overrun_pct=float(row.get("cost_overrun_pct", 0.0)),
            expected_delay_days=int(row.get("delay_days", 0)),
            composite_risk_score=float(row["composite_risk_score"]),
            risk_level=str(row["risk_level"]),
            ipi_score=float(row["ipi_score"]),
            ipi_rank=int(row.get("ipi_rank", 0)),
            trend_direction=str(row["trend_direction"]),
            model_version="v1.0-temporal-xgb"
        )
        prediction_records.append(pred)
        
    db.bulk_save_objects(snapshot_records)
    db.bulk_save_objects(prediction_records)
    db.commit()
    
    # Compute SHAP Explanations for the latest snapshot of all projects
    print("  -> Generating SHAP Feature Attributions and Root Cause Explanations...")
    latest_snaps = portfolio_df.sort_values(by=["project_id", "report_month"]).groupby("project_id").last().reset_index()
    
    explanation_records = []
    alert_records = []
    
    for _, row in latest_snaps.iterrows():
        pid = row["project_id"]
        m_str = row["report_month"]
        
        shap_res = shap_engine.explain_snapshot(row, top_n=5)
        
        for attr in shap_res["top_attributions"]:
            exp_obj = RiskExplanation(
                project_id=pid,
                report_month=m_str,
                feature_name=attr["feature_name"],
                feature_display_name=attr["display_name"],
                feature_value=float(attr["value"]),
                shap_value=float(attr["shap_value"]),
                direction=attr["direction"],
                rank=int(attr["rank"]),
                explanation_text=shap_res["diagnosis"]
            )
            explanation_records.append(exp_obj)
            
        # Generate Early Warning Alerts for High/Critical Risk Projects
        risk_score = float(row["composite_risk_score"])
        delay_d = int(row.get("delay_days", 0))
        trend = row.get("trend_direction", "stable")
        exp_ratio = float(row.get("expenditure_to_progress_ratio", 1.0))
        issue_c = int(row.get("issue_count", 0))
        
        if risk_score >= 75.0 or delay_d >= 180:
            if trend == "deteriorating":
                alert_records.append(EarlyWarningAlert(
                    project_id=pid,
                    report_month=m_str,
                    alert_code="RAPID_DETERIORATION",
                    severity="CRITICAL",
                    title="Rapid Risk Escalation Detected",
                    description=f"Project risk has surged with rapid slippage expansion over the last quarter."
                ))
            elif delay_d >= 365:
                alert_records.append(EarlyWarningAlert(
                    project_id=pid,
                    report_month=m_str,
                    alert_code="SEVERE_SCHEDULE_SLIPPAGE",
                    severity="CRITICAL",
                    title="Severe Schedule Slippage (>12 Months)",
                    description=f"Project has accumulated {delay_d} days of delay with stagnant progress."
                ))
            elif exp_ratio > 1.5:
                alert_records.append(EarlyWarningAlert(
                    project_id=pid,
                    report_month=m_str,
                    alert_code="EXPENDITURE_DISPARITY",
                    severity="WARNING",
                    title="Disproportionate Budget Drawdown",
                    description=f"Expenditure utilization is outpacing physical milestone execution."
                ))
            elif issue_c >= 2:
                alert_records.append(EarlyWarningAlert(
                    project_id=pid,
                    report_month=m_str,
                    alert_code="MULTI_BOTTLENECK",
                    severity="WARNING",
                    title="Concurrent Critical Path Bottlenecks",
                    description=f"Multiple concurrent impediments (contractor, land, or procurement) active."
                ))
                
    db.bulk_save_objects(explanation_records)
    db.bulk_save_objects(alert_records)
    db.commit()
    
    # Generate Initial Interventions for Top High-Priority Projects
    print("  -> Creating Initial Intervention Tracking Records...")
    top_priority_projects = latest_snaps.sort_values(by="ipi_score", ascending=False).head(25)
    intervention_records = []
    
    for idx, row in top_priority_projects.iterrows():
        pid = row["project_id"]
        shap_res = shap_engine.explain_snapshot(row, top_n=3)
        rec = shap_res["recommendations"][0] if shap_res["recommendations"] else {
            "type": "Schedule Recovery",
            "action": "Convene joint progress review."
        }
        
        status_choice = "RECOMMENDED" if idx % 3 == 0 else ("UNDER_REVIEW" if idx % 3 == 1 else "COMPLETED")
        post_score = float(row["composite_risk_score"]) - 18.0 if status_choice == "COMPLETED" else None
        
        inv = Intervention(
            project_id=pid,
            intervention_type=rec["type"],
            recommended_action=rec["action"],
            action_taken="High-level review meeting chaired by Joint Secretary; contractor timeline re-baselined." if status_choice != "RECOMMENDED" else None,
            assigned_to="Chief Monitoring Officer",
            status=status_choice,
            initial_risk_score=float(row["composite_risk_score"]),
            post_risk_score=post_score,
            created_at=datetime.utcnow()
        )
        intervention_records.append(inv)
        
    db.bulk_save_objects(intervention_records)
    db.commit()
    
    # Generate Sector & Size-Band Benchmarks
    print("  -> Computing Sector & Size-Band Benchmarks...")
    benchmark_records = []
    for sector_name, group in latest_snaps.groupby("sector"):
        med_cost_esc = float(group["cost_overrun_pct"].median())
        med_delay_m = float(group["delay_days"].median() / 30.4)
        med_vel = float(group["progress_velocity_3m"].median())
        med_risk = float(group["composite_risk_score"].median())
        
        b = Benchmark(
            sector=sector_name,
            cost_band="All Scales",
            median_cost_escalation_pct=round(med_cost_esc, 1),
            median_delay_months=round(med_delay_m, 1),
            median_progress_velocity=round(med_vel, 2),
            median_risk_score=round(med_risk, 1),
            sample_size=len(group)
        )
        benchmark_records.append(b)
        
    db.bulk_save_objects(benchmark_records)
    db.commit()
    db.close()
    
    print("\n" + "=" * 70)
    print("DATABASE SEED & ML PIPELINE COMPLETED SUCCESSFULLY!")
    print(f"Total Projects: {len(clean_projects)}")
    print(f"Total Snapshots: {len(portfolio_df)}")
    print(f"Active Alerts: {len(alert_records)}")
    print(f"Database File: data/paimana.db")
    print("=" * 70)

if __name__ == "__main__":
    run_seed_pipeline(n_projects=2000)
