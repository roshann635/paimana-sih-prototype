# 🔌 PARAKH Satellite Cross-Verification API Reference
## Document: `docs/satellite/API.md`

All satellite endpoints are mounted under `/api/v1`.

---

## 1. Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/projects/{id}/satellite` | Returns current project satellite verification result, multi-sensor breakdown, and discrepancy signal. |
| `GET` | `/api/v1/projects/{id}/satellite/timeline` | Returns multi-month historical time series comparing reported progress vs observed change. |
| `GET` | `/api/v1/projects/{id}/satellite/evidence` | Returns vector visual layers (RGB, False Color NIR, SAR backscatter, Change Mask). |
| `POST` | `/api/v1/projects/{id}/satellite/verify` | Triggers an explicit on-demand satellite verification run. |
| `GET` | `/api/v1/projects/{id}/satellite/audit/{verification_id}` | Returns complete reproducible audit packet with geometry hash and provenance. |
| `GET` | `/api/v1/projects/{id}/satellite/audit/{verification_id}/hash` | Returns cryptographic SHA-256 evidence hash verification. |
| `GET` | `/api/v1/satellite/portfolio-overview` | Returns national portfolio-level Earth observation summary and high-discrepancy queue. |
| `GET` | `/api/v1/satellite/health` | Returns Earth Observation infrastructure and CDSE STAC connectivity health. |

---

## 2. Sample Request & Response

### `GET /api/v1/projects/P618427/satellite`
```json
{
  "project_id": "P618427",
  "project_name": "8-Lane Vadodara-Mumbai Expressway Greenfield Alignment",
  "project_code": "618427",
  "sector": "Road Transport and Highways",
  "state": "Gujarat",
  "evaluation_month": "2026-06",
  "reported_progress_pct": 74.0,
  "observed_site_change_index": 58.0,
  "progress_discrepancy_pp": -16.0,
  "verification_status": "REVIEW_RECOMMENDED",
  "status_headline": "Review Recommended — Empirical Evidence Gap",
  "status_description": "Reported physical progress exceeds observed multi-sensor site-change signal by 16.0 percentage points.",
  "optical_evidence_score": 61.0,
  "sar_evidence_score": 69.0,
  "builtup_footprint_score": 52.0,
  "temporal_consistency_score": 54.0,
  "spatial_suitability": {
    "level": "HIGH",
    "suitability_score": 96.0,
    "aoi_area_sqkm": 28.5,
    "feature_width_m": 45.0,
    "is_observable": true
  },
  "evidence_quality": {
    "overall_confidence": 87.0,
    "aoi_quality_score": 95.0,
    "optical_quality_score": 85.0,
    "sar_quality_score": 92.0,
    "is_quality_gate_passed": true
  },
  "first_divergence_month": "2026-07",
  "aoi_provenance": "PARAKH DEMO GEOMETRY",
  "is_synthetic": true,
  "verification_audit_id": "SAT-2026-618427",
  "processing_version": "sat-engine v1.0",
  "config_version": "config v0.3-provisional",
  "aoi_hash": "sha256:0936dca40a3e7a7c",
  "reproducible_evidence_hash": "sha256:ae30de10",
  "data_quality_confidence": 94.0,
  "ml_model_confidence": 88.0,
  "satellite_evidence_confidence": 87.0,
  "disclaimer": "Observed Site Change Index is an experimental multi-sensor evidence score and should not be interpreted as a direct measurement of construction completion percentage.",
  "recommended_action": "Issue formal Site Inspection Directive to verify physical progress claims.",
  "action_priority": "HIGH"
}
```
