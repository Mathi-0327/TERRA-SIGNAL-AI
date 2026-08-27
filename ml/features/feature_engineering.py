"""
TerraSignal AI - Feature Engineering Module
Transforms raw property and micro-market data into structured numeric features
and interaction terms for ML models and explainability engines.
"""

import numpy as np
import pandas as pd

PROP_TYPE_MAP = {
    "Apartment": 0,
    "Gated Community Apartment": 1,
    "Independent House": 2,
    "Villa": 3,
    "Penthouse": 4
}

FEATURE_COLUMNS = [
    "area_sqft",
    "bedrooms",
    "bathrooms",
    "property_age",
    "floor_number",
    "total_floors",
    "floor_ratio",
    "density_sqft_per_bhk",
    "prop_type_encoded",
    "amenity_count",
    "has_parking",
    "has_power_backup",
    "has_security",
    "has_gym",
    "has_pool",
    "has_clubhouse",
    "base_micro_price_sqft",
    "infra_score",
    "flood_risk_score",
    "demand_index",
    "supply_index",
    "demand_supply_ratio",
    "selling_days",
    "rental_yield"
]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Computes engineered features for a dataframe of properties."""
    feat_df = df.copy()
    
    # Categorical encoding
    feat_df["prop_type_encoded"] = feat_df["property_type"].map(PROP_TYPE_MAP).fillna(0)
    
    # Boolean to numeric conversions
    bool_cols = ["has_parking", "has_power_backup", "has_security", "has_gym", "has_pool", "has_clubhouse"]
    for col in bool_cols:
        if col in feat_df.columns:
            feat_df[col] = feat_df[col].astype(int)
        else:
            feat_df[col] = 0
            
    # Engineered interaction features
    feat_df["density_sqft_per_bhk"] = feat_df["area_sqft"] / np.maximum(feat_df["bedrooms"], 1)
    feat_df["floor_ratio"] = feat_df["floor_number"] / np.maximum(feat_df["total_floors"], 1)
    feat_df["demand_supply_ratio"] = feat_df["demand_index"] / np.maximum(feat_df["supply_index"], 1)
    
    return feat_df[FEATURE_COLUMNS]

def prepare_single_property_features(prop_dict: dict, micro_market_info: dict) -> pd.DataFrame:
    """Prepares a single row feature DataFrame from user input dictionary."""
    amenities = prop_dict.get("amenities", [])
    if isinstance(amenities, str):
        import json
        try:
            amenities = json.loads(amenities)
        except Exception:
            amenities = [a.strip() for a in amenities.split(",") if a.strip()]
            
    prop_type = prop_dict.get("property_type", "Apartment")
    area_sqft = float(prop_dict.get("area_sqft", 1000))
    bedrooms = int(prop_dict.get("bedrooms", 2))
    bathrooms = int(prop_dict.get("bathrooms", 2))
    property_age = float(prop_dict.get("property_age", 2))
    floor_number = int(prop_dict.get("floor_number", 2))
    total_floors = int(prop_dict.get("total_floors", max(floor_number, 5)))
    
    single_record = {
        "area_sqft": area_sqft,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "property_age": property_age,
        "floor_number": floor_number,
        "total_floors": total_floors,
        "floor_ratio": floor_number / max(total_floors, 1),
        "density_sqft_per_bhk": area_sqft / max(bedrooms, 1),
        "prop_type_encoded": PROP_TYPE_MAP.get(prop_type, 0),
        "amenity_count": len(amenities),
        "has_parking": int("Covered Car Parking" in amenities or prop_dict.get("has_parking", False)),
        "has_power_backup": int("Power Backup" in amenities or prop_dict.get("has_power_backup", False)),
        "has_security": int("24/7 Security" in amenities or prop_dict.get("has_security", False)),
        "has_gym": int("Gymnasium" in amenities or prop_dict.get("has_gym", False)),
        "has_pool": int("Swimming Pool" in amenities or prop_dict.get("has_pool", False)),
        "has_clubhouse": int("Clubhouse" in amenities or prop_dict.get("has_clubhouse", False)),
        "base_micro_price_sqft": float(micro_market_info.get("base_price_sqft", 6500)),
        "infra_score": float(micro_market_info.get("infra_score", 80)),
        "flood_risk_score": float(micro_market_info.get("flood_risk_score", 40)),
        "demand_index": float(micro_market_info.get("demand_index", 75)),
        "supply_index": float(micro_market_info.get("supply_index", 60)),
        "demand_supply_ratio": float(micro_market_info.get("demand_index", 75)) / max(float(micro_market_info.get("supply_index", 60)), 1),
        "selling_days": float(micro_market_info.get("selling_days", 70)),
        "rental_yield": float(micro_market_info.get("rental_yield", 4.0))
    }
    
    return pd.DataFrame([single_record])[FEATURE_COLUMNS]
