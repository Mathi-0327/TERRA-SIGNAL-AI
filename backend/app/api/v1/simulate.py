"""
TerraSignal AI - What-If Scenario Simulator API Endpoint
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.api_schemas import (
    ScenarioSimulationRequest, ScenarioSimulationResponse
)
from backend.app.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulate", tags=["Scenario Simulator"])

@router.post("/", response_model=ScenarioSimulationResponse)
def run_what_if_simulation(request: ScenarioSimulationRequest, db: Session = Depends(get_db)):
    """
    Executes dynamic macroeconomic, demand, and environmental shocks,
    calculating Base Case vs Scenario deltas, 12M forecast adjustments,
    and BUY / WAIT / AVOID recommendation shifts.
    """
    return SimulationService.run_scenario(request)
