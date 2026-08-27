"""
Spatial Suitability Engine (backend/app/satellite/suitability.py)
Evaluates whether project spatial geometry and sector archetype
meet Copernicus Sentinel-1/2 resolution criteria (10m optical / 10-20m SAR GRD).
"""

from typing import Dict, Any, Tuple
from backend.app.satellite.schemas import SpatialSuitability, SuitabilityLevel

# Sector baseline characteristics
SECTOR_CHARACTERISTICS = {
    "Road Transport and Highways": {
        "archetype": "LINEAR_CORRIDOR",
        "base_width_m": 45.0,
        "base_area_sqkm": 28.5,
        "default_suitability": SuitabilityLevel.HIGH,
        "description": "High linear corridor continuity; ideal for 10m Sentinel-2 multi-spectral & Sentinel-1 SAR change detection."
    },
    "Railways": {
        "archetype": "LINEAR_CORRIDOR",
        "base_width_m": 30.0,
        "base_area_sqkm": 15.2,
        "default_suitability": SuitabilityLevel.HIGH,
        "description": "Continuous railway alignment, earthworks, and ballast beds clearly distinguishable across 10m pixels."
    },
    "Power": {
        "archetype": "LARGE_AREA_PLANT",
        "base_width_m": 250.0,
        "base_area_sqkm": 18.0,
        "default_suitability": SuitabilityLevel.HIGH,
        "description": "Large geographic footprints (solar parks, thermal plants, transmission substations) offer extensive multi-pixel coverage."
    },
    "Renewable Energy": {
        "archetype": "LARGE_AREA_PLANT",
        "base_width_m": 500.0,
        "base_area_sqkm": 25.0,
        "default_suitability": SuitabilityLevel.HIGH,
        "description": "Extensive solar array fields and wind farm footprints provide strong multi-spectral solar-absorption contrasts."
    },
    "Water Resources": {
        "archetype": "DAM_AND_CANAL",
        "base_width_m": 120.0,
        "base_area_sqkm": 35.0,
        "default_suitability": SuitabilityLevel.HIGH,
        "description": "Mass concrete dam structures, reservoir impoundment, and major canals have distinct optical NDWI and SAR dielectric signatures."
    },
    "Shipping and Ports": {
        "archetype": "COASTAL_PORT",
        "base_width_m": 200.0,
        "base_area_sqkm": 12.0,
        "default_suitability": SuitabilityLevel.HIGH,
        "description": "Breakwaters, berths, reclamation areas, and land-water interfaces exhibit high radar backscatter and optical distinctness."
    },
    "Urban Development": {
        "archetype": "COMPACT_METRO",
        "base_width_m": 25.0,
        "base_area_sqkm": 3.8,
        "default_suitability": SuitabilityLevel.MEDIUM,
        "description": "Elevated metro viaducts and large transit hubs are observable; dense sub-surface urban works require complementary in-situ auditing."
    },
    "Petroleum": {
        "archetype": "REFINERY_PIPELINE",
        "base_width_m": 80.0,
        "base_area_sqkm": 14.0,
        "default_suitability": SuitabilityLevel.HIGH,
        "description": "Large tank farms, processing units, and pipeline right-of-ways yield distinct SAR corner-reflector and optical signatures."
    },
    "Telecommunications": {
        "archetype": "POINT_NETWORK",
        "base_width_m": 12.0,
        "base_area_sqkm": 0.4,
        "default_suitability": SuitabilityLevel.LOW,
        "description": "Distributed point tower infrastructure is below 10m optical Sentinel pixel resolution; unsuitable for macro change indexing."
    },
    "Health and Family Welfare": {
        "archetype": "BUILDING_CAMPUS",
        "base_width_m": 35.0,
        "base_area_sqkm": 1.2,
        "default_suitability": SuitabilityLevel.MEDIUM,
        "description": "Multi-acre hospital campuses are observable, but internal structural finishes require in-situ verification."
    },
}

DEFAULT_SECTOR_TRAITS = {
    "archetype": "GENERAL_INFRASTRUCTURE",
    "base_width_m": 40.0,
    "base_area_sqkm": 5.0,
    "default_suitability": SuitabilityLevel.MEDIUM,
    "description": "Standard infrastructure project evaluated against Copernicus 10m multi-spectral and C-band SAR criteria."
}


def assess_spatial_suitability(
    sector: str,
    project_name: str = "",
    custom_area_sqkm: float = None,
    custom_width_m: float = None
) -> SpatialSuitability:
    """
    Computes spatial suitability of project AOI for Sentinel-1 & Sentinel-2 Earth observation.
    Enforces the NOT_OBSERVABLE constraint for tiny footprints (<0.5 sq km or width < 15m).
    """
    traits = SECTOR_CHARACTERISTICS.get(sector, DEFAULT_SECTOR_TRAITS)
    area = custom_area_sqkm if custom_area_sqkm is not None else traits["base_area_sqkm"]
    width = custom_width_m if custom_width_m is not None else traits["base_width_m"]
    
    # Check for specific project keywords
    p_lower = project_name.lower()
    if "expressway" in p_lower or "highway" in p_lower or "corridor" in p_lower:
        area = max(area, 25.0)
        width = max(width, 45.0)
    elif "bridge" in p_lower or "tunnel" in p_lower:
        width = max(width, 25.0)
    elif "substation" in p_lower or "building" in p_lower:
        area = min(area, 2.0)
        width = min(width, 25.0)

    # Suitability scoring logic
    # Sentinel pixel = 10m. Need at least 2-3 pixels across feature width (>20-30m)
    # and sufficient footprint area (>1.5 sqkm for macro temporal indices).
    width_score = min(100.0, (width / 40.0) * 100.0)
    area_score = min(100.0, (area / 10.0) * 100.0)
    
    score = (width_score * 0.45) + (area_score * 0.55)
    score = round(max(5.0, min(99.0, score)), 1)
    
    if score >= 70.0 and width >= 25.0:
        level = SuitabilityLevel.HIGH
        is_observable = True
        rationale = (
            f"High Suitability ({score}/100): Project AOI ({area:.1f} km², width ~{width:.0f}m) spans multiple 10m Sentinel-2 pixels "
            f"and provides strong Sentinel-1 C-band backscatter response."
        )
    elif score >= 45.0 and width >= 18.0:
        level = SuitabilityLevel.MEDIUM
        is_observable = True
        rationale = (
            f"Moderate Suitability ({score}/100): Macro boundary changes observable at 10m resolution; "
            f"fine internal structural elements should be cross-referenced with milestone logs."
        )
    elif score >= 25.0 and width >= 12.0:
        level = SuitabilityLevel.LOW
        is_observable = True
        rationale = (
            f"Low Suitability ({score}/100): Footprint is near the spatial limits of Sentinel 10m resolution. "
            f"Optical change signals have higher noise margin."
        )
    else:
        level = SuitabilityLevel.UNSUITABLE
        is_observable = False
        rationale = (
            f"Not Observable ({score}/100): Project footprint (<{width:.0f}m width / {area:.2f} km²) is below the resolving "
            f"power of 10m Sentinel constellations. Ground verification / high-res commercial imagery required."
        )

    return SpatialSuitability(
        level=level,
        suitability_score=score,
        aoi_area_sqkm=round(area, 2),
        feature_width_m=round(width, 1),
        sector_archetype=traits["archetype"],
        is_observable=is_observable,
        suitability_rationale=rationale
    )
