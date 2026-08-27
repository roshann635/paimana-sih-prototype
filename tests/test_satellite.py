"""
Scientific Invariant Test Suite for Satellite Cross-Verification (tests/test_satellite.py)
Validates all 10 core scientific invariants:
1. No progress, no change -> CONSISTENT
2. Matching progress -> CONSISTENT
3. Moderate discrepancy -> REVIEW_RECOMMENDED
4. Large persistent discrepancy -> SIGNIFICANT_DISCREPANCY
5. Cloudy optical with SAR available -> SAR-primary evidence fallback
6. Both sensors unusable -> INCONCLUSIVE
7. Tiny AOI footprint -> NOT_OBSERVABLE
8. Synthetic provenance -> is_synthetic=True & DEMO FIXTURE source
9. Copernicus provider -> is_synthetic=False & CDSE source
10. Strict temporal boundary -> no future leakage (acquisition <= T)
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.satellite.schemas import (
    VerificationStatus, SuitabilityLevel, SpatialSuitability
)
from backend.app.satellite.suitability import assess_spatial_suitability
from backend.app.satellite.preprocessing.optical import calculate_spectral_indices, compute_optical_change
from backend.app.satellite.preprocessing.sar import compute_sar_backscatter_change
from backend.app.satellite.change_detection import (
    evaluate_evidence_quality_gate, calculate_observed_site_change_index,
    classify_verification_status
)
from backend.app.satellite.providers.copernicus import CopernicusSTACProvider
from backend.app.satellite.providers.synthetic import SyntheticDemoProvider

client = TestClient(app)


# Test 1: Invariant 1 — No progress, no change -> CONSISTENT
def test_invariant_1_no_progress_no_change():
    suit = assess_spatial_suitability("Road Transport and Highways", "Highway Project")
    quality = evaluate_evidence_quality_gate(
        suitability=suit, optical_quality_score=90.0, sar_quality_score=92.0,
        cloud_cover_pct=5.0, optical_change=0.0, sar_change=0.0
    )
    osc_100, _ = calculate_observed_site_change_index(0.0, 0.0, 0.0, 0.0)
    status, disc_pp, _, _, _, _ = classify_verification_status(0.0, osc_100, suit, quality)
    
    assert osc_100 == 0.0
    assert disc_pp == 0.0
    assert status == VerificationStatus.CONSISTENT


# Test 2: Invariant 2 — Matching progress -> CONSISTENT
def test_invariant_2_matching_progress():
    suit = assess_spatial_suitability("Road Transport and Highways", "Expressway Corridor")
    quality = evaluate_evidence_quality_gate(
        suitability=suit, optical_quality_score=90.0, sar_quality_score=92.0,
        cloud_cover_pct=5.0, optical_change=0.68, sar_change=0.72
    )
    osc_100, _ = calculate_observed_site_change_index(0.68, 0.72, 0.70, 0.70)
    # Reported 70%, Observed ~70%
    status, disc_pp, _, _, _, _ = classify_verification_status(70.0, osc_100, suit, quality)
    
    assert abs(disc_pp) < 15.0
    assert status == VerificationStatus.CONSISTENT


# Test 3: Invariant 3 — Moderate discrepancy (-18 pp) -> REVIEW_RECOMMENDED
def test_invariant_3_moderate_discrepancy():
    suit = assess_spatial_suitability("Railways", "Railway Corridor Double Track")
    quality = evaluate_evidence_quality_gate(
        suitability=suit, optical_quality_score=85.0, sar_quality_score=90.0,
        cloud_cover_pct=10.0, optical_change=0.50, sar_change=0.54
    )
    osc_100, _ = calculate_observed_site_change_index(0.50, 0.54, 0.52, 0.52)
    # Reported 70%, Observed ~52% (diff -18 pp)
    status, disc_pp, _, _, _, priority = classify_verification_status(70.0, osc_100, suit, quality)
    
    assert disc_pp <= -15.0 and disc_pp >= -30.0
    assert status == VerificationStatus.REVIEW_RECOMMENDED
    assert priority == "MEDIUM"


# Test 4: Invariant 4 — Large persistent discrepancy (-45 pp) -> SIGNIFICANT_DISCREPANCY
def test_invariant_4_large_discrepancy():
    suit = assess_spatial_suitability("Road Transport and Highways", "Expressway")
    quality = evaluate_evidence_quality_gate(
        suitability=suit, optical_quality_score=85.0, sar_quality_score=90.0,
        cloud_cover_pct=10.0, optical_change=0.32, sar_change=0.38
    )
    osc_100, _ = calculate_observed_site_change_index(0.32, 0.38, 0.35, 0.35)
    # Reported 80%, Observed 35% (diff -45 pp)
    status, disc_pp, _, _, _, priority = classify_verification_status(80.0, osc_100, suit, quality)
    
    assert disc_pp < -30.0
    assert status == VerificationStatus.SIGNIFICANT_DISCREPANCY
    assert priority == "HIGH"


# Test 5: Invariant 5 — Cloudy optical with SAR available -> SAR-primary fallback
def test_invariant_5_cloudy_optical_sar_fallback():
    suit = assess_spatial_suitability("Power", "Solar Park")
    # Optical heavily cloud covered (70% clouds) -> optical quality degraded
    _, opt_q = compute_optical_change(
        {"ndvi": 0.45, "ndbi": -0.2, "ndwi": -0.1, "bsi": 0.05},
        {"ndvi": 0.20, "ndbi": 0.3, "ndwi": -0.05, "bsi": 0.35},
        scl_cloud_coverage_pct=70.0
    )
    sar_feat, sar_q = compute_sar_backscatter_change(-14.0, -9.0, -21.0, -16.5)
    
    quality = evaluate_evidence_quality_gate(
        suitability=suit, optical_quality_score=opt_q, sar_quality_score=sar_q,
        cloud_cover_pct=70.0, optical_change=0.2, sar_change=sar_feat.sar_change_score
    )
    # Quality gate should still pass because SAR C-band is all-weather
    assert quality.is_quality_gate_passed is True
    assert quality.sar_quality_score >= 85.0


# Test 6: Invariant 6 — Both sensors unusable -> INCONCLUSIVE
def test_invariant_6_both_sensors_unusable():
    suit = assess_spatial_suitability("Road Transport and Highways", "Highway")
    quality = evaluate_evidence_quality_gate(
        suitability=suit, optical_quality_score=10.0, sar_quality_score=15.0,
        cloud_cover_pct=95.0, optical_change=0.1, sar_change=0.1,
        is_optical_available=False, is_sar_available=False
    )
    status, _, _, _, _, _ = classify_verification_status(65.0, 30.0, suit, quality)
    
    assert status == VerificationStatus.INCONCLUSIVE


# Test 7: Invariant 7 — Tiny AOI footprint (<10m resolvable) -> NOT_OBSERVABLE
def test_invariant_7_tiny_aoi_not_observable():
    suit = assess_spatial_suitability(
        sector="Telecommunications",
        project_name="Single Point Tower Substation",
        custom_area_sqkm=0.08,
        custom_width_m=8.0
    )
    quality = evaluate_evidence_quality_gate(
        suitability=suit, optical_quality_score=90.0, sar_quality_score=90.0,
        cloud_cover_pct=5.0, optical_change=0.5, sar_change=0.5
    )
    status, _, _, _, _, _ = classify_verification_status(50.0, 50.0, suit, quality)
    
    assert suit.is_observable is False
    assert status == VerificationStatus.NOT_OBSERVABLE


# Test 8: Invariant 8 — Synthetic provenance is explicitly flagged
def test_invariant_8_synthetic_provenance():
    prov = SyntheticDemoProvider.get_synthetic_provenance("optical", "2026-06")
    assert prov.is_synthetic is True
    assert prov.source == "PAIMANA DEMO FIXTURE"


# Test 9: Invariant 9 — Copernicus STAC discovery preserves CDSE metadata
def test_invariant_9_copernicus_discovery():
    copernicus = CopernicusSTACProvider()
    prov_s2 = copernicus.discover_sentinel2_l2a([73.12, 22.42], "2026-06")
    prov_s1 = copernicus.discover_sentinel1_grd([73.12, 22.42], "2026-06")
    
    assert prov_s2.is_synthetic is False
    assert prov_s2.source == "Copernicus Data Space Ecosystem"
    assert "S2A_MSIL2A" in prov_s2.product_id
    assert prov_s1.is_synthetic is False
    assert "S1A_IW_GRDH" in prov_s1.product_id


# Test 10: Invariant 10 — Strict temporal boundary (no future leakage)
def test_invariant_10_temporal_boundary_no_leakage():
    copernicus = CopernicusSTACProvider()
    prov_past = copernicus.discover_sentinel2_l2a([73.12, 22.42], "2025-08")
    
    # Acquisition date must be in August 2025 or earlier, never in 2026
    assert "2025-08" in prov_past.acquisition_datetime
    assert "2026" not in prov_past.acquisition_datetime


# API Endpoint Integration Tests
def test_satellite_api_project_verification():
    # Test on default project
    resp = client.get("/api/v1/projects")
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    if items:
        pid = items[0]["project_id"]
        sat_resp = client.get(f"/api/v1/projects/{pid}/satellite")
        assert sat_resp.status_code == 200
        data = sat_resp.json()
        assert "observed_site_change_index" in data
        assert "progress_discrepancy_pp" in data
        assert "verification_status" in data
        assert "evidence_quality" in data
        assert "spatial_suitability" in data


def test_satellite_api_portfolio_overview():
    resp = client.get("/api/v1/satellite/portfolio-overview")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_projects_evaluated" in data
    assert "consistent_count" in data
    assert "high_discrepancy_projects" in data


# Test 25: Project -> Satellite Journey Integration
def test_test_25_project_to_satellite_journey():
    resp = client.get("/api/v1/projects?limit=5")
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    assert len(items) > 0
    pid = items[0]["project_id"]

    sat_resp = client.get(f"/api/v1/projects/{pid}/satellite")
    assert sat_resp.status_code == 200
    sat_data = sat_resp.json()
    assert sat_data["project_id"] == pid
    assert "reported_progress_pct" in sat_data
    assert "observed_site_change_index" in sat_data
    assert "spatial_suitability" in sat_data
    assert "evidence_quality" in sat_data
    assert "confidence_stack" not in sat_data or isinstance(sat_data.get("data_quality_confidence"), (int, float))


# Test 26: Satellite <-> EVM Temporal Consistency
def test_test_26_satellite_evm_temporal_consistency():
    resp = client.get("/api/v1/projects?limit=1")
    pid = resp.json()["items"][0]["project_id"]
    
    proj_resp = client.get(f"/api/v1/projects/{pid}")
    assert proj_resp.status_code == 200
    evm_month = proj_resp.json()["latest_snapshot"]["report_month"]

    sat_resp = client.get(f"/api/v1/projects/{pid}/satellite")
    assert sat_resp.status_code == 200
    sat_month = sat_resp.json()["evaluation_month"]

    # Satellite engine must evaluate against the exact reporting month of the EVM snapshot
    assert sat_month == evm_month


# Test 27: Strict Future Imagery Rejection (T = 2026-07-31 rejects 2026-08-03+)
def test_test_27_strict_future_imagery_rejection():
    copernicus = CopernicusSTACProvider()
    eval_m = "2026-07"
    prov = copernicus.discover_sentinel2_l2a([73.12, 22.42], evaluation_month=eval_m)
    
    # Must be on or before 2026-07-31
    acq_date = prov.acquisition_datetime
    assert acq_date.startswith("2026-07")
    assert "2026-08" not in acq_date


# Test 28: Provenance & Synthetic Disclaimer Integrity
def test_test_28_provenance_and_disclaimer_integrity():
    resp = client.get("/api/v1/projects?limit=1")
    pid = resp.json()["items"][0]["project_id"]
    
    sat_resp = client.get(f"/api/v1/projects/{pid}/satellite?use_live_copernicus=false")
    sat_data = sat_resp.json()
    
    assert sat_data["is_synthetic"] is True
    assert sat_data["aoi_provenance"] == "PAIMANA DEMO GEOMETRY"
    assert "experimental multi-sensor evidence score" in sat_data["disclaimer"]


# Test 29: Missing / Unobservable AOI returns NOT_OBSERVABLE
def test_test_29_unobservable_aoi_gate():
    from backend.app.satellite.suitability import assess_spatial_suitability
    # Footprint below 10m Ground Sampling Distance
    suit = assess_spatial_suitability(
        sector="Telecommunications",
        project_name="Single Tower Pole",
        custom_area_sqkm=0.01,
        custom_width_m=4.0
    )
    assert suit.is_observable is False
    assert suit.level == SuitabilityLevel.UNSUITABLE


# Test 30: Provider Failure / Inconclusive Graceful Handling
def test_test_30_provider_failure_graceful_handling():
    suit = assess_spatial_suitability("Road Transport and Highways", "Expressway Corridor")
    # Simulate both optical & SAR streams down/degraded
    quality = evaluate_evidence_quality_gate(
        suitability=suit,
        optical_quality_score=0.0,
        sar_quality_score=0.0,
        cloud_cover_pct=100.0,
        optical_change=0.0,
        sar_change=0.0,
        is_optical_available=False,
        is_sar_available=False
    )
    status, _, headline, _, _, _ = classify_verification_status(
        reported_progress_pct=60.0,
        observed_change_index=0.0,
        suitability=suit,
        quality=quality
    )
    # Must return INCONCLUSIVE rather than silently fabricating fake live evidence
    assert status == VerificationStatus.INCONCLUSIVE
    assert "Inconclusive" in headline

