"""
TerraSignal AI - Pydantic Request & Response Schemas
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field

# Authentication
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "investor"

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# Property Analysis Request
class PropertyAnalysisRequest(BaseModel):
    location_id: Optional[int] = None
    locality: Optional[str] = "OMR"
    property_type: Optional[str] = "Gated Community Apartment"
    area_sqft: float = Field(..., gt=100, lt=20000, description="Area in square feet")
    bedrooms: int = Field(2, ge=1, le=10)
    bathrooms: int = Field(2, ge=1, le=10)
    property_age: float = Field(2.0, ge=0, le=50)
    floor_number: int = Field(2, ge=0, le=60)
    total_floors: int = Field(5, ge=1, le=60)
    current_price: Optional[float] = None
    amenities: Optional[List[str]] = []
    lat: Optional[float] = None
    lng: Optional[float] = None

# Valuation and Prediction Details
class ValuationDetail(BaseModel):
    estimated_value: float
    lower_bound: float
    upper_bound: float
    estimated_price_sqft: float
    valuation_status: str # UNDERVALUED, FAIR_VALUE, OVERVALUED
    over_under_pct: float

class ForecastDetail(BaseModel):
    month_3: float = Field(..., alias="3_month")
    month_6: float = Field(..., alias="6_month")
    month_12: float = Field(..., alias="12_month")
    growth_12m_pct: float

    class Config:
        populate_by_name = True

# 8-Dimensional Risk Scores
class RiskDimensions(BaseModel):
    market_risk: float
    valuation_risk: float
    demand_risk: float
    supply_risk: float
    liquidity_risk: float
    environmental_risk: float
    infrastructure_risk: float
    economic_risk: float

class RiskDetail(BaseModel):
    score: float # 0 to 100
    level: str # VERY_LOW, LOW, MODERATE, HIGH, CRITICAL
    dimensions: RiskDimensions
    key_vulnerabilities: List[str]
    mitigating_factors: List[str]

class DemandDetail(BaseModel):
    score: float # 0 to 100
    trend: str # INCREASING, STABLE, DECLINING
    demand_supply_ratio: float
    description: str

class LiquidityDetail(BaseModel):
    score: float # 0 to 100
    classification: str # HIGH_LIQUIDITY, MODERATE, LOW_LIQUIDITY
    estimated_selling_days: int
    turnover_velocity: str

class OpportunityDetail(BaseModel):
    score: float # 0 to 100
    grade: str # A+, A, B, C, D
    growth_potential: str
    drivers: List[str]

class DecisionRecommendation(BaseModel):
    decision: str # BUY, WAIT, AVOID, HOLD
    confidence: float # 0.0 to 1.0
    rationale: str
    key_tradeoffs: List[str]
    suggested_negotiation_range: Optional[Dict[str, float]] = None

class FeatureExplanation(BaseModel):
    factor: str
    impact_inr: float
    impact_pct: float
    category: str
    description: str

class ExplainabilityResponse(BaseModel):
    positive_factors: List[FeatureExplanation]
    negative_factors: List[FeatureExplanation]
    net_amenity_adjustment_pct: float

# Complete Property Intelligence Response
class PropertyAnalysisResponse(BaseModel):
    property_id: Optional[int] = None
    input_summary: Dict[str, Any]
    valuation: ValuationDetail
    forecast: ForecastDetail
    risk: RiskDetail
    demand: DemandDetail
    liquidity: LiquidityDetail
    opportunity: OpportunityDetail
    rental_potential: Dict[str, Any]
    recommendation: DecisionRecommendation
    explanations: ExplainabilityResponse
    micro_market: Dict[str, Any]
    data_freshness: Dict[str, Any]
    model_provenance: Dict[str, Any]

# Scenario Simulation
class ScenarioSimulationRequest(BaseModel):
    location_id: int
    property_type: Optional[str] = "Apartment"
    area_sqft: float = 1200
    bedrooms: int = 2
    bathrooms: int = 2
    property_age: float = 2.0
    floor_number: int = 3
    total_floors: int = 5
    current_price: Optional[float] = None
    amenities: Optional[List[str]] = []
    # What-If Adjusters
    demand_change_pct: float = Field(0.0, ge=-50.0, le=50.0, description="Demand shift %")
    supply_change_pct: float = Field(0.0, ge=-50.0, le=100.0, description="Supply/Inventory shift %")
    interest_rate_change_bps: float = Field(0.0, ge=-300.0, le=300.0, description="Interest rate change in basis points")
    infra_improvement_pct: float = Field(0.0, ge=-20.0, le=50.0, description="Infrastructure progress delta %")
    environmental_stress_delta: float = Field(0.0, ge=-30.0, le=50.0, description="Climate/Flood stress delta")
    rental_growth_delta_pct: float = Field(0.0, ge=-30.0, le=50.0, description="Rental yield growth delta %")

class ScenarioComparisonCard(BaseModel):
    metric: str
    base_value: Any
    scenario_value: Any
    delta: Any
    unit: str
    impact: str # POSITIVE, NEGATIVE, NEUTRAL

class ScenarioSimulationResponse(BaseModel):
    location_name: str
    applied_shocks: Dict[str, Any]
    base_case: Dict[str, Any]
    scenario_case: Dict[str, Any]
    comparison_matrix: List[ScenarioComparisonCard]
    decision_shift: Dict[str, Any]
    ai_scenario_synthesis: str

# AI Analyst
class AIAnalystQuery(BaseModel):
    question: str
    location_id: Optional[int] = None
    property_context: Optional[Dict[str, Any]] = None
    scenario_context: Optional[Dict[str, Any]] = None

class AIAnalystResponse(BaseModel):
    answer: str
    why: str
    data: Dict[str, Any]
    risks: List[str]
    recommendation: str
    confidence: float
    data_freshness: str
    cited_sources: List[str]

# Location Intelligence
class LocationComparisonRequest(BaseModel):
    location_ids: List[int]

class LocationDetail(BaseModel):
    id: int
    name: str
    slug: str
    city: str
    zone: str
    lat: float
    lng: float
    base_price_sqft: float
    rental_yield: float
    demand_index: float
    supply_index: float
    selling_days: int
    price_growth_1y: float
    flood_risk_score: float
    infra_score: float
    water_table_risk: float
    anomaly_signal: str
    market_status: str
    summary: str

# Dashboard Summary
class DashboardKPISummary(BaseModel):
    avg_property_price_sqft: float
    avg_price_growth_yoy: float
    market_demand_index: float
    inventory_supply_index: float
    composite_market_risk: float
    avg_rental_yield_pct: float
    market_liquidity_score: float
    projected_12m_metro_growth: float
    market_pulse_state: str # EXPANDING, STABLE, COOLING, STRESSED
    market_pulse_summary: str
