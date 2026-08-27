"""
Satellite Cross-Verification Schemas (backend/app/satellite/schemas.py)
Pydantic v2 data models for Sentinel-1/2 Earth observation evidence,
spatial suitability, discrepancy signals, and provenance tracking.
"""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class VerificationStatus(str, Enum):
    CONSISTENT = "CONSISTENT"
    INCONCLUSIVE = "INCONCLUSIVE"
    NOT_OBSERVABLE = "NOT_OBSERVABLE"
    REVIEW_RECOMMENDED = "REVIEW_RECOMMENDED"
    SIGNIFICANT_DISCREPANCY = "SIGNIFICANT_DISCREPANCY"


class SuitabilityLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNSUITABLE = "UNSUITABLE"


class SatelliteProvenance(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sensor: str  # e.g., "Sentinel-2A MSI" / "Sentinel-1B C-SAR"
    product_type: str  # "L2A_Surface_Reflectance" / "GRD_IW_Gamma0"
    acquisition_datetime: str
    product_id: str
    processing_baseline: str
    cloud_cover_percent: Optional[float] = 0.0
    scene_classification_valid: bool = True
    resolution_m: float = 10.0
    aoi_coverage_percent: float = 100.0
    source: str  # "Copernicus Data Space Ecosystem" or "PAIMANA DEMO FIXTURE"
    is_synthetic: bool = False
    orbit_pass: Optional[str] = "DESCENDING"


class OpticalFeatures(BaseModel):
    ndvi_baseline: float
    ndvi_current: float
    ndvi_delta: float
    ndbi_delta: float
    ndwi_delta: float
    bsi_delta: float
    optical_change_score: float  # 0.0 - 1.0


class SARFeatures(BaseModel):
    vv_backscatter_db_baseline: float
    vv_backscatter_db_current: float
    vv_delta_db: float
    vh_delta_db: float
    vv_vh_ratio_delta: float
    sar_coherence_index: float  # 0.0 - 1.0 (temporal coherence / structural change)
    sar_change_score: float  # 0.0 - 1.0


class SpatialSuitability(BaseModel):
    level: SuitabilityLevel
    suitability_score: float  # 0 - 100
    aoi_area_sqkm: float
    feature_width_m: float
    sector_archetype: str
    is_observable: bool
    suitability_rationale: str


class EvidenceQuality(BaseModel):
    overall_confidence: float  # 0 - 100
    aoi_quality_score: float  # 0 - 100
    optical_quality_score: float  # 0 - 100
    sar_quality_score: float  # 0 - 100
    temporal_coverage_score: float  # 0 - 100
    sensor_agreement_score: float  # 0 - 100
    is_quality_gate_passed: bool
    quality_notes: List[str] = []


class TemporalDivergencePoint(BaseModel):
    report_month: str
    reported_progress_pct: float
    satellite_change_index: Optional[float] = None
    optical_change_score: Optional[float] = None
    sar_change_score: Optional[float] = None
    discrepancy_pp: Optional[float] = None
    verification_status: VerificationStatus
    is_cloud_obscured: bool = False
    is_synthetic: bool = False


class SatelliteVerificationResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: str
    project_name: str
    project_code: str
    sector: str
    state: str
    evaluation_month: str
    
    # Core Comparison Metrics
    reported_progress_pct: float
    observed_site_change_index: float  # 0 - 100
    progress_discrepancy_pp: float  # (observed - reported)
    verification_status: VerificationStatus
    status_headline: str
    status_description: str
    
    # Multi-Sensor Scores (0 - 100)
    optical_evidence_score: float
    sar_evidence_score: float
    builtup_footprint_score: float
    temporal_consistency_score: float
    
    # Suitability & Quality
    spatial_suitability: SpatialSuitability
    evidence_quality: EvidenceQuality
    
    # First Point of Satellite Divergence
    first_divergence_month: Optional[str] = None
    divergence_narrative: Optional[str] = None
    
    # Provenance & Confidence Stack
    optical_provenance: Optional[SatelliteProvenance] = None
    sar_provenance: Optional[SatelliteProvenance] = None
    aoi_provenance: str = "PAIMANA DEMO GEOMETRY"
    is_synthetic: bool = False
    
    # Evidence Audit Trail & Reproducibility
    verification_audit_id: str = "SAT-2026-000184"
    processing_version: str = "sat-engine v1.0"
    config_version: str = "config v0.3-provisional"
    aoi_hash: str = "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
    reproducible_evidence_hash: str = "sha256:9a58b2a14e6b528b12e34d7f5a9108b981f5e821a00e5ff"
    
    # Independent Confidence Stack (never merged into a single arbitrary metric)
    data_quality_confidence: float = 94.0
    ml_model_confidence: float = 88.0
    satellite_evidence_confidence: float = 87.0
    
    disclaimer: str = (
        "Observed Site Change Index is an experimental multi-sensor evidence score and should "
        "not be interpreted as a direct measurement of construction completion percentage."
    )
    
    # Action Recommendation
    recommended_action: str
    action_priority: str  # HIGH, MEDIUM, ROUTINE




class SatelliteEvidenceVisuals(BaseModel):
    project_id: str
    aoi_geojson: Dict[str, Any]
    center_coords: List[float]  # [lat, lng]
    baseline_date: str
    current_date: str
    
    # Image product URLs or SVG/Canvas vector tile encodings
    optical_true_color_baseline: str
    optical_true_color_current: str
    optical_cir_nir_current: str
    sar_vv_backscatter_heatmap: str
    change_detection_mask: str
    
    optical_provenance: SatelliteProvenance
    sar_provenance: SatelliteProvenance
    is_synthetic: bool


class PortfolioSatelliteSummary(BaseModel):
    total_projects_evaluated: int
    observable_projects_count: int
    not_observable_count: int
    consistent_count: int
    review_recommended_count: int
    significant_discrepancy_count: int
    inconclusive_count: int
    
    high_discrepancy_projects: List[Dict[str, Any]]
    sector_suitability_distribution: Dict[str, Dict[str, Any]]
    average_evidence_confidence: float
    data_freshness_month: str
