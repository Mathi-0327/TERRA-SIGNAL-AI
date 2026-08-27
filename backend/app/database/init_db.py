"""
TerraSignal AI - Database Initialization & Seed Ingestion Script
Creates all tables and seeds micro-markets, properties, historical trends,
alerts, data source metadata, model metrics, and default demo user.
"""

import json
import os
import pandas as pd
from sqlalchemy.orm import Session

from backend.app.core.security import get_password_hash
from backend.app.database.session import Base, SessionLocal, engine
from backend.app.models.db_models import (
    Alert, DataSource, Location, MarketData, ModelVersion, PortfolioItem, Property, User
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models", "trained_models")

def init_database():
    print("Initializing TerraSignal Database Schema...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Location).count() > 0:
            print("Database already initialized with location records.")
            return
            
        print("Seeding Micro-Markets...")
        mm_file = os.path.join(RAW_DIR, "micro_markets.json")
        if os.path.exists(mm_file):
            with open(mm_file, "r") as f:
                markets = json.load(f)
                for m in markets:
                    loc = Location(
                        id=m["id"],
                        name=m["name"],
                        slug=m["slug"],
                        city=m["city"],
                        zone=m["zone"],
                        lat=m["lat"],
                        lng=m["lng"],
                        base_price_sqft=m["base_price_sqft"],
                        rental_yield=m["rental_yield"],
                        demand_index=m["demand_index"],
                        supply_index=m["supply_index"],
                        selling_days=m["selling_days"],
                        price_growth_1y=m["price_growth_1y"],
                        flood_risk_score=m["flood_risk_score"],
                        infra_score=m["infra_score"],
                        water_table_risk=m["water_table_risk"],
                        anomaly_signal=m["anomaly_signal"],
                        market_status=m["market_status"],
                        summary=m["summary"]
                    )
                    db.add(loc)
            db.commit()
            
        print("Seeding Data Sources Registry...")
        ds_file = os.path.join(RAW_DIR, "data_sources.json")
        if os.path.exists(ds_file):
            with open(ds_file, "r") as f:
                sources = json.load(f)
                for s in sources:
                    ds = DataSource(
                        id=s["id"],
                        name=s["name"],
                        organization=s["organization"],
                        url=s["url"],
                        dataset=s["dataset"],
                        frequency=s["frequency"],
                        coverage=s["coverage"],
                        last_updated=s["last_updated"],
                        license=s["license"],
                        notes=s["notes"]
                    )
                    db.add(ds)
            db.commit()
            
        print("Seeding Historical Quarterly Trends...")
        hist_file = os.path.join(RAW_DIR, "historical_market_data.csv")
        if os.path.exists(hist_file):
            hist_df = pd.read_csv(hist_file)
            for _, row in hist_df.iterrows():
                md = MarketData(
                    location_id=int(row["location_id"]),
                    quarter=str(row["quarter"]),
                    avg_price_sqft=float(row["avg_price_sqft"]),
                    demand_index=float(row["demand_index"]),
                    supply_index=float(row["supply_index"]),
                    selling_days=int(row["selling_days"]),
                    rental_yield=float(row["rental_yield"]),
                    inventory_units=int(row["inventory_units"]),
                    transactions_count=int(row["transactions_count"])
                )
                db.add(md)
            db.commit()
            
        print("Seeding Clean Property Database...")
        prop_file = os.path.join(PROCESSED_DIR, "properties_clean.csv")
        if os.path.exists(prop_file):
            prop_df = pd.read_csv(prop_file)
            for _, row in prop_df.iterrows():
                p = Property(
                    id=int(row["id"]),
                    title=str(row["title"]),
                    location_id=int(row["location_id"]),
                    city=str(row["city"]),
                    property_type=str(row["property_type"]),
                    area_sqft=float(row["area_sqft"]),
                    bedrooms=int(row["bedrooms"]),
                    bathrooms=int(row["bathrooms"]),
                    property_age=float(row["property_age"]),
                    floor_number=int(row["floor_number"]),
                    total_floors=int(row["total_floors"]),
                    amenities=str(row["amenities"]),
                    current_price=float(row["current_price"]),
                    fair_value_total=float(row["fair_value_total"]),
                    lat=float(row["lat"]),
                    lng=float(row["lng"]),
                    status=str(row["status"]),
                    listed_date=str(row["listed_date"])
                )
                db.add(p)
            db.commit()
            
        print("Seeding Early Warning Alerts...")
        alerts_file = os.path.join(RAW_DIR, "early_warnings.json")
        if os.path.exists(alerts_file):
            with open(alerts_file, "r") as f:
                alerts = json.load(f)
                for a in alerts:
                    al = Alert(
                        id=a["id"],
                        location_id=a["location_id"],
                        severity=a["severity"],
                        title=a["title"],
                        signal_type=a["signal_type"],
                        signals_json=json.dumps(a["signals"]),
                        interpretation=a["interpretation"],
                        recommended_action=a["recommended_action"],
                        data_sources_json=json.dumps(a["data_sources"]),
                        is_active=True
                    )
                    db.add(al)
            db.commit()
            
        print("Seeding Model Version Card...")
        meta_file = os.path.join(MODELS_DIR, "model_metadata.json")
        if os.path.exists(meta_file):
            with open(meta_file, "r") as f:
                meta = json.load(f)
                mv = ModelVersion(
                    id=1,
                    model_name=meta.get("model_name", "TerraSignal Valuation Engine"),
                    version=meta.get("version", "v1.2.0-stable"),
                    algorithm=meta.get("primary_algorithm", "GradientBoostingRegressor"),
                    training_date=meta.get("training_date", "2026-08-27"),
                    metrics_json=json.dumps(meta.get("evaluation_metrics", {})),
                    feature_importances_json=json.dumps(meta.get("feature_importances", {})),
                    status="ACTIVE"
                )
                db.add(mv)
            db.commit()
            
        print("Seeding Demo Users and Portfolio...")
        demo_user = User(
            email="demo@terrasignal.ai",
            full_name="Investor Demo Analyst",
            hashed_password=get_password_hash("investor123"),
            role="analyst",
            is_active=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        # Add 2 sample portfolio properties for demo user
        p1 = PortfolioItem(
            user_id=demo_user.id,
            property_name="Prestige Courtyards 3BHK",
            location_id=8, # Sholinganallur
            property_type="Gated Community Apartment",
            area_sqft=1560,
            purchase_price=9500000,
            current_value=9900000,
            risk_score=52,
            opportunity_score=68,
            monthly_rental=36000,
            purchase_date="2024-03-15",
            notes="Tech corridor asset near ELCOT SEZ. Monitor inventory absorption."
        )
        p2 = PortfolioItem(
            user_id=demo_user.id,
            property_name="Appaswamy Trellis 2BHK",
            location_id=2, # Velachery
            property_type="Apartment",
            area_sqft=1120,
            purchase_price=8200000,
            current_value=9100000,
            risk_score=64, # High flood risk
            opportunity_score=74,
            monthly_rental=32000,
            purchase_date="2023-11-10",
            notes="Excellent transit connectivity, watch monsoon drainage."
        )
        db.add(p1)
        db.add(p2)
        db.commit()
        
        print("Database successfully initialized and seeded!")
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
