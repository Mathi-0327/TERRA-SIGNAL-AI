"""
TerraSignal AI - Early Warning Alerts & Anomaly Scan Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Early Warning System"])

@router.get("/")
def get_alerts(
    location_id: Optional[int] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return AlertService.get_active_alerts(db, location_id=location_id, severity=severity)

@router.post("/scan")
def trigger_anomaly_scan(db: Session = Depends(get_db)):
    return AlertService.run_realtime_anomaly_scan(db)
