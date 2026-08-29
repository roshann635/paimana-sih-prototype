# Model Card: TreeSHAP Explainability & Factor Attribution

## System Overview

- **Identifier:** `PARAKH-treeshap-explainer-v1.0`
- **Methodology:** TreeSHAP (Tree-based Shapley Additive Explanations) by Lundberg & Lee.
- **Objective:** Deconstruct black-box gradient boosted tree predictions into exact additive feature risk contributions for government administrative review.

---

## Explanation Dimensions

1. **Local Project Attributions:** Quantitative impact values for each feature explaining why a specific project received its assigned risk score.
2. **Impact Direction:**
   - **`+` (Risk Driver / Red):** Feature value increases the likelihood of cost overrun or schedule delay.
   - **`-` (Risk Mitigator / Green):** Feature value reduces risk (e.g. high physical progress velocity, stable contract execution).
3. **Trend Explanations:** Compares current SHAP attributions against 3-month historical attributions to detect rapidly accelerating risk factors.
4. **Cohort & Peer Explanations:** Evaluates project feature deviations relative to sector empirical medians.

---

## Translation to Administrative Directives

TreeSHAP attributions are systematically mapped to deterministic operational directives:

| Dominant Risk Driving Factor | Threshold Trigger                             | Administrative Prescriptive Directive                                                                           |
| :--------------------------- | :-------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **Progress Stagnation**      | Velocity $< 1.0\%$/mo for $\ge 3$ months      | Review critical-path milestones, contractor execution capacity, and site access constraints.                    |
| **Capex Acceleration**       | Drawdown velocity $> 2.5\times$ progress rate | Initiate financial expenditure reconciliation; audit contractor interim bills against physical completion.      |
| **Schedule Slippage**        | Target revised $> 180$ days                   | Convene Project Monitoring Committee (PMC) to evaluate schedule re-baselining and EPC contractor recovery plan. |
| **Pending Approvals / Land** | Issue flags $\ge 1$                           | Escalate pending inter-departmental clearances to Ministry Empowered Committee / State Chief Secretary.         |

