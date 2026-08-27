# TerraSignal AI - System Architecture

**"Know the property. Predict the risk. Decide with intelligence."**

TerraSignal AI is an institutional-grade AI Real Estate Decision Intelligence and Early-Warning Platform.

---

## 1. High-Level System Architecture

```
                    ┌─────────────────────────────────────────────────────┐
                    │               NEXT.JS 14 FRONTEND                   │
                    │   Executive Dashboard  •  Property Analyzer         │
                    │   Risk Radar Map       •  What-If Scenario Sim      │
                    │   Opportunity Radar    •  Grounded AI Analyst       │
                    └──────────────────────────┬──────────────────────────┘
                                               │ HTTP / REST (JSON)
                                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │                 FASTAPI BACKEND                     │
                    │   Authentication       •  Property Valuation API    │
                    │   8-D Risk Engine      •  Early Warning Alerts      │
                    │   Scenario Simulator   •  Grounded RAG AI Analyst   │
                    └───────┬──────────────────┬──────────────────┬───────┘
                            │                  │                  │
                            ▼                  ▼                  ▼
    ┌──────────────────────────────┐ ┌───────────────────┐ ┌──────────────┐
    │       ML INFERENCE ENGINE    │ │   SQL DATABASE    │ │ DATA SOURCES │
    │ • GradientBoosting Valuation │ │ • SQLite (Local)  │ │ • NHB RESIDEX│
    │ • 3M/6M/12M Horizon Models   │ │ • MySQL (Prod)    │ │ • TNRERA     │
    │ • Tree SHAP Feature Factors  │ │ • 12 Micro-Markets│ │ • WRD GIS    │
    │ • IsolationForest Anomaly    │ │ • 3,500 Properties│ │ • CMDA Plan  │
    └──────────────────────────────┘ └───────────────────┘ └──────────────┘
```

---

## 2. Core Operational Workflow

```
RAW OBSERVED DATA
      │
      ▼
DATA PIPELINE & VALIDATION (Bounds, IQR Outliers, Quality Report)
      │
      ▼
FEATURE ENGINEERING (Density, Floor Ratio, Demand/Supply Interaction)
      │
      ▼
MACHINE LEARNING PREDICTIVE VALUATION (Gradient Boosting Regressor, R² = 0.987)
      │
      ▼
TIME HORIZON PROJECTIONS (3M, 6M, 12M Capital Forecasts)
      │
      ▼
8-DIMENSIONAL MULTI-FACTOR RISK ENGINE (Market, Valuation, Demand, Supply, Liquidity, Environment, Infra, Economic)
      │
      ▼
EARLY WARNING & DIVERGENCE DETECTOR (Detects Price-Demand Decoupling, Inventory Surges)
      │
      ▼
EXPLAINABLE AI ENGINE (Decomposes Exact Positive & Negative INR / % Value Contributors)
      │
      ▼
WHAT-IF SCENARIO SIMULATOR (Dynamic Shocks: Demand, Supply, Repo Rate, Climate)
      │
      ▼
DECISION SUPPORT MATRIX (Formulates BUY / WAIT / AVOID Stance + Negotiation Range)
      │
      ▼
GROUNDED AI ANALYST (Retrieval-based Decision Assistance with Zero Hallucination)
```

---

## 3. 8-Dimensional Multi-Factor Risk Model

The composite risk score ($0 - 100$) is computed as a weighted combination of 8 critical real-estate risk dimensions:

$$\text{Composite Risk Score} = \sum_{i=1}^{8} w_i \times \text{Risk Dimension}_i$$

| Dimension | Description | Default Weight |
| :--- | :--- | :--- |
| **Valuation Risk** | Overvaluation spread vs. ML fair value model ($\hat{y}$) | 20% |
| **Market Risk** | Micro-market status (`COOLING`, `STRESSED`), historical volatility | 15% |
| **Demand Risk** | Inverted buyer search volume and inquiry velocity | 15% |
| **Supply Risk** | Active unsold developer inventory and construction overhang | 15% |
| **Liquidity Risk** | Average days on market ($>90$ days indicates liquidity drag) | 10% |
| **Environmental Risk** | 100-year flood hazard, marsh catchment, sea level exposure | 10% |
| **Infrastructure Risk** | Transit connectivity deficit, distance to upcoming Metro Line | 10% |
| **Economic Risk** | Mortgage interest rate sensitivity and rental yield compression | 5% |

### Risk Classifications
- **0 – 20**: `VERY_LOW`
- **21 – 40**: `LOW`
- **41 – 60**: `MODERATE`
- **61 – 80**: `HIGH`
- **81 – 100**: `CRITICAL`
