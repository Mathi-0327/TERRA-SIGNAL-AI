"""
TerraSignal AI - Property Intelligence Report Generator
Compiles comprehensive investment dossiers including fair valuation, 12M forecast,
8-D risk matrices, explainable AI drivers, and data provenance.
"""

import json
from typing import Any, Dict
from sqlalchemy.orm import Session
from backend.app.models.db_models import Report
from backend.app.services.risk_service import get_risk_engine
from ml.inference.predict import get_inference_engine

class ReportService:
    @staticmethod
    def generate_property_dossier(db: Session, user_id: int, property_data: dict) -> Dict[str, Any]:
        ml_engine = get_inference_engine()
        risk_engine = get_risk_engine()
        
        loc_id = property_data.get("location_id", 1)
        mm_info = ml_engine.get_micro_market(loc_id)
        
        pred = ml_engine.predict_property(property_data)
        val = pred["valuation"]
        forecast = pred["forecast"]
        
        risk = risk_engine.evaluate_property_risk(property_data, mm_info, val)
        demand = risk_engine.evaluate_demand(mm_info)
        liquidity = risk_engine.evaluate_liquidity(mm_info)
        opp = risk_engine.evaluate_opportunity(mm_info, risk["score"], val)
        rec = risk_engine.generate_recommendation(risk["score"], opp["score"], val, mm_info)
        
        dossier = {
            "title": f"Intelligence Dossier: {property_data.get('title', 'Residential Property Analysis')}",
            "property_summary": {
                "locality": mm_info["name"],
                "city": mm_info["city"],
                "property_type": property_data.get("property_type", "Apartment"),
                "area_sqft": property_data.get("area_sqft", 1200),
                "bedrooms": property_data.get("bedrooms", 2),
                "bathrooms": property_data.get("bathrooms", 2),
                "property_age": property_data.get("property_age", 2),
                "asking_price": property_data.get("current_price", val["estimated_value"])
            },
            "valuation_intelligence": val,
            "forecast_trajectories": forecast,
            "eight_dimensional_risk": risk,
            "demand_liquidity_profile": {
                "demand": demand,
                "liquidity": liquidity,
                "opportunity": opp
            },
            "explainable_ai_drivers": pred["explanations"],
            "decision_recommendation": rec,
            "micro_market_context": mm_info,
            "data_provenance": {
                "valuation_model": pred["model_provenance"]["model_name"],
                "model_version": pred["model_provenance"]["version"],
                "r2_accuracy": pred["model_provenance"]["r2_score"],
                "data_sources": ["NHB RESIDEX Q2-2026", "TNRERA Registered Baseline", "State WRD GIS"]
            }
        }
        
        # Save to database
        db_report = Report(
            user_id=user_id,
            title=dossier["title"],
            property_data_json=json.dumps(dossier["property_summary"]),
            valuation_data_json=json.dumps(val),
            risk_data_json=json.dumps(risk),
            scenario_data_json=json.dumps(forecast)
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        dossier["report_id"] = db_report.id
        dossier["created_at"] = db_report.created_at.isoformat()
        
        return dossier
