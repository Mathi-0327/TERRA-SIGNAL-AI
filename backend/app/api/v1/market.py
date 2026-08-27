"""
TerraSignal AI - Market Intelligence & Historical Time-Series Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.db_models import Location, MarketData

router = APIRouter(prefix="/market", tags=["Market Intelligence"])

@router.get("/history/{location_id}")
def get_location_market_history(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Micro-market not found")
        
    records = db.query(MarketData).filter(MarketData.location_id == location_id).order_by(MarketData.quarter.asc()).all()
    
    return {
        "location_id": loc.id,
        "location_name": loc.name,
        "city": loc.city,
        "history": [
            {
                "quarter": r.quarter,
                "avg_price_sqft": r.avg_price_sqft,
                "demand_index": r.demand_index,
                "supply_index": r.supply_index,
                "selling_days": r.selling_days,
                "rental_yield": r.rental_yield,
                "inventory_units": r.inventory_units,
                "transactions_count": r.transactions_count
            }
            for r in records
        ]
    }

@router.get("/metro-trends")
def get_metro_wide_quarterly_trends(db: Session = Depends(get_db)):
    """Aggregates quarterly averages across all Chennai micro-markets."""
    quarters = [
        "2023-Q3", "2023-Q4", "2024-Q1", "2024-Q2",
        "2024-Q3", "2024-Q4", "2025-Q1", "2025-Q2",
        "2025-Q3", "2025-Q4", "2026-Q1", "2026-Q2"
    ]
    trends = []
    for q in quarters:
        records = db.query(MarketData).filter(MarketData.quarter == q).all()
        if records:
            avg_price = sum(r.avg_price_sqft for r in records) / len(records)
            avg_demand = sum(r.demand_index for r in records) / len(records)
            avg_supply = sum(r.supply_index for r in records) / len(records)
            avg_days = sum(r.selling_days for r in records) / len(records)
            avg_yield = sum(r.rental_yield for r in records) / len(records)
            
            trends.append({
                "quarter": q,
                "avg_price_sqft": round(avg_price),
                "demand_index": round(avg_demand, 1),
                "supply_index": round(avg_supply, 1),
                "avg_selling_days": round(avg_days),
                "avg_rental_yield": round(avg_yield, 2)
            })
    return trends
