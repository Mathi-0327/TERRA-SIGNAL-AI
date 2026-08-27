"""
TerraSignal AI - Core Application Configuration
"""

import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TerraSignal AI"
    PROJECT_TAGLINE: str = "Know the property. Predict the risk. Decide with intelligence."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Database
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    # Default to local SQLite for instant setup; supports MySQL / PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./terrasignal.db")
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "terrasignal-ai-super-secret-production-key-2026-decision-intel")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "https://terrasignal.ai",
        "*"
    ]
    
    # Risk Engine Default Weights (Configurable)
    RISK_WEIGHTS: dict = {
        "market_risk": 0.15,
        "valuation_risk": 0.20,
        "demand_risk": 0.15,
        "supply_risk": 0.15,
        "liquidity_risk": 0.10,
        "environmental_risk": 0.10,
        "infrastructure_risk": 0.10,
        "economic_risk": 0.05
    }

    class Config:
        case_sensitive = True

settings = Settings()
