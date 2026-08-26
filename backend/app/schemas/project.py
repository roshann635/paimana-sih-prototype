"""
Pydantic API Schemas (backend/app/schemas/project.py) - Pydantic v2 Compliant
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class SnapshotSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    project_id: str
    report_month: str
    revised_cost: float
    cumulative_expenditure: float
    physical_progress_pct: float
    delay_days: int
    current_end_date: str
    issue_procurement: int
    issue_land: int
    issue_contractor: int
    issue_approval: int
    status: str

class RiskPredictionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_month: str
    cost_risk_probability: float
    time_risk_probability: float
    expected_cost_overrun_pct: float
    expected_delay_days: int
    composite_risk_score: float
    risk_level: str
    ipi_score: float
    ipi_rank: int
    trend_direction: str
    model_version: str

class RiskExplanationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feature_name: str
    feature_display_name: str
    feature_value: float
    shap_value: float
    direction: str
    rank: int
    explanation_text: Optional[str] = None

class AlertSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: str
    report_month: str
    alert_code: str
    severity: str
    title: str
    description: str
    is_active: bool

class ProjectListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: str
    project_code: str
    project_name: str
    ministry: str
    sector: str
    state: str
    implementing_agency: str
    original_cost: float
    revised_cost: float
    physical_progress_pct: float
    delay_days: int
    composite_risk_score: float
    risk_level: str
    ipi_score: float
    ipi_rank: int
    trend_direction: str

class ProjectDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: str
    project_code: str
    project_name: str
    ministry: str
    sector: str
    state: str
    implementing_agency: str
    original_cost: float
    original_start_date: str
    original_end_date: str
    archetype: str
    latest_snapshot: Optional[SnapshotSchema] = None
    latest_prediction: Optional[RiskPredictionSchema] = None

class TrajectoryPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_month: str
    physical_progress_pct: float
    revised_cost: float
    cumulative_expenditure: float
    delay_days: int
    composite_risk_score: float

class InterventionCreate(BaseModel):
    project_id: str
    intervention_type: str
    recommended_action: str
    action_taken: Optional[str] = None
    assigned_to: Optional[str] = "Monitoring Officer"
    status: Optional[str] = "UNDER_REVIEW"
    initial_risk_score: float

class InterventionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: str
    intervention_type: str
    recommended_action: str
    action_taken: Optional[str] = None
    assigned_to: str
    status: str
    initial_risk_score: float
    post_risk_score: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

class BenchmarkItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sector: str
    cost_band: str
    median_cost_escalation_pct: float
    median_delay_months: float
    median_progress_velocity: float
    median_risk_score: float
    sample_size: int

class DashboardSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_projects: int
    total_original_cost_cr: float
    total_revised_cost_cr: float
    total_cost_escalation_cr: float
    total_expenditure_cr: float
    avg_physical_progress: float
    avg_delay_days: float
    risk_counts: Dict[str, int]  # RED, ORANGE, AMBER, GREEN
    deteriorating_count: int
    active_alerts_count: int
    latest_report_month: Optional[str] = None
    top_sectors_at_risk: List[Dict[str, Any]]
    ministry_sector_matrix: List[Dict[str, Any]]
