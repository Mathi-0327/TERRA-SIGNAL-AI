"""
TerraSignal AI - Anomaly Detection Model
Trains Isolation Forest and statistical Z-score detectors on micro-market time-series
to catch abnormal divergences (e.g. rising prices during demand contraction).
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models", "trained_models")
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")

def train_anomaly_model():
    print("Training Market Anomaly Isolation Forest...")
    history_csv = os.path.join(RAW_DATA_DIR, "historical_market_data.csv")
    df = pd.read_csv(history_csv)
    
    # Calculate QoQ rates of change
    df_sorted = df.sort_values(by=["location_id", "quarter"]).copy()
    
    df_sorted["price_pct_change"] = df_sorted.groupby("location_id")["avg_price_sqft"].pct_change().fillna(0) * 100
    df_sorted["demand_pct_change"] = df_sorted.groupby("location_id")["demand_index"].pct_change().fillna(0) * 100
    df_sorted["supply_pct_change"] = df_sorted.groupby("location_id")["supply_index"].pct_change().fillna(0) * 100
    df_sorted["selling_pct_change"] = df_sorted.groupby("location_id")["selling_days"].pct_change().fillna(0) * 100
    
    # Interaction divergence: Price going up while demand goes down
    df_sorted["divergence_intensity"] = df_sorted["price_pct_change"] - df_sorted["demand_pct_change"]
    
    features = [
        "price_pct_change", "demand_pct_change", "supply_pct_change",
        "selling_pct_change", "divergence_intensity"
    ]
    
    X = df_sorted[features].values
    
    iso_forest = IsolationForest(n_estimators=100, contamination=0.08, random_state=42)
    iso_forest.fit(X)
    
    joblib.dump(iso_forest, os.path.join(MODELS_DIR, "anomaly_isolation_forest.joblib"))
    print("Anomaly Detection Model trained and saved.")

if __name__ == "__main__":
    train_anomaly_model()
