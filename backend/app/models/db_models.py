"""
TerraSignal AI - SQLAlchemy Database Models
"""

import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="investor") # investor, analyst, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    portfolio_items = relationship("PortfolioItem", back_populates="user")
    reports = relationship("Report", back_populates="user")

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    city = Column(String(100), default="Chennai", index=True)
    zone = Column(String(100), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    base_price_sqft = Column(Float, nullable=False)
    rental_yield = Column(Float, default=3.8)
    demand_index = Column(Float, default=75.0)
    supply_index = Column(Float, default=60.0)
    selling_days = Column(Integer, default=75)
    price_growth_1y = Column(Float, default=6.5)
    flood_risk_score = Column(Float, default=40.0)
    infra_score = Column(Float, default=80.0)
    water_table_risk = Column(Float, default=45.0)
    anomaly_signal = Column(String(100), default="NONE")
    market_status = Column(String(50), default="STABLE") # EXPANDING, STABLE, COOLING, STRESSED
    summary = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    properties = relationship("Property", back_populates="location")
    market_history = relationship("MarketData", back_populates="location")
    alerts = relationship("Alert", back_populates="location")

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True)
    city = Column(String(100), default="Chennai")
    property_type = Column(String(100), default="Apartment")
    area_sqft = Column(Float, nullable=False)
    bedrooms = Column(Integer, default=2)
    bathrooms = Column(Integer, default=2)
    property_age = Column(Float, default=2.0)
    floor_number = Column(Integer, default=2)
    total_floors = Column(Integer, default=5)
    amenities = Column(Text, nullable=True) # JSON list
    current_price = Column(Float, nullable=False)
    fair_value_total = Column(Float, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    status = Column(String(50), default="Active")
    listed_date = Column(String(50), nullable=True)
    
    location = relationship("Location", back_populates="properties")

class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True)
    quarter = Column(String(50), index=True) # e.g. 2026-Q2
    avg_price_sqft = Column(Float, nullable=False)
    demand_index = Column(Float, nullable=False)
    supply_index = Column(Float, nullable=False)
    selling_days = Column(Integer, nullable=False)
    rental_yield = Column(Float, nullable=False)
    inventory_units = Column(Integer, default=1000)
    transactions_count = Column(Integer, default=200)
    
    location = relationship("Location", back_populates="market_history")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True)
    severity = Column(String(50), default="WARNING") # INFO, WATCH, WARNING, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    signal_type = Column(String(100), nullable=False)
    signals_json = Column(Text, nullable=False)
    interpretation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    data_sources_json = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    location = relationship("Location", back_populates="alerts")

class DataSource(Base):
    __tablename__ = "data_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False)
    url = Column(String(500), nullable=True)
    dataset = Column(String(255), nullable=False)
    frequency = Column(String(100), default="Quarterly")
    coverage = Column(String(255), nullable=True)
    last_updated = Column(String(50), nullable=True)
    license = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    algorithm = Column(String(100), nullable=False)
    training_date = Column(String(100), nullable=False)
    metrics_json = Column(Text, nullable=False)
    feature_importances_json = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE")

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    property_name = Column(String(255), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True)
    property_type = Column(String(100), default="Apartment")
    area_sqft = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    risk_score = Column(Float, default=35.0)
    opportunity_score = Column(Float, default=70.0)
    monthly_rental = Column(Float, default=25000.0)
    purchase_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="portfolio_items")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    title = Column(String(255), nullable=False)
    property_data_json = Column(Text, nullable=False)
    valuation_data_json = Column(Text, nullable=False)
    risk_data_json = Column(Text, nullable=False)
    scenario_data_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="reports")

class ScenarioRun(Base):
    __tablename__ = "scenario_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True)
    user_id = Column(Integer, nullable=True)
    base_demand = Column(Float)
    scenario_demand_delta = Column(Float)
    base_risk = Column(Float)
    scenario_risk = Column(Float)
    base_price = Column(Float)
    scenario_price = Column(Float)
    recommendation_shift = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
