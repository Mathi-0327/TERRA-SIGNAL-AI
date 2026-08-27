"""
TerraSignal AI - What-If Scenario Simulation Engine
Evaluates dynamic macroeconomic, demand, supply, interest rate, and environmental shocks,
computing exact Base Case vs. Scenario deltas and decision transitions.
"""

from typing import Any, Dict, List
from ml.inference.predict import get_inference_engine
from backend.app.schemas.api_schemas import (
    ScenarioComparisonCard, ScenarioSimulationRequest, ScenarioSimulationResponse
)
from backend.app.services.risk_service import get_risk_engine

class SimulationService:
    @staticmethod
    def run_scenario(request: ScenarioSimulationRequest) -> ScenarioSimulationResponse:
        ml_engine = get_inference_engine()
        risk_engine = get_risk_engine()
        
        # 1. Fetch Micro-Market Info
        base_mm = ml_engine.get_micro_market(request.location_id)
        
        prop_payload = {
            "location_id": request.location_id,
            "property_type": request.property_type,
            "area_sqft": request.area_sqft,
            "bedrooms": request.bedrooms,
            "bathrooms": request.bathrooms,
            "property_age": request.property_age,
            "floor_number": request.floor_number,
            "total_floors": request.total_floors,
            "amenities": request.amenities or [],
            "current_price": request.current_price
        }
        
        # 2. Compute BASE CASE
        base_pred = ml_engine.predict_property(prop_payload)
        base_val = base_pred["valuation"]
        base_forecast = base_pred["forecast"]
        
        base_risk = risk_engine.evaluate_property_risk(prop_payload, base_mm, base_val)
        base_demand = risk_engine.evaluate_demand(base_mm)
        base_liquidity = risk_engine.evaluate_liquidity(base_mm)
        base_opp = risk_engine.evaluate_opportunity(base_mm, base_risk["score"], base_val)
        base_rec = risk_engine.generate_recommendation(base_risk["score"], base_opp["score"], base_val, base_mm)
        
        # 3. Create SCENARIO Micro-Market with Shocks
        scenario_mm = base_mm.copy()
        
        # Demand shock
        d_pct = request.demand_change_pct
        scenario_mm["demand_index"] = max(15.0, min(98.0, base_mm["demand_index"] * (1.0 + d_pct / 100.0)))
        
        # Supply shock
        s_pct = request.supply_change_pct
        scenario_mm["supply_index"] = max(15.0, min(100.0, base_mm["supply_index"] * (1.0 + s_pct / 100.0)))
        
        # Environmental shock
        env_delta = request.environmental_stress_delta
        scenario_mm["flood_risk_score"] = max(5.0, min(100.0, base_mm["flood_risk_score"] + env_delta))
        
        # Infrastructure shock
        infra_delta = request.infra_improvement_pct
        scenario_mm["infra_score"] = max(20.0, min(100.0, base_mm["infra_score"] * (1.0 + infra_delta / 100.0)))
        
        # Selling days response
        selling_modifier = (1.0 - (d_pct / 150.0) + (s_pct / 150.0))
        scenario_mm["selling_days"] = max(20, min(220, round(base_mm["selling_days"] * selling_modifier)))
        
        # Rental yield shock
        rent_delta = request.rental_growth_delta_pct
        scenario_mm["rental_yield"] = max(1.5, min(8.0, round(base_mm["rental_yield"] * (1.0 + rent_delta / 100.0), 2)))
        
        # Interest rate impact on valuation & growth (e.g. +100 bps repo rate ~ -3.5% capital valuation drag)
        ir_bps = request.interest_rate_change_bps
        ir_drag_pct = (ir_bps / 100.0) * -3.5
        
        # 4. Compute SCENARIO Predictions
        # Re-run ML Inference with adjusted parameters
        from ml.features.feature_engineering import prepare_single_property_features
        X_scenario = prepare_single_property_features(prop_payload, scenario_mm)
        
        if ml_engine.valuation_model is not None:
            scen_val_raw = float(ml_engine.valuation_model.predict(X_scenario)[0])
        else:
            scen_val_raw = base_val["estimated_value"]
            
        # Apply interest rate drag
        scen_val_num = round(scen_val_raw * (1.0 + ir_drag_pct / 100.0))
        scen_diff_pct = ((float(request.current_price or scen_val_num) - scen_val_num) / scen_val_num) * 100
        
        scen_val = {
            "estimated_value": scen_val_num,
            "lower_bound": round(scen_val_num * 0.94),
            "upper_bound": round(scen_val_num * 1.06),
            "estimated_price_sqft": round(scen_val_num / max(request.area_sqft, 1)),
            "valuation_status": "OVERVALUED" if scen_diff_pct > 6.0 else ("UNDERVALUED" if scen_diff_pct < -6.0 else "FAIR_VALUE"),
            "over_under_pct": round(scen_diff_pct, 1)
        }
        
        # Scenario 12M Forecast
        effective_scen_growth = (scenario_mm["demand_index"] / scenario_mm["supply_index"]) * (scenario_mm["infra_score"] / 80.0) * 0.07 + (ir_drag_pct / 200.0)
        scen_12m_forecast = round(scen_val_num * (1.0 + effective_scen_growth))
        scen_growth_12m_pct = round(((scen_12m_forecast - scen_val_num) / scen_val_num) * 100, 2)
        
        scen_forecast = {
            "3_month": round(scen_val_num * (1.0 + effective_scen_growth * 0.25)),
            "6_month": round(scen_val_num * (1.0 + effective_scen_growth * 0.50)),
            "12_month": scen_12m_forecast,
            "growth_12m_pct": scen_growth_12m_pct
        }
        
        # Scenario Risk & Decision
        scen_risk = risk_engine.evaluate_property_risk(prop_payload, scenario_mm, scen_val)
        scen_demand = risk_engine.evaluate_demand(scenario_mm)
        scen_liquidity = risk_engine.evaluate_liquidity(scenario_mm)
        scen_opp = risk_engine.evaluate_opportunity(scenario_mm, scen_risk["score"], scen_val)
        scen_rec = risk_engine.generate_recommendation(scen_risk["score"], scen_opp["score"], scen_val, scenario_mm)
        
        # 5. Build Comparison Matrix
        comparison = [
            ScenarioComparisonCard(
                metric="Estimated Fair Value",
                base_value=f"₹{base_val['estimated_value']:,.0f}",
                scenario_value=f"₹{scen_val['estimated_value']:,.0f}",
                delta=f"{((scen_val['estimated_value'] - base_val['estimated_value']) / base_val['estimated_value']) * 100:+.1f}%",
                unit="INR",
                impact="POSITIVE" if scen_val['estimated_value'] >= base_val['estimated_value'] else "NEGATIVE"
            ),
            ScenarioComparisonCard(
                metric="12-Month Forecast",
                base_value=f"₹{base_forecast['12_month']:,.0f}",
                scenario_value=f"₹{scen_forecast['12_month']:,.0f}",
                delta=f"{scen_forecast['growth_12m_pct'] - base_forecast['growth_12m_pct']:+.1f}% pts",
                unit="INR",
                impact="POSITIVE" if scen_forecast['12_month'] >= base_forecast['12_month'] else "NEGATIVE"
            ),
            ScenarioComparisonCard(
                metric="Composite Risk Score",
                base_value=f"{base_risk['score']:.1f} / 100 ({base_risk['level']})",
                scenario_value=f"{scen_risk['score']:.1f} / 100 ({scen_risk['level']})",
                delta=f"{scen_risk['score'] - base_risk['score']:+.1f} pts",
                unit="Index",
                impact="NEGATIVE" if scen_risk['score'] > base_risk['score'] else "POSITIVE"
            ),
            ScenarioComparisonCard(
                metric="Locality Demand Index",
                base_value=f"{base_demand['score']:.0f} / 100",
                scenario_value=f"{scen_demand['score']:.0f} / 100",
                delta=f"{scen_demand['score'] - base_demand['score']:+.0f} pts",
                unit="Index",
                impact="POSITIVE" if scen_demand['score'] >= base_demand['score'] else "NEGATIVE"
            ),
            ScenarioComparisonCard(
                metric="Expected Resale Days",
                base_value=f"{base_liquidity['estimated_selling_days']} days",
                scenario_value=f"{scen_liquidity['estimated_selling_days']} days",
                delta=f"{scen_liquidity['estimated_selling_days'] - base_liquidity['estimated_selling_days']:+d} days",
                unit="Days",
                impact="NEGATIVE" if scen_liquidity['estimated_selling_days'] > base_liquidity['estimated_selling_days'] else "POSITIVE"
            ),
            ScenarioComparisonCard(
                metric="Opportunity Score",
                base_value=f"{base_opp['score']:.1f} ({base_opp['grade']})",
                scenario_value=f"{scen_opp['score']:.1f} ({scen_opp['grade']})",
                delta=f"{scen_opp['score'] - base_opp['score']:+.1f} pts",
                unit="Score",
                impact="POSITIVE" if scen_opp['score'] >= base_opp['score'] else "NEGATIVE"
            )
        ]
        
        # 6. AI Scenario Synthesis
        shift_text = f"DECISION TRANSITION: {base_rec['decision']} ➔ {scen_rec['decision']}"
        synthesis = (
            f"Under simulated shocks (Demand {d_pct:+.0f}%, Supply {s_pct:+.0f}%, Interest Rate {ir_bps:+.0f} bps), "
            f"composite risk shifted from {base_risk['score']:.1f} ({base_risk['level']}) to {scen_risk['score']:.1f} ({scen_risk['level']}). "
            f"12-month capital forecast adjusted from ₹{base_forecast['12_month']:,.0f} ({base_forecast['growth_12m_pct']:+.1f}%) "
            f"to ₹{scen_forecast['12_month']:,.0f} ({scen_growth_12m_pct:+.1f}%). "
            f"Decision posture transitioned from {base_rec['decision']} to {scen_rec['decision']}: {scen_rec['rationale']}"
        )
        
        return ScenarioSimulationResponse(
            location_name=base_mm["name"],
            applied_shocks={
                "demand_change_pct": d_pct,
                "supply_change_pct": s_pct,
                "interest_rate_change_bps": ir_bps,
                "infra_improvement_pct": infra_delta,
                "environmental_stress_delta": env_delta,
                "rental_growth_delta_pct": rent_delta
            },
            base_case={
                "valuation": base_val,
                "forecast": base_forecast,
                "risk": base_risk,
                "demand": base_demand,
                "liquidity": base_liquidity,
                "opportunity": base_opp,
                "recommendation": base_rec
            },
            scenario_case={
                "valuation": scen_val,
                "forecast": scen_forecast,
                "risk": scen_risk,
                "demand": scen_demand,
                "liquidity": scen_liquidity,
                "opportunity": scen_opp,
                "recommendation": scen_rec
            },
            comparison_matrix=comparison,
            decision_shift={
                "base_decision": base_rec["decision"],
                "scenario_decision": scen_rec["decision"],
                "has_changed": base_rec["decision"] != scen_rec["decision"],
                "summary": shift_text
            },
            ai_scenario_synthesis=synthesis
        )
