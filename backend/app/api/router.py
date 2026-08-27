"""
TerraSignal AI - API v1 Master Router
"""

from fastapi import APIRouter
from backend.app.api.v1.admin import router as admin_router
from backend.app.api.v1.ai_analyst import router as ai_router
from backend.app.api.v1.alerts import router as alerts_router
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.dashboard import router as dashboard_router
from backend.app.api.v1.locations import router as locations_router
from backend.app.api.v1.market import router as market_router
from backend.app.api.v1.opportunities import router as opportunities_router
from backend.app.api.v1.portfolio import router as portfolio_router
from backend.app.api.v1.properties import router as properties_router
from backend.app.api.v1.reports import router as reports_router
from backend.app.api.v1.simulate import router as simulate_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(properties_router)
api_router.include_router(locations_router)
api_router.include_router(market_router)
api_router.include_router(alerts_router)
api_router.include_router(opportunities_router)
api_router.include_router(dashboard_router)
api_router.include_router(simulate_router)
api_router.include_router(ai_router)
api_router.include_router(portfolio_router)
api_router.include_router(reports_router)
api_router.include_router(admin_router)
