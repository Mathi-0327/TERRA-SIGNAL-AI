"""
TerraSignal AI - Investor Portfolio Intelligence Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.db_models import Location, PortfolioItem, User

router = APIRouter(prefix="/portfolio", tags=["Portfolio Intelligence"])

class PortfolioCreateRequest(BaseModel):
    property_name: str
    location_id: int
    property_type: Optional[str] = "Apartment"
    area_sqft: float
    purchase_price: float
    current_value: Optional[float] = None
    monthly_rental: Optional[float] = None
    purchase_date: Optional[str] = None
    notes: Optional[str] = None

@router.get("/")
def get_portfolio(db: Session = Depends(get_db)):
    # Fetch demo user
    user = db.query(User).filter(User.email == "demo@terrasignal.ai").first()
    user_id = user.id if user else 1
    
    items = db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()
    
    total_cost = sum(p.purchase_price for p in items)
    total_current = sum(p.current_value for p in items)
    total_monthly_rent = sum(p.monthly_rental for p in items)
    total_gain = total_current - total_cost
    gain_pct = (total_gain / max(total_cost, 1)) * 100
    
    avg_risk = sum(p.risk_score for p in items) / len(items) if items else 35.0
    
    records = []
    for p in items:
        loc = db.query(Location).filter(Location.id == p.location_id).first()
        records.append({
            "id": p.id,
            "property_name": p.property_name,
            "location_id": p.location_id,
            "location_name": loc.name if loc else "Chennai",
            "property_type": p.property_type,
            "area_sqft": p.area_sqft,
            "purchase_price": p.purchase_price,
            "current_value": p.current_value,
            "gain_inr": p.current_value - p.purchase_price,
            "gain_pct": round(((p.current_value - p.purchase_price) / p.purchase_price) * 100, 1),
            "risk_score": p.risk_score,
            "opportunity_score": p.opportunity_score,
            "monthly_rental": p.monthly_rental,
            "annual_yield_pct": round(((p.monthly_rental * 12) / p.current_value) * 100, 2),
            "purchase_date": p.purchase_date,
            "notes": p.notes
        })
        
    return {
        "summary": {
            "total_assets_count": len(items),
            "total_portfolio_cost_inr": total_cost,
            "total_current_valuation_inr": total_current,
            "total_unrealized_gain_inr": total_gain,
            "portfolio_return_pct": round(gain_pct, 2),
            "annual_rental_cashflow_inr": total_monthly_rent * 12,
            "composite_portfolio_risk": round(avg_risk, 1),
            "geographic_concentration": f"{len(set(p.location_id for p in items))} Micro-Markets"
        },
        "properties": records
    }

@router.post("/")
def add_portfolio_item(payload: PortfolioCreateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == "demo@terrasignal.ai").first()
    user_id = user.id if user else 1
    
    cur_val = payload.current_value or payload.purchase_price
    rent = payload.monthly_rental or round((cur_val * 0.038) / 12)
    
    item = PortfolioItem(
        user_id=user_id,
        property_name=payload.property_name,
        location_id=payload.location_id,
        property_type=payload.property_type,
        area_sqft=payload.area_sqft,
        purchase_price=payload.purchase_price,
        current_value=cur_val,
        monthly_rental=rent,
        purchase_date=payload.purchase_date or "2026-01-15",
        notes=payload.notes or "Tracked asset."
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Asset added to portfolio", "item_id": item.id}

@router.delete("/{id}")
def delete_portfolio_item(id: int, db: Session = Depends(get_db)):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted from portfolio"}
