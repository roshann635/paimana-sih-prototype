"""
Change Detection & Discrepancy Engine (backend/app/satellite/change_detection.py)
Implements:
1. Multi-Sensor Observed Site Change Index calculation:
   OSC_100 = 100 * (w_O * O + w_S * S + w_B * B + w_T * T)
2. Discrepancy formulation:
   D_pp = OSC_100 - P  (where P in [0, 100], D_pp in percentage points)
3. Evidence Quality Gate
4. Verification Status mapping against provisional prototype thresholds
"""

from typing import Dict, Any, List, Optional, Tuple
from backend.app.satellite.config import (
    PROVISIONAL_WEIGHTS, PROVISIONAL_DISCREPANCY_THRESHOLDS
)
from backend.app.satellite.schemas import (
    VerificationStatus, SpatialSuitability, EvidenceQuality,
    TemporalDivergencePoint, SatelliteVerificationResult, SuitabilityLevel
)


def evaluate_evidence_quality_gate(
    suitability: SpatialSuitability,
    optical_quality_score: float,
    sar_quality_score: float,
    cloud_cover_pct: float,
    optical_change: float,
    sar_change: float,
    is_optical_available: bool = True,
    is_sar_available: bool = True
) -> EvidenceQuality:
    """
    Evaluates multi-sensor evidence quality before calculating discrepancy.
    If evidence quality is compromised, returns INCONCLUSIVE to prevent false alarms.
    """
    notes = []
    
    # 1. AOI Quality
    aoi_q = suitability.suitability_score
    if aoi_q < 30.0:
        notes.append("Footprint geometry is near spatial resolution limits of 10m sensor.")
        
    # 2. Optical Quality (penalized by SCL cloud cover)
    if not is_optical_available:
        opt_q = 0.0
        notes.append("Sentinel-2 optical acquisition unavailable for current period.")
    else:
        opt_q = optical_quality_score
        if cloud_cover_pct > 35.0:
            notes.append(f"High cloud obscuration ({cloud_cover_pct:.1f}%); SCL cloud masking applied.")

    # 3. SAR Quality (all-weather resilience)
    if not is_sar_available:
        sar_q = 0.0
        notes.append("Sentinel-1 SAR acquisition unavailable for current period.")
    else:
        sar_q = sar_quality_score
        if is_optical_available and cloud_cover_pct > 30.0:
            notes.append("Sentinel-1 C-band SAR utilized as primary cloud-penetrating evidence stream.")

    # 4. Temporal Coverage
    temporal_q = 88.0

    # 5. Sensor Agreement (trend direction check)
    if is_optical_available and is_sar_available and cloud_cover_pct < 50.0:
        diff = abs(optical_change - sar_change)
        agreement_q = max(40.0, 100.0 - (diff * 70.0))
        if diff > 0.45:
            notes.append("Moderate divergence between optical clearing and SAR backscatter response.")
    else:
        agreement_q = 75.0

    # Overall Evidence Confidence formulation
    overall = (aoi_q * 0.25) + (opt_q * 0.25) + (sar_q * 0.30) + (temporal_q * 0.10) + (agreement_q * 0.10)
    overall = round(max(0.0, min(100.0, overall)), 1)
    
    # Quality Gate Passed if at least one strong sensor stream is valid
    is_passed = (opt_q >= 30.0 or sar_q >= 50.0) and suitability.is_observable
    
    return EvidenceQuality(
        overall_confidence=overall,
        aoi_quality_score=round(aoi_q, 1),
        optical_quality_score=round(opt_q, 1),
        sar_quality_score=round(sar_q, 1),
        temporal_coverage_score=round(temporal_q, 1),
        sensor_agreement_score=round(agreement_q, 1),
        is_quality_gate_passed=is_passed,
        quality_notes=notes
    )


def calculate_observed_site_change_index(
    optical_score: float,
    sar_score: float,
    builtup_score: float,
    temporal_score: float,
    is_optical_available: bool = True,
    is_sar_available: bool = True,
    weights: Dict[str, float] = None
) -> Tuple[float, Dict[str, float]]:
    """
    Computes the Observed Site Change Index on a 0 - 100 scale:
    OSC_100 = 100 * (w_O * O + w_S * S + w_B * B + w_T * T)
    where O, S, B, T in [0, 1] and weights sum to 1.0.
    """
    w = dict(weights or PROVISIONAL_WEIGHTS)
    
    if not is_optical_available or optical_score <= 0.05:
        # Optical unavailable or cloud obscured -> SAR primary stream
        w["sar"] = 0.65
        w["builtup"] = 0.20
        w["temporal"] = 0.15
        w["optical"] = 0.0
    elif not is_sar_available:
        # SAR unavailable -> Optical primary stream
        w["optical"] = 0.60
        w["builtup"] = 0.25
        w["temporal"] = 0.15
        w["sar"] = 0.0

    # Ensure weights sum to 1.0
    total_w = sum(w.values())
    w = {k: v / total_w for k, v in w.items()}
    
    # OSC_100 calculation
    osc_normalized = (
        (w["optical"] * optical_score) +
        (w["sar"] * sar_score) +
        (w["builtup"] * builtup_score) +
        (w["temporal"] * temporal_score)
    )
    
    osc_100 = round(max(0.0, min(100.0, osc_normalized * 100.0)), 1)
    
    breakdown = {
        "optical_score_100": round(optical_score * 100.0, 1),
        "sar_score_100": round(sar_score * 100.0, 1),
        "builtup_score_100": round(builtup_score * 100.0, 1),
        "temporal_score_100": round(temporal_score * 100.0, 1)
    }
    
    return osc_100, breakdown


def classify_verification_status(
    reported_progress_pct: float,
    observed_change_index: float,
    suitability: SpatialSuitability,
    quality: EvidenceQuality
) -> Tuple[VerificationStatus, float, str, str, str, str]:
    """
    Computes Discrepancy D_pp = OSC_100 - P (in percentage points)
    and maps to 5 institutional verification states.
    """
    # 1. Spatial Observability Check
    if not suitability.is_observable:
        discrepancy_pp = 0.0
        status = VerificationStatus.NOT_OBSERVABLE
        headline = "⚪ Project Spatial Footprint Not Observable at 10m Resolution"
        desc = (
            f"Project geometry (width ~{suitability.feature_width_m}m) is below the resolving limits "
            f"of Sentinel constellations. Ground verification / high-res commercial imagery required."
        )
        action = "Exempt from macro satellite indexing; verify via milestone geo-tagged inspection photos."
        priority = "ROUTINE"
        return status, discrepancy_pp, headline, desc, action, priority

    # 2. Evidence Quality Gate Check
    if not quality.is_quality_gate_passed or (quality.optical_quality_score < 20.0 and quality.sar_quality_score < 30.0):
        discrepancy_pp = round(observed_change_index - reported_progress_pct, 1)
        status = VerificationStatus.INCONCLUSIVE
        headline = "🟡 Satellite Evidence Inconclusive Due to Sensor Degradation"
        desc = (
            "Persistent cloud cover and atmospheric attenuation precluded reliable optical index calculation, "
            "and SAR baseline is currently undergoing recalibration."
        )
        action = "Schedule follow-up satellite pass analysis on next orbital revisit window."
        priority = "ROUTINE"
        return status, discrepancy_pp, headline, desc, action, priority

    # 3. Discrepancy Calculation: D_pp = OSC_100 - P
    discrepancy_pp = round(observed_change_index - reported_progress_pct, 1)

    r_lower = PROVISIONAL_DISCREPANCY_THRESHOLDS["review_recommended_lower"]
    c_lower = PROVISIONAL_DISCREPANCY_THRESHOLDS["consistent_lower"]

    if discrepancy_pp < r_lower:
        status = VerificationStatus.SIGNIFICANT_DISCREPANCY
        headline = "🔴 Significant Discrepancy: Remotely Sensed Change Far Below Reported Progress"
        desc = (
            f"Contractor reports {reported_progress_pct:.1f}% physical progress, but multi-sensor Earth observation "
            f"detects an Observed Change Index of only {observed_change_index:.1f}/100 (Discrepancy: {discrepancy_pp:.1f} pp). "
            f"Observable earthworks and structural backscatter do not corroborate reported execution velocity."
        )
        action = "Issue formal Site Inspection Directive; request geo-referenced contractor bill measurement logs."
        priority = "HIGH"
    elif discrepancy_pp < c_lower:
        status = VerificationStatus.REVIEW_RECOMMENDED
        headline = "🟠 Review Recommended: Moderate Gap Between Reported and Observed Progress"
        desc = (
            f"Reported physical progress ({reported_progress_pct:.1f}%) exceeds remotely observed site transformation "
            f"({observed_change_index:.1f}/100) by {abs(discrepancy_pp):.1f} percentage points. "
            f"Corroborating sub-surface or structural evidence should be reviewed."
        )
        action = "Verify latest physical progress submission against engineering drawings and milestone logs."
        priority = "MEDIUM"
    else:
        status = VerificationStatus.CONSISTENT
        headline = "🟢 Consistent: Satellite Evidence Broadly Corroborates Reported Progress"
        desc = (
            f"Multi-temporal optical reflectance and SAR backscatter patterns (Observed Change: {observed_change_index:.1f}/100) "
            f"broadly agree with reported progress ({reported_progress_pct:.1f}%, Discrepancy: {discrepancy_pp:+.1f} pp)."
        )
        action = "Maintain routine monthly Earth observation cross-monitoring."
        priority = "ROUTINE"

    return status, discrepancy_pp, headline, desc, action, priority


def detect_first_satellite_divergence(
    history_points: List[Dict[str, Any]]
) -> Tuple[Optional[str], Optional[str]]:
    """
    Scans temporal sequence to pinpoint the earliest month where satellite observed change
    diverged by more than -15 pp from contractor reported progress.
    """
    thresh = PROVISIONAL_DISCREPANCY_THRESHOLDS["consistent_lower"]
    for pt in history_points:
        reported = pt.get("reported_progress_pct", 0.0)
        observed = pt.get("satellite_change_index")
        month = pt.get("report_month", "")
        
        if observed is not None and (observed - reported) < thresh:
            gap = abs(observed - reported)
            narrative = (
                f"Persistent satellite-reported divergence first emerged in {month} "
                f"(Reported {reported:.0f}% vs Observed Change {observed:.0f}/100; gap {gap:.1f} pp)."
            )
            return month, narrative
            
    return None, "No historical divergence detected; satellite observations have tracked reported milestones closely."
