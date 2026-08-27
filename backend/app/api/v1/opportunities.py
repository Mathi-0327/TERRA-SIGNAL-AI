"""
TerraSignal AI - Opportunity Radar & Investment Ranking Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.db_models import Location
from backend.app.services.risk_service import get_risk_engine

router = APIRouter(prefix="/opportunities", tags=["Opportunity Radar"])

@router.get("/")
def get_opportunity_rankings(db: Session = Depends(get_db)):
    locations = db.query(Location).all()
    risk_engine = get_risk_engine()
    
    ranked = []
    for l in locations:
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
        
        # Build "Why this location?" rationale
        reasons = []
        if l.price_growth_1y >= 8.0:
            reasons.append(f"Strong capital momentum (+{l.price_growth_1y:.1f}% YoY)")
        if l.infra_score >= 85:
            reasons.append(f"High infrastructure and transit grade ({l.infra_score:.0f}/100)")
        if l.demand_index >= 80:
            reasons.append(f"Resilient buyer demand absorption ({l.demand_index:.0f}/100)")
        if l.rental_yield >= 4.0:
            reasons.append(f"Attractive rental cashflow yield ({l.rental_yield:.1f}%)")
            
        ranked.append({
            "location_id": l.id,
            "location_name": l.name,
            "location_slug": l.slug,
            "city": l.city,
            "zone": l.zone,
            "base_price_sqft": l.base_price_sqft,
            "opportunity_score": opp["score"],
            "opportunity_grade": opp["grade"],
            "growth_potential": opp["growth_potential"],
            "risk_score": risk["score"],
            "risk_level": risk["level"],
            "price_growth_1y": l.price_growth_1y,
            "demand_index": l.demand_index,
            "rental_yield": l.rental_yield,
            "selling_days": l.selling_days,
            "why_this_location": reasons or ["Steady baseline appreciation."]
        })
        
    # Sort descending by opportunity score
    ranked.sort(key=lambda x: x["opportunity_score"], reverse=True)
    
    # Assign ranks
    for i, item in enumerate(ranked, 1):
        item["rank"] = i
        
    return ranked
