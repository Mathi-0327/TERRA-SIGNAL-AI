"""
Integration tests for FastAPI REST Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["platform"] == "TerraSignal AI"
    assert data["status"] == "ONLINE"

def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

def test_dashboard_endpoint():
    resp = client.get("/api/v1/dashboard/")
    assert resp.status_code == 200
    data = resp.json()
    assert "kpi_summary" in data
    assert "micro_markets" in data
    assert len(data["micro_markets"]) == 12
    assert "early_warning_alerts" in data

def test_property_analyze_endpoint():
    payload = {
        "location_id": 1,
        "property_type": "Gated Community Apartment",
        "area_sqft": 1350,
        "bedrooms": 3,
        "bathrooms": 2,
        "property_age": 1,
        "floor_number": 4,
        "total_floors": 12,
        "amenities": ["Swimming Pool", "Gymnasium", "Power Backup"],
        "current_price": 8500000
    }
    resp = client.post("/api/v1/properties/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "valuation" in data
    assert "forecast" in data
    assert "risk" in data
    assert "recommendation" in data
    assert "explanations" in data
    assert data["recommendation"]["decision"] in ["BUY", "WAIT", "AVOID", "HOLD"]

def test_locations_list_endpoint():
    resp = client.get("/api/v1/locations/")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 12

def test_location_compare_endpoint():
    resp = client.post("/api/v1/locations/compare", json={"location_ids": [1, 3]}) # OMR vs Tambaram
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["compared_locations"]) == 2
    assert len(data["tradeoff_analysis"]) > 0

def test_scenario_simulate_endpoint():
    payload = {
        "location_id": 1,
        "area_sqft": 1200,
        "demand_change_pct": -15.0,
        "supply_change_pct": 20.0
    }
    resp = client.post("/api/v1/simulate/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "comparison_matrix" in data
    assert "decision_shift" in data

def test_ai_analyst_endpoint():
    payload = {
        "question": "Why is the risk high in OMR and should I buy?",
        "location_id": 1
    }
    resp = client.post("/api/v1/ai/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert "why" in data
    assert "data" in data
    assert "risks" in data
    assert "recommendation" in data
