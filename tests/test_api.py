"""
Backend API & Model Integration Tests (tests/test_api.py)
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add base directory to path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"

def test_dashboard_summary():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_projects" in data
    assert data["total_projects"] >= 1000
    assert "risk_counts" in data
    assert "RED" in data["risk_counts"]

def test_list_projects():
    response = client.get("/api/v1/projects?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert "project_id" in data["items"][0]
    assert "ipi_score" in data["items"][0]

def test_priority_queue():
    response = client.get("/api/v1/risk/priority-queue?limit=10")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 10
    # Ensure ranked in descending order of IPI score
    for i in range(len(items) - 1):
        assert items[i]["ipi_score"] >= items[i + 1]["ipi_score"]

def test_project_detail_and_trajectory():
    # Fetch top project from queue
    queue_res = client.get("/api/v1/risk/priority-queue?limit=1")
    top_pid = queue_res.json()[0]["project_id"]
    
    # Detail
    detail_res = client.get(f"/api/v1/projects/{top_pid}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["project_id"] == top_pid
    assert detail["latest_prediction"] is not None
    
    # Trajectory
    traj_res = client.get(f"/api/v1/projects/{top_pid}/trajectory")
    assert traj_res.status_code == 200
    trajectory = traj_res.json()
    assert len(trajectory) >= 1

def test_project_shap_explanation():
    queue_res = client.get("/api/v1/risk/priority-queue?limit=1")
    top_pid = queue_res.json()[0]["project_id"]
    
    exp_res = client.get(f"/api/v1/projects/{top_pid}/explanation")
    assert exp_res.status_code == 200
    exp = exp_res.json()
    assert "attributions" in exp
    assert "diagnosis" in exp

def test_alerts_and_benchmarks():
    alerts_res = client.get("/api/v1/alerts")
    assert alerts_res.status_code == 200
    assert isinstance(alerts_res.json(), list)
    
    benchmarks_res = client.get("/api/v1/benchmarks")
    assert benchmarks_res.status_code == 200
    assert len(benchmarks_res.json()) >= 10

def test_model_health():
    health_res = client.get("/api/v1/model/health")
    assert health_res.status_code == 200
    health = health_res.json()
    assert "cost_model" in health
    assert "time_model" in health
    assert health["cost_model"]["roc_auc"] > 0.70
    assert health["cost_model"]["pr_auc"] > 0.30
    assert health["time_model"]["roc_auc"] > 0.70

def test_create_intervention():
    payload = {
        "project_id": "P0001",
        "intervention_type": "Schedule Recovery",
        "recommended_action": "Re-baseline critical path activities with EPC contractor.",
        "assigned_to": "Joint Secretary (Infrastructure)",
        "initial_risk_score": 88.5
    }
    res = client.post("/api/v1/interventions", json=payload)
    assert res.status_code == 200
    inv = res.json()
    assert inv["project_id"] == "P0001"
    assert inv["status"] == "UNDER_REVIEW"

