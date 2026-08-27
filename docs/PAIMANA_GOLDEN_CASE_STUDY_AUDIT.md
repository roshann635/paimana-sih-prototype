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

- **Verification Audit ID**: `SAT-2026-000184`
- **Processing Engine**: `sat-engine v1.0` (Configuration: `config v0.3-provisional`)
- **AOI Provenance**: `COPERNICUS STAC DISCOVERY` (Collection: `SENTINEL-2` & `SENTINEL-1-GRD`)
- **Action Priority**: `HIGH`
- **Administrative Directive Dispatched**:
  > *"Issue formal Site Inspection Directive to NHAI Project Director; require physical joint measurement of completed base subgrade and overpass superstructure prior to releasing milestone tranche 7."*

---

## 🏁 8. Conclusion: Scientific Integrity & SIH Presentation Framing

1. **Defensible Nomenclature**: Framed strictly as a **Verification Signal**, not "fraud detection".
2. **Reproducible Provenance**: Supported by immutable audit hashes and clear distinction between live Copernicus observations and synthetic demonstration fixtures.
3. **Complete Workflow Integration**: Seamlessly connects government monthly flash reports to deterministic EVM analytics, explainable ML risk forecasting, multi-sensor Earth-observation evidence, and actionable administrative memorandums.
