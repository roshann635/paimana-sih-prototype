"""
Optical Preprocessing & Spectral Index Engine (backend/app/satellite/preprocessing/optical.py)
Processes Sentinel-2 Level-2A surface reflectance 10m bands (B02 Blue, B03 Green, B04 Red, B08 NIR)
and incorporates SCL (Scene Classification Layer) for cloud, cirrus, and shadow masking.
"""

from typing import Dict, Any, Tuple
from backend.app.satellite.schemas import OpticalFeatures

def calculate_spectral_indices(
    blue_b02: float,
    green_b03: float,
    red_b04: float,
    nir_b08: float,
    swir_b11: float = 0.25
) -> Dict[str, float]:
    """
    Computes standard earth observation indices from Sentinel-2 surface reflectance:
    - NDVI = (NIR - Red) / (NIR + Red)  -> Vegetation clearing / disturbance
    - NDBI = (SWIR - NIR) / (SWIR + NIR) -> Built-up & concrete footprint change
    - NDWI = (Green - NIR) / (Green + NIR) -> Surface water / drainage diversion
    - BSI  = ((Red + SWIR) - (NIR + Blue)) / ((Red + SWIR) + (NIR + Blue)) -> Bare soil excavation
    """
    eps = 1e-6
    
    # NDVI: Normalized Difference Vegetation Index
    ndvi = (nir_b08 - red_b04) / (nir_b08 + red_b04 + eps)
    ndvi = max(-1.0, min(1.0, ndvi))
    
    # NDBI: Normalized Difference Built-Up Index
    ndbi = (swir_b11 - nir_b08) / (swir_b11 + nir_b08 + eps)
    ndbi = max(-1.0, min(1.0, ndbi))
    
    # NDWI: Normalized Difference Water Index (McFeeters)
    ndwi = (green_b03 - nir_b08) / (green_b03 + nir_b08 + eps)
    ndwi = max(-1.0, min(1.0, ndwi))
    
    # BSI: Bare Soil Index
    bsi_num = (red_b04 + swir_b11) - (nir_b08 + blue_b02)
    bsi_den = (red_b04 + swir_b11) + (nir_b08 + blue_b02) + eps
    bsi = bsi_num / bsi_den
    bsi = max(-1.0, min(1.0, bsi))
    
    return {
        "ndvi": round(ndvi, 3),
        "ndbi": round(ndbi, 3),
        "ndwi": round(ndwi, 3),
        "bsi": round(bsi, 3)
    }


def compute_optical_change(
    baseline_indices: Dict[str, float],
    current_indices: Dict[str, float],
    scl_cloud_coverage_pct: float = 0.0
) -> Tuple[OpticalFeatures, float]:
    """
    Derives normalized optical change score O (0.0 to 1.0) by analyzing
    vegetation loss, bare earth emergence, and built-up structural consolidation,
    accounting for SCL cloud masking quality.
    """
    ndvi_base = baseline_indices.get("ndvi", 0.45)
    ndvi_curr = current_indices.get("ndvi", 0.15)
    ndvi_delta = ndvi_curr - ndvi_base  # Typically negative during site clearing
    
    ndbi_base = baseline_indices.get("ndbi", -0.20)
    ndbi_curr = current_indices.get("ndbi", 0.35)
    ndbi_delta = ndbi_curr - ndbi_base  # Positive as built structure increases
    
    ndwi_base = baseline_indices.get("ndwi", -0.10)
    ndwi_curr = current_indices.get("ndwi", -0.05)
    ndwi_delta = ndwi_curr - ndwi_base
    
    bsi_base = baseline_indices.get("bsi", 0.05)
    bsi_curr = current_indices.get("bsi", 0.40)
    bsi_delta = bsi_curr - bsi_base     # Positive as earthworks / grading proceed
    
    # Change score calculation:
    # 1. Earthwork / vegetation clearing component: abs(ndvi_delta) + bsi_delta
    # 2. Structural emergence component: ndbi_delta
    clearing_signal = min(1.0, max(0.0, -ndvi_delta * 1.2))
    soil_signal = min(1.0, max(0.0, bsi_delta * 1.5))
    builtup_signal = min(1.0, max(0.0, ndbi_delta * 1.4))
    
    raw_optical_score = (clearing_signal * 0.30) + (soil_signal * 0.30) + (builtup_signal * 0.40)
    
    # Adjust for cloud degradation if SCL indicates cloud obscuration
    cloud_penalty = max(0.0, (scl_cloud_coverage_pct - 15.0) / 85.0)
    optical_score = max(0.0, min(1.0, raw_optical_score * (1.0 - (cloud_penalty * 0.5))))
    
    features = OpticalFeatures(
        ndvi_baseline=ndvi_base,
        ndvi_current=ndvi_curr,
        ndvi_delta=round(ndvi_delta, 3),
        ndbi_delta=round(ndbi_delta, 3),
        ndwi_delta=round(ndwi_delta, 3),
        bsi_delta=round(bsi_delta, 3),
        optical_change_score=round(optical_score, 3)
    )
    
    # Quality score for optical observation (100 is pristine clear, 0 is fully cloud covered)
    optical_quality_score = max(0.0, min(100.0, 100.0 - (scl_cloud_coverage_pct * 1.2)))
    
    return features, round(optical_quality_score, 1)
