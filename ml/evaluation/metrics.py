"""
Model Evaluation Metrics (ml/evaluation/metrics.py)
Computes PR-AUC, ROC-AUC, Brier score, Precision@K, Recall@K,
and temporal calibration metrics for national infrastructure risk models.
"""

import json
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.metrics import (
    roc_auc_score, average_precision_score, brier_score_loss,
    precision_score, recall_score, f1_score, confusion_matrix
)

def evaluate_binary_model(
    y_true: np.ndarray,
    y_pred_proba: np.ndarray,
    model_name: str = "Model",
    target_name: str = "Target",
    threshold: float = 0.5,
    top_k_pct: float = 0.20
) -> Dict[str, Any]:
    """
    Evaluates classification model with focus on PR-AUC, Brier score, and Top-K recall.
    """
    y_true = np.asarray(y_true).astype(int)
    y_pred_proba = np.asarray(y_pred_proba).astype(float)
    y_pred_binary = (y_pred_proba >= threshold).astype(int)
    
    # 1. Standard Metrics
    pr_auc = float(average_precision_score(y_true, y_pred_proba))
    roc_auc = float(roc_auc_score(y_true, y_pred_proba))
    brier = float(brier_score_loss(y_true, y_pred_proba))
    prec = float(precision_score(y_true, y_pred_binary, zero_division=0))
    rec = float(recall_score(y_true, y_pred_binary, zero_division=0))
    f1 = float(f1_score(y_true, y_pred_binary, zero_division=0))
    
    # 2. Top-K Capture Rates (Recall@5%, Recall@10%, Recall@20%)
    total_positives = int(np.sum(y_true))
    top_recalls = {}
    for pct in [0.05, 0.10, 0.20]:
        k_val = max(1, int(len(y_true) * pct))
        top_k_idx = np.argsort(y_pred_proba)[::-1][:k_val]
        pos_in_top = int(np.sum(y_true[top_k_idx]))
        top_recalls[f"top_{int(pct*100)}_recall"] = round(float(pos_in_top / max(1, total_positives)), 4)
    top_k_recall = top_recalls[f"top_{int(top_k_pct*100)}_recall"]
    
    # 3. Calibration Bins
    bins = np.linspace(0.0, 1.0, 6)
    bin_centers = (bins[:-1] + bins[1:]) / 2.0
    bin_indices = np.digitize(y_pred_proba, bins) - 1
    calibration_data = []
    
    for i in range(5):
        mask = bin_indices == i
        if np.sum(mask) > 0:
            empirical_prob = float(np.mean(y_true[mask]))
            mean_pred = float(np.mean(y_pred_proba[mask]))
            count = int(np.sum(mask))
        else:
            empirical_prob = float(bin_centers[i])
            mean_pred = float(bin_centers[i])
            count = 0
            
        calibration_data.append({
            "bin": f"{int(bins[i]*100)}-{int(bins[i+1]*100)}%",
            "predicted_prob": round(mean_pred, 4),
            "empirical_prob": round(empirical_prob, 4),
            "count": count
        })
        
    metrics = {
        "model_name": model_name,
        "target_name": target_name,
        "pr_auc": round(pr_auc, 4),
        "roc_auc": round(roc_auc, 4),
        "brier_score": round(brier, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "top_5_recall": top_recalls.get("top_5_recall", 0.0),
        "top_10_recall": top_recalls.get("top_10_recall", 0.0),
        "top_20_recall": top_recalls.get("top_20_recall", 0.0),
        f"top_{int(top_k_pct*100)}_recall": round(top_k_recall, 4),
        "total_samples": len(y_true),
        "positive_samples": total_positives,
        "calibration": calibration_data
    }
    
    return metrics

def evaluate_regression_model(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    model_name: str = "Model",
    target_name: str = "Target"
) -> Dict[str, Any]:
    """
    Evaluates regression model with MAE, RMSE, R², and guarded MAPE.
    """
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    
    y_true = np.asarray(y_true).astype(float)
    y_pred = np.asarray(y_pred).astype(float)
    
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    
    # Guarded MAPE — only on non-near-zero targets to avoid division by zero
    mask = np.abs(y_true) > 1e-2
    if mask.sum() > 0:
        mape = float(np.mean(np.abs(
            (y_true[mask] - y_pred[mask]) / y_true[mask]
        )) * 100)
    else:
        mape = None
    
    return {
        "model_name": model_name,
        "target_name": target_name,
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "mape": round(mape, 2) if mape is not None else None,
        "total_samples": len(y_true)
    }

def save_model_health_report(
    cost_metrics: Dict[str, Any],
    time_metrics: Dict[str, Any],
    baseline_metrics: Dict[str, Any],
    cost_reg_metrics: Dict[str, Any] = None,
    time_reg_metrics: Dict[str, Any] = None,
    split_month: str = None,
    train_size: int = 0,
    test_size: int = 0,
    ablation_study: Any = None,
    output_path: str = "ml/artifacts/model_health.json"
):
    import os
    from datetime import datetime
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    health = {
        "model_version": "v2.0-temporal-hardened",
        "last_evaluated": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "validation_strategy": f"Out-of-Time Temporal Split (Train <= {split_month}, Test > {split_month})" if split_month else "Temporal Split",
        "train_samples": train_size,
        "test_samples": test_size,
        "cost_model": cost_metrics,
        "time_model": time_metrics,
        "cost_regressor": cost_reg_metrics,
        "time_regressor": time_reg_metrics,
        "baseline_comparison": baseline_metrics,
        "ablation_study": ablation_study or []
    }
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(health, f, indent=2)
        
    print(f"Model health report saved to: {output_path}")
    return health

