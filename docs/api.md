# TerraSignal AI - REST API Documentation

**Base API URL:** `http://127.0.0.1:8000/api/v1`

---

## Endpoints Overview

### 1. Property Intelligence
- `POST /properties/analyze`: Full end-to-end ML property valuation, bounds, 3M/6M/12M forecast, 8-D risk radar, explainable AI factors, and BUY/WAIT/AVOID decision.
- `GET /properties/`: List verified properties in database.
- `GET /properties/{id}`: Detailed property view.

### 2. Location Intelligence & Comparison
- `GET /locations/`: List all 12 micro-markets with rates, growth, risk scores, demand/supply indices.
- `GET /locations/{id}`: Locality profile with 12-quarter historical time-series.
- `POST /locations/compare`: Side-by-side multi-location trade-off comparison matrix.

### 3. What-If Scenario Simulation
- `POST /simulate/`: Executes macroeconomic, demand, and environmental stress shocks, returning Base Case vs. Scenario deltas and decision posture shifts.

### 4. Grounded AI Real-Estate Analyst
- `POST /ai/analyze`: Retrieval-augmented conversational decision agent strictly citing database tables and risk matrices with zero hallucination.

### 5. Early Warning System & Anomalies
- `GET /alerts/`: Active early warning advisories with severity and micro-market filtering.
- `POST /alerts/scan`: Trigger dynamic anomaly detection scan across all zones.

### 6. Opportunity Radar
- `GET /opportunities/`: Ranked investment opportunity micro-markets with data-backed reasoning.

### 7. Executive Dashboard
- `GET /dashboard/`: Aggregates top 8 KPIs, Market Pulse, 12-quarter macro trends, and active alerts.

### 8. Investor Portfolio
- `GET /portfolio/`: Aggregate valuation, unrealized returns, risk concentration, and rental yields.
- `POST /portfolio/`: Save new asset to portfolio.
- `DELETE /portfolio/{id}`: Remove asset from portfolio.

### 9. Model Governance & Admin
- `GET /admin/overview`: Model card metrics (MAE, RMSE, R²), data sources provenance, data quality report.
- `POST /admin/retrain`: Trigger verified model retraining pipeline.
