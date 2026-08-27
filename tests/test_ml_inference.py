"""
Unit tests for TerraSignal AI ML Inference & Explainability Engine
"""

import os
import pytest
from ml.inference.predict import get_inference_engine

def test_ml_inference_valuation():
    engine = get_inference_engine()
    assert engine is not None
    
    payload = {
        "location_id": 1, # OMR
        "property_type": "Gated Community Apartment",
        "area_sqft": 1250,
        "bedrooms": 3,
        "bathrooms": 2,
        "property_age": 1,
        "floor_number": 6,
        "total_floors": 14,
        "amenities": ["Swimming Pool", "Gymnasium", "Power Backup", "24/7 Security", "Clubhouse"],
        "current_price": 8200000
    }
    
    result = engine.predict_property(payload)
    
    # Valuation Checks
    val = result["valuation"]
    assert val["estimated_value"] > 5000000, "Estimated value should be realistic"
    assert val["lower_bound"] < val["estimated_value"]
    assert val["upper_bound"] > val["estimated_value"]
    assert val["valuation_status"] in ["UNDERVALUED", "FAIR_VALUE", "OVERVALUED"]
    
    # Forecast Checks
    fc = result["forecast"]
    assert fc["3_month"] > 0
    assert fc["6_month"] > 0
    assert fc["12_month"] > 0
    assert fc["12_month"] > fc["3_month"], "12-month projection should reflect positive trajectory"
    
    # Explainable AI Checks
    expl = result["explanations"]
    assert "positive_factors" in expl
    assert "negative_factors" in expl
    assert len(expl["positive_factors"]) + len(expl["negative_factors"]) > 0
