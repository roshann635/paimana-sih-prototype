"""
Dashboard Analytics & Aggregations (backend/app/services/dashboard_service.py)
"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.app.database.schema import Project, ProjectSnapshot, RiskPrediction, EarlyWarningAlert
from backend.app.schemas.project import DashboardSummary

def get_dashboard_summary(db: Session) -> DashboardSummary:
    # Subquery for latest snapshot per project
    sub_month = db.query(
        ProjectSnapshot.project_id,
        func.max(ProjectSnapshot.report_month).label("max_month")
    ).group_by(ProjectSnapshot.project_id).subquery()
    
    latest_data = db.query(
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
    ).all()
    
    total_projects = len(latest_data)
    if total_projects == 0:
        return DashboardSummary(
            total_projects=0,
            total_original_cost_cr=0.0,
            total_revised_cost_cr=0.0,
            total_cost_escalation_cr=0.0,
            total_expenditure_cr=0.0,
            avg_physical_progress=0.0,
            avg_delay_days=0.0,
            risk_counts={"RED": 0, "ORANGE": 0, "AMBER": 0, "GREEN": 0},
            deteriorating_count=0,
            active_alerts_count=0,
            top_sectors_at_risk=[],
            ministry_sector_matrix=[]
        )
        
    tot_orig_cost = sum(p.original_cost for p, s, r in latest_data)
    tot_rev_cost = sum(s.revised_cost for p, s, r in latest_data)
    tot_exp = sum(s.cumulative_expenditure for p, s, r in latest_data)
    avg_prog = sum(s.physical_progress_pct for p, s, r in latest_data) / total_projects
    avg_delay = sum(s.delay_days for p, s, r in latest_data) / total_projects
    
    risk_counts = {"RED": 0, "ORANGE": 0, "AMBER": 0, "GREEN": 0}
    deteriorating_count = 0
    
    sector_risk = {}
    matrix_map = {}
    
    for p, s, r in latest_data:
        lvl = r.risk_level
        risk_counts[lvl] = risk_counts.get(lvl, 0) + 1
        if r.trend_direction == "deteriorating":
            deteriorating_count += 1
            
        # Sector risk tracking
        sec = p.sector
        if sec not in sector_risk:
            sector_risk[sec] = {
                "sector": sec,
                "project_count": 0,
                "red_count": 0,
                "total_revised_cost": 0.0,
                "avg_risk": 0.0,
                "risk_sum": 0.0
            }
        sector_risk[sec]["project_count"] += 1
        if lvl == "RED":
            sector_risk[sec]["red_count"] += 1
        sector_risk[sec]["total_revised_cost"] += s.revised_cost
        sector_risk[sec]["risk_sum"] += r.composite_risk_score
        
        # Ministry x Sector matrix
        min_name = p.ministry.replace("Ministry of ", "").replace("Department of ", "")
        key = (min_name, sec)
        if key not in matrix_map:
            matrix_map[key] = {"ministry": min_name, "sector": sec, "count": 0, "avg_risk": 0.0, "risk_sum": 0.0, "red_count": 0}
        matrix_map[key]["count"] += 1
        matrix_map[key]["risk_sum"] += r.composite_risk_score
        if lvl == "RED":
            matrix_map[key]["red_count"] += 1
            
    # Compute averages
    for sec, data in sector_risk.items():
        data["avg_risk"] = round(data["risk_sum"] / max(1, data["project_count"]), 1)
        data["total_revised_cost"] = round(data["total_revised_cost"], 1)
        del data["risk_sum"]
        
    top_sectors_at_risk = sorted(list(sector_risk.values()), key=lambda x: x["red_count"] * 1000 + x["avg_risk"], reverse=True)[:8]
    
    ministry_sector_matrix = []
    for (m, s), d in matrix_map.items():
        ministry_sector_matrix.append({
            "ministry": d["ministry"],
            "sector": d["sector"],
            "count": d["count"],
            "avg_risk": round(d["risk_sum"] / max(1, d["count"]), 1),
            "red_count": d["red_count"]
        })
        
    active_alerts = db.query(EarlyWarningAlert).filter(EarlyWarningAlert.is_active == True).count()
    max_month_val = db.query(func.max(ProjectSnapshot.report_month)).scalar() or "2025-12"
    
    return DashboardSummary(
        total_projects=total_projects,
        total_original_cost_cr=round(tot_orig_cost, 2),
        total_revised_cost_cr=round(tot_rev_cost, 2),
        total_cost_escalation_cr=round(tot_rev_cost - tot_orig_cost, 2),
        total_expenditure_cr=round(tot_exp, 2),
        avg_physical_progress=round(avg_prog, 1),
        avg_delay_days=round(avg_delay, 1),
        risk_counts=risk_counts,
        deteriorating_count=deteriorating_count,
        active_alerts_count=active_alerts,
        latest_report_month=max_month_val,
        top_sectors_at_risk=top_sectors_at_risk,
        ministry_sector_matrix=sorted(ministry_sector_matrix, key=lambda x: x["avg_risk"], reverse=True)[:15]
    )
