# Model Card: Composite Risk Engine & Normalized Intervention Priority Index (IPI)

## Overview

- **System Identifier:** `paimana-composite-ipi-engine-v1.0`
- **Purpose:** Multi-criteria risk aggregation and administrative review ranking combining calibrated machine-learning probabilities with capital exposure and urgency.

---

## 1. Composite Implementation Risk Score ($R_{\text{composite}} \in [0, 100]$)

The Composite Risk Score synthesizes predicted cost risk, schedule risk, trajectory drift, and issue bottlenecks:

$$R_{\text{composite}} = 100 \times \left( 0.35 \cdot \hat{P}(\text{Cost Overrun}) + 0.35 \cdot \hat{P}(\text{Schedule Delay}) + 0.15 \cdot S_{\text{trend}} + 0.15 \cdot S_{\text{bottlenecks}} \right)$$

Where:

- $\hat{P}(\text{Cost Overrun})$: Calibrated probability of material cost escalation.
- $\hat{P}(\text{Schedule Delay})$: Calibrated probability of timeline slippage ($\ge 45$ days).
- $S_{\text{trend}}$: 3-month risk velocity delta score ($[0, 1]$).
- $S_{\text{bottlenecks}}$: Normalized issue count (Land, Approval, Contractor, Procurement) ($[0, 1]$).

### Calibrated RAGB Tiers:

- **0 – 24 (NORMAL / GREEN):** Project executing on baseline trajectory.
- **25 – 49 (WATCH / AMBER):** Early divergence in physical velocity or milestone reporting.
- **50 – 74 (REVIEW / ORANGE):** Active cost/schedule risk requiring departmental attention.
- **75 – 100 (CRITICAL / RED):** Severe compound risk requiring immediate central administrative intervention.

---

## 2. Normalized Intervention Priority Index (IPI $\in [0, 100]$)

Sorting solely by risk percentage can cause high-risk minor projects (e.g. ₹50 Cr) to obscure mega-projects with immense public capital exposure (e.g. ₹25,000 Cr).

To ensure mathematical validity across wildly varying scales, all inputs are normalized to $[0, 1]$ prior to weighted synthesis:

$$\text{IPI} = 100 \times \left( w_1 \cdot \text{Risk}_{\text{norm}} + w_2 \cdot \text{Exposure}_{\text{norm}} + w_3 \cdot \text{Urgency}_{\text{norm}} + w_4 \cdot \text{Criticality}_{\text{norm}} \right)$$

### Parameter Specifications:

- **Weights:** $w_1 = 0.40$ (Risk), $w_2 = 0.30$ (Financial Exposure), $w_3 = 0.15$ (Urgency), $w_4 = 0.15$ (Strategic Criticality).
- **$\text{Risk}_{\text{norm}} = \frac{R_{\text{composite}}}{100} \in [0, 1]$.**
- **$\text{Exposure}_{\text{norm}} = \min\left(1.0, \frac{\log_{10}(\text{Revised Cost Cr}) - \log_{10}(150)}{\log_{10}(50,000) - \log_{10}(150)}\right) \in [0, 1]$.** (Logarithmic scaling prevents single ₹1 Lakh Cr mega-projects from suppressing all other projects).
- **$\text{Urgency}_{\text{norm}} = \text{clamp}\left(1.0 - \frac{\max(0, \text{Days to Target End})}{730}, 0.0, 1.0\right)$.** (Projects due within near-term horizons receive higher urgency weight).
- **$\text{Criticality}_{\text{norm}} \in [0, 1]$:** Sectoral and regional strategic weight (e.g. Strategic National Corridors, Border Infrastructure, Critical Energy).

---

## Governance & Lineage Traceability

Every generated priority score and risk classification maintains complete lineage:
$$\text{IPI Score} \to \text{Prediction Record} \to \text{Model Version (\texttt{v1.0-temporal-xgb})} \to \text{Feature Set (\texttt{v2.1})} \to \text{Snapshot Record} \to \text{Project Master}$$
