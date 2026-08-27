"""
Satellite Configuration & Provisional Parameters (backend/app/satellite/config.py)
PROVISIONAL PROTOTYPE THRESHOLDS & WEIGHTS:
These parameters are configurable prototype settings and are to be calibrated
empirically against ground-truth field audit data before operational deployment.
"""

from typing import Dict, Any

# Sensor weighting configuration (sum = 1.0)
PROVISIONAL_WEIGHTS: Dict[str, float] = {
    "optical": 0.30,     # w_O: Optical surface reflectance, vegetation clearing, earthworks (NDVI/BSI)
    "sar": 0.35,         # w_S: SAR C-band radar backscatter (VV/VH Gamma0 delta)
    "builtup": 0.20,     # w_B: Built-up structural consolidation (NDBI)
    "temporal": 0.15     # w_T: Multi-snapshot temporal consistency
}

# Provisional Discrepancy Thresholds (in percentage points: Observed OSC_100 - Reported P)
PROVISIONAL_DISCREPANCY_THRESHOLDS: Dict[str, float] = {
    "consistent_lower": -15.0,        # >= -15.0 pp -> CONSISTENT
    "review_recommended_lower": -30.0 # -15.0 to -30.0 pp -> REVIEW_RECOMMENDED, < -30.0 pp -> SIGNIFICANT_DISCREPANCY
}

# Copernicus STAC & API Endpoints
CDSE_STAC_URL = "https://dataspace.copernicus.eu/stac/v1/search"
CDSE_CATALOG_URL = "https://catalogue.dataspace.copernicus.eu/resto/api/collections"

# Spatial Suitability Limits for Sentinel 10m Ground Sampling Distance
SUITABILITY_LIMITS = {
    "min_feature_width_m": 15.0,  # Minimum feature width to avoid NOT_OBSERVABLE
    "min_aoi_area_sqkm": 0.50,     # Minimum macro footprint for multi-pixel aggregation
    "high_suitability_score": 70.0,
    "medium_suitability_score": 45.0
}
