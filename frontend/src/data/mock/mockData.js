/**
 * Mock & Fallback Data Cache (src/data/mock/mockData.js)
 * Cleanly separated fallback data structure matching backend API contracts.
 * Never hardcoded directly into JSX components.
 */

export const mockDashboardSummary = {
  total_projects: 1630,
  total_approved_cost_cr: 2748500.0,
  total_revised_cost_cr: 3185400.0,
  total_cumulative_expenditure_cr: 1420900.0,
  overall_cost_overrun_pct: 15.89,
  high_risk_projects_count: 142,
  critical_risk_projects_count: 38,
  total_capex_at_risk_cr: 485200.0,
  average_delay_days: 148,
  latest_report_month: "2025-12",
  risk_distribution: {
    critical_red: 38,
    review_orange: 104,
    watch_amber: 412,
    normal_green: 1076,
  },
  active_alerts_count: 101,
  data_quality_score: 85.0
};

export const mockModelHealth = {
  model_version: "v1.0-temporal-xgb",
  last_evaluated: "2025-12-31",
  validation_strategy: "Out-of-Time Temporal Split (Train <= 2025-08, Test > 2025-08)",
  data_freshness: "December 2025 Cycle",
  missing_data_pct: 1.2,
  cost_model: {
    model_name: "XGBoost Classifier",
    target_name: "Cost Overrun (>= 4% Escalation)",
    pr_auc: 0.4462,
    roc_auc: 0.8656,
    brier_score: 0.0334,
    precision: 0.742,
    recall: 0.815,
    f1_score: 0.776,
    total_samples: 1694,
    positive_samples: 142
  },
  time_model: {
    model_name: "XGBoost Classifier",
    target_name: "Schedule Slippage (>= 45 Days Delay)",
    pr_auc: 0.3689,
    roc_auc: 0.8470,
    brier_score: 0.0838,
    precision: 0.718,
    recall: 0.792,
    f1_score: 0.753,
    total_samples: 1694,
    positive_samples: 218
  },
  baseline_comparison: {
    baseline_cost: {
      model_name: "Logistic Regression Baseline",
      pr_auc: 0.2104,
      roc_auc: 0.6840,
      brier_score: 0.0812
    },
    baseline_time: {
      model_name: "Logistic Regression Baseline",
      pr_auc: 0.1850,
      roc_auc: 0.6510,
      brier_score: 0.1140
    }
  }
};

export const mockDataQuality = {
  total_projects: 1630,
  total_snapshots: 6787,
  valid_snapshots: 5383,
  warnings_count: 21,
  critical_errors_count: 707,
  quality_score: 85.0,
  issue_breakdown: {
    NEGATIVE_COST: 0,
    PROGRESS_OUT_OF_BOUNDS: 0,
    DATE_INCONSISTENCY: 0,
    MISSING_CRITICAL_FIELDS: 14,
    EXPENDITURE_EXCEEDS_REVISED_COST: 7
  },
  status: "PASSED"
};
