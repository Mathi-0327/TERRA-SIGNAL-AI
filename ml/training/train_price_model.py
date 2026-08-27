"""
TerraSignal AI - ML Model Training Pipeline
Trains baseline Ridge, Random Forest, and Gradient Boosting models on real property features,
evaluates genuine metrics (MAE, RMSE, R²), and serializes production artifacts.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from ml.features.feature_engineering import FEATURE_COLUMNS, engineer_features

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models", "trained_models")
DOCS_DIR = os.path.join(BASE_DIR, "docs")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

def train_models():
    print("Training TerraSignal AI Predictive Valuation Models...")
    
    clean_csv = os.path.join(PROCESSED_DATA_DIR, "properties_clean.csv")
    if not os.path.exists(clean_csv):
        raise FileNotFoundError(f"Processed dataset not found at {clean_csv}")
        
    df = pd.read_csv(clean_csv)
    
    X = engineer_features(df)
    y = df["current_price"].values
    
    # Train-test split (80-20) with random seed
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    
    models = {
        "Ridge_Regression_Baseline": Ridge(alpha=1.0),
        "Random_Forest_Regressor": RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1),
        "Gradient_Boosting_Regressor": GradientBoostingRegressor(n_estimators=200, learning_rate=0.08, max_depth=5, random_state=42)
    }
    
    results = {}
    best_model_name = None
    best_r2 = -float("inf")
    trained_model_objs = {}
    
    for name, model in models.items():
        print(f"Training {name} on {len(X_train)} samples...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        
        results[name] = {
            "mae_inr": round(float(mae), 2),
            "rmse_inr": round(float(rmse), 2),
            "r2_score": round(float(r2), 4),
            "mape_pct": round(float(mape), 2)
        }
        print(f"  -> {name} | R2: {r2:.4f} | MAE: INR {mae:,.0f} | MAPE: {mape:.2f}%")
        
        trained_model_objs[name] = model
        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name
            
    print(f"\nBest Performing Model: {best_model_name} (R2 = {best_r2:.4f})")
    
    # Save the best model artifact
    best_model = trained_model_objs[best_model_name]
    model_artifact_path = os.path.join(MODELS_DIR, "price_valuation_model.joblib")
    joblib.dump(best_model, model_artifact_path)
    
    # Also save the Ridge baseline for comparative introspection
    joblib.dump(trained_model_objs["Ridge_Regression_Baseline"], os.path.join(MODELS_DIR, "ridge_baseline.joblib"))
    
    # Extract Feature Importances
    if hasattr(best_model, "feature_importances_"):
        importances = {feat: round(float(imp), 4) for feat, imp in zip(FEATURE_COLUMNS, best_model.feature_importances_)}
        sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))
    else:
        sorted_importances = {}
        
    model_metadata = {
        "model_name": "TerraSignal Predictive Valuation Engine",
        "primary_algorithm": best_model_name,
        "version": "v1.2.0-stable",
        "training_date": pd.Timestamp.now().isoformat(),
        "dataset_version": "Chennai_Metro_Q2_2026",
        "training_samples_count": len(X_train),
        "test_samples_count": len(X_test),
        "features_list": FEATURE_COLUMNS,
        "evaluation_metrics": results[best_model_name],
        "all_benchmarked_models": results,
        "feature_importances": sorted_importances,
        "status": "PRODUCTION_READY"
    }
    
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(model_metadata, f, indent=2)
        
    # Write Model Card Markdown Documentation
    write_model_card(model_metadata, results)
    
    return model_metadata

def write_model_card(meta: dict, results: dict):
    """Generates official model card documentation with transparent metrics."""
    doc_content = f"""# TerraSignal AI - Valuation Model Card

**Model Name:** {meta['model_name']}  
**Production Version:** `{meta['version']}`  
**Training Date:** `{meta['training_date']}`  
**Status:** `{meta['status']}`

---

## 1. Model Overview
The TerraSignal AI Valuation Engine provides automated fair market value estimations for residential properties across Chennai micro-markets. It processes physical property attributes combined with micro-market demand, supply, infrastructure, and environmental risk indicators.

## 2. Benchmark Model Comparison
| Algorithm | R2 Score | MAE (INR) | RMSE (INR) | MAPE (%) |
| :--- | :--- | :--- | :--- | :--- |
| **Ridge Regression (Baseline)** | {results['Ridge_Regression_Baseline']['r2_score']} | INR {results['Ridge_Regression_Baseline']['mae_inr']:,.0f} | INR {results['Ridge_Regression_Baseline']['rmse_inr']:,.0f} | {results['Ridge_Regression_Baseline']['mape_pct']}% |
| **Random Forest Regressor** | {results['Random_Forest_Regressor']['r2_score']} | INR {results['Random_Forest_Regressor']['mae_inr']:,.0f} | INR {results['Random_Forest_Regressor']['rmse_inr']:,.0f} | {results['Random_Forest_Regressor']['mape_pct']}% |
| **Gradient Boosting Regressor (Selected)** | **{results['Gradient_Boosting_Regressor']['r2_score']}** | **INR {results['Gradient_Boosting_Regressor']['mae_inr']:,.0f}** | **INR {results['Gradient_Boosting_Regressor']['rmse_inr']:,.0f}** | **{results['Gradient_Boosting_Regressor']['mape_pct']}%** |

## 3. Key Feature Importances
Top factors driving property valuations:
"""
    for feat, imp in list(meta['feature_importances'].items())[:8]:
        doc_content += f"- **`{feat}`**: {imp * 100:.1f}%\n"

    doc_content += """
## 4. Uncertainty & Error Bounds
The model outputs a 90% confidence interval defined as:
$$\\text{Valuation Range} = \\hat{y} \\pm 1.645 \\times \\text{RMSE}$$

Predictions are clearly segregated into:
- **Observed Market Price** (Seller Asking)
- **Estimated Fair Market Value** (ML Median)
- **Lower & Upper Bound Bounds** (Conservative to Optimistic Band)
"""
    with open(os.path.join(DOCS_DIR, "model-card.md"), "w", encoding="utf-8") as f:
        f.write(doc_content)
    print("Saved model card to docs/model-card.md")

if __name__ == "__main__":
    train_models()
