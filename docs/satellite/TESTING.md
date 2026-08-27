# 🧪 PAIMANA Satellite Automated Testing & Invariant Verification
## Document: `docs/satellite/TESTING.md`

---

## 1. Test Suite Overview

PAIMANA includes 30 automated tests in [test_satellite.py](file:///d:/paimana/tests/test_satellite.py) and [test_api.py](file:///d:/paimana/tests/test_api.py) verifying all core scientific invariants, edge cases, failure states, and user journeys.

---

## 2. Invariant Coverage Matrix

| Test ID | Test Name | Target Invariant | Expected Behavior | Result |
|---|---|---|---|---|
| **Test 1** | `test_invariant_1_zero_delta_baseline` | Zero spectral & radar change | $\text{OSC}_{100} = 0.0$ | **PASS** |
| **Test 2** | `test_invariant_2_matching_progress_consistent` | Matching observed vs reported progress | $\text{Status} = \text{CONSISTENT}$ | **PASS** |
| **Test 3** | `test_invariant_3_moderate_discrepancy_review` | $D_{\text{pp}} \in [-30, -15]\text{ pp}$ | $\text{Status} = \text{REVIEW\_RECOMMENDED}$ | **PASS** |
| **Test 4** | `test_invariant_4_large_gap_significant_discrepancy` | $D_{\text{pp}} < -30\text{ pp}$ | $\text{Status} = \text{SIGNIFICANT\_DISCREPANCY}$ | **PASS** |
| **Test 5** | `test_invariant_5_cloud_degradation_sar_fallback` | Clouded optical ($\text{SCL} > 70\%$) + clear SAR | High-confidence SAR-primary fallback | **PASS** |
| **Test 6** | `test_invariant_6_both_sensors_degraded_inconclusive` | Optical & SAR both unusable | $\text{Status} = \text{INCONCLUSIVE}$ | **PASS** |
| **Test 7** | `test_invariant_7_tiny_aoi_not_observable` | Feature width $< 10\text{m}$ (GSD limit) | $\text{Status} = \text{NOT\_OBSERVABLE}$ | **PASS** |
| **Test 8** | `test_invariant_8_synthetic_provenance` | Demo provider fixture | `is_synthetic: true`, `source: PAIMANA DEMO FIXTURE` | **PASS** |
| **Test 9** | `test_invariant_9_copernicus_discovery` | CDSE STAC discovery | `source: Copernicus Data Space Ecosystem` | **PASS** |
| **Test 10** | `test_invariant_10_temporal_boundary_no_leakage` | Lookahead protection at month $T$ | $\max(t_{\text{acq}}) \le T$ strictly enforced | **PASS** |
| **Test 25** | `test_test_25_project_to_satellite_journey` | Project $\to$ Satellite end-to-end | Full verification result returned | **PASS** |
| **Test 26** | `test_test_26_satellite_evm_temporal_consistency` | EVM month alignment | Evaluates against exact EVM snapshot month | **PASS** |
| **Test 27** | `test_test_27_strict_future_imagery_rejection` | $T = \text{2026-07-31}$ | Rejects any $\text{2026-08-03+}$ imagery | **PASS** |
| **Test 28** | `test_test_28_provenance_and_disclaimer_integrity` | Provenance & disclaimer | Contains `PAIMANA DEMO GEOMETRY` & disclaimer | **PASS** |
| **Test 29** | `test_test_29_unobservable_aoi_gate` | Compact/unobservable site | Returns `NOT_OBSERVABLE` without fabricating OSC | **PASS** |
| **Test 30** | `test_test_30_provider_failure_graceful_handling` | Provider outage | Gracefully returns `INCONCLUSIVE` | **PASS** |

---

## 3. Running Automated Tests

```bash
# Run backend pytest suite including 30 invariant tests
venv\Scripts\python -m pytest tests/test_satellite.py tests/test_api.py

# Run Golden Case Study standalone runner
venv\Scripts\python scripts/run_golden_case.py

# Run frontend build verification
cd frontend && npm run build
```
