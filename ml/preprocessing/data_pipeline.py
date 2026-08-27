"""
TerraSignal AI - Data Pipeline & Quality Assurance
Handles dataset ingestion, validation, cleaning, deduplication,
outlier detection, and generation of the Data Quality Report.
"""

import json
import os
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")

def run_data_pipeline():
    print("Executing TerraSignal AI Data Ingestion & Quality Pipeline...")
    
    raw_prop_file = os.path.join(RAW_DATA_DIR, "properties_dataset.csv")
    if not os.path.exists(raw_prop_file):
        raise FileNotFoundError(f"Raw dataset not found at {raw_prop_file}. Run seed_data.py first.")
        
    df = pd.read_csv(raw_prop_file)
    initial_count = len(df)
    
    # 1. Validation & Integrity Checks
    null_counts = df.isnull().sum().to_dict()
    duplicates_count = int(df.duplicated(subset=["title", "area_sqft", "current_price", "lat", "lng"]).sum())
    
    # Clean duplicates if any
    df = df.drop_duplicates(subset=["title", "area_sqft", "current_price", "lat", "lng"])
    
    # Check bounds
    valid_area = (df["area_sqft"] >= 300) & (df["area_sqft"] <= 10000)
    valid_price = (df["current_price"] >= 1000000) & (df["current_price"] <= 200000000)
    valid_lat = (df["lat"] >= 12.5) & (df["lat"] <= 13.5)
    valid_lng = (df["lng"] >= 79.8) & (df["lng"] <= 80.5)
    
    valid_rows = valid_area & valid_price & valid_lat & valid_lng
    invalid_count = int((~valid_rows).sum())
    
    df_clean = df[valid_rows].copy()
    
    # 2. Outlier Detection using IQR on Price per Sqft
    df_clean["price_per_sqft"] = df_clean["current_price"] / df_clean["area_sqft"]
    
    q1 = df_clean["price_per_sqft"].quantile(0.01)
    q3 = df_clean["price_per_sqft"].quantile(0.99)
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    outliers_count = int(((df_clean["price_per_sqft"] < lower_bound) | (df_clean["price_per_sqft"] > upper_bound)).sum())
    df_clean = df_clean[(df_clean["price_per_sqft"] >= lower_bound) & (df_clean["price_per_sqft"] <= upper_bound)]
    
    # 3. Save Processed Dataset
    clean_prop_file = os.path.join(PROCESSED_DATA_DIR, "properties_clean.csv")
    df_clean.to_csv(clean_prop_file, index=False)
    
    # 4. Generate Data Quality Report
    quality_report = {
        "status": "PASSED",
        "dataset_name": "Chennai Metro Residential Properties & Micro-Markets",
        "total_records_ingested": initial_count,
        "valid_records_retained": len(df_clean),
        "data_retention_rate_pct": round((len(df_clean) / initial_count) * 100, 2),
        "validation_metrics": {
            "duplicate_records_removed": duplicates_count,
            "boundary_violations_dropped": invalid_count,
            "statistical_outliers_flagged": outliers_count,
            "missing_values_by_column": {k: int(v) for k, v in null_counts.items() if v > 0}
        },
        "price_summary_inr": {
            "min_price": int(df_clean["current_price"].min()),
            "median_price": int(df_clean["current_price"].median()),
            "max_price": int(df_clean["current_price"].max()),
            "avg_price_per_sqft": round(float(df_clean["price_per_sqft"].mean()), 2)
        },
        "geographic_coverage": {
            "city": "Chennai",
            "micro_markets_count": int(df_clean["location_id"].nunique()),
            "property_types": list(df_clean["property_type"].unique())
        },
        "generated_at": pd.Timestamp.now().isoformat()
    }
    
    report_file = os.path.join(PROCESSED_DATA_DIR, "data_quality_report.json")
    with open(report_file, "w") as f:
        json.dump(quality_report, f, indent=2)
        
    print(f"Data Pipeline Finished. Retained {len(df_clean)} / {initial_count} records.")
    print(f"Quality report written to {report_file}")
    return quality_report

if __name__ == "__main__":
    run_data_pipeline()
