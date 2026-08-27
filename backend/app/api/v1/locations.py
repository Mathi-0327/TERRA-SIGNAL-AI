"""
TerraSignal AI - Location Intelligence & Comparison Endpoints
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.db_models import Location, MarketData
from backend.app.schemas.api_schemas import LocationComparisonRequest, LocationDetail
from backend.app.services.risk_service import get_risk_engine

router = APIRouter(prefix="/locations", tags=["Location Intelligence"])

@router.get("/", response_model=List[LocationDetail])
def list_locations(db: Session = Depends(get_db)):
    locations = db.query(Location).order_by(Location.id.asc()).all()
    return locations

@router.get("/{id}")
def get_location_profile(id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
        
    history = db.query(MarketData).filter(MarketData.location_id == id).order_by(MarketData.quarter.asc()).all()
    
    risk_engine = get_risk_engine()
    dummy_prop = {"location_id": loc.id, "area_sqft": 1000, "current_price": loc.base_price_sqft * 1000}
    mm_dict = {
        "id": loc.id,
        "name": loc.name,
        "base_price_sqft": loc.base_price_sqft,
        "rental_yield": loc.rental_yield,
        "demand_index": loc.demand_index,
        "supply_index": loc.supply_index,
        "selling_days": loc.selling_days,
        "price_growth_1y": loc.price_growth_1y,
        "flood_risk_score": loc.flood_risk_score,
        "infra_score": loc.infra_score,
        "water_table_risk": loc.water_table_risk,
        "anomaly_signal": loc.anomaly_signal,
        "market_status": loc.market_status
    }
    
    val_data = {"estimated_value": loc.base_price_sqft * 1000, "over_under_pct": 0.0}
    risk_data = risk_engine.evaluate_property_risk(dummy_prop, mm_dict, val_data)
    opp_data = risk_engine.evaluate_opportunity(mm_dict, risk_data["score"], val_data)
    
    return {
        "location": loc,
        "risk_profile": risk_data,
        "opportunity_profile": opp_data,
        "historical_trends": [
            {
                "quarter": h.quarter,
                "avg_price_sqft": h.avg_price_sqft,
                "demand_index": h.demand_index,
                "supply_index": h.supply_index,
                "selling_days": h.selling_days,
                "rental_yield": h.rental_yield,
                "inventory_units": h.inventory_units,
                "transactions_count": h.transactions_count
            }
            for h in history
        ]
    }

@router.post("/compare")
def compare_locations(request: LocationComparisonRequest, db: Session = Depends(get_db)):
    locs = db.query(Location).filter(Location.id.in_(request.location_ids)).all()
    if len(locs) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least 2 valid location IDs for comparison.")
        
    risk_engine = get_risk_engine()
    profiles = []
    
    for l in locs:
        mm_dict = {
            "id": l.id,
            "name": l.name,
            "base_price_sqft": l.base_price_sqft,
            "rental_yield": l.rental_yield,
            "demand_index": l.demand_index,
            "supply_index": l.supply_index,
            "selling_days": l.selling_days,
            "price_growth_1y": l.price_growth_1y,
            "flood_risk_score": l.flood_risk_score,
            "infra_score": l.infra_score,
            "water_table_risk": l.water_table_risk,
            "anomaly_signal": l.anomaly_signal,
            "market_status": l.market_status
        }
        val_data = {"estimated_value": l.base_price_sqft * 1000, "over_under_pct": 0.0}
        risk = risk_engine.evaluate_property_risk({}, mm_dict, val_data)
        opp = risk_engine.evaluate_opportunity(mm_dict, risk["score"], val_data)
        
        profiles.append({
            "id": l.id,
            "name": l.name,
            "city": l.city,
            "zone": l.zone,
            "base_price_sqft": l.base_price_sqft,
            "rental_yield": l.rental_yield,
            "demand_index": l.demand_index,
            "supply_index": l.supply_index,
            "selling_days": l.selling_days,
            "price_growth_1y": l.price_growth_1y,
            "infra_score": l.infra_score,
            "flood_risk_score": l.flood_risk_score,
            "risk_score": risk["score"],
            "risk_level": risk["level"],
            "opportunity_score": opp["score"],
            "opportunity_grade": opp["grade"],
            "market_status": l.market_status
        })
        
    # Generate structured trade-offs between first two locations
    l1, l2 = profiles[0], profiles[1]
    tradeoffs = [
        {
            "dimension": "Capital Affordability & Entry Price",
            "observation": f"{l1['name']} is priced at ₹{l1['base_price_sqft']:,}/sqft vs {l2['name']} at ₹{l2['base_price_sqft']:,}/sqft ({((l1['base_price_sqft']-l2['base_price_sqft'])/l2['base_price_sqft'])*100:+.1f}% spread)."
        },
        {
            "dimension": "1-Year Appreciation Momentum",
            "observation": f"{l1['name']} recorded {l1['price_growth_1y']:+.1f}% YoY growth vs {l2['name']} at {l2['price_growth_1y']:+.1f}%."
        },
        {
            "dimension": "Rental Cashflow Yield",
            "observation": f"{l1['name']} offers {l1['rental_yield']:.1f}% gross yield vs {l2['name']} at {l2['rental_yield']:.1f}%."
        },
        {
            "dimension": "Environmental Inundation Risk",
            "observation": f"{l1['name']} flood score is {l1['flood_risk_score']:.0f}/100 vs {l2['name']} at {l2['flood_risk_score']:.0f}/100."
        },
        {
            "dimension": "Transaction Liquidity & Days on Market",
            "observation": f"Average resale marketing time is {l1['selling_days']} days in {l1['name']} vs {l2['selling_days']} days in {l2['name']}."
        }
    ]
    
    return {
        "compared_locations": profiles,
        "tradeoff_analysis": tradeoffs
    }
