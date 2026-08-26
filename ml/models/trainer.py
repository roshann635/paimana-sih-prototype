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
    split_month: str = "2025-06"
):
    os.makedirs(artifacts_dir, exist_ok=True)
    
    df = pd.read_csv(features_csv)
    
    # Filter rows with lookahead future targets for training & validation
    labeled_df = df[df["has_future_target"] == 1].copy()
    
    # Strict Out-of-Time Temporal Split
    train_mask = labeled_df["report_month"] <= split_month
    test_mask = labeled_df["report_month"] > split_month
    
    df_train = labeled_df[train_mask].reset_index(drop=True)
    df_test = labeled_df[test_mask].reset_index(drop=True)
    
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
    cost_pred_proba = xgb_cost.predict_proba(X_test)[:, 1]
    cost_metrics = evaluate_binary_model(y_cost_test, cost_pred_proba, "XGBoost Classifier", "Cost Overrun")
    
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
    time_pred_proba = xgb_time.predict_proba(X_test)[:, 1]
    time_metrics = evaluate_binary_model(y_time_test, time_pred_proba, "XGBoost Classifier", "Time Overrun")
    
    # ----------------------------------------------------
    # 3. Regression Models for Magnitude Estimation
    # ----------------------------------------------------
    xgb_cost_reg = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.05, random_state=42)
    xgb_cost_reg.fit(X_train, y_cost_reg_train)
    
    xgb_time_reg = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.05, random_state=42)
    xgb_time_reg.fit(X_train, y_time_reg_train)
    
    # Save Model Artifacts
    joblib.dump(xgb_cost, os.path.join(artifacts_dir, "xgb_cost_model.joblib"))
    joblib.dump(xgb_time, os.path.join(artifacts_dir, "xgb_time_model.joblib"))
    joblib.dump(xgb_cost_reg, os.path.join(artifacts_dir, "xgb_cost_regressor.joblib"))
    joblib.dump(xgb_time_reg, os.path.join(artifacts_dir, "xgb_time_regressor.joblib"))
    
    # Save Health and Metrics Report
    save_model_health_report(
        cost_metrics=cost_metrics,
        time_metrics=time_metrics,
        baseline_metrics={
            "baseline_cost": base_cost_metrics,
            "baseline_time": base_time_metrics
        },
        output_path=os.path.join(artifacts_dir, "model_health.json")
    )
    
    print("\n--- Model Training & Evaluation Results ---")
    print(f"Cost Model (XGBoost): PR-AUC = {cost_metrics['pr_auc']}, ROC-AUC = {cost_metrics['roc_auc']}, Brier = {cost_metrics['brier_score']}")
    print(f"Time Model (XGBoost): PR-AUC = {time_metrics['pr_auc']}, ROC-AUC = {time_metrics['roc_auc']}, Brier = {time_metrics['brier_score']}")
    print(f"Baseline Cost (LogReg): PR-AUC = {base_cost_metrics['pr_auc']}, Brier = {base_cost_metrics['brier_score']}")
    print(f"Baseline Time (LogReg): PR-AUC = {base_time_metrics['pr_auc']}, Brier = {base_time_metrics['brier_score']}")
    
    return xgb_cost, xgb_time, xgb_cost_reg, xgb_time_reg

if __name__ == "__main__":
    train_risk_models()
