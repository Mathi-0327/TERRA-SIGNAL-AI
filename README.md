# TerraSignal AI

> **"Know the property. Predict the risk. Decide with intelligence."**

**TerraSignal AI** is an institutional-grade AI-powered real estate early-warning and decision intelligence platform. Rather than acting as a static property listing portal, TerraSignal AI computes forward-looking predictive valuations, forecasts 12-month capital appreciation trajectories, evaluates 8-dimensional multi-factor risk profiles, generates early warning alerts on market stress, and runs interactive What-If scenario simulations with explainable AI insights.

---

## 🌟 Core Differentiating Innovations

1. **Grounded ML Predictive Valuation Engine**:
   - Trained on 3,500+ realistic properties across 12 Chennai micro-markets.
   - Evaluated Gradient Boosting Regressor ($R^2 = 0.9872$, $\text{MAE} = ₹8.94\text{L}$, $\text{MAPE} = 5.30\%$) and Random Forest Regressor ($R^2 = 0.9805$).
   - Computes statistical $90\%$ confidence bounds: $\hat{y} \pm 1.645 \times \text{RMSE}$.
2. **Transparent Explainable AI (Tree SHAP Approximation)**:
   - Quantifies exact value enhancements ($+₹$) and risk discounts ($-₹$) for infrastructure proximity, demand-supply velocity, age depreciation, and flood hazard exposure.
3. **8-Dimensional Multi-Factor Risk Engine**:
   - Market Risk, Valuation Risk, Demand Risk, Supply Risk, Liquidity Risk, Environmental Inundation Risk, Infrastructure Risk, and Economic Risk.
   - Transparent, configurable weights and objective classifications (`VERY_LOW` to `CRITICAL`).
4. **Early Warning System & Anomaly Detection**:
   - Detects abnormal market stress (e.g. price-demand divergence where asking prices rise while buyer inquiry velocity falls and inventory spikes).
5. **Interactive What-If Scenario Simulator**:
   - Live stress-testing across Demand ($\pm 40\%$), Supply Overhang, Interest Rate Shifts, and Climate Events.
   - Computes real-time Base Case vs. Scenario deltas and dynamic recommendation shifts (e.g. `BUY` ➔ `WAIT` or `WAIT` ➔ `AVOID`).
6. **Zero-Hallucination Grounded AI Analyst**:
   - Conversational RAG assistant directly citing database tables and ML model parameters.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Leaflet, Lucide Icons
- **Backend**: Python, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn
- **Machine Learning**: Scikit-Learn (Gradient Boosting, Random Forest, Ridge), NumPy, Pandas, Joblib
- **Database**: SQLite (Zero-friction local dev) / MySQL & PostgreSQL (Production deployment ready)
- **Data Provenance**: NHB RESIDEX, TNRERA Registered Registry, CMDA Master Plan 2026, State WRD GIS

---

## 🚀 Quick Startup Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup & Startup
```powershell
# Navigate to project root
cd c:\Users\mathiyazhagan\Desktop\LAND

# Install Python backend dependencies
pip install fastapi uvicorn pydantic pydantic-settings sqlalchemy pymysql pandas numpy scikit-learn joblib scipy bcrypt python-jose email-validator httpx pytest

# Seed data and train ML models (One-time setup)
python data/seed_data.py
python ml/preprocessing/data_pipeline.py
python ml/training/train_price_model.py
python ml/training/train_forecast_model.py
python ml/training/train_anomaly_model.py
python -m backend.app.database.init_db

# Start FastAPI Backend Server (Runs on http://127.0.0.1:8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup & Startup
```powershell
# In a new terminal, navigate to the frontend directory
cd c:\Users\mathiyazhagan\Desktop\LAND\frontend

# Install Node dependencies
npm install

# Start Next.js Development Server (Runs on http://localhost:3000)
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 🧪 Running Automated Tests

```powershell
# Run the complete test suite
python -m pytest tests/ -v
```

---

## 🎯 5-Minute Investor / Judge Demo Flow

1. **Step 1: Open Executive Dashboard (`/dashboard`)**
   - Highlight the **Market Pulse** indicator (`COOLING` in IT corridors vs `EXPANDING` in West Chennai).
   - Point out the 8 top KPI cards, 12-quarter price trajectories, and the live early-warning feed.
2. **Step 2: Inspect Spatial Risk Radar (`/risk-radar`)**
   - Click on **OMR** on the interactive map: explain that the platform detects an active **Demand-Price Divergence Warning** (Demand $-12\%$, Inventory $+19\%$, Selling Days $115$d).
3. **Step 3: Analyze Property (`/property-analyzer`)**
   - Enter a 1,250 sq.ft 3BHK in OMR.
   - Click **"Run AI Intelligence Engine"**.
   - Review the **Estimated Fair Value** (₹89.3L), **12M Forecast** (₹1.02 Cr), **8-D Risk Radar**, and the **Explainable AI Feature Contributions**.
4. **Step 4: Stress-Test in Scenario Simulator (`/scenario-simulator`)**
   - Move the **Demand Shock** slider to $-15\%$ and **Supply Overhang** to $+20\%$.
   - Observe how composite risk increases from $38 \to 61$, 12-month appreciation decelerates, and the decision posture transitions from **BUY ➔ WAIT**.
5. **Step 5: Query the Grounded AI Analyst (`/ai-analyst`)**
   - Click the prompt chip: *"Why did the recommendation change for OMR?"*
   - Show how the AI provides strict data citations directly from the simulation run with zero hallucination.
6. **Step 6: Export Memorandum (`/reports`)**
   - View the complete institutional **Investment Intelligence Dossier** with printable export.

---

## 📁 Repository Structure

```
LAND/
├── backend/
│   ├── app/
│   │   ├── api/v1/ (auth, properties, locations, market, alerts, opportunities, dashboard, simulate, ai_analyst, portfolio, reports, admin)
│   │   ├── core/ (config.py, security.py)
│   │   ├── database/ (session.py, init_db.py)
│   │   ├── models/ (db_models.py)
│   │   ├── schemas/ (api_schemas.py)
│   │   ├── services/ (risk_service.py, alert_service.py, simulation_service.py, ai_analyst_service.py, report_service.py)
│   │   └── main.py
│   └── requirements.txt
├── ml/
│   ├── features/ (feature_engineering.py)
│   ├── models/trained_models/ (.joblib artifacts & model_metadata.json)
│   ├── preprocessing/ (data_pipeline.py)
│   ├── training/ (train_price_model.py, train_forecast_model.py, train_anomaly_model.py)
│   └── inference/ (predict.py)
├── data/
│   ├── raw/ (micro_markets.json, data_sources.json, historical_market_data.csv, early_warnings.json)
│   ├── processed/ (properties_clean.csv, data_quality_report.json)
│   └── seed_data.py
├── frontend/
│   ├── app/ (dashboard, property-analyzer, location-intelligence, risk-radar, opportunity-radar, market-intelligence, scenario-simulator, ai-analyst, alerts, reports, portfolio, admin, settings, login, register)
│   ├── components/ (layout, maps, ui)
│   ├── lib/ (api-client.ts, formatting.ts)
│   └── types/ (api.ts)
├── docs/ (architecture.md, data-sources.md, model-card.md, api.md)
└── tests/ (test_data_pipeline.py, test_ml_inference.py, test_risk_engine.py, test_scenario_simulation.py, test_api_endpoints.py)
```
