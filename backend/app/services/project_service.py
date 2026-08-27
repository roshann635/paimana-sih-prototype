"""
Project Data & Risk Queries (backend/app/services/project_service.py)
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from backend.app.database.schema import (
    Project, ProjectSnapshot, RiskPrediction, RiskExplanation,
    EarlyWarningAlert, Intervention, Benchmark
)
from backend.app.schemas.project import (
    ProjectListItem, ProjectDetail, SnapshotSchema, RiskPredictionSchema,
    RiskExplanationSchema, AlertSchema, InterventionCreate, InterventionResponse,
    TrajectoryPoint, BenchmarkItem
)

def get_projects(
    db: Session,
    sector: Optional[str] = None,
    ministry: Optional[str] = None,
    state: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "ipi_rank",
    order: str = "asc",
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    # Subquery for latest report_month per project
    sub_month = db.query(
        ProjectSnapshot.project_id,
        func.max(ProjectSnapshot.report_month).label("max_month")
    ).group_by(ProjectSnapshot.project_id).subquery()
    
    query = db.query(
        Project, ProjectSnapshot, RiskPrediction
    ).join(
        sub_month, Project.project_id == sub_month.c.project_id
    ).join(
        ProjectSnapshot,
        (ProjectSnapshot.project_id == Project.project_id) &
        (ProjectSnapshot.report_month == sub_month.c.max_month)
    ).join(
        RiskPrediction,
        (RiskPrediction.project_id == Project.project_id) &
        (RiskPrediction.report_month == sub_month.c.max_month)
    )
    
    # Filters
    if sector and sector != "All":
        query = query.filter(Project.sector == sector)
    if ministry and ministry != "All":
        query = query.filter(Project.ministry == ministry)
    if state and state != "All":
        query = query.filter(Project.state == state)
    if risk_level and risk_level != "All":
        query = query.filter(RiskPrediction.risk_level == risk_level)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Project.project_name.ilike(term)) |
            (Project.project_id.ilike(term)) |
            (Project.project_code.ilike(term)) |
            (Project.implementing_agency.ilike(term))
        )
        
    total_count = query.count()
    
    # Sorting
    if sort_by == "ipi_score":
        query = query.order_by(desc(RiskPrediction.ipi_score) if order == "desc" else asc(RiskPrediction.ipi_score))
    elif sort_by == "composite_risk_score":
        query = query.order_by(desc(RiskPrediction.composite_risk_score) if order == "desc" else asc(RiskPrediction.composite_risk_score))
    elif sort_by == "revised_cost":
        query = query.order_by(desc(ProjectSnapshot.revised_cost) if order == "desc" else asc(ProjectSnapshot.revised_cost))
    elif sort_by == "delay_days":
        query = query.order_by(desc(ProjectSnapshot.delay_days) if order == "desc" else asc(ProjectSnapshot.delay_days))
    else:  # default ipi_rank
        query = query.order_by(asc(RiskPrediction.ipi_rank) if order == "asc" else desc(RiskPrediction.ipi_rank))
        
    results = query.offset(offset).limit(limit).all()
    
    items = []
    for proj, snap, pred in results:
        items.append(ProjectListItem(
            project_id=proj.project_id,
            project_code=proj.project_code,
            project_name=proj.project_name,
            ministry=proj.ministry,
            sector=proj.sector,
            state=proj.state,
            implementing_agency=proj.implementing_agency,
            original_cost=proj.original_cost,
            revised_cost=snap.revised_cost,
            physical_progress_pct=snap.physical_progress_pct,
            planned_progress_pct=snap.planned_progress_pct if snap.planned_progress_pct is not None else snap.physical_progress_pct,
            spi=snap.spi if snap.spi is not None else 1.0,
            cpi=snap.cpi if snap.cpi is not None else 1.0,
            delay_days=snap.delay_days,
            composite_risk_score=pred.composite_risk_score,
            risk_level=pred.risk_level,
            ipi_score=pred.ipi_score,
            ipi_rank=pred.ipi_rank,
            trend_direction=pred.trend_direction
        ))
        
    return {
        "total": total_count,
        "items": items,
        "limit": limit,
        "offset": offset
    }

def get_priority_queue(
    db: Session,
    limit: int = 25,
    sector: Optional[str] = None,
    ministry: Optional[str] = None,
    risk_level: Optional[str] = None
) -> List[ProjectListItem]:
    res = get_projects(
        db,
        sector=sector,
        ministry=ministry,
        risk_level=risk_level,
        sort_by="ipi_score",
        order="desc",
        limit=limit,
        offset=0
    )
    return res["items"]

def get_project_by_id(db: Session, project_id: str) -> Optional[ProjectDetail]:
    proj = db.query(Project).filter(
        (Project.project_id == project_id) | (Project.project_code == project_id)
    ).first()
    if not proj:
        return None
        
    latest_snap = db.query(ProjectSnapshot).filter(
        ProjectSnapshot.project_id == proj.project_id
    ).order_by(desc(ProjectSnapshot.report_month)).first()
    
    latest_pred = db.query(RiskPrediction).filter(
        RiskPrediction.project_id == proj.project_id
    ).order_by(desc(RiskPrediction.report_month)).first()
    
    return ProjectDetail(
        project_id=proj.project_id,
        project_code=proj.project_code,
        project_name=proj.project_name,
        ministry=proj.ministry,
        sector=proj.sector,
        state=proj.state,
        implementing_agency=proj.implementing_agency,
        original_cost=proj.original_cost,
        original_start_date=proj.original_start_date,
        original_end_date=proj.original_end_date,
        archetype=proj.archetype,
        latest_snapshot=SnapshotSchema.model_validate(latest_snap) if latest_snap else None,
        latest_prediction=RiskPredictionSchema.model_validate(latest_pred) if latest_pred else None
    )

def get_project_trajectory(db: Session, project_id: str) -> List[TrajectoryPoint]:
    snaps = db.query(
        ProjectSnapshot, RiskPrediction.composite_risk_score
    ).outerjoin(
        RiskPrediction,
        (RiskPrediction.project_id == ProjectSnapshot.project_id) &
        (RiskPrediction.report_month == ProjectSnapshot.report_month)
    ).filter(
        ProjectSnapshot.project_id == project_id
    ).order_by(asc(ProjectSnapshot.report_month)).all()
    
    trajectory = []
    for s, risk_score in snaps:
        trajectory.append(TrajectoryPoint(
            report_month=s.report_month,
            physical_progress_pct=s.physical_progress_pct,
            planned_progress_pct=s.planned_progress_pct if s.planned_progress_pct is not None else s.physical_progress_pct,
            revised_cost=s.revised_cost,
            cumulative_expenditure=s.cumulative_expenditure,
            pv=s.pv if s.pv is not None else 0.0,
            ev=s.ev if s.ev is not None else 0.0,
            ac=s.ac if s.ac is not None else s.cumulative_expenditure,
            sv=s.sv if s.sv is not None else 0.0,
            cv=s.cv if s.cv is not None else 0.0,
            spi=s.spi if s.spi is not None else 1.0,
            cpi=s.cpi if s.cpi is not None else 1.0,
            delay_days=s.delay_days,
            composite_risk_score=risk_score if risk_score is not None else 0.0
        ))
    return trajectory

def get_project_explanation(db: Session, project_id: str) -> Dict[str, Any]:
    exps = db.query(RiskExplanation).filter(
        RiskExplanation.project_id == project_id
    ).order_by(asc(RiskExplanation.rank)).all()
    
    if not exps:
        return {"attributions": [], "diagnosis": "Standard project parameters within baseline limits."}
        
    attributions = [
        {
            "rank": e.rank,
            "feature_name": e.feature_name,
            "display_name": e.feature_display_name,
            "value": e.feature_value,
            "shap_value": e.shap_value,
            "direction": e.direction,
            "impact": "Increases Risk" if e.direction == "+" else "Mitigates Risk"
        }
        for e in exps
    ]
    
    diagnosis = exps[0].explanation_text if exps else "No explanation generated."
    
    return {
        "project_id": project_id,
        "attributions": attributions,
        "diagnosis": diagnosis
    }

def get_project_recommendations(db: Session, project_id: str) -> List[Dict[str, str]]:
    snap = db.query(ProjectSnapshot).filter(
        ProjectSnapshot.project_id == project_id
    ).order_by(desc(ProjectSnapshot.report_month)).first()
    
    if not snap:
        return []
        
    recs = []
    if snap.spi is not None and snap.spi < 0.85:
        recs.append({
            "category": "EVM Schedule Review",
            "title": f"Schedule Performance Deficit (SPI: {snap.spi:.2f})",
            "action": f"Convene EVM schedule review with Project Management Consultant (PMC) to address ₹{abs(snap.sv or 0.0):.1f} Cr schedule lag.",
            "urgency": "HIGH"
        })
    if snap.cpi is not None and snap.cpi < 0.90:
        recs.append({
            "category": "EVM Cost Audit",
            "title": f"Cost Efficiency Inefficiency (CPI: {snap.cpi:.2f})",
            "action": f"Audit contractor billing against certified physical measurements to curtail expenditure drawdowns outpacing earned value.",
            "urgency": "HIGH"
        })
    if snap.delay_days >= 90 and not any("SPI" in r["title"] for r in recs):
        recs.append({
            "category": "Schedule Recovery",
            "title": "Critical Path Re-baselining",
            "action": "Convene joint progress review with Project Management Unit to re-baseline critical path activities and evaluate deployment of catch-up crews.",
            "urgency": "HIGH"
        })
    if snap.issue_contractor == 1:
        recs.append({
            "category": "Contractor Review",
            "title": "Contractor Capacity & Cash-flow Audit",
            "action": "Audit contractor cash flow, mobilization of specialized plant/machinery, and key sub-vendor delivery commitments.",
            "urgency": "HIGH"
        })
    if snap.issue_land == 1:
        recs.append({
            "category": "Land & ROW",
            "title": "District Administration Escalation",
            "action": "Escalate unhanded encumbrance-free stretches to State Nodal Officer / District Collectorate for expedited joint measurement.",
            "urgency": "MEDIUM"
        })
    if snap.issue_approval == 1:
        recs.append({
            "category": "Inter-Agency",
            "title": "PM GatiShakti Clearance Coordination",
            "action": "Trigger inter-ministerial coordination meeting on PM GatiShakti portal for pending environmental, forest, or railway safety approvals.",
            "urgency": "MEDIUM"
        })
    if not recs:
        recs.append({
            "category": "Routine Monitoring",
            "title": "Standard Monthly Protocol",
            "action": "Continue regular monthly physical milestone and financial billing verification.",
            "urgency": "LOW"
        })
    return recs

def get_alerts(db: Session, severity: Optional[str] = None, limit: int = 50) -> List[AlertSchema]:
    q = db.query(EarlyWarningAlert).filter(EarlyWarningAlert.is_active == True)
    if severity and severity != "ALL":
        q = q.filter(EarlyWarningAlert.severity == severity)
    alerts = q.order_by(desc(EarlyWarningAlert.id)).limit(limit).all()
    return [AlertSchema.model_validate(a) for a in alerts]

def get_benchmarks(db: Session, sector: Optional[str] = None) -> List[BenchmarkItem]:
    q = db.query(Benchmark)
    if sector and sector != "All":
        q = q.filter(Benchmark.sector == sector)
    bms = q.order_by(desc(Benchmark.sample_size)).all()
    return [BenchmarkItem.model_validate(b) for b in bms]

def create_intervention(db: Session, inv_in: InterventionCreate) -> InterventionResponse:
    project = db.query(Project).filter(Project.project_id == inv_in.project_id).first()
    if not project:
        raise ValueError(f"Project {inv_in.project_id} not found")

    inv = Intervention(
        project_id=inv_in.project_id,
        intervention_type=inv_in.intervention_type,
        recommended_action=inv_in.recommended_action,
        action_taken=inv_in.action_taken,
        assigned_to=inv_in.assigned_to or "Monitoring Officer",
        status=inv_in.status or "UNDER_REVIEW",
        initial_risk_score=inv_in.initial_risk_score
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return InterventionResponse.model_validate(inv)

def get_interventions(db: Session, project_id: Optional[str] = None) -> List[InterventionResponse]:
    q = db.query(Intervention)
    if project_id:
        q = q.filter(Intervention.project_id == project_id)
    invs = q.order_by(desc(Intervention.id)).all()
    return [InterventionResponse.model_validate(i) for i in invs]
