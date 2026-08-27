"""
Satellite Cross-Verification API Routes (backend/app/api/satellite_routes.py)
Endpoints for project satellite cross-verification, temporal divergence curves,
evidence imagery packages, and portfolio-wide Earth observation summaries.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.satellite.schemas import (
    SatelliteVerificationResult, SatelliteEvidenceVisuals,
    TemporalDivergencePoint, PortfolioSatelliteSummary
)
from backend.app.satellite.service import satellite_service

router = APIRouter(tags=["Satellite Cross-Verification"])


@router.get("/projects/{project_id}/satellite", response_model=SatelliteVerificationResult)
def get_project_satellite_verification(
    project_id: str,
    evaluation_month: Optional[str] = Query(None, description="Evaluation snapshot month (YYYY-MM)"),
    use_live_copernicus: bool = Query(False, description="Whether to query live Copernicus CDSE STAC"),
    db: Session = Depends(get_db)
):
    """
    Returns empirical satellite cross-verification signals, Observed Site Change Index,
    multi-sensor breakdown (Sentinel-2 L2A optical + Sentinel-1 GRD SAR), and discrepancy gap.
    """
    res = satellite_service.get_project_satellite_verification(
        db=db,
        project_id=project_id,
        evaluation_month=evaluation_month,
        use_live_copernicus=use_live_copernicus
    )
    if not res:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return res


@router.get("/projects/{project_id}/satellite/timeline", response_model=List[TemporalDivergencePoint])
def get_project_satellite_timeline(
    project_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns historical multi-month time series comparing reported contractor progress
    vs. satellite-observed site change index to pinpoint first divergence month.
    """
    return satellite_service.get_project_satellite_timeline(db=db, project_id=project_id)


@router.get("/projects/{project_id}/satellite/evidence")
def get_project_satellite_evidence(
    project_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns multi-band visual evidence package including project AOI GeoJSON,
    Before/After Sentinel-2 RGB, False Color NIR, SAR Backscatter heatmap, and Change Mask.
    """
    res = satellite_service.get_project_satellite_evidence_visuals(db=db, project_id=project_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Evidence for {project_id} not found")
    return res


@router.get("/satellite/portfolio-overview", response_model=PortfolioSatelliteSummary)
def get_portfolio_satellite_summary(
    db: Session = Depends(get_db)
):
    """
    Returns national Earth observation cross-verification statistics across the portfolio,
    including high-discrepancy projects queue and sector suitability distribution.
    """
    return satellite_service.get_portfolio_satellite_summary(db=db)
