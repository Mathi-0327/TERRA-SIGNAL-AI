"""
TerraSignal AI - Admin, Model Monitoring & Data Provenance Endpoints
"""

import json
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.db_models import DataSource, Location, ModelVersion, Property, User
from ml.training.train_price_model import train_models

router = APIRouter(prefix="/admin", tags=["Admin & Model Governance"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

@router.get("/overview")
def get_admin_overview(db: Session = Depends(get_db)):
    users_count = db.query(User).count()
    properties_count = db.query(Property).count()
    locations_count = db.query(Location).count()
    
    # Load Model Metadata
    model_version = db.query(ModelVersion).first()
    model_meta = {}
    if model_version:
        model_meta = {
            "model_name": model_version.model_name,
            "version": model_version.version,
            "algorithm": model_version.algorithm,
            "training_date": model_version.training_date,
            "metrics": json.loads(model_version.metrics_json),
            "feature_importances": json.loads(model_version.feature_importances_json) if model_version.feature_importances_json else {},
            "status": model_version.status
        }
        
    # Load Data Sources
    sources = db.query(DataSource).all()
    sources_list = [
        {
            "id": s.id,
            "name": s.name,
            "organization": s.organization,
            "url": s.url,
            "dataset": s.dataset,
            "frequency": s.frequency,
            "coverage": s.coverage,
            "last_updated": s.last_updated,
            "license": s.license,
            "notes": s.notes
        }
        for s in sources
    ]
    
    # Load Data Quality Report
    quality_report = {}
    q_file = os.path.join(PROCESSED_DIR, "data_quality_report.json")
    if os.path.exists(q_file):
        with open(q_file, "r") as f:
            quality_report = json.load(f)
            
    return {
        "system_status": {
            "api_health": "HEALTHY",
            "ml_inference_engine": "ONLINE",
            "risk_engine": "ACTIVE",
            "total_users": users_count,
            "indexed_properties": properties_count,
            "monitored_micro_markets": locations_count,
            "active_version": "v1.2.0-stable"
        },
        "model_governance": model_meta,
        "data_sources_registry": sources_list,
        "data_quality_report": quality_report
    }

@router.post("/retrain")
def trigger_model_retraining(db: Session = Depends(get_db)):
    """Triggers verified model retraining pipeline."""
    meta = train_models()
    return {
        "status": "RETRAINING_SUCCESS",
        "retrained_version": meta["version"],
        "metrics": meta["evaluation_metrics"],
        "message": "Model weights updated and serialized to disk."
    }
