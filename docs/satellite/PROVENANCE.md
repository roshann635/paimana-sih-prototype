# 🔍 PAIMANA Satellite Provenance & Audit System
## Document: `docs/satellite/PROVENANCE.md`

---

## 1. Provenance Integrity & Scientific Honesty

PAIMANA enforces a strict, transparent separation between **Live Copernicus Earth Observation** and **Demonstration Fixtures**. The system strictly prohibits presenting synthetic fixtures as live satellite products.

### 1.1 Provenance Fields Tracked

Every Earth-observation payload must include:
- `sensor`: Platform and instrument (e.g. `Sentinel-2A MSI` or `Sentinel-1A C-SAR`).
- `product_type`: Level-2A BOA Reflectance (`L2A_Surface_Reflectance`) or Level-1 GRD (`GRD_IW_Gamma0`).
- `product_id`: Full Copernicus catalog identifier (e.g. `S2A_MSIL2A_20260614T054651_N0510_R105_T43QDB_20260614T091218`).
- `acquisition_datetime`: ISO-8601 acquisition timestamp.
- `cloud_cover_percent`: Scene Classification Layer (SCL) cloud obscuration fraction.
- `source`: Explicitly `"Copernicus Data Space Ecosystem"` vs `"PAIMANA DEMO FIXTURE"`.
- `is_synthetic`: Boolean flag (`false` for live CDSE, `true` for demo).
- `aoi_provenance`: `"COPERNICUS STAC DISCOVERY"` vs `"PAIMANA DEMO GEOMETRY"`.

---

## 2. Cryptographic Evidence Audit Trail

To enable reproducibility and official scrutiny:
1. **Verification Audit ID**: Generated as `SAT-YYYY-XXXXXX` (e.g. `SAT-2026-618427`).
2. **Canonical Geometry Hash**: SHA-256 hash derived from the normalized GeoJSON polygon coordinates.
3. **Reproducible Evidence Hash**: SHA-256 hash sealing evaluation month, reported progress, and the computed multi-sensor change scores.
4. **Engine & Config Versioning**: `sat-engine v1.0` and `config v0.3-provisional` are embedded directly in every verification packet.
