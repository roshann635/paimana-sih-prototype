"""
Model Training Pipeline (ml/models/trainer.py)
Trains XGBoost classification & regression models with strict out-of-time temporal validation,
evaluates against Logistic Regression baseline, and exports model artifacts.
"""

import os
import joblib
import json
import pandas as pd
import numpy as np
from xgboost import XGBClassifier, XGBRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from ml.features.engineer import FEATURE_COLUMNS
from ml.evaluation.metrics import evaluate_binary_model, evaluate_regression_model, save_model_health_report

def train_risk_models(
    features_csv: str = "data/processed/features_matrix.csv",
    artifacts_dir: str = "ml/artifacts",
    split_month: str = "2025-08"
):
    os.makedirs(artifacts_dir, exist_ok=True)
    
    df = pd.read_csv(features_csv)
    
    # Filter rows with lookahead future targets for training & validation
    labeled_df = df[df["has_future_target"] == 1].copy()
    
    if len(labeled_df) == 0:
        raise ValueError(
            "No rows contain future targets (has_future_target == 1). "
            "Generate sufficient historical snapshots with adequate "
            "lookahead horizon before training. Use lookahead_months "
            "parameter in compute_features() to control the target window."
        )

    # Ensure report_month is zero-padded YYYY-MM for correct temporal ordering
    labeled_df["report_month"] = pd.to_datetime(
        labeled_df["report_month"]
    ).dt.strftime("%Y-%m")

    # Dynamic or explicit temporal split
    unique_months = sorted(labeled_df["report_month"].unique())
    if split_month not in unique_months or len(unique_months) < 2:
        split_idx = max(0, int(len(unique_months) * 0.65))
        split_month = unique_months[split_idx] if len(unique_months) > 0 else "2026-02"

    train_mask = labeled_df["report_month"] <= split_month
    test_mask = labeled_df["report_month"] > split_month
    
    df_train = labeled_df[train_mask].reset_index(drop=True)
    df_test = labeled_df[test_mask].reset_index(drop=True)
    
    if len(df_test) == 0 or len(df_train) == 0:
        # Fallback to chronological 75/25 split
        n_train = max(1, int(len(labeled_df) * 0.75))
        df_train = labeled_df.iloc[:n_train].reset_index(drop=True)
        df_test = labeled_df.iloc[n_train:].reset_index(drop=True)
        split_month = df_train["report_month"].max()

    print(f"Temporal Split at {split_month}:")
    print(f"Train snapshots: {len(df_train)} (Months: {df_train['report_month'].min()} to {df_train['report_month'].max()})")
    print(f"Test snapshots:  {len(df_test)} (Months: {df_test['report_month'].min()} to {df_test['report_month'].max()})")
    
    X_train = df_train[FEATURE_COLUMNS].fillna(0.0)
    X_test = df_test[FEATURE_COLUMNS].fillna(0.0)
    
    # Target 1: Cost Overrun Binary
    y_cost_train = df_train["target_cost_overrun"].values
    y_cost_test = df_test["target_cost_overrun"].values
    
    # Target 2: Time Overrun Binary
    y_time_train = df_train["target_time_overrun"].values
    y_time_test = df_test["target_time_overrun"].values
    
    # Target 3: Expected Cost Escalation % (Regression)
    y_cost_reg_train = df_train["target_cost_escalation_pct"].values
    
    # Target 4: Expected Delay Days (Regression)
    y_time_reg_train = df_train["target_delay_delta_days"].values
    
    # Never mutate labels to manufacture class diversity; a split like this is invalid.
    for name, y_arr in {
        "cost train": y_cost_train,
        "cost test": y_cost_test,
        "time train": y_time_train,
        "time test": y_time_test,
    }.items():
        if len(np.unique(y_arr)) < 2:
            raise ValueError(f"Invalid {name} split: expected both binary classes")

    # ----------------------------------------------------
    # 1. Baseline Models (Logistic Regression)
    # ----------------------------------------------------
    baseline_cost = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000, random_state=42))
    ])
    baseline_cost.fit(X_train, y_cost_train)
    base_cost_preds = baseline_cost.predict_proba(X_test)[:, 1]
    base_cost_metrics = evaluate_binary_model(y_cost_test, base_cost_preds, "Logistic Regression", "Cost Overrun")
    
    baseline_time = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000, random_state=42))
    ])
    baseline_time.fit(X_train, y_time_train)
    base_time_preds = baseline_time.predict_proba(X_test)[:, 1]
    base_time_metrics = evaluate_binary_model(y_time_test, base_time_preds, "Logistic Regression", "Time Overrun")
    
    # ----------------------------------------------------
    # 2. Main Models (XGBoost Classifier) with class imbalance handling
    # ----------------------------------------------------
    # Calculate scale_pos_weight only when classes are substantially imbalanced (<30% positive)
    cost_pos = int(y_cost_train.sum())
    cost_neg = len(y_cost_train) - cost_pos
    cost_scale = cost_neg / max(1, cost_pos) if cost_pos / len(y_cost_train) < 0.3 else 1.0
    
    time_pos = int(y_time_train.sum())
    time_neg = len(y_time_train) - time_pos
    time_scale = time_neg / max(1, time_pos) if time_pos / len(y_time_train) < 0.3 else 1.0
    
    print(f"Class balance — Cost: {cost_pos}/{len(y_cost_train)} positive (scale_pos_weight={cost_scale:.2f})")
    print(f"Class balance — Time: {time_pos}/{len(y_time_train)} positive (scale_pos_weight={time_scale:.2f})")
    
    xgb_cost = XGBClassifier(
        n_estimators=180,
        max_depth=5,
        learning_rate=0.04,
        subsample=0.85,
        colsample_bytree=0.8,
        scale_pos_weight=cost_scale,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_cost.fit(X_train, y_cost_train)
    cost_preds = xgb_cost.predict_proba(X_test)[:, 1]
    cost_metrics = evaluate_binary_model(y_cost_test, cost_preds, "XGBoost Classifier", "Cost Overrun")
    
    xgb_time = XGBClassifier(
        n_estimators=180,
        max_depth=5,
        learning_rate=0.04,
        subsample=0.85,
        colsample_bytree=0.8,
        scale_pos_weight=time_scale,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_time.fit(X_train, y_time_train)
    time_preds = xgb_time.predict_proba(X_test)[:, 1]
    time_metrics = evaluate_binary_model(y_time_test, time_preds, "XGBoost Classifier", "Time Overrun")
    
    # ----------------------------------------------------
    # 2b. Research Ablation Study: CUF-Only vs Trajectory Features
    # ----------------------------------------------------
    cuf_cols = [c for c in FEATURE_COLUMNS if any(k in c for k in [
        "cost_overrun_pct", "expenditure_pct", "budget_remaining",
        "physical_progress_pct", "schedule_slip_days", "days_elapsed",
        "days_remaining", "sector_", "ministry_"
    ])]
    if not cuf_cols:
        cuf_cols = FEATURE_COLUMNS[:10]
        
    X_train_cuf = X_train[cuf_cols]
    X_test_cuf = X_test[cuf_cols]
    
    xgb_cuf_cost = XGBClassifier(
        n_estimators=180, max_depth=5, learning_rate=0.04,
        scale_pos_weight=cost_scale, random_state=42, eval_metric="logloss"
    )
    xgb_cuf_cost.fit(X_train_cuf, y_cost_train)
    cuf_cost_preds = xgb_cuf_cost.predict_proba(X_test_cuf)[:, 1]
    cuf_cost_metrics = evaluate_binary_model(y_cost_test, cuf_cost_preds, "XGBoost (CUF Only)", "Cost Overrun")
    
    xgb_cuf_time = XGBClassifier(
        n_estimators=180, max_depth=5, learning_rate=0.04,
        scale_pos_weight=time_scale, random_state=42, eval_metric="logloss"
    )
    xgb_cuf_time.fit(X_train_cuf, y_time_train)
    cuf_time_preds = xgb_cuf_time.predict_proba(X_test_cuf)[:, 1]
    cuf_time_metrics = evaluate_binary_model(y_time_test, cuf_time_preds, "XGBoost (CUF Only)", "Time Overrun")
    
    ablation_study = [
        {
            "model_tier": "Conventional Baseline (Logistic Regression)",
            "feature_set": "CUF Status-Quo Variables Only",
            "cost_roc_auc": round(base_cost_metrics["roc_auc"], 4),
            "time_roc_auc": round(base_time_metrics["roc_auc"], 4),
            "cost_pr_auc": round(base_cost_metrics["pr_auc"], 4),
            "time_pr_auc": round(base_time_metrics["pr_auc"], 4),
            "cost_top10_recall": round(base_cost_metrics.get("top_10_recall", 0.0), 4),
            "time_top10_recall": round(base_time_metrics.get("top_10_recall", 0.0), 4),
            "cost_top20_recall": round(base_cost_metrics.get("top_20_recall", 0.0), 4),
            "time_top20_recall": round(base_time_metrics.get("top_20_recall", 0.0), 4)
        },
        {
            "model_tier": "CUF-Only Machine Learning (XGBoost)",
            "feature_set": "Nonlinear ML on CUF Variables Only",
            "cost_roc_auc": round(cuf_cost_metrics["roc_auc"], 4),
            "time_roc_auc": round(cuf_time_metrics["roc_auc"], 4),
            "cost_pr_auc": round(cuf_cost_metrics["pr_auc"], 4),
            "time_pr_auc": round(cuf_time_metrics["pr_auc"], 4),
            "cost_top10_recall": round(cuf_cost_metrics.get("top_10_recall", 0.0), 4),
            "time_top10_recall": round(cuf_time_metrics.get("top_10_recall", 0.0), 4),
            "cost_top20_recall": round(cuf_cost_metrics.get("top_20_recall", 0.0), 4),
            "time_top20_recall": round(cuf_time_metrics.get("top_20_recall", 0.0), 4)
        },
        {
            "model_tier": "PARAKH Trajectory Intelligence (XGBoost)",
            "feature_set": "CUF + EVM Dynamics + Longitudinal Velocities & Issue Drift",
            "cost_roc_auc": round(cost_metrics["roc_auc"], 4),
            "time_roc_auc": round(time_metrics["roc_auc"], 4),
            "cost_pr_auc": round(cost_metrics["pr_auc"], 4),
            "time_pr_auc": round(time_metrics["pr_auc"], 4),
            "cost_top10_recall": round(cost_metrics.get("top_10_recall", 0.0), 4),
            "time_top10_recall": round(time_metrics.get("top_10_recall", 0.0), 4),
            "cost_top20_recall": round(cost_metrics.get("top_20_recall", 0.0), 4),
            "time_top20_recall": round(time_metrics.get("top_20_recall", 0.0), 4)
        }
    ]

    # ----------------------------------------------------
    # 3. Regressors (Expected Cost Escalation & Delay Days)
    # ----------------------------------------------------
    xgb_cost_reg = XGBRegressor(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.05,
        random_state=42
    )
    xgb_cost_reg.fit(X_train, y_cost_reg_train)
    
    xgb_time_reg = XGBRegressor(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.05,
        random_state=42
    )
    xgb_time_reg.fit(X_train, y_time_reg_train)
    
    # ----------------------------------------------------
    # 3b. Regression Evaluation on Temporal Test Set
    # ----------------------------------------------------
    y_cost_reg_test = df_test["target_cost_escalation_pct"].values
    y_time_reg_test = df_test["target_delay_delta_days"].values
    
    cost_reg_preds = xgb_cost_reg.predict(X_test)
    time_reg_preds = xgb_time_reg.predict(X_test)
    
    cost_reg_metrics = evaluate_regression_model(
        y_cost_reg_test, cost_reg_preds,
        "XGBoost Regressor", "Cost Escalation %"
    )
    time_reg_metrics = evaluate_regression_model(
        y_time_reg_test, time_reg_preds,
        "XGBoost Regressor", "Delay Delta Days"
    )
    
    # ----------------------------------------------------
    # 4. Export Model Artifacts
    # ----------------------------------------------------
    joblib.dump(xgb_cost, os.path.join(artifacts_dir, "xgb_cost_model.joblib"))
    joblib.dump(xgb_time, os.path.join(artifacts_dir, "xgb_time_model.joblib"))
    joblib.dump(xgb_cost_reg, os.path.join(artifacts_dir, "xgb_cost_regressor.joblib"))
    joblib.dump(xgb_time_reg, os.path.join(artifacts_dir, "xgb_time_regressor.joblib"))
    
    baseline_comparison = {
        "baseline_cost": base_cost_metrics,
        "baseline_time": base_time_metrics,
        "cuf_cost": cuf_cost_metrics,
        "cuf_time": cuf_time_metrics
    }
    
    health_report = save_model_health_report(
        cost_metrics=cost_metrics,
        time_metrics=time_metrics,
        baseline_metrics=baseline_comparison,
        cost_reg_metrics=cost_reg_metrics,
        time_reg_metrics=time_reg_metrics,
        split_month=split_month,
        train_size=len(df_train),
        test_size=len(df_test),
        ablation_study=ablation_study,
        output_path=os.path.join(artifacts_dir, "model_health.json")
    )
    
    print("\nModel Training and Temporal Evaluation Complete!")
    print(f"Cost Overrun Model: PR-AUC = {cost_metrics['pr_auc']:.4f}, ROC-AUC = {cost_metrics['roc_auc']:.4f}, Brier = {cost_metrics['brier_score']:.4f}")
    print(f"Time Overrun Model: PR-AUC = {time_metrics['pr_auc']:.4f}, ROC-AUC = {time_metrics['roc_auc']:.4f}, Brier = {time_metrics['brier_score']:.4f}")
    print(f"Cost Regressor: MAE={cost_reg_metrics['mae']:.2f}%, RMSE={cost_reg_metrics['rmse']:.2f}%, R\u00b2={cost_reg_metrics['r2']:.4f}")
    print(f"Time Regressor: MAE={time_reg_metrics['mae']:.1f} days, RMSE={time_reg_metrics['rmse']:.1f} days, R\u00b2={time_reg_metrics['r2']:.4f}")
    
    return {
        "xgb_cost": xgb_cost,
        "xgb_time": xgb_time,
        "xgb_cost_reg": xgb_cost_reg,
        "xgb_time_reg": xgb_time_reg,
        "health_report": health_report
    }

if __name__ == "__main__":
    train_risk_models()
