"""
Unit tests for TerraSignal AI What-If Scenario Simulation Engine
"""

import pytest
from backend.app.schemas.api_schemas import ScenarioSimulationRequest
from backend.app.services.simulation_service import SimulationService

def test_demand_shock_simulation():
    req = ScenarioSimulationRequest(
        location_id=1, # OMR
        property_type="Apartment",
        area_sqft=1200,
        bedrooms=2,
        bathrooms=2,
        current_price=7400000,
        demand_change_pct=-20.0, # Negative demand shock
        supply_change_pct=+25.0, # Positive supply shock
        interest_rate_change_bps=+75.0
    )
    
    res = SimulationService.run_scenario(req)
    
    assert res.location_name == "OMR (Old Mahabalipuram Road)"
    assert res.applied_shocks["demand_change_pct"] == -20.0
    
    # Scenario risk should be strictly greater than Base risk
    base_risk = res.base_case["risk"]["score"]
    scen_risk = res.scenario_case["risk"]["score"]
    assert scen_risk > base_risk, f"Scenario risk ({scen_risk}) should be higher than base risk ({base_risk})"
    
    # Check comparison matrix is populated
    assert len(res.comparison_matrix) >= 5
    assert res.decision_shift["base_decision"] in ["BUY", "WAIT", "AVOID"]
