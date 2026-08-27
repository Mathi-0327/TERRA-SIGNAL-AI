"""
TerraSignal AI - Grounded AI Real-Estate Analyst API Endpoint
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.api_schemas import AIAnalystQuery, AIAnalystResponse
from backend.app.services.ai_analyst_service import AIAnalystService

router = APIRouter(prefix="/ai", tags=["AI Analyst"])

@router.post("/analyze", response_model=AIAnalystResponse)
def query_ai_analyst(query: AIAnalystQuery, db: Session = Depends(get_db)):
    """
    Retrieval-augmented AI decision intelligence.
    Grounded answers directly citing database parameters and ML valuation models.
    """
    return AIAnalystService.analyze_query(db, query)
