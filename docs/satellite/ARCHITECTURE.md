# 🛰️ PARAKH Satellite Cross-Verification Architecture
## Document: `docs/satellite/ARCHITECTURE.md`

---

## 1. Architectural Overview

The Satellite Cross-Verification Engine provides an independent Earth-observation evidence layer that cross-checks contractor-reported physical progress against observable surface transformations derived from **Copernicus Sentinel-2 (10m Optical L2A)** and **Sentinel-1 (C-band SAR GRD)** missions.

```
                              CONTRACTOR MONTHLY REPORT
                                          │
                                          ▼
                                 PARAKH EVM SNAPSHOT
                                          │
                ┌─────────────────────────┴─────────────────────────┐
                ▼                                                   ▼
       Reported Progress (P)                                Evaluation Month (T)
                │                                                   │
                │                                                   ▼
                │                                        Temporal Boundary Gate
                │                                        acquisition <= T
                │                                                   │
                │                                                   ▼
                │                                              Project AOI
                │                                                   │
                │                                                   ▼
                │                                        Spatial Suitability Engine
                │                                        (Width >= 15m, Area >= 0.5km²)
                │                                         /                     \
                │                                        /                       \
                │                                       v                         v
                │                               NOT_OBSERVABLE               Observable
                │                                                                 │
                │                                                                 ▼
                │                                                     Satellite Provider Router
                │                                                      /                     \
                │                                                     v                       v
                │                                             Copernicus CDSE          Synthetic Provider
                │                                              (LIVE MODE)               (DEMO MODE)
                │                                                     \                       /
                │                                                      +----------+----------+
                │                                                                 │
                │                                                       ┌─────────┴─────────┐
                │                                                       ▼                   ▼
                │                                                  Sentinel-2           Sentinel-1
                │                                                  Optical L2A          C-SAR GRD
                │                                                       │                   │
                │                                                       ▼                   ▼
                │                                                Optical Pipeline      SAR Pipeline
                │                                                       │                   │
                │                                                       └─────────┬─────────┘
                │                                                                 ▼
                │                                                       Evidence Quality Gate
                │                                                        /                 \
                │                                                       v                   v
                │                                                 INCONCLUSIVE        Valid Evidence
                │                                                                           │
                │                                                                           ▼
                │                                                                  Site Change Engine
                │                                                                           │
                │                                                               ┌───────────┼───────────┐
                │                                                               ▼           ▼           ▼
                │                                                            Optical       SAR      Built-up/
                │                                                            Change      Change     Temporal
                │                                                               \           |          /
                │                                                                +----------+---------+
                │                                                                           │
                │                                                                           ▼
                │                                                              Observed Site Change Index
                │                                                                    (OSC_100)
                │                                                                           │
                └───────────────────────────────────┬───────────────────────────────────────┘
                                                    ▼
                                           Discrepancy Engine
                                           D_pp = OSC_100 - P
                                                    │
                                                    ▼
                                           Verification Status
                                   (CONSISTENT / REVIEW / SIGNIFICANT)
                                                    │
                                                    ▼
                                      Temporal Divergence Analysis
                                       (First Onset Identification)
                                                    │
                                                    ▼
                                         PARAKH Decision Stack
                                                    │
                                    ┌───────────────┴───────────────┐
                                    ▼                               ▼
                           Review Priority Queue           Action Memorandum
```

---

## 2. Subsystem Components

1. **Spatial Suitability Gate** (`backend/app/satellite/suitability.py`):
   - Evaluates project physical archetype (corridor width, polygon area, compactness) against the 10m Ground Sampling Distance (GSD) of Sentinel sensors.
   - Categorizes projects as `HIGH`, `MEDIUM`, `LOW`, or `UNSUITABLE`. If unsuitable, immediately emits `NOT_OBSERVABLE` without fabricating an index.

2. **Provider Router & Provenance Layer** (`backend/app/satellite/providers/`):
   - **Copernicus Provider**: Queries official CDSE STAC search catalog (`/api/v1/search`) enforcing $t_{\text{acquisition}} \le T_{\text{evaluation}}$.
   - **Synthetic Provider**: Generates realistic demonstration geometries and multi-band layers with explicit `is_synthetic: true` flags.

3. **Multi-Sensor Preprocessing Pipelines**:
   - **Optical Pipeline** (`preprocessing/optical.py`): Evaluates BOA surface reflectance, computes SCL cloud masking, and derives NDVI, NDBI, NDWI, and BSI.
   - **SAR Pipeline** (`preprocessing/sar.py`): Processes C-band IW GRD backscatter $\gamma^0$, extracts VV/VH ratios, and flags temporal backscatter deltas.

4. **Evidence Quality Gate & Site Change Engine** (`change_detection.py`):
   - Validates cloud thresholds, sensor agreement, and temporal freshness.
   - Computes the provisional Observed Site Change Index $\text{OSC}_{100}$.
   - Calculates the progress discrepancy $D_{\text{pp}} = \text{OSC}_{100} - P$.
   - Identifies the First Point of Satellite Divergence over historical timelines.

5. **Decision Stack & Action Memorandum Integration**:
   - Maintains the three independent confidence dimensions: Data Quality ($94\%$), ML Calibration ($88\%$), and Satellite Evidence ($87\%$).
   - Generates official Site Inspection Directives with reproducible verification audit packets (`SAT-2026-000184`).

