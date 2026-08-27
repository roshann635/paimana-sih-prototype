"""
Synthetic Demonstration Provider (backend/app/satellite/providers/synthetic.py)
Generates high-fidelity mock fixtures for system demonstration.
IMPORTANT: All outputs from this provider are explicitly flagged with is_synthetic=True
and source='PAIMANA DEMO FIXTURE' to preserve scientific transparency and demo integrity.
"""

from typing import Dict, Any, List, Optional
import math
from backend.app.satellite.schemas import SatelliteProvenance

# Geographic center points and bounding boxes for key projects across India
PROJECT_GEO_REGISTRY = {
    # Highway / Expressway Segment (e.g. Delhi-Mumbai / Vadodara-Kim Expressway)
    "HIGHWAY": {
        "center": [22.418, 73.120],
        "coords": [
            [73.080, 22.380], [73.100, 22.400], [73.125, 22.420],
            [73.150, 22.440], [73.158, 22.435], [73.132, 22.412],
            [73.108, 22.392], [73.086, 22.374], [73.080, 22.380]
        ],
        "type": "Polygon"
    },
    # Rail Corridor & Bridge (e.g. Chenab / USBRL Link)
    "RAIL": {
        "center": [33.151, 74.882],
        "coords": [
            [74.860, 33.140], [74.875, 33.148], [74.890, 33.155],
            [74.910, 33.162], [74.912, 33.158], [74.892, 33.151],
            [74.878, 33.144], [74.862, 33.136], [74.860, 33.140]
        ],
        "type": "Polygon"
    },
    # Large Dam & Irrigation Reservoir (e.g. Polavaram / Kaleshwaram)
    "DAM": {
        "center": [17.258, 81.657],
        "coords": [
            [81.630, 17.240], [81.645, 17.265], [81.670, 17.275],
            [81.685, 17.255], [81.665, 17.235], [81.630, 17.240]
        ],
        "type": "Polygon"
    },
    # Solar Power Park (e.g. Bhadla / Pavagada)
    "SOLAR": {
        "center": [27.538, 71.916],
        "coords": [
            [71.890, 27.520], [71.940, 27.520], [71.940, 27.560],
            [71.890, 27.560], [71.890, 27.520]
        ],
        "type": "Polygon"
    },
    # Default Urban / Industrial Metro Area
    "DEFAULT": {
        "center": [19.076, 72.877],
        "coords": [
            [72.850, 19.060], [72.890, 19.060], [72.890, 19.090],
            [72.850, 19.090], [72.850, 19.060]
        ],
        "type": "Polygon"
    }
}


class SyntheticDemoProvider:
    """
    Supplies labeled synthetic demonstration fixtures for visual testing
    and offline demonstration without network dependency on external Copernicus servers.
    """

    @staticmethod
    def get_project_aoi(project_id: str, sector: str, state: str) -> Dict[str, Any]:
        """Generates realistic GeoJSON project boundary polygon."""
        sec_lower = sector.lower()
        if "road" in sec_lower or "highway" in sec_lower:
            geo_type = "HIGHWAY"
        elif "rail" in sec_lower:
            geo_type = "RAIL"
        elif "water" in sec_lower or "dam" in sec_lower:
            geo_type = "DAM"
        elif "power" in sec_lower or "renewable" in sec_lower or "solar" in sec_lower:
            geo_type = "SOLAR"
        else:
            geo_type = "DEFAULT"

        template = PROJECT_GEO_REGISTRY[geo_type]
        
        # Add deterministic small offset based on project_id hash for uniqueness
        offset = (hash(project_id) % 100) * 0.005
        coords = [[round(c[0] + offset, 4), round(c[1] + offset, 4)] for c in template["coords"]]
        center = [round(template["center"][0] + offset, 4), round(template["center"][1] + offset, 4)]

        return {
            "geojson": {
                "type": "Feature",
                "properties": {
                    "project_id": project_id,
                    "sector": sector,
                    "state": state,
                    "aoi_type": geo_type,
                    "crs": "EPSG:4326"
                },
                "geometry": {
                    "type": template["type"],
                    "coordinates": [coords]
                }
            },
            "center": center
        }

    @staticmethod
    def get_synthetic_provenance(
        sensor_type: str,
        evaluation_month: str,
        cloud_pct: float = 12.0
    ) -> SatelliteProvenance:
        """Constructs explicitly marked synthetic provenance metadata."""
        if sensor_type == "optical":
            return SatelliteProvenance(
                sensor="Sentinel-2A MSI (Synthetic Fixture)",
                product_type="L2A_Surface_Reflectance",
                acquisition_datetime=f"{evaluation_month}-14T05:30:00.000Z",
                product_id=f"SYNTH_S2A_L2A_{evaluation_month.replace('-', '')}_DEMO_V1",
                processing_baseline="PB_DEMO_05",
                cloud_cover_percent=cloud_pct,
                scene_classification_valid=True,
                resolution_m=10.0,
                aoi_coverage_percent=100.0,
                source="PAIMANA DEMO FIXTURE",
                is_synthetic=True,
                orbit_pass="DESCENDING"
            )
        else:
            return SatelliteProvenance(
                sensor="Sentinel-1B C-SAR (Synthetic Fixture)",
                product_type="GRD_IW_Gamma0",
                acquisition_datetime=f"{evaluation_month}-11T01:10:00.000Z",
                product_id=f"SYNTH_S1B_GRD_{evaluation_month.replace('-', '')}_DEMO_V1",
                processing_baseline="IPF_DEMO_03",
                cloud_cover_percent=0.0,
                scene_classification_valid=True,
                resolution_m=10.0,
                aoi_coverage_percent=100.0,
                source="PAIMANA DEMO FIXTURE",
                is_synthetic=True,
                orbit_pass="ASCENDING"
            )
