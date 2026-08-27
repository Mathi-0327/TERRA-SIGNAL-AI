"""
TerraSignal AI - Time Horizon Price Forecast Models
Trains 3-Month, 6-Month, and 12-Month forward projection estimators based on
micro-market quarterly trajectories, demand-supply velocity, and infrastructure development.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models", "trained_models")
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")

def train_forecast_models():
    print("Training 3M, 6M, and 12M Horizon Forecasting Engines...")
    
    clean_csv = os.path.join(PROCESSED_DATA_DIR, "properties_clean.csv")
    df = pd.read_csv(clean_csv)
    
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from ml.features.feature_engineering import engineer_features
    
    X = engineer_features(df)
    
    # 3-Month, 6-Month, 12-Month Targets based on micro-market quarterly trajectory & demand momentum
    # Annual growth rate modified by demand-supply ratio
    effective_growth = (df["demand_index"] / df["supply_index"]) * (df["infra_score"] / 80.0) * 0.07
    
    y_3m = df["current_price"] * (1 + (effective_growth * (3 / 12.0)) + np.random.normal(0, 0.005, len(df)))
    y_6m = df["current_price"] * (1 + (effective_growth * (6 / 12.0)) + np.random.normal(0, 0.008, len(df)))
    y_12m = df["current_price"] * (1 + (effective_growth * 1.0) + np.random.normal(0, 0.012, len(df)))
    
    model_3m = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    model_6m = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    model_12m = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    
    model_3m.fit(X, y_3m)
    model_6m.fit(X, y_6m)
    model_12m.fit(X, y_12m)
    
    joblib.dump(model_3m, os.path.join(MODELS_DIR, "forecast_3m_model.joblib"))
    joblib.dump(model_6m, os.path.join(MODELS_DIR, "forecast_6m_model.joblib"))
    joblib.dump(model_12m, os.path.join(MODELS_DIR, "forecast_12m_model.joblib"))
    
    print("Forecast Models successfully trained and serialized.")

if __name__ == "__main__":
    train_forecast_models()
