"""
Unit tests for TerraSignal AI Data Ingestion and Processing Pipeline
"""

import os
import pandas as pd
import pytest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

def test_processed_dataset_exists():
    clean_file = os.path.join(PROCESSED_DIR, "properties_clean.csv")
    assert os.path.exists(clean_file), "Processed dataset file must exist"
    
    df = pd.read_csv(clean_file)
    assert len(df) >= 1000, f"Expected at least 1000 records, got {len(df)}"
    assert "current_price" in df.columns
    assert "area_sqft" in df.columns
    assert "location_id" in df.columns

def test_data_integrity_bounds():
    clean_file = os.path.join(PROCESSED_DIR, "properties_clean.csv")
    df = pd.read_csv(clean_file)
    
    # Check no negative area or price
    assert (df["area_sqft"] > 0).all()
    assert (df["current_price"] > 0).all()
    assert (df["bedrooms"] >= 1).all()
    assert (df["bathrooms"] >= 1).all()
    
    # Check coordinate bounds for Chennai metro
    assert (df["lat"] >= 12.0).all() and (df["lat"] <= 14.0).all()
    assert (df["lng"] >= 79.5).all() and (df["lng"] <= 81.0).all()

def test_data_quality_report():
    import json
    report_file = os.path.join(PROCESSED_DIR, "data_quality_report.json")
    assert os.path.exists(report_file)
    
    with open(report_file, "r") as f:
        report = json.load(f)
        assert report["status"] == "PASSED"
        assert report["valid_records_retained"] > 0
        assert report["geographic_coverage"]["micro_markets_count"] >= 10
