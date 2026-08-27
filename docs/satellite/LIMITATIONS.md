# ⚠️ PAIMANA Satellite Limitations & Scientific Boundaries
## Document: `docs/satellite/LIMITATIONS.md`

---

## 1. Physical & Remote Sensing Limitations

1. **10m Spatial Resolution (Ground Sampling Distance)**:
   - Sentinel-2 and Sentinel-1 have a 10m nominal pixel size.
   - Small individual buildings, narrow utility trenches (<15m), and isolated equipment cannot be resolved. These assets are flagged as **`NOT_OBSERVABLE`**.

2. **Optical Cloud & Atmospheric Contamination**:
   - Persistent monsoon cloud cover can obscure Sentinel-2 optical observations for multiple weeks.
   - Mitigated by automated fallback to **Sentinel-1 C-band SAR** (all-weather radar backscatter).

3. **SAR Layover, Shadow & Dielectric Sensitivity**:
   - Steep terrain can cause radar layover and shadowing.
   - Soil moisture fluctuations following rainfall can alter backscatter intensity ($\sigma^0$), requiring temporal baseline normalization.

4. **Construction Material Ambiguity**:
   - Spectral indices (NDVI/NDBI/BSI) measure broad macro transformations (e.g. vegetation clearing, rough grading, paving), but cannot distinguish between concrete curing stages or interior finishes.

---

## 2. Mathematical & Methodological Boundaries

1. **Provisional Prototype Parameters**:
   - The weights ($w_O=0.30, w_S=0.35, w_B=0.20, w_T=0.15$) and discrepancy thresholds ($-15\text{ pp}, -30\text{ pp}$) are provisional prototype configurations.
   - They represent structured heuristic baselines that require empirical calibration against official ground-truth field audit measurements.

2. **No Measurement of True Construction Completion**:
   - The Observed Site Change Index ($\text{OSC}_{100}$) is an evidence score and must **not** be presented as an absolute measurement of contractor completion percentage.

3. **No Autonomous Fraud Accusation**:
   - Discrepancies generate a **Verification Signal** for administrative inspection, not a determination of contractor culpability.
