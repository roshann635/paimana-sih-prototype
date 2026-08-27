# 🔬 PAIMANA Satellite Cross-Verification Scientific Methodology
## Document: `docs/satellite/SCIENTIFIC_METHOD.md`

---

## 1. Scientific Principles & Institutional Defensibility

The fundamental principle governing PAIMANA Earth-observation intelligence is:
> **Satellite cross-verification produces an independent evidence signal of physical site transformation; it does not measure true construction completion percentage.**

### 1.1 Non-Negotiable Disclaimers
All satellite outputs, visual studios, and action memorandums must display the mandatory scientific disclaimer:
```
"Observed Site Change Index is an experimental multi-sensor evidence score
and should not be interpreted as a direct measurement of construction
completion percentage."
```

---

## 2. Mathematical Formulations

### 2.1 Multi-Spectral Optical Indices
Using atmospherically corrected Sentinel-2 L2A Bottom-of-Atmosphere (BOA) surface reflectance:
- **Normalized Difference Vegetation Index (NDVI)**:
  $$\text{NDVI} = \frac{\text{NIR (B08)} - \text{RED (B04)}}{\text{NIR (B08)} + \text{RED (B04)}}$$
- **Normalized Difference Built-Up Index (NDBI)**:
  $$\text{NDBI} = \frac{\text{SWIR (B11)} - \text{NIR (B08)}}{\text{SWIR (B11)} + \text{NIR (B08)}}$$
- **Bare Soil Index (BSI)**:
  $$\text{BSI} = \frac{(\text{RED} + \text{SWIR}) - (\text{NIR} + \text{BLUE})}{(\text{RED} + \text{SWIR}) + (\text{NIR} + \text{BLUE})}$$

### 2.2 SAR Radar Backscatter Formulations
Using Sentinel-1 C-SAR IW GRD radiometric terrain-corrected backscatter:
- **VV/VH Ratio Delta**:
  $$\Delta(\text{VV}/\text{VH}) = (\text{VV}_{\text{current}} - \text{VH}_{\text{current}}) - (\text{VV}_{\text{baseline}} - \text{VH}_{\text{baseline}})$$
- **Structural Intensity Delta**:
  $$\Delta \sigma^0_{\text{VV}} = \sigma^0_{\text{VV, current}} - \sigma^0_{\text{VV, baseline}}$$

### 2.3 Observed Site Change Index ($\text{OSC}_{100}$)
$$\text{OSC}_{100} = 100 \times \left(w_O \cdot O + w_S \cdot S + w_B \cdot B + w_T \cdot T\right)$$
Where:
- $O \in [0, 1]$: Optical clearing and spectral transformation score
- $S \in [0, 1]$: SAR backscatter and structural reflection score
- $B \in [0, 1]$: Built-up physical footprint change score
- $T \in [0, 1]$: Multi-temporal trajectory continuity score
- **Provisional Weights**: $w_O = 0.30, w_S = 0.35, w_B = 0.20, w_T = 0.15$ ($\sum w = 1.0$)

> *Note: These weights are provisional prototype parameters subject to empirical calibration against ground-truth inspection records.*

### 2.4 Progress Discrepancy Formulation ($D_{\text{pp}}$)
$$D_{\text{pp}} = \text{OSC}_{100} - P$$
Where $P$ is the contractor-reported physical progress percentage.

### 2.5 Categorization Thresholds
- $D_{\text{pp}} \ge -15.0\text{ pp} \implies \mathbf{🟢\text{ CONSISTENT}}$
- $-30.0\text{ pp} \le D_{\text{pp}} < -15.0\text{ pp} \implies \mathbf{🟠\text{ REVIEW RECOMMENDED}}$
- $D_{\text{pp}} < -30.0\text{ pp} \implies \mathbf{🔴\text{ SIGNIFICANT DISCREPANCY}}$

---

## 3. Evidence Quality Gate Logic

$$\text{Confidence} = 0.30 \cdot Q_{\text{AOI}} + 0.25 \cdot Q_{\text{Optical}} + 0.25 \cdot Q_{\text{SAR}} + 0.10 \cdot Q_{\text{Temporal}} + 0.10 \cdot Q_{\text{Agreement}}$$

- If both sensors are unusable ($Q_{\text{Optical}} < 20$ and $Q_{\text{SAR}} < 20$): Status is set to **`INCONCLUSIVE`**.
- If AOI is sub-resolution ($\text{Width} < 15\text{m}$ or $\text{Area} < 0.5\text{km}^2$): Status is set to **`NOT_OBSERVABLE`**.
- If optical is clouded ($\text{SCL} > 40\%$) but SAR is high-quality: System executes **SAR-primary fallback** with degraded optical weighting.
