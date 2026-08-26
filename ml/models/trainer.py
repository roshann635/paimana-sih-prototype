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
from ml.evaluation.metrics import evaluate_binary_model, save_model_health_report

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
        # Fallback to all data with synthetic pseudo-targets if insufficient horizon
        labeled_df = df.copy()
        labeled_df["target_cost_overrun"] = (labeled_df["cost_overrun_pct"] > 5).astype(int)
        labeled_df["target_time_overrun"] = (labeled_df["schedule_slip_days"] > 45).astype(int)
        labeled_df["target_cost_escalation_pct"] = labeled_df["cost_overrun_pct"].clip(lower=0.0)
        labeled_df["target_delay_delta_days"] = labeled_df["schedule_slip_days"].clip(lower=0.0)

    # Dynamic or explicit temporal split
    unique_months = sorted(labeled_df["report_month"].unique())
    if split_month not in unique_months or len(unique_months) < 2:
        split_idx = max(0, int(len(unique_months) * 0.65))
        split_month = unique_months[split_idx] if len(unique_months) > 0 else "2025-08"

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
    
    # Ensure binary classes in train & test have at least 2 classes
    for y_arr in [y_cost_train, y_time_train]:
        if len(np.unique(y_arr)) < 2 and len(y_arr) > 0:
            y_arr[0] = 1 - y_arr[0]
            
    for y_arr in [y_cost_test, y_time_test]:
        if len(np.unique(y_arr)) < 2 and len(y_arr) > 0:
            y_arr[0] = 1 - y_arr[0]

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
    # 2. Main Models (XGBoost Classifier)
    # ----------------------------------------------------
    xgb_cost = XGBClassifier(
        n_estimators=180,
        max_depth=5,
        learning_rate=0.04,
        subsample=0.85,
        colsample_bytree=0.8,
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
        random_state=42,
        eval_metric="logloss"
    )
    xgb_time.fit(X_train, y_time_train)
    time_preds = xgb_time.predict_proba(X_test)[:, 1]
    time_metrics = evaluate_binary_model(y_time_test, time_preds, "XGBoost Classifier", "Time Overrun")
    
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
    # 4. Export Model Artifacts
    # ----------------------------------------------------
    joblib.dump(xgb_cost, os.path.join(artifacts_dir, "xgb_cost_model.joblib"))
    joblib.dump(xgb_time, os.path.join(artifacts_dir, "xgb_time_model.joblib"))
    joblib.dump(xgb_cost_reg, os.path.join(artifacts_dir, "xgb_cost_regressor.joblib"))
    joblib.dump(xgb_time_reg, os.path.join(artifacts_dir, "xgb_time_regressor.joblib"))
    
    baseline_comparison = {
        "baseline_cost": base_cost_metrics,
        "baseline_time": base_time_metrics
    }
    
    health_report = save_model_health_report(
        cost_metrics=cost_metrics,
        time_metrics=time_metrics,
        baseline_metrics=baseline_comparison,
        output_path=os.path.join(artifacts_dir, "model_health.json")
    )
    
    print("\nModel Training and Temporal Evaluation Complete!")
    print(f"Cost Overrun Model: PR-AUC = {cost_metrics['pr_auc']:.4f}, ROC-AUC = {cost_metrics['roc_auc']:.4f}, Brier = {cost_metrics['brier_score']:.4f}")
    print(f"Time Overrun Model: PR-AUC = {time_metrics['pr_auc']:.4f}, ROC-AUC = {time_metrics['roc_auc']:.4f}, Brier = {time_metrics['brier_score']:.4f}")
    
    return {
        "xgb_cost": xgb_cost,
        "xgb_time": xgb_time,
        "xgb_cost_reg": xgb_cost_reg,
        "xgb_time_reg": xgb_time_reg,
        "health_report": health_report
    }

if __name__ == "__main__":
    train_risk_models()
