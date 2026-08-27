"""
Unit tests for TerraSignal AI 8-Dimensional Risk & Decision Engine
"""

import pytest
from backend.app.services.risk_service import get_risk_engine

def test_risk_dimensions_computation():
    risk_engine = get_risk_engine()
    
    mm_info = {
        "id": 1,
        "name": "OMR",
        "base_price_sqft": 6200,
        "rental_yield": 4.1,
        "demand_index": 68,
        "supply_index": 82, # High supply
        "selling_days": 115, # Elongated selling days
        "price_growth_1y": 4.8,
        "flood_risk_score": 45,
        "infra_score": 88,
        "water_table_risk": 55,
        "anomaly_signal": "DIVERGENCE_WARNING",
        "market_status": "COOLING"
    }
    
    val_data = {"estimated_value": 7500000, "over_under_pct": 5.2}
    prop_data = {"area_sqft": 1200, "floor_number": 2, "property_age": 2}
    
    risk = risk_engine.evaluate_property_risk(prop_data, mm_info, val_data)
    
    assert 0 <= risk["score"] <= 100
    assert risk["level"] in ["VERY_LOW", "LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert len(risk["dimensions"]) == 8
    
    # In cooling OMR market with elongated days, supply and liquidity risk should be elevated
    assert risk["dimensions"]["supply_risk"] > 60
    assert risk["dimensions"]["liquidity_risk"] > 50

def test_decision_recommendation():
    risk_engine = get_risk_engine()
    
    # Low risk + High opp -> BUY
    rec_buy = risk_engine.generate_recommendation(
        risk_score=30.0,
        opp_score=85.0,
        valuation_data={"estimated_value": 7500000, "over_under_pct": -4.0},
        mm_info={"market_status": "EXPANDING", "flood_risk_score": 25}
    )
    assert rec_buy["decision"] == "BUY"
    
    # High risk -> AVOID
    rec_avoid = risk_engine.generate_recommendation(
        risk_score=78.0,
        opp_score=40.0,
        valuation_data={"estimated_value": 7500000, "over_under_pct": 20.0},
        mm_info={"market_status": "COOLING", "flood_risk_score": 85}
    )
    assert rec_avoid["decision"] == "AVOID"
