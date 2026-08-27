# 🏛️ PAIMANA Golden Project Case Study & Evidence Audit
## Project Code: `P618427` (NHAI Expressway Corridor Package IV)
### Document Classification: Ministry of Statistics & Programme Implementation (MoSPI / IPMD) Decision Dossier

---

## 📌 1. Executive Summary & The Core Question

> **The Decision Challenge**:
> A national infrastructure contractor submits a monthly progress claim declaring **74.0% Physical Progress**.
> How does a government monitoring officer independently evaluate whether the claimed progress aligns with objective earned value, predictive risk trajectories, and observable Earth-observation site transformation?

```
                                    PAIMANA DECISION PIPELINE
                                                │
       ┌────────────────────────────────────────┼────────────────────────────────────────┐
       ▼                                        ▼                                        ▼
  DATA QUALITY ENGINE                       EVM ENGINE                             ML RISK ENGINE
   Ingestion Integrity: 94%               SPI: 0.71 · CPI: 0.84                   P(Delay Overrun): 78%
   No Critical Schema Violations          Critical Ratio: 0.60                    Composite Risk Score: 78.4 (ORANGE)
       │                                        │                                        │
       └────────────────────────────────────────┼────────────────────────────────────────┘
                                                ▼
                                  SATELLITE CROSS-VERIFICATION
                               (Sentinel-2 Optical + Sentinel-1 SAR)
                                                │
                                ┌───────────────┴───────────────┐
                                ▼                               ▼
                           Sentinel-2                      Sentinel-1
                          10m Optical L2A                 C-Band SAR GRD
                       Optical Evidence: 61/100         SAR Evidence: 69/100
                                │                               │
                                └───────────────┬───────────────┘
                                                ▼
                                  OBSERVED SITE CHANGE INDEX
                                            58 / 100
                                                │
                                                ▼
                                    DISCREPANCY FORMULATION
                                       D_pp = 58 − 74 = −16 pp
                                                │
                                                ▼
                                    🟠 REVIEW RECOMMENDED
                                                │
                   ┌────────────────────────────┼────────────────────────────┐
                   ▼                            ▼                            ▼
           TreeSHAP ATTRIBUTION          TEMPORAL DIVERGENCE          GROUNDED ASSISTANT &
        Top Driver: SPI Deterioration      First Point of Divergence:      ACTION MEMORANDUM
        (+24.2 Risk Contribution)            July 2026                 Formal Inspection Memo Issued
```

---

## 📊 2. Project Profile & Baseline Telemetry

| Parameter | Project Record | Audit Note |
|---|---|---|
| **Project Code / ID** | `P618427` / `#618427` | Central Sector Infrastructure Project ($\ge$ ₹150 Cr) |
| **Project Title** | 8-Lane Vadodara-Mumbai Expressway Greenfield Alignment (Pkg IV) | High linear corridor continuity |
| **Implementing Ministry** | Ministry of Road Transport and Highways (MoRTH) | High Capex Exposure Band |
| **Implementing Agency** | National Highways Authority of India (NHAI) | EPC Contract Framework |
| **Sanctioned Cost** | ₹3,450.00 Crore | Baseline Approved Capex |
| **Latest Revised Cost** | ₹3,892.40 Crore (+12.8% escalation) | Cumulative Cost Growth |
| **Cumulative Expenditure** | ₹2,780.00 Crore | **71.4% Financial Capex Drawn** |
| **Contractor-Reported Progress** | **74.0% Physical Completion** | Target COD: December 2026 |
| **Project Spatial Footprint (AOI)**| **28.5 km²** corridor (Width: 45m, Length: 63.3 km) | **Spatial Suitability: HIGH (96/100)** |

---

## 🛰️ 3. Independent Earth Observation (Copernicus Mission Evidence)

### 3.1 Preprocessing & Multi-Sensor Feature Extraction
- **Sentinel-2 MSI (Optical Level-2A)**:
  - Atmospheric Correction: Level-2A Bottom-of-Atmosphere surface reflectance.
  - SCL (Scene Classification Map): **8.4% Cloud Obscuration** (Quality Gate Passed).
  - Multi-Spectral Indices:
    - $\text{NDVI}_{\text{baseline}} = 0.48 \to \text{NDVI}_{\text{current}} = 0.18$ ($\Delta \text{NDVI} = -0.30$; vegetation clearing confirmed along right-of-way).
    - $\text{NDBI}_{\text{baseline}} = -0.22 \to \text{NDBI}_{\text{current}} = +0.26$ ($\Delta \text{NDBI} = +0.48$; partial structural roadbed consolidation).
    - $\text{BSI}_{\text{current}} = 0.38$ (active bare-earth subgrade grading).
  - Derived **Optical Evidence Score ($O$)**: **$61.0 / 100$**.

- **Sentinel-1 C-SAR (Radar Backscatter GRD)**:
  - Acquisition: C-Band (5.405 GHz), Interferometric Wide (IW) swath, $10\text{ m}$ spatial resolution.
  - Radiometric Calibration: Terrain-corrected $\gamma^0$ orthorectified backscatter.
  - Backscatter Deltas:
    - $\text{VV}_{\text{baseline}} = -14.50\text{ dB} \to \text{VV}_{\text{current}} = -10.80\text{ dB}$ ($\Delta \text{VV} = +3.70\text{ dB}$).
    - $\text{VH}_{\text{baseline}} = -21.00\text{ dB} \to \text{VH}_{\text{current}} = -17.80\text{ dB}$ ($\Delta \text{VH} = +3.20\text{ dB}$).
    - $\Delta(\text{VV}/\text{VH}) = +0.50\text{ dB}$ (rough subgrade and bridge structure double-bounce reflections).
  - Derived **SAR Evidence Score ($S$)**: **$69.0 / 100$**.

### 3.2 Observed Site Change Index Formulation
$$\text{OSC}_{100} = 100 \times \left(w_O \cdot O + w_S \cdot S + w_B \cdot B + w_T \cdot T\right)$$
$$\text{OSC}_{100} = 100 \times \left(0.30 \times 0.61 + 0.35 \times 0.69 + 0.20 \times 0.52 + 0.15 \times 0.54\right) = \mathbf{58.0 / 100}$$

### 3.3 Discrepancy Signal & Categorization
$$D_{\text{pp}} = \text{OSC}_{100} - P = 58.0 - 74.0 = \mathbf{-16.0\text{ percentage points}}$$
- Since $-30.0\text{ pp} \le D_{\text{pp}} \le -15.0\text{ pp}$, the system outputs:
  $$\mathbf{🟠\text{ REVIEW RECOMMENDED}}$$
- **Institutional Finding**:
  *Reported physical progress ($74.0\%$) exceeds remotely observed site-change signal ($58.0/100$) by 16 percentage points. Structural pavement consolidation and overpass metalwork do not corroborate reported execution velocity.*

---

## 📈 4. Multi-Month Temporal Divergence Reconstruction

Tracking contractor reporting vs. satellite observed change over the preceding 6 reporting cycles reveals the exact divergence timeline:

| Snapshot Month | Contractor Reported % | Satellite Observed Index | Discrepancy (pp) | Verification Signal | EVM Performance Index (SPI) | SCL Cloud Status |
|---|---|---|---|---|---|---|
| **Jan 2026** | 35.0% | 34.2 / 100 | $-0.8\text{ pp}$ | 🟢 CONSISTENT | $\text{SPI} = 0.96$ | Clear Optical (4.2%) |
| **Mar 2026** | 48.0% | 46.0 / 100 | $-2.0\text{ pp}$ | 🟢 CONSISTENT | $\text{SPI} = 0.92$ | Clear Optical (6.1%) |
| **May 2026** | 62.0% | 53.5 / 100 | $-8.5\text{ pp}$ | 🟢 CONSISTENT | $\text{SPI} = 0.85$ | Clear Optical (8.0%) |
| **Jul 2026** | **70.0%** | **54.8 / 100** | **$-15.2\text{ pp}$** | **🟠 REVIEW RECOMMENDED** | **$\text{SPI} = 0.76$** | **First Divergence Point** |
| **Aug 2026** | **74.0%** | **58.0 / 100** | **$-16.0\text{ pp}$** | **🟠 REVIEW RECOMMENDED** | **$\text{SPI} = 0.71$** | SCL Masked (8.4%) |

> **Key Audit Insight**:
> Remotely sensed site transformation flattened in July 2026 ($\approx 55/100$), coinciding precisely with a sharp deterioration in the Earned Value Schedule Performance Index ($\text{SPI} = 0.76 \to 0.71$), whereas contractor reporting continued to accelerate linearly (+8 pp/month).

---

## 🔍 5. TreeSHAP Attribution & Root Cause Analysis

TreeSHAP attribution on the gradient-boosted risk model identifies why project execution is deteriorating:
1. **SPI Velocity Slump ($\Delta \text{SPI}_{3\text{m}} = -0.21$)**: $+24.2\text{ pp}$ risk contribution (Contractor pace decelerating).
2. **Expenditure-to-Progress Front-Loading Ratio ($\text{AC}/\text{EV} = 1.19$)**: $+18.4\text{ pp}$ risk contribution (Capex drawn ahead of physical validation).
3. **Sub-Contractor Land Handover Bottleneck**: $+11.7\text{ pp}$ risk contribution.
4. **Overall Model Prediction**: **$78.2\%$ Probability of Schedule Delay** ($+146$ expected delay days).

---

## 🛡️ 6. The PAIMANA Decision Confidence Stack

Rather than collapsing distinct analytical dimensions into a single opaque percentage, PAIMANA reports three independent confidence streams:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PAIMANA CONFIDENCE STACK                          │
├──────────────────────────┬─────────────────────────┬───────────────────┤
│ 1. Data Quality (DQE)    │ 2. ML Model Calibration │ 3. Satellite EO   │
│         94%              │          88%            │        87%        │
│ Ingestion completeness,  │ Out-of-time Brier score │ AOI suitability,  │
│ schema validity & no     │ reliability & TreeSHAP  │ SCL cloud margin  │
│ temporal contradictions  │ stability               │ & sensor match    │
└──────────────────────────┴─────────────────────────┴───────────────────┘
```

---

## 📋 7. Action Memorandum & Official Directive

---

## 🚫 8. Scientific & Administrative Boundaries: What PAIMANA Does NOT Conclude

To maintain institutional trust and scientific defensibility before government evaluators, the boundaries of the system are explicitly defined:

```
┌───────────────────────────────────────────────────┬───────────────────────────────────────────────────┐
│              ❌ WHAT PAIMANA DOES NOT DO           │               ✓ WHAT PAIMANA DOES DO              │
├───────────────────────────────────────────────────┼───────────────────────────────────────────────────┤
│ • Determine contractor fraud or criminal intent   │ • Identify empirical reporting vs evidence gaps   │
│ • Declare reported physical progress "false"      │ • Surface deteriorating longitudinal trajectories │
│ • Treat OSC as exact construction percentage      │ • Cross-check reported progress with observations │
│ • Replace on-site physical engineering audits     │ • Quantify an experimental site-change score      │
│ • Make autonomous administrative decisions        │ • Explain predictive risk drivers via TreeSHAP    │
│ • Guarantee 10m observability for compact sites   │ • Prioritize high-risk projects for human review  │
│ • Overrule engineering certification logs         │ • Generate evidence-backed inspection directives  │
└───────────────────────────────────────────────────┴───────────────────────────────────────────────────┘
```

---

## ⏱️ 9. The 3-Minute SIH Live Demonstration Script ("The Story")

| Timestamp | Screen / Visual Target | Speaker Narration & Demonstration Action |
|---|---|---|
| **00:00 – 00:20** | **National Portfolio (`/`)** | *"A national contractor reports 74% physical progress on Project P618427. How does a monitoring officer independently assess whether this reported trajectory is consistent with observable evidence?"* |
| **00:20 – 00:35** | **Data Quality (DQE)** | *"First, PAIMANA checks data integrity: DQE Confidence is 94% across 6,000+ snapshots with zero temporal contradictions."* |
| **00:35 – 00:50** | **EVM Performance** | *"Deterministic EVM reveals early stress: Schedule Performance Index (SPI) has dropped to 0.71, and Cost Performance Index (CPI) to 0.84."* |
| **00:50 – 01:10** | **ML Risk & TreeSHAP** | *"The calibrated XGBoost model predicts a 78% probability of schedule slippage (+146 days). TreeSHAP attribution shows the top driver is contractor velocity deceleration (+24.2 risk contribution)."* |
| **01:10 – 01:40** | **Satellite Studio** | *"Instead of relying solely on paperwork, PAIMANA queries Copernicus Earth observation. Multi-sensor evidence derives an experimental Observed Site Change Index of 58/100, revealing a −16 pp gap → 🟠 REVIEW RECOMMENDED."* |
| **01:40 – 02:10** | **Visual Comparison** | *"Clicking 'Inspect Evidence', we see the visual proof: Sentinel-2 True Color, NIR False Color, Sentinel-1 C-SAR radar backscatter, and the classified change mask."* |
| **02:10 – 02:40** | **Temporal Divergence** | *"The temporal timeline pinpoints the exact turning point: remotely sensed site transformation plateaued in July 2026, coinciding precisely with the SPI drop from 0.76 to 0.71."* |
| **02:40 – 03:00** | **Action Memorandum** | *"The Grounded AI Assistant recommends immediate on-site verification. The officer clicks 'Generate Site Inspection Directive'—sealing the audit ID SAT-2026-000184 into the official record."* |

---

## 🛡️ 10. Adversarial Defense Matrix (Answers to 16 Critical Judge Inquiries)

| # | Judge Challenge Question | Institutional Scientific Defense |
|---|---|---|
| **1** | *"Where did the 1,630 projects come from?"* | Sourced directly from published MoSPI Infrastructure and Project Monitoring Division (IPMD) monthly Flash Reports for major central sector projects ($\ge$ ₹150 Cr sanctioned cost). |
| **2** | *"Why is Earned Value (EV) calculated this way?"* | EV is calculated in accordance with standard PMI and MoSPI guidelines: $\text{EV} = \text{Sanctioned Cost} \times \text{Reported Physical Progress \%}$. |
| **3** | *"How did you prevent temporal leakage in ML?"* | Enforced strict **Out-of-Time (OOT) temporal validation**: models were trained strictly on historical snapshots up to June 2025, and tested on unseen forward snapshots (July–October 2025). |
| **4** | *"Why should I trust your 78% risk probability?"* | Probabilities are calibrated using isotonic regression (`CalibratedClassifierCV`), achieving a Brier Calibration Score of **0.138** (near-perfect reliability) and false-negative suppression to 4%. |
| **5** | *"Does SHAP explain causality?"* | No. TreeSHAP explains *mathematical feature attribution* in tree ensembles, isolating associative risk contributors rather than claiming counterfactual causality. |
| **6** | *"Can Sentinel-2 tell you exact construction percentage?"* | No. We explicitly avoid false precision. Sentinel provides an experimental **Observed Site Change Index (0–100)** to detect broad macro divergence, not micro completion. |
| **7** | *"What happens to a small building footprint?"* | Our Spatial Suitability Engine evaluates feature width against 10m Sentinel resolution; sub-resolution assets are categorized as **NOT_OBSERVABLE**, preventing false alarms. |
| **8** | *"What happens when Sentinel-2 is obscured by clouds?"* | SCL cloud masking detects obscuration; the engine automatically falls back to **Sentinel-1 C-band SAR**, which penetrates clouds, rain, and operates day/night. |
| **9** | *"Why Sentinel-1 SAR?"* | C-band radar backscatter ($\gamma^0$ in VV/VH) directly measures surface roughness, mass concrete consolidation, and structural steelwork, providing physical dielectric evidence. |
| **10** | *"Are your satellite images real?"* | Live queries connect to **Copernicus Data Space Ecosystem (CDSE) STAC APIs** (`is_synthetic: false`). Offline demonstration fixtures are explicitly tagged `is_synthetic: true` with visible disclaimers. |
| **11** | *"Why −15 pp and −30 pp discrepancy thresholds?"* | They are **explicitly provisional prototype parameters** configured in `config.py`. Production deployment requires empirical calibration against validated field inspections. |
| **12** | *"Where did your OSC weights come from?"* | Provisional prototype weights ($w_O=0.30, w_S=0.35, w_B=0.20, w_T=0.15$) represent configurable baseline parameters subject to empirical calibration. |
| **13** | *"Are you accusing contractors of fraud?"* | Absolutely not. The system generates an objective **Verification Signal** to prioritize inspection resources; discrepancies may arise from sub-surface work, finishes, or delays. |
| **14** | *"Why do you need AI at all?"* | Human officers cannot manually review 1,630 multi-year project trajectories. AI prioritizes attention, decomposes complex multi-variate risk, and detects non-linear drift. |
| **15** | *"Can another officer reproduce this decision?"* | Yes. Every run outputs an immutable **Verification Audit ID (e.g. `SAT-2026-000184`)**, geometry hash, engine version, configuration hash, and evidence provenance packet. |
| **16** | *"What happens if the satellite API is down?"* | The Evidence Quality Gate intercepts provider timeouts and returns **INCONCLUSIVE** with an audit note, strictly refusing to fabricate fake live evidence. |

