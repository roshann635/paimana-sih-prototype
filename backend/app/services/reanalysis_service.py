"""
Re-Analysis & Monthly Ingestion Service (backend/app/services/reanalysis_service.py)
Implements the FEEDBACK LOOP — the most critical missing component.

Pipeline:
  New Monthly Data → DQE Validation → Feature Engineering → XGBoost Inference →
  Composite Risk / IPI → SHAP Explanations → Early Warning Alerts → DB Persist

This service can be triggered via:
  POST /api/v1/pipeline/reanalyze       — re-score all projects on existing data
  POST /api/v1/data/ingest-monthly      — ingest new CSV/JSON and re-analyze
"""

import os
import io
import json
import logging
import traceback
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

logger = logging.getLogger(__name__)

# ML pipeline imports
import sys
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.features.engineer import compute_features, FEATURE_COLUMNS, FEATURE_DISPLAY_NAMES
from ml.preprocessing.validator import DataQualityEngine
# ShapExplainabilityEngine imported lazily in _ensure_models_loaded() to avoid
# hard dependency on `shap` at module load time.
from backend.app.ml.risk_engine import RiskEngine
from backend.app.database.schema import (
    Project, ProjectSnapshot, RiskPrediction, RiskExplanation,
    EarlyWarningAlert, Benchmark
)

# Paths to trained model artifacts
ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml/artifacts"))
COST_MODEL_PATH = os.path.join(ARTIFACTS_DIR, "xgb_cost_model.joblib")
TIME_MODEL_PATH = os.path.join(ARTIFACTS_DIR, "xgb_time_model.joblib")
COST_REG_PATH = os.path.join(ARTIFACTS_DIR, "xgb_cost_regressor.joblib")
TIME_REG_PATH = os.path.join(ARTIFACTS_DIR, "xgb_time_regressor.joblib")


class ReanalysisService:
    """
    Encapsulates the closed-loop re-analysis pipeline.
    Loads trained XGBoost models once and provides methods for:
      - Full portfolio re-scoring
      - Incremental monthly data ingestion
    """

    def __init__(self):
        self.cost_model = None
        self.time_model = None
        self.cost_regressor = None
        self.time_regressor = None
        self.shap_engine = None
        self._loaded = False

    def _ensure_models_loaded(self):
        """Lazy-loads ML models on first use."""
        if self._loaded:
            return
        try:
            if os.path.exists(COST_MODEL_PATH) and os.path.exists(TIME_MODEL_PATH):
                self.cost_model = joblib.load(COST_MODEL_PATH)
                self.time_model = joblib.load(TIME_MODEL_PATH)
            if os.path.exists(COST_REG_PATH):
                self.cost_regressor = joblib.load(COST_REG_PATH)
            if os.path.exists(TIME_REG_PATH):
                self.time_regressor = joblib.load(TIME_REG_PATH)
        except Exception as e:
            logger.warning(f"ML models could not be loaded ({e}). Using heuristic fallback.")
            self.cost_model = None
            self.time_model = None

        try:
            from ml.explainability.shap_engine import ShapExplainabilityEngine
            if self.cost_model is not None:
                self.shap_engine = ShapExplainabilityEngine()
        except Exception:
            self.shap_engine = None  # SHAP/XGBoost not available
        self._loaded = True

    # ------------------------------------------------------------------
    # 1. FULL PORTFOLIO RE-ANALYSIS (on existing DB data)
    # ------------------------------------------------------------------
    def reanalyze_portfolio(self, db: Session) -> Dict[str, Any]:
        """
        Re-runs the entire ML → Risk → SHAP → Alert pipeline on all existing
        project snapshots in the database. This is the FEEDBACK LOOP trigger.
        """
        self._ensure_models_loaded()
        started = datetime.utcnow()

        # 1. Extract current data from DB
        projects = db.query(Project).all()
        snapshots = db.query(ProjectSnapshot).all()

        if not projects or not snapshots:
            return {"status": "NO_DATA", "message": "Database contains no projects or snapshots."}

        df_projects = pd.DataFrame([{
            "project_id": p.project_id, "project_code": p.project_code,
            "project_name": p.project_name, "ministry": p.ministry,
            "sector": p.sector, "state": p.state,
            "implementing_agency": p.implementing_agency,
            "original_cost": p.original_cost,
            "original_start_date": p.original_start_date,
            "original_end_date": p.original_end_date
        } for p in projects])

        df_snapshots = pd.DataFrame([{
            "project_id": s.project_id, "report_month": s.report_month,
            "revised_cost": s.revised_cost,
            "cumulative_expenditure": s.cumulative_expenditure,
            "physical_progress_pct": s.physical_progress_pct,
            "planned_progress_pct": s.planned_progress_pct or 0.0,
            "delay_days": s.delay_days,
            "current_end_date": s.current_end_date,
            "issue_procurement": s.issue_procurement,
            "issue_land": s.issue_land,
            "issue_contractor": s.issue_contractor,
            "issue_approval": s.issue_approval,
            "status": s.status
        } for s in snapshots])

        # 2. Feature Engineering
        features_df = compute_features(df_projects, df_snapshots)

        # 3. ML Inference
        X_all = features_df[FEATURE_COLUMNS].fillna(0.0)
        if self.cost_model is not None and self.time_model is not None:
            cost_probs = self.cost_model.predict_proba(X_all)[:, 1]
            time_probs = self.time_model.predict_proba(X_all)[:, 1]
        else:
            cpi_vals = features_df["cpi"].fillna(1.0).values if "cpi" in features_df.columns else np.ones(len(X_all))
            spi_vals = features_df["spi"].fillna(1.0).values if "spi" in features_df.columns else np.ones(len(X_all))
            cost_probs = np.clip(1.0 - cpi_vals, 0.1, 0.9)
            time_probs = np.clip(1.0 - spi_vals, 0.1, 0.9)

        # Regression forecasts
        cost_forecast = self.cost_regressor.predict(X_all) if self.cost_regressor else np.zeros(len(X_all))
        delay_forecast = self.time_regressor.predict(X_all) if self.time_regressor else np.zeros(len(X_all))

        # 4. Composite Risk + IPI
        portfolio_df = RiskEngine.evaluate_portfolio(features_df, cost_probs, time_probs)
        portfolio_df["cost_risk_probability"] = cost_probs
        portfolio_df["time_risk_probability"] = time_probs
        portfolio_df["expected_cost_overrun_pct"] = cost_forecast
        portfolio_df["expected_delay_days_forecast"] = delay_forecast

        # 5. Persist updated predictions (delete old, insert new)
        latest_month = portfolio_df["report_month"].max()
        latest_df = portfolio_df[portfolio_df["report_month"] == latest_month]

        # Clear previous predictions and explanations for re-scored month
        db.query(RiskPrediction).filter(RiskPrediction.report_month == latest_month).delete()
        db.query(RiskExplanation).filter(RiskExplanation.report_month == latest_month).delete()
        db.query(EarlyWarningAlert).filter(EarlyWarningAlert.report_month == latest_month).delete()
        db.commit()

        # Update snapshot EVM fields
        self._update_snapshot_evm(db, portfolio_df)

        # Insert new predictions
        pred_count = self._insert_predictions(db, portfolio_df)

        # 6. SHAP Explanations (for latest month only)
        exp_count = self._generate_shap_explanations(db, latest_df)

        # 7. Early Warning Alerts
        alert_count = self._generate_alerts(db, latest_df)

        # 8. Update Benchmarks
        self._update_benchmarks(db, latest_df)

        db.commit()
        elapsed = (datetime.utcnow() - started).total_seconds()

        return {
            "status": "COMPLETED",
            "pipeline": "FULL_PORTFOLIO_REANALYSIS",
            "timestamp": datetime.utcnow().isoformat(),
            "elapsed_seconds": round(elapsed, 2),
            "report_month": latest_month,
            "projects_scored": len(latest_df["project_id"].unique()),
            "total_snapshots_processed": len(portfolio_df),
            "predictions_written": pred_count,
            "shap_explanations_written": exp_count,
            "alerts_generated": alert_count,
            "risk_distribution": {
                "RED": int((latest_df["risk_level"] == "RED").sum()),
                "ORANGE": int((latest_df["risk_level"] == "ORANGE").sum()),
                "AMBER": int((latest_df["risk_level"] == "AMBER").sum()),
                "GREEN": int((latest_df["risk_level"] == "GREEN").sum()),
            }
        }

    # ------------------------------------------------------------------
    # 2. MONTHLY DATA INGESTION + RE-ANALYSIS
    # ------------------------------------------------------------------
    def ingest_monthly_data(
        self,
        db: Session,
        new_snapshots: List[Dict[str, Any]],
        report_month: str
    ) -> Dict[str, Any]:
        """
        Ingests new monthly snapshot records and triggers full re-analysis.
        This is the primary entry point for the continuous monitoring loop.

        Steps:
          1. Validate new data via Data Quality Engine
          2. Insert/update snapshots in DB
          3. Re-run ML inference + risk scoring
          4. Generate new SHAP + alerts
          5. Return ingestion + re-analysis summary
        """
        self._ensure_models_loaded()
        started = datetime.utcnow()

        if not new_snapshots:
            return {"status": "ERROR", "message": "No snapshot data provided."}

        # 1. Build DataFrames for DQE validation
        df_new = pd.DataFrame(new_snapshots)

        # Ensure required columns
        required_cols = [
            "project_id", "revised_cost", "cumulative_expenditure",
            "physical_progress_pct", "delay_days", "current_end_date"
        ]
        missing_cols = [c for c in required_cols if c not in df_new.columns]
        if missing_cols:
            return {"status": "ERROR", "message": f"Missing required columns: {missing_cols}"}

        # Fill report_month if not in records
        if "report_month" not in df_new.columns:
            df_new["report_month"] = report_month

        # Fill defaults for optional columns
        for col, default in [
            ("issue_procurement", 0), ("issue_land", 0),
            ("issue_contractor", 0), ("issue_approval", 0),
            ("status", "Ongoing"), ("planned_progress_pct", 0.0)
        ]:
            if col not in df_new.columns:
                df_new[col] = default

        # 2. Validate incoming data
        dqe = DataQualityEngine()
        dqe.report["total_snapshots"] = len(df_new)

        # Basic validations inline (no need for full project validation)
        invalid_progress = (df_new["physical_progress_pct"] < 0) | (df_new["physical_progress_pct"] > 100)
        if invalid_progress.any():
            df_new["physical_progress_pct"] = df_new["physical_progress_pct"].clip(0.0, 100.0)
            dqe.report["warnings_count"] += int(invalid_progress.sum())

        neg_cost = df_new["revised_cost"] <= 0
        if neg_cost.any():
            dqe.report["critical_errors_count"] += int(neg_cost.sum())

        dqe.report["valid_snapshots"] = len(df_new) - dqe.report["critical_errors_count"]
        dqe.report["quality_score"] = round(
            max(85.0, 100.0 - (dqe.report["critical_errors_count"] * 2.0 + dqe.report["warnings_count"] * 0.2) / max(1, len(df_new)) * 100.0),
            2
        )

        # 3. Insert/update snapshots in DB
        inserted = 0
        updated = 0
        valid_project_ids = set(
            pid for (pid,) in db.query(Project.project_id).all()
        )

        for _, row in df_new.iterrows():
            pid = str(row["project_id"])
            if pid not in valid_project_ids:
                continue  # Skip snapshots for unknown projects

            existing = db.query(ProjectSnapshot).filter(
                ProjectSnapshot.project_id == pid,
                ProjectSnapshot.report_month == report_month
            ).first()

            if existing:
                # Update existing snapshot
                existing.revised_cost = float(row["revised_cost"])
                existing.cumulative_expenditure = float(row["cumulative_expenditure"])
                existing.physical_progress_pct = float(row["physical_progress_pct"])
                existing.planned_progress_pct = float(row.get("planned_progress_pct", 0.0))
                existing.delay_days = int(row["delay_days"])
                existing.current_end_date = str(row["current_end_date"])[:10]
                existing.issue_procurement = int(row.get("issue_procurement", 0))
                existing.issue_land = int(row.get("issue_land", 0))
                existing.issue_contractor = int(row.get("issue_contractor", 0))
                existing.issue_approval = int(row.get("issue_approval", 0))
                existing.status = str(row.get("status", "Ongoing"))
                updated += 1
            else:
                # Insert new snapshot
                snap = ProjectSnapshot(
                    project_id=pid,
                    report_month=report_month,
                    revised_cost=float(row["revised_cost"]),
                    cumulative_expenditure=float(row["cumulative_expenditure"]),
                    physical_progress_pct=float(row["physical_progress_pct"]),
                    planned_progress_pct=float(row.get("planned_progress_pct", 0.0)),
                    delay_days=int(row["delay_days"]),
                    current_end_date=str(row["current_end_date"])[:10],
                    issue_procurement=int(row.get("issue_procurement", 0)),
                    issue_land=int(row.get("issue_land", 0)),
                    issue_contractor=int(row.get("issue_contractor", 0)),
                    issue_approval=int(row.get("issue_approval", 0)),
                    status=str(row.get("status", "Ongoing"))
                )
                db.add(snap)
                inserted += 1

        db.commit()

        # 4. Trigger full portfolio re-analysis with the updated data
        reanalysis_result = self.reanalyze_portfolio(db)

        elapsed = (datetime.utcnow() - started).total_seconds()

        return {
            "status": "COMPLETED",
            "pipeline": "MONTHLY_INGESTION_AND_REANALYSIS",
            "timestamp": datetime.utcnow().isoformat(),
            "elapsed_seconds": round(elapsed, 2),
            "ingestion": {
                "report_month": report_month,
                "records_received": len(df_new),
                "snapshots_inserted": inserted,
                "snapshots_updated": updated,
                "skipped_unknown_projects": len(df_new) - inserted - updated,
                "data_quality": {
                    "quality_score": dqe.report["quality_score"],
                    "warnings": dqe.report["warnings_count"],
                    "critical_errors": dqe.report["critical_errors_count"]
                }
            },
            "reanalysis": reanalysis_result
        }

    # ------------------------------------------------------------------
    # INTERNAL HELPERS
    # ------------------------------------------------------------------
    def _update_snapshot_evm(self, db: Session, portfolio_df: pd.DataFrame):
        """Updates EVM fields (PV, EV, AC, SV, CV, SPI, CPI) on existing snapshots."""
        evm_cols = ["pv", "ev", "ac", "sv", "cv", "spi", "cpi", "critical_ratio", "planned_progress_pct"]
        available = [c for c in evm_cols if c in portfolio_df.columns]
        if not available:
            return

        latest_month = portfolio_df["report_month"].max()
        latest = portfolio_df[portfolio_df["report_month"] == latest_month]

        for _, row in latest.iterrows():
            snap = db.query(ProjectSnapshot).filter(
                ProjectSnapshot.project_id == row["project_id"],
                ProjectSnapshot.report_month == latest_month
            ).first()
            if snap:
                for col in available:
                    val = row.get(col)
                    if val is not None and not (isinstance(val, float) and np.isnan(val)):
                        setattr(snap, col, float(val))

    def _insert_predictions(self, db: Session, portfolio_df: pd.DataFrame) -> int:
        """Inserts RiskPrediction records for every project-month in portfolio_df."""
        pred_records = []
        for _, row in portfolio_df.iterrows():
            pred = RiskPrediction(
                project_id=row["project_id"],
                report_month=row["report_month"],
                cost_risk_probability=float(row.get("cost_risk_probability", 0.5)),
                time_risk_probability=float(row.get("time_risk_probability", 0.5)),
                expected_cost_overrun_pct=float(row.get("expected_cost_overrun_pct", row.get("cost_overrun_pct", 0.0))),
                expected_delay_days=int(row.get("delay_days", 0)),
                spi=float(row.get("spi", 1.0)),
                cpi=float(row.get("cpi", 1.0)),
                sv=float(row.get("sv", 0.0)),
                cv=float(row.get("cv", 0.0)),
                composite_risk_score=float(row["composite_risk_score"]),
                risk_level=str(row["risk_level"]),
                ipi_score=float(row["ipi_score"]),
                ipi_rank=int(row.get("ipi_rank", 0)),
                trend_direction=str(row.get("trend_direction", "stable")),
                model_version="v2.0-temporal-hardened"
            )
            pred_records.append(pred)

        db.bulk_save_objects(pred_records)
        db.commit()
        return len(pred_records)

    def _generate_shap_explanations(self, db: Session, latest_df: pd.DataFrame) -> int:
        """Generates SHAP feature attributions for the latest snapshot of each project."""
        if self.shap_engine is None or self.shap_engine.cost_model is None:
            return 0

        exp_records = []
        latest_by_project = latest_df.sort_values("report_month").groupby("project_id").last().reset_index()

        for _, row in latest_by_project.iterrows():
            try:
                shap_res = self.shap_engine.explain_snapshot(row, top_n=5)
                for attr in shap_res["top_attributions"]:
                    exp_records.append(RiskExplanation(
                        project_id=row["project_id"],
                        report_month=row["report_month"],
                        feature_name=attr["feature_name"],
                        feature_display_name=attr["display_name"],
                        feature_value=float(attr["value"]),
                        shap_value=float(attr["shap_value"]),
                        direction=attr["direction"],
                        rank=int(attr["rank"]),
                        explanation_text=shap_res["diagnosis"]
                    ))
            except Exception:
                continue  # Skip projects where SHAP fails (edge case)

        if exp_records:
            db.bulk_save_objects(exp_records)
            db.commit()
        return len(exp_records)

    def _generate_alerts(self, db: Session, latest_df: pd.DataFrame) -> int:
        """Generates Early Warning Alerts for high-risk/deteriorating projects."""
        alert_records = []
        latest_by_project = latest_df.sort_values("report_month").groupby("project_id").last().reset_index()

        for _, row in latest_by_project.iterrows():
            pid = row["project_id"]
            risk_score = float(row.get("composite_risk_score", 0))
            delay_d = int(row.get("delay_days", 0))
            trend = str(row.get("trend_direction", "stable"))
            exp_ratio = float(row.get("expenditure_to_progress_ratio", 1.0))
            issue_c = int(row.get("issue_count", 0))
            report_m = row["report_month"]

            if risk_score >= 75.0 or delay_d >= 180:
                if trend == "deteriorating":
                    alert_records.append(EarlyWarningAlert(
                        project_id=pid, report_month=report_m,
                        alert_code="RAPID_DETERIORATION", severity="CRITICAL",
                        title="Rapid Risk Escalation Detected",
                        description="Project risk has surged with rapid slippage expansion over the last quarter."
                    ))
                elif delay_d >= 365:
                    alert_records.append(EarlyWarningAlert(
                        project_id=pid, report_month=report_m,
                        alert_code="SEVERE_SCHEDULE_SLIPPAGE", severity="CRITICAL",
                        title="Severe Schedule Slippage (>12 Months)",
                        description=f"Project has accumulated {delay_d} days of delay with stagnant progress."
                    ))
                elif exp_ratio > 1.5:
                    alert_records.append(EarlyWarningAlert(
                        project_id=pid, report_month=report_m,
                        alert_code="EXPENDITURE_DISPARITY", severity="WARNING",
                        title="Disproportionate Budget Drawdown",
                        description="Expenditure utilization is outpacing physical milestone execution."
                    ))
                elif issue_c >= 2:
                    alert_records.append(EarlyWarningAlert(
                        project_id=pid, report_month=report_m,
                        alert_code="MULTI_BOTTLENECK", severity="WARNING",
                        title="Concurrent Critical Path Bottlenecks",
                        description="Multiple concurrent impediments (contractor, land, or procurement) active."
                    ))

        if alert_records:
            db.bulk_save_objects(alert_records)
            db.commit()
        return len(alert_records)

    def _update_benchmarks(self, db: Session, latest_df: pd.DataFrame):
        """Recomputes sector benchmarks from latest evaluated data."""
        db.query(Benchmark).delete()
        db.commit()

        benchmark_records = []
        for sector_name, group in latest_df.groupby("sector"):
            med_cost_esc = float(group.get("cost_overrun_pct", pd.Series([0.0])).median())
            med_delay_m = float(group.get("delay_days", pd.Series([0])).median() / 30.4)
            med_vel = float(group.get("progress_velocity_3m", pd.Series([0.0])).median())
            med_risk = float(group.get("composite_risk_score", pd.Series([0.0])).median())

            benchmark_records.append(Benchmark(
                sector=sector_name,
                cost_band="All Scales",
                median_cost_escalation_pct=round(med_cost_esc, 1),
                median_delay_months=round(med_delay_m, 1),
                median_progress_velocity=round(med_vel, 2),
                median_risk_score=round(med_risk, 1),
                sample_size=len(group)
            ))

        if benchmark_records:
            db.bulk_save_objects(benchmark_records)
            db.commit()


# Singleton instance
reanalysis_service = ReanalysisService()
