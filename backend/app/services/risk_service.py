"""
TerraSignal AI - 8-Dimensional Multi-Factor Risk Engine & Decision Support System
Computes transparent, configurable risk scores, opportunity grades, and BUY/WAIT/AVOID decisions.
"""

from typing import Any, Dict, List, Optional
from backend.app.core.config import settings

class TerraSignalRiskEngine:
    def __init__(self, custom_weights: Optional[Dict[str, float]] = None):
        self.weights = custom_weights or settings.RISK_WEIGHTS

    def evaluate_property_risk(
        self,
        prop_data: dict,
        mm_info: dict,
        valuation_data: dict
    ) -> dict:
        """
        Calculates all 8 risk dimensions and composite risk classification.
        """
        # 1. Valuation Risk (0 - 100)
        over_under_pct = valuation_data.get("over_under_pct", 0.0)
        if over_under_pct > 15.0:
            val_risk = min(95.0, 50.0 + over_under_pct * 2.5)
        elif over_under_pct > 5.0:
            val_risk = 40.0 + over_under_pct * 1.5
        elif over_under_pct < -5.0:
            val_risk = max(10.0, 30.0 + over_under_pct * 1.0) # Undervalued = Low valuation risk
        else:
            val_risk = 25.0
            
        # 2. Market Risk (0 - 100)
        # Based on status, anomaly signal, and growth deceleration
        market_status = mm_info.get("market_status", "STABLE")
        if market_status == "STRESSED":
            mkt_risk = 85.0
        elif market_status == "COOLING":
            mkt_risk = 65.0
        elif market_status == "EXPANDING":
            mkt_risk = 22.0
        else: # STABLE
            mkt_risk = 35.0
            
        if mm_info.get("anomaly_signal") != "NONE":
            mkt_risk = min(95.0, mkt_risk + 12.0)
            
        # 3. Demand Risk (0 - 100)
        demand_idx = float(mm_info.get("demand_index", 75))
        demand_risk = max(5.0, min(95.0, 100.0 - demand_idx + 10.0))
        
        # 4. Supply Risk (0 - 100)
        supply_idx = float(mm_info.get("supply_index", 60))
        supply_risk = max(10.0, min(95.0, supply_idx * 1.05))
        
        # 5. Liquidity Risk (0 - 100)
        selling_days = int(mm_info.get("selling_days", 75))
        if selling_days > 110:
            liq_risk = min(95.0, 60.0 + (selling_days - 110) * 0.8)
        elif selling_days < 50:
            liq_risk = 18.0
        else:
            liq_risk = 25.0 + (selling_days - 50) * 0.6
            
        # 6. Environmental Risk (0 - 100)
        flood_score = float(mm_info.get("flood_risk_score", 40))
        water_score = float(mm_info.get("water_table_risk", 40))
        env_risk = max(5.0, min(98.0, (flood_score * 0.7) + (water_score * 0.3)))
        
        # Floor adjustment for flood risk: Ground/1st floors carry higher damage risk in high flood areas
        floor = int(prop_data.get("floor_number", 2))
        if floor <= 1 and flood_score > 60:
            env_risk = min(100.0, env_risk + 15.0)
        elif floor >= 5 and flood_score > 60:
            env_risk = max(30.0, env_risk - 10.0)
            
        # 7. Infrastructure Risk (0 - 100)
        infra_score = float(mm_info.get("infra_score", 80))
        infra_risk = max(5.0, min(95.0, 100.0 - infra_score))
        
        # 8. Economic Risk (0 - 100)
        rental_yield = float(mm_info.get("rental_yield", 3.8))
        if rental_yield < 3.0:
            econ_risk = 60.0 + (3.0 - rental_yield) * 15.0
        elif rental_yield > 4.2:
            econ_risk = 20.0
        else:
            econ_risk = 35.0
            
        dimensions = {
            "market_risk": round(mkt_risk, 1),
            "valuation_risk": round(val_risk, 1),
            "demand_risk": round(demand_risk, 1),
            "supply_risk": round(supply_risk, 1),
            "liquidity_risk": round(liq_risk, 1),
            "environmental_risk": round(env_risk, 1),
            "infrastructure_risk": round(infra_risk, 1),
            "economic_risk": round(econ_risk, 1)
        }
        
        # Weighted Composite Score
        composite_score = sum(dimensions[k] * self.weights.get(k, 0.125) for k in dimensions)
        composite_score = round(max(0.0, min(100.0, composite_score)), 1)
        
        # Classification
        if composite_score <= 20.0:
            level = "VERY_LOW"
        elif composite_score <= 40.0:
            level = "LOW"
        elif composite_score <= 60.0:
            level = "MODERATE"
        elif composite_score <= 80.0:
            level = "HIGH"
        else:
            level = "CRITICAL"
            
        # Identify Vulnerabilities and Mitigators
        key_vulns = []
        mitigators = []
        
        if val_risk > 50:
            key_vulns.append(f"Valuation Risk ({val_risk:.0f}/100): Asking price is {over_under_pct:+.1f}% vs ML Fair Value benchmark.")
        if env_risk > 65:
            key_vulns.append(f"Environmental Hazard ({env_risk:.0f}/100): Micro-drainage catchment and monsoon flood vulnerability.")
        if supply_risk > 70:
            key_vulns.append(f"Supply Overhang ({supply_risk:.0f}/100): Elevated unsold developer inventory ({mm_info.get('supply_index', 70)}/100).")
        if liq_risk > 60:
            key_vulns.append(f"Liquidity Drag ({liq_risk:.0f}/100): Elongated average resale listing duration ({selling_days} days).")
            
        if demand_risk < 30:
            mitigators.append(f"Robust Buyer Demand ({100-demand_risk:.0f}/100 index in {mm_info['name']}).")
        if infra_risk < 20:
            mitigators.append(f"Superior Infrastructure ({infra_score:.0f}/100 transit rating with active Metro connectivity).")
        if rental_yield >= 4.0:
            mitigators.append(f"High Cash Flow Yield ({rental_yield:.1f}% gross rental yield cushions downside).")
            
        return {
            "score": composite_score,
            "level": level,
            "dimensions": dimensions,
            "key_vulnerabilities": key_vulns or ["No dominant single-factor vulnerabilities detected."],
            "mitigating_factors": mitigators or ["Standard metro baseline risk protections apply."]
        }

    def evaluate_demand(self, mm_info: dict) -> dict:
        demand_idx = float(mm_info.get("demand_index", 75))
        supply_idx = float(mm_info.get("supply_index", 60))
        ratio = round(demand_idx / max(supply_idx, 1), 2)
        
        if demand_idx >= 80:
            trend = "INCREASING"
            desc = "Aggressive end-user and investor inquiry volume outstripping available fresh inventory."
        elif demand_idx <= 65:
            trend = "DECLINING"
            desc = "Softening inquiry velocity and buyer hesitation due to elevated interest rates or alternative suburban options."
        else:
            trend = "STABLE"
            desc = "Balanced transaction volume matching steady replacement demand."
            
        return {
            "score": round(demand_idx, 1),
            "trend": trend,
            "demand_supply_ratio": ratio,
            "description": desc
        }

    def evaluate_liquidity(self, mm_info: dict) -> dict:
        selling_days = int(mm_info.get("selling_days", 75))
        demand_idx = float(mm_info.get("demand_index", 75))
        
        # Liquidity score (0-100, higher is more liquid / faster to sell)
        liq_score = round(max(10.0, min(95.0, (180 - selling_days) * 0.6 + (demand_idx * 0.4))), 1)
        
        if liq_score >= 70:
            cls_name = "HIGH_LIQUIDITY"
            vel = "Fast exit turnover (<60 days expected resale time)"
        elif liq_score <= 45:
            cls_name = "LOW_LIQUIDITY"
            vel = "Elongated marketing window (>100 days to exit)"
        else:
            cls_name = "MODERATE"
            vel = "Standard market absorption (60-90 days resale time)"
            
        return {
            "score": liq_score,
            "classification": cls_name,
            "estimated_selling_days": selling_days,
            "turnover_velocity": vel
        }

    def evaluate_opportunity(self, mm_info: dict, risk_score: float, valuation_data: dict) -> dict:
        growth_1y = float(mm_info.get("price_growth_1y", 6.0))
        demand_idx = float(mm_info.get("demand_index", 75))
        infra_score = float(mm_info.get("infra_score", 80))
        rental_yield = float(mm_info.get("rental_yield", 3.8))
        over_under = valuation_data.get("over_under_pct", 0.0)
        
        # Opportunity formula:
        # High growth + high demand + strong infra + good rental yield + undervaluation discount + low risk
        opp = (growth_1y * 3.2) + (demand_idx * 0.35) + (infra_score * 0.25) + (rental_yield * 4.0) - (over_under * 0.8) + ((100 - risk_score) * 0.2)
        opp_score = round(max(10.0, min(96.0, opp)), 1)
        
        if opp_score >= 82:
            grade = "A+"
            pot = "Exceptional Capital Appreciation & Yield Convergence"
        elif opp_score >= 72:
            grade = "A"
            pot = "High Growth Trajectory with Sound Fundamentals"
        elif opp_score >= 60:
            grade = "B"
            pot = "Moderate Steady-State Return Profile"
        elif opp_score >= 45:
            grade = "C"
            pot = "Defensive / Income-Focused Asset"
        else:
            grade = "D"
            pot = "Constrained Upside Potential"
            
        drivers = []
        if growth_1y >= 8.0:
            drivers.append(f"Top-tier YoY capital appreciation momentum (+{growth_1y:.1f}%).")
        if infra_score >= 85:
            drivers.append(f"Transit-oriented catalyst: Upcoming Metro node and bypass linkages.")
        if rental_yield >= 4.2:
            drivers.append(f"Strong rental cashflow yielding {rental_yield:.1f}% per annum.")
        if over_under < -4.0:
            drivers.append(f"Entry price discount of {abs(over_under):.1f}% below fair market valuation.")
            
        return {
            "score": opp_score,
            "grade": grade,
            "growth_potential": pot,
            "drivers": drivers or ["Consistent baseline metro growth."]
        }

    def generate_recommendation(
        self,
        risk_score: float,
        opp_score: float,
        valuation_data: dict,
        mm_info: dict
    ) -> dict:
        over_under = valuation_data.get("over_under_pct", 0.0)
        flood_risk = float(mm_info.get("flood_risk_score", 40))
        
        tradeoffs = []
        
        if risk_score > 70.0 or flood_risk > 80.0 or over_under > 18.0:
            decision = "AVOID"
            conf = 0.88
            rationale = "Elevated composite risk and negative pricing asymmetry severely compromise margin of safety."
            tradeoffs.append("Capital preservation prioritized over potential cyclical bounce.")
            tradeoffs.append("Elevated holding cost risk due to sluggish liquidity.")
            neg_range = None
        elif risk_score >= 48.0 or over_under > 4.5 or mm_info.get("market_status") == "COOLING":
            decision = "WAIT"
            conf = 0.82
            rationale = "Market displays inventory accumulation and pricing resistance. Patient capital should bid at a 5-8% discount."
            tradeoffs.append("Risk of missing immediate upside balanced against avoiding buying at local cyclical peak.")
            tradeoffs.append("High developer inventory offers strong negotiation leverage in coming 6 months.")
            neg_range = {
                "recommended_bid_inr": round(valuation_data["estimated_value"] * 0.94),
                "discount_target_pct": 6.0
            }
        else:
            decision = "BUY"
            conf = 0.86
            rationale = "Solid fundamentals, healthy demand-supply absorption, and attractive valuation margin favor long-term accumulation."
            tradeoffs.append("Requires 3-5 year horizon to capture full infrastructure catalyst benefits.")
            tradeoffs.append("Moderate initial rental yield during transition period.")
            neg_range = {
                "recommended_bid_inr": round(valuation_data["estimated_value"] * 0.98),
                "discount_target_pct": 2.0
            }
            
        return {
            "decision": decision,
            "confidence": conf,
            "rationale": rationale,
            "key_tradeoffs": tradeoffs,
            "suggested_negotiation_range": neg_range
        }

_risk_engine = None

def get_risk_engine():
    global _risk_engine
    if _risk_engine is None:
        _risk_engine = TerraSignalRiskEngine()
    return _risk_engine
