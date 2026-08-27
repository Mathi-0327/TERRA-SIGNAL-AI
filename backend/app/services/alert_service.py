"""
TerraSignal AI - Early Warning System & Market Anomaly Detector
Scans micro-market indicator time-series for abnormal divergences, inventory overhangs,
and environmental risks, publishing structured warning advisories.
"""

import json
from typing import Any, Dict, List
from sqlalchemy.orm import Session
from backend.app.models.db_models import Alert, Location, MarketData

class AlertService:
    @staticmethod
    def get_active_alerts(db: Session, location_id: int = None, severity: str = None) -> List[Dict[str, Any]]:
        query = db.query(Alert).filter(Alert.is_active == True)
        if location_id:
            query = query.filter(Alert.location_id == location_id)
        if severity:
            query = query.filter(Alert.severity == severity.upper())
            
        alerts = query.order_by(Alert.id.asc()).all()
        results = []
        for a in alerts:
            loc = a.location
            signals = []
            try:
                signals = json.loads(a.signals_json)
            except Exception:
                signals = []
                
            sources = []
            try:
                sources = json.loads(a.data_sources_json)
            except Exception:
                sources = []
                
            results.append({
                "id": a.id,
                "location_id": a.location_id,
                "location_name": loc.name if loc else "Chennai Metro",
                "location_slug": loc.slug if loc else "chennai",
                "severity": a.severity,
                "title": a.title,
                "signal_type": a.signal_type,
                "signals": signals,
                "interpretation": a.interpretation,
                "recommended_action": a.recommended_action,
                "data_sources": sources,
                "timestamp": a.created_at.isoformat() if a.created_at else "2026-08-20T10:00:00Z"
            })
        return results

    @staticmethod
    def run_realtime_anomaly_scan(db: Session) -> Dict[str, Any]:
        """
        Dynamically scans all 12 micro-markets for indicator anomalies
        and generates warning summaries.
        """
        locations = db.query(Location).all()
        scanned_count = len(locations)
        flagged = []
        
        for loc in locations:
            # Check divergence: Demand low (<70) + Supply high (>75)
            if loc.demand_index < 72 and loc.supply_index > 75:
                flagged.append({
                    "location": loc.name,
                    "anomaly": "DEMAND_SUPPLY_DIVERGENCE",
                    "severity": "HIGH",
                    "reason": f"Demand index ({loc.demand_index}) lagging behind supply inventory pressure ({loc.supply_index})."
                })
            elif loc.flood_risk_score > 70:
                flagged.append({
                    "location": loc.name,
                    "anomaly": "ELEVATED_INUNDATION_RISK",
                    "severity": "WARNING",
                    "reason": f"Topographical catchment hazard index is {loc.flood_risk_score}/100."
                })
                
        return {
            "status": "SCAN_COMPLETE",
            "micro_markets_scanned": scanned_count,
            "anomalies_detected": len(flagged),
            "flagged_markets": flagged
        }
