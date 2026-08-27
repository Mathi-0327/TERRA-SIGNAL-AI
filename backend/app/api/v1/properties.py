"""
TerraSignal AI - Property Intelligence & Predictive Valuation Endpoints
"""

import json
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.db_models import Location, Property
from backend.app.schemas.api_schemas import (
    PropertyAnalysisRequest, PropertyAnalysisResponse
)
from backend.app.services.risk_service import get_risk_engine
from ml.inference.predict import get_inference_engine

router = APIRouter(prefix="/properties", tags=["Property Intelligence"])

@router.post("/analyze", response_model=PropertyAnalysisResponse)
@router.post("/evaluate", response_model=PropertyAnalysisResponse)
def analyze_property(payload: PropertyAnalysisRequest, db: Session = Depends(get_db)):
    """
    Core Pipeline:
    Property Payload -> Feature Engineering -> ML Valuation -> Time Forecast ->
    8-D Risk Engine -> Demand & Liquidity Engine -> Explainable Factors -> BUY/WAIT/AVOID Decision
    """
    ml_engine = get_inference_engine()
    risk_engine = get_risk_engine()
    
    # 1. Resolve Location
    location = None
    if payload.location_id:
        location = db.query(Location).filter(Location.id == payload.location_id).first()
    elif payload.locality:
        location = db.query(Location).filter(
            (Location.name.ilike(f"%{payload.locality}%")) |
            (Location.slug.ilike(f"%{payload.locality}%"))
        ).first()
        
    if not location:
        location = db.query(Location).first()
        
    mm_info = ml_engine.get_micro_market(location.id if location else 1)
    
    # 2. Run ML Predictive Valuation & Forecasting
    prop_dict = payload.model_dump()
    prop_dict["location_id"] = location.id if location else 1
    
    pred_res = ml_engine.predict_property(prop_dict)
    val_data = pred_res["valuation"]
    forecast_data = pred_res["forecast"]
    
    # 3. 8-Dimensional Multi-factor Risk Engine
    risk_data = risk_engine.evaluate_property_risk(prop_dict, mm_info, val_data)
    
    # 4. Demand & Liquidity Engines
    demand_data = risk_engine.evaluate_demand(mm_info)
    liquidity_data = risk_engine.evaluate_liquidity(mm_info)
    
    # 5. Opportunity Scoring & Investment Grade
    opp_data = risk_engine.evaluate_opportunity(mm_info, risk_data["score"], val_data)
    
    # 6. Decision Support Recommendation (BUY / WAIT / AVOID)
    rec_data = risk_engine.generate_recommendation(
        risk_data["score"], opp_data["score"], val_data, mm_info
    )
    
    # 7. Rental Potential
    est_val = val_data["estimated_value"]
    gross_yield = mm_info.get("rental_yield", 3.8)
    monthly_rent = round((est_val * (gross_yield / 100.0)) / 12.0)
    
    rental_potential = {
        "gross_rental_yield_pct": gross_yield,
        "estimated_monthly_rent_inr": monthly_rent,
        "annual_rental_cashflow_inr": monthly_rent * 12,
        "tenant_demand_rating": "HIGH" if mm_info.get("demand_index", 75) > 75 else "MODERATE",
        "primary_occupant_segment": "Tech & Financial Services Professionals"
    }
    
    return PropertyAnalysisResponse(
        input_summary={
            "locality": mm_info["name"],
            "city": mm_info["city"],
            "property_type": payload.property_type,
            "area_sqft": payload.area_sqft,
            "bedrooms": payload.bedrooms,
            "bathrooms": payload.bathrooms,
            "property_age": payload.property_age,
            "floor_number": payload.floor_number,
            "total_floors": payload.total_floors,
            "current_price": payload.current_price or val_data["estimated_value"],
            "amenities_count": len(payload.amenities or [])
        },
        valuation=val_data,
        forecast=forecast_data,
        risk=risk_data,
        demand=demand_data,
        liquidity=liquidity_data,
        opportunity=opp_data,
        rental_potential=rental_potential,
        recommendation=rec_data,
        explanations=pred_res["explanations"],
        micro_market=mm_info,
        data_freshness={
            "dataset": "NHB RESIDEX + TNRERA Q2-2026",
            "last_updated": "2026-07-15",
            "source_authority": "National Housing Bank & Tamil Nadu WRD GIS",
            "data_type": "OBSERVED_AND_ML_DERIVED"
        },
        model_provenance=pred_res["model_provenance"]
    )

@router.get("/")
def list_properties(
    location_id: Optional[int] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Property)
    if location_id:
        query = query.filter(Property.location_id == location_id)
        
    total = query.count()
    props = query.offset(offset).limit(limit).all()
    
    items = []
    for p in props:
        amenities = []
        try:
            amenities = json.loads(p.amenities) if p.amenities else []
        except Exception:
            amenities = []
            
        items.append({
            "id": p.id,
            "title": p.title,
            "location_id": p.location_id,
            "location_name": p.location.name if p.location else "Chennai",
            "property_type": p.property_type,
            "area_sqft": p.area_sqft,
            "bedrooms": p.bedrooms,
            "bathrooms": p.bathrooms,
            "property_age": p.property_age,
            "current_price": p.current_price,
            "fair_value_total": p.fair_value_total,
            "amenities": amenities,
            "lat": p.lat,
            "lng": p.lng,
            "status": p.status,
            "listed_date": p.listed_date
        })
        
    return {"total": total, "properties": items}

@router.get("/{id}")
def get_property(id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    return {
        "id": prop.id,
        "title": prop.title,
        "location_id": prop.location_id,
        "location_name": prop.location.name if prop.location else "Chennai",
        "property_type": prop.property_type,
        "area_sqft": prop.area_sqft,
        "bedrooms": prop.bedrooms,
        "bathrooms": prop.bathrooms,
        "property_age": prop.property_age,
        "current_price": prop.current_price,
        "fair_value_total": prop.fair_value_total,
        "lat": prop.lat,
        "lng": prop.lng,
        "status": prop.status
    }
