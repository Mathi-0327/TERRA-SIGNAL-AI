"""
TerraSignal AI - Property Intelligence Report Dossier Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.db_models import Report
from backend.app.schemas.api_schemas import PropertyAnalysisRequest
from backend.app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate")
def generate_report(payload: PropertyAnalysisRequest, db: Session = Depends(get_db)):
    return ReportService.generate_property_dossier(db, user_id=1, property_data=payload.model_dump())

@router.get("/{id}")
def get_report(id: int, db: Session = Depends(get_db)):
    rep = db.query(Report).filter(Report.id == id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
        
    import json
    return {
        "id": rep.id,
        "title": rep.title,
        "property_summary": json.loads(rep.property_data_json),
        "valuation_intelligence": json.loads(rep.valuation_data_json),
        "eight_dimensional_risk": json.loads(rep.risk_data_json),
        "forecast_trajectories": json.loads(rep.scenario_data_json) if rep.scenario_data_json else {},
        "created_at": rep.created_at.isoformat()
    }

@router.get("/")
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.id.desc()).limit(10).all()
    import json
    return [
        {
            "id": r.id,
            "title": r.title,
            "property_summary": json.loads(r.property_data_json),
            "created_at": r.created_at.isoformat()
        }
        for r in reports
    ]
