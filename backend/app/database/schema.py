"""
Database Schema (backend/app/database/schema.py)
SQLAlchemy ORM models supporting both SQLite and PostgreSQL.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(String(50), unique=True, index=True, nullable=False)
    project_code = Column(String(100), index=True, nullable=False)
    project_name = Column(String(300), nullable=False)
    ministry = Column(String(200), index=True, nullable=False)
    sector = Column(String(100), index=True, nullable=False)
    state = Column(String(100), index=True, nullable=False)
    implementing_agency = Column(String(100), index=True, nullable=False)
    original_cost = Column(Float, nullable=False)  # in ₹ Crore
    original_start_date = Column(String(20), nullable=False)
    original_end_date = Column(String(20), nullable=False)
    archetype = Column(String(50), default="healthy")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    snapshots = relationship("ProjectSnapshot", back_populates="project", cascade="all, delete-orphan")
    predictions = relationship("RiskPrediction", back_populates="project", cascade="all, delete-orphan")
    explanations = relationship("RiskExplanation", back_populates="project", cascade="all, delete-orphan")
    alerts = relationship("EarlyWarningAlert", back_populates="project", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="project", cascade="all, delete-orphan")


class ProjectSnapshot(Base):
    __tablename__ = "project_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(String(50), ForeignKey("projects.project_id"), index=True, nullable=False)
    report_month = Column(String(20), index=True, nullable=False)  # Format: YYYY-MM
    
    revised_cost = Column(Float, nullable=False)
    cumulative_expenditure = Column(Float, nullable=False)
    physical_progress_pct = Column(Float, nullable=False)
    delay_days = Column(Integer, default=0)
    current_end_date = Column(String(20), nullable=False)
    
    issue_procurement = Column(Integer, default=0)
    issue_land = Column(Integer, default=0)
    issue_contractor = Column(Integer, default=0)
    issue_approval = Column(Integer, default=0)
    
    status = Column(String(50), default="Ongoing")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="snapshots")

    __table_args__ = (
        Index("ix_project_snapshot_month", "project_id", "report_month", unique=True),
    )


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(String(50), ForeignKey("projects.project_id"), index=True, nullable=False)
    report_month = Column(String(20), index=True, nullable=False)
    
    cost_risk_probability = Column(Float, nullable=False)
    time_risk_probability = Column(Float, nullable=False)
    expected_cost_overrun_pct = Column(Float, default=0.0)
    expected_delay_days = Column(Integer, default=0)
    
    composite_risk_score = Column(Float, index=True, nullable=False)  # 0 to 100
    risk_level = Column(String(20), index=True, nullable=False)       # GREEN, AMBER, ORANGE, RED
    ipi_score = Column(Float, index=True, nullable=False)             # Intervention Priority Index
    ipi_rank = Column(Integer, index=True, default=0)
    trend_direction = Column(String(30), default="stable")           # deteriorating, stable, improving
    
    model_version = Column(String(50), default="v1.0")
    prediction_timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="predictions")


class RiskExplanation(Base):
    __tablename__ = "risk_explanations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(String(50), ForeignKey("projects.project_id"), index=True, nullable=False)
    report_month = Column(String(20), index=True, nullable=False)
    
    feature_name = Column(String(100), nullable=False)
    feature_display_name = Column(String(150), nullable=False)
    feature_value = Column(Float, nullable=False)
    shap_value = Column(Float, nullable=False)
    direction = Column(String(10), default="+")  # "+" (increases risk) or "-" (reduces risk)
    rank = Column(Integer, nullable=False)
    explanation_text = Column(Text, nullable=True)

    project = relationship("Project", back_populates="explanations")


class EarlyWarningAlert(Base):
    __tablename__ = "early_warning_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(String(50), ForeignKey("projects.project_id"), index=True, nullable=False)
    report_month = Column(String(20), index=True, nullable=False)
    
    alert_code = Column(String(50), index=True, nullable=False)
    severity = Column(String(20), index=True, nullable=False)  # CRITICAL, WARNING, WATCH
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="alerts")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(String(50), ForeignKey("projects.project_id"), index=True, nullable=False)
    
    intervention_type = Column(String(100), nullable=False)
    recommended_action = Column(Text, nullable=False)
    action_taken = Column(Text, nullable=True)
    assigned_to = Column(String(100), default="Monitoring Officer")
    status = Column(String(50), default="RECOMMENDED")  # RECOMMENDED, UNDER_REVIEW, COMPLETED
    
    initial_risk_score = Column(Float, nullable=False)
    post_risk_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="interventions")


class Benchmark(Base):
    __tablename__ = "benchmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sector = Column(String(100), index=True, nullable=False)
    cost_band = Column(String(100), index=True, nullable=False)
    
    median_cost_escalation_pct = Column(Float, default=0.0)
    median_delay_months = Column(Float, default=0.0)
    median_progress_velocity = Column(Float, default=0.0)
    median_risk_score = Column(Float, default=0.0)
    sample_size = Column(Integer, default=0)
