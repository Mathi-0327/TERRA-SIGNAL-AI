"""
TerraSignal AI - Comprehensive Real Estate Data Seed Generator
Generates micro-market, historical, property, infrastructure, environmental,
and data provenance records grounded in Chennai metro real estate data.
"""

import json
import os
import random
import numpy as np
import pandas as pd

# Set deterministic seed for reproducibility
random.seed(42)
np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
os.makedirs(RAW_DATA_DIR, exist_ok=True)
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)

# 12 Core Micro-Markets in Chennai with realistic market parameters
MICRO_MARKETS = [
    {
        "id": 1,
        "name": "OMR (Old Mahabalipuram Road)",
        "slug": "omr",
        "city": "Chennai",
        "zone": "South-East / IT Corridor",
        "lat": 12.8931,
        "lng": 80.2281,
        "base_price_sqft": 6200,
        "rental_yield": 4.1,
        "demand_index": 68,
        "supply_index": 82,     # High inventory pressure
        "selling_days": 115,     # Elongating selling time
        "price_growth_1y": 4.8,
        "flood_risk_score": 45, # Moderate low-lying near marshes
        "infra_score": 88,      # Metro Phase 2 under active construction
        "water_table_risk": 55,
        "anomaly_signal": "DIVERGENCE_WARNING",
        "market_status": "COOLING",
        "summary": "Major IT corridor experiencing inventory buildup (+18% YoY) and elongated selling cycles despite Metro Phase 2 connectivity works.",
    },
    {
        "id": 2,
        "name": "Velachery",
        "slug": "velachery",
        "city": "Chennai",
        "zone": "South",
        "lat": 12.9759,
        "lng": 80.2212,
        "base_price_sqft": 7800,
        "rental_yield": 4.6,
        "demand_index": 79,
        "supply_index": 62,
        "selling_days": 75,
        "price_growth_1y": 7.2,
        "flood_risk_score": 78, # High flood risk historically (marshland proximity)
        "infra_score": 82,      # MRTS and monorail/flyover connectivity
        "water_table_risk": 68,
        "anomaly_signal": "ENVIRONMENTAL_STRESS",
        "market_status": "STABLE",
        "summary": "Dense residential hub with strong commercial and transit connectivity, but high monsoon inundation vulnerability.",
    },
    {
        "id": 3,
        "name": "Tambaram",
        "slug": "tambaram",
        "city": "Chennai",
        "zone": "South-West / Gateway",
        "lat": 12.9249,
        "lng": 80.1275,
        "base_price_sqft": 5100,
        "rental_yield": 3.8,
        "demand_index": 84,
        "supply_index": 54,
        "selling_days": 60,
        "price_growth_1y": 8.9,
        "flood_risk_score": 32,
        "infra_score": 79,      # Suburban rail, airport proximity, Outer Ring Road
        "water_table_risk": 38,
        "anomaly_signal": "GROWTH_SURGE",
        "market_status": "EXPANDING",
        "summary": "High affordability hub with robust end-user demand driven by healthcare, transit hubs, and educational institutes.",
    },
    {
        "id": 4,
        "name": "Anna Nagar",
        "slug": "anna-nagar",
        "city": "Chennai",
        "zone": "Central-West / Premium",
        "lat": 13.0850,
        "lng": 80.2101,
        "base_price_sqft": 14200,
        "rental_yield": 2.8,
        "demand_index": 86,
        "supply_index": 42,     # Tight supply, high barrier
        "selling_days": 48,
        "price_growth_1y": 6.5,
        "flood_risk_score": 22, # Well-planned elevation
        "infra_score": 94,      # Underground Metro Line 2, premium amenities
        "water_table_risk": 28,
        "anomaly_signal": "NONE",
        "market_status": "STABLE",
        "summary": "Prime residential grid with exceptional social infrastructure, high capital values, and constrained fresh supply.",
    },
    {
        "id": 5,
        "name": "Porur",
        "slug": "porur",
        "city": "Chennai",
        "zone": "West / IT & Health Hub",
        "lat": 13.0382,
        "lng": 80.1565,
        "base_price_sqft": 6400,
        "rental_yield": 4.3,
        "demand_index": 81,
        "supply_index": 58,
        "selling_days": 65,
        "price_growth_1y": 9.1,
        "flood_risk_score": 42,
        "infra_score": 85,      # Metro Phase 2 Line 4 intersection hub
        "water_table_risk": 44,
        "anomaly_signal": "INFRA_MOMENTUM",
        "market_status": "EXPANDING",
        "summary": "Fast-appreciating commercial-residential pocket benefiting heavily from DLF CyberCity expansion and Metro Line 4 construction.",
    },
    {
        "id": 6,
        "name": "Guindy",
        "slug": "guindy",
        "city": "Chennai",
        "zone": "Central-South / Business Hub",
        "lat": 13.0067,
        "lng": 80.2025,
        "base_price_sqft": 11500,
        "rental_yield": 3.9,
        "demand_index": 78,
        "supply_index": 45,
        "selling_days": 52,
        "price_growth_1y": 5.9,
        "flood_risk_score": 30,
        "infra_score": 96,      # Multimodal transit junction (Metro, Rail, Airport)
        "water_table_risk": 32,
        "anomaly_signal": "NONE",
        "market_status": "STABLE",
        "summary": "Key institutional and corporate hub with superior multimodal transit and steady commercial-driven residential demand.",
    },
    {
        "id": 7,
        "name": "Medavakkam",
        "slug": "medavakkam",
        "city": "Chennai",
        "zone": "South / Suburban",
        "lat": 12.9185,
        "lng": 80.1904,
        "base_price_sqft": 5400,
        "rental_yield": 4.0,
        "demand_index": 82,
        "supply_index": 64,
        "selling_days": 70,
        "price_growth_1y": 8.4,
        "flood_risk_score": 52, # Lake marsh catchment zones
        "infra_score": 80,      # Three flyovers completed, link road expansion
        "water_table_risk": 48,
        "anomaly_signal": "NONE",
        "market_status": "EXPANDING",
        "summary": "Strategic residential node connecting OMR and Tambaram, popular with young mid-income IT professionals.",
    },
    {
        "id": 8,
        "name": "Sholinganallur",
        "slug": "sholinganallur",
        "city": "Chennai",
        "zone": "South-East / OMR Epicenter",
        "lat": 12.9010,
        "lng": 80.2279,
        "base_price_sqft": 6100,
        "rental_yield": 4.4,
        "demand_index": 72,
        "supply_index": 78,
        "selling_days": 105,
        "price_growth_1y": 4.2,
        "flood_risk_score": 62, # Perumbakkam lake & marsh runoff
        "infra_score": 84,      # Metro Line 3/5 interchange
        "water_table_risk": 58,
        "anomaly_signal": "SUPPLY_SURPLUS",
        "market_status": "COOLING",
        "summary": "Tech corridor epicenter with dense IT parks; facing high developer inventory absorption lag and stormwater challenges.",
    },
    {
        "id": 9,
        "name": "ECR (East Coast Road)",
        "slug": "ecr",
        "city": "Chennai",
        "zone": "South-East / Coastal Luxury",
        "lat": 12.8550,
        "lng": 80.2450,
        "base_price_sqft": 9200,
        "rental_yield": 3.2,
        "demand_index": 69,
        "supply_index": 52,
        "selling_days": 90,
        "price_growth_1y": 5.4,
        "flood_risk_score": 68, # CRZ coastal surge & storm vulnerability
        "infra_score": 75,      # 4-lane widening, scenic expressway
        "water_table_risk": 64,
        "anomaly_signal": "COASTAL_REGULATION_WATCH",
        "market_status": "STABLE",
        "summary": "High-end villa and sea-facing luxury enclave; high lifestyle premium tempered by coastal vulnerability and CRZ zoning constraints.",
    },
    {
        "id": 10,
        "name": "Perungudi",
        "slug": "perungudi",
        "city": "Chennai",
        "zone": "South / OMR Beginning",
        "lat": 12.9654,
        "lng": 80.2461,
        "base_price_sqft": 7500,
        "rental_yield": 4.5,
        "demand_index": 77,
        "supply_index": 60,
        "selling_days": 72,
        "price_growth_1y": 6.8,
        "flood_risk_score": 58, # Wetland proximity
        "infra_score": 86,      # Phase 2 Metro & MRTS link
        "water_table_risk": 50,
        "anomaly_signal": "NONE",
        "market_status": "STABLE",
        "summary": "Prime entry point to OMR IT corridor with strong rental occupancy from World Trade Center and SP Infocity.",
    },
    {
        "id": 11,
        "name": "Adyar",
        "slug": "adyar",
        "city": "Chennai",
        "zone": "South-Central / Heritage Premium",
        "lat": 13.0012,
        "lng": 80.2565,
        "base_price_sqft": 15800,
        "rental_yield": 2.6,
        "demand_index": 88,
        "supply_index": 38,
        "selling_days": 42,
        "price_growth_1y": 6.1,
        "flood_risk_score": 38, # Adyar river basin buffer
        "infra_score": 93,
        "water_table_risk": 35,
        "anomaly_signal": "NONE",
        "market_status": "STABLE",
        "summary": "Established elite southern neighbourhood with high green cover, top-tier schools, and virtually zero new land parcel additions.",
    },
    {
        "id": 12,
        "name": "T. Nagar",
        "slug": "t-nagar",
        "city": "Chennai",
        "zone": "Central / Commercial Core",
        "lat": 13.0418,
        "lng": 80.2341,
        "base_price_sqft": 14800,
        "rental_yield": 3.4,
        "demand_index": 85,
        "supply_index": 36,
        "selling_days": 45,
        "price_growth_1y": 5.8,
        "flood_risk_score": 40, # Urban dense water logging
        "infra_score": 95,      # Central smart city transit, pedestrian plaza
        "water_table_risk": 36,
        "anomaly_signal": "NONE",
        "market_status": "STABLE",
        "summary": "Commercial hub of South India with strong redevelopment trends and robust retail-backed asset stability.",
    },
]

DATA_SOURCES = [
    {
        "id": 1,
        "name": "National Housing Bank (NHB) RESIDEX",
        "organization": "National Housing Bank / Ministry of Housing and Urban Affairs (India)",
        "url": "https://residex.nhb.org.in/",
        "dataset": "Quarterly Housing Price Index (HPI) - City & Micro-Market Indices",
        "frequency": "Quarterly",
        "coverage": "Chennai Metro & Suburbs (50+ Zones)",
        "last_updated": "2026-06-30",
        "license": "Public Government Data (Data.gov.in)",
        "notes": "Official benchmark for residential property price movement and index tracking across Indian Tier-1 metros.",
    },
    {
        "id": 2,
        "name": "TNRERA Project Registry",
        "organization": "Tamil Nadu Real Estate Regulatory Authority",
        "url": "https://rera.tn.gov.in/",
        "dataset": "Registered Residential Projects, Inventory Units, Handover Schedules",
        "frequency": "Monthly",
        "coverage": "Tamil Nadu State - CMDA Planning Area",
        "last_updated": "2026-07-15",
        "license": "Statutory Public Registry",
        "notes": "Provides verified builder project launches, unsold unit counts, completion timelines, and regulatory compliances.",
    },
    {
        "id": 3,
        "name": "Chennai Metropolitan Development Authority (CMDA)",
        "organization": "CMDA Infrastructure & Master Plan 2026-2046",
        "url": "http://www.cmdachennai.gov.in/",
        "dataset": "Comprehensive Mobility Plan & Metro Phase 2 Alignment Progress",
        "frequency": "Bi-annual",
        "coverage": "Greater Chennai Planning Area",
        "last_updated": "2026-05-20",
        "license": "Public Information Disclosure",
        "notes": "Infrastructure completion milestones for Metro Phase 2 Corridors (3, 4, 5) and Peripheral Ring Roads.",
    },
    {
        "id": 4,
        "name": "State Disaster Management & Water Resources Dept (WRD)",
        "organization": "Tamil Nadu Water Resources Department & GCC GIS",
        "url": "https://www.chennaicorporation.gov.in/",
        "dataset": "Flood Inundation & Micro-drainage Catchment Mapping",
        "frequency": "Annual",
        "coverage": "15 Greater Chennai Corporation Zones",
        "last_updated": "2025-11-30",
        "license": "Open Municipal GIS",
        "notes": "Vulnerability classifications for 100-year flood lines, Pallikaranai marsh catchment, and micro-basin waterlogging risks.",
    },
    {
        "id": 5,
        "name": "Reserve Bank of India (RBI) Real Estate Metrics",
        "organization": "Reserve Bank of India",
        "url": "https://www.rbi.org.in/",
        "dataset": "All-India House Price Index & Weighted Average Lending Rates",
        "frequency": "Quarterly",
        "coverage": "National & Metro Breakdowns",
        "last_updated": "2026-06-30",
        "license": "Official Statistical Release",
        "notes": "Macroeconomic mortgage rate trends, housing credit growth, and home loan non-performing asset benchmarks.",
    }
]

def generate_historical_market_data():
    """Generates 12 quarters of historical market indicators per micro-market."""
    quarters = [
        "2023-Q3", "2023-Q4", "2024-Q1", "2024-Q2",
        "2024-Q3", "2024-Q4", "2025-Q1", "2025-Q2",
        "2025-Q3", "2025-Q4", "2026-Q1", "2026-Q2"
    ]
    records = []
    
    for mm in MICRO_MARKETS:
        base_price = mm["base_price_sqft"]
        base_demand = mm["demand_index"]
        base_supply = mm["supply_index"]
        base_selling = mm["selling_days"]
        base_yield = mm["rental_yield"]
        
        # Quarter-over-quarter trajectory
        for i, q in enumerate(quarters):
            t = (i - 11) # -11 to 0
            # Quarterly price trend
            growth_trend = (1 + (mm["price_growth_1y"] / 400.0)) ** t
            noise = np.random.normal(0, 0.01)
            q_price = round(base_price * growth_trend * (1 + noise))
            
            # Anomaly injection for OMR in recent quarters (Demand down, inventory up)
            if mm["slug"] == "omr" and i >= 8:
                q_demand = max(40, round(base_demand - (i - 7) * 4.5 + np.random.normal(0, 1.5)))
                q_supply = min(98, round(base_supply + (i - 7) * 3.8 + np.random.normal(0, 1.5)))
                q_selling = round(base_selling + (i - 7) * 6 + np.random.normal(0, 2))
                q_price = round(base_price * (1 + (i - 7) * 0.015)) # Price slightly inflated despite demand drop
            else:
                q_demand = max(30, min(95, round(base_demand + np.random.normal(0, 2))))
                q_supply = max(25, min(95, round(base_supply + np.random.normal(0, 2))))
                q_selling = max(20, min(180, round(base_selling + np.random.normal(0, 3))))
                
            q_yield = round(base_yield + np.random.normal(0, 0.05), 2)
            
            records.append({
                "location_id": mm["id"],
                "location_slug": mm["slug"],
                "location_name": mm["name"],
                "quarter": q,
                "avg_price_sqft": q_price,
                "demand_index": q_demand,
                "supply_index": q_supply,
                "selling_days": q_selling,
                "rental_yield": q_yield,
                "inventory_units": round(q_supply * 48 + np.random.normal(0, 50)),
                "transactions_count": round(q_demand * 12 + np.random.normal(0, 15))
            })
            
    return pd.DataFrame(records)

def generate_property_dataset(num_properties=3200):
    """
    Generates realistic, grounded property transactions and listings
    with accurate micro-market correlations, amenities, and floor plans.
    """
    properties = []
    
    prop_types = ["Apartment", "Independent House", "Villa", "Gated Community Apartment", "Penthouse"]
    prop_type_weights = [0.55, 0.15, 0.10, 0.18, 0.02]
    
    amenities_list = [
        "Swimming Pool", "Gymnasium", "Clubhouse", "Power Backup",
        "24/7 Security", "Covered Car Parking", "Children Play Area",
        "EV Charging Station", "Intercom", "Rainwater Harvesting"
    ]
    
    for pid in range(1, num_properties + 1):
        mm = random.choice(MICRO_MARKETS)
        prop_type = np.random.choice(prop_types, p=prop_type_weights)
        
        # Area and bedrooms logic
        if prop_type in ["Apartment", "Gated Community Apartment"]:
            bedrooms = random.choices([1, 2, 3, 4], weights=[0.10, 0.45, 0.40, 0.05])[0]
            if bedrooms == 1:
                area_sqft = random.randint(520, 720)
                bathrooms = 1
            elif bedrooms == 2:
                area_sqft = random.randint(850, 1250)
                bathrooms = 2
            elif bedrooms == 3:
                area_sqft = random.randint(1280, 1950)
                bathrooms = random.choice([2, 3])
            else:
                area_sqft = random.randint(2000, 2900)
                bathrooms = random.choice([3, 4])
            total_floors = random.randint(4, 24)
            floor_number = random.randint(1, total_floors)
            prop_age = random.randint(0, 15)
        elif prop_type == "Villa":
            bedrooms = random.choices([3, 4, 5], weights=[0.30, 0.55, 0.15])[0]
            area_sqft = random.randint(2200, 4800)
            bathrooms = bedrooms
            total_floors = random.randint(2, 3)
            floor_number = 1
            prop_age = random.randint(0, 10)
        elif prop_type == "Penthouse":
            bedrooms = random.choices([3, 4, 5], weights=[0.20, 0.60, 0.20])[0]
            area_sqft = random.randint(2800, 5200)
            bathrooms = bedrooms + 1
            total_floors = random.randint(12, 28)
            floor_number = total_floors
            prop_age = random.randint(0, 8)
        else: # Independent House
            bedrooms = random.choices([2, 3, 4], weights=[0.25, 0.50, 0.25])[0]
            area_sqft = random.randint(1100, 3200)
            bathrooms = bedrooms
            total_floors = random.randint(1, 3)
            floor_number = 1
            prop_age = random.randint(2, 25)
            
        # Select amenities
        num_amenities = random.randint(2, 8) if "Gated" in prop_type or prop_type in ["Villa", "Penthouse"] else random.randint(1, 5)
        amenities = random.sample(amenities_list, min(num_amenities, len(amenities_list)))
        amenity_count = len(amenities)
        
        # Base valuation formula grounded in micro-market economics + features
        base_rate = mm["base_price_sqft"]
        
        # Modifiers
        age_depreciation = max(0.70, 1.0 - (prop_age * 0.012))
        type_multiplier = 1.25 if prop_type == "Villa" else (1.30 if prop_type == "Penthouse" else (1.08 if "Gated" in prop_type else 1.0))
        amenity_multiplier = 1.0 + (amenity_count * 0.015)
        floor_multiplier = 1.0 + (min(floor_number, 20) * 0.003) if prop_type in ["Apartment", "Gated Community Apartment", "Penthouse"] else 1.0
        
        calculated_unit_price = base_rate * age_depreciation * type_multiplier * amenity_multiplier * floor_multiplier
        
        # Real market price with realistic noise
        market_noise = np.random.normal(1.0, 0.04)
        fair_unit_price = round(calculated_unit_price * market_noise)
        total_price = round(fair_unit_price * area_sqft)
        
        # Slight listing asking price spread (some sellers ask slightly higher or lower)
        listing_discount_premium = random.choice([0.96, 0.98, 1.00, 1.02, 1.05, 1.08])
        current_asking_price = round(total_price * listing_discount_premium)
        
        # Rental potential calculation
        monthly_rent = round((total_price * (mm["rental_yield"] / 100.0)) / 12.0)
        
        # Nearby lat/long jitter
        lat_offset = np.random.normal(0, 0.008)
        lng_offset = np.random.normal(0, 0.008)
        
        properties.append({
            "id": pid,
            "title": f"{bedrooms} BHK {prop_type} in {mm['name']}",
            "location_id": mm["id"],
            "location_name": mm["name"],
            "location_slug": mm["slug"],
            "city": mm["city"],
            "property_type": prop_type,
            "area_sqft": area_sqft,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "property_age": prop_age,
            "floor_number": floor_number,
            "total_floors": total_floors,
            "amenities": json.dumps(amenities),
            "amenity_count": amenity_count,
            "has_parking": "Covered Car Parking" in amenities,
            "has_power_backup": "Power Backup" in amenities,
            "has_security": "24/7 Security" in amenities,
            "has_gym": "Gymnasium" in amenities,
            "has_pool": "Swimming Pool" in amenities,
            "has_clubhouse": "Clubhouse" in amenities,
            "lat": round(mm["lat"] + lat_offset, 5),
            "lng": round(mm["lng"] + lng_offset, 5),
            "base_micro_price_sqft": base_rate,
            "fair_value_sqft": fair_unit_price,
            "fair_value_total": total_price,
            "current_price": current_asking_price,
            "monthly_rent": monthly_rent,
            "rental_yield": mm["rental_yield"],
            "infra_score": mm["infra_score"],
            "flood_risk_score": mm["flood_risk_score"],
            "demand_index": mm["demand_index"],
            "supply_index": mm["supply_index"],
            "selling_days": mm["selling_days"],
            "status": "Active" if random.random() > 0.3 else "Sold",
            "listed_date": f"2026-{random.randint(1,7):02d}-{random.randint(1,28):02d}"
        })
        
    return pd.DataFrame(properties)

def generate_early_warnings():
    """Prepares structured early-warning alerts generated from anomalous market conditions."""
    alerts = [
        {
            "id": 1,
            "location_id": 1,
            "location_name": "OMR (Old Mahabalipuram Road)",
            "severity": "HIGH",
            "title": "Demand-Price Divergence Detected",
            "signal_type": "DIVERGENCE_WARNING",
            "signals": [
                {"indicator": "Demand Index", "previous": 78, "current": 68, "change_pct": -12.8, "direction": "DOWN"},
                {"indicator": "Active Inventory", "previous": 3200, "current": 3810, "change_pct": +19.1, "direction": "UP"},
                {"indicator": "Average Selling Days", "previous": 98, "current": 115, "change_pct": +17.3, "direction": "UP"},
                {"indicator": "Asking Price / sqft", "previous": 5950, "current": 6200, "change_pct": +4.2, "direction": "UP"}
            ],
            "interpretation": "Asking prices have risen +4.2% while end-user demand fell -12.8% and unsold inventory expanded +19.1%. This divergence indicates building valuation resistance and potential short-term price correction pressure.",
            "recommended_action": "Exercise price discipline; negotiate 5-8% below listing price; monitor absorption rates in IT sub-clusters.",
            "data_sources": ["NHB RESIDEX Q2-2026", "TNRERA Active Registrations"],
            "timestamp": "2026-08-20T10:30:00Z"
        },
        {
            "id": 2,
            "location_id": 2,
            "location_name": "Velachery",
            "severity": "WARNING",
            "title": "Monsoon Inundation Vulnerability & Insurance Premium Elevation",
            "signal_type": "ENVIRONMENTAL_STRESS",
            "signals": [
                {"indicator": "Flood Hazard Score", "previous": 74, "current": 78, "change_pct": +5.4, "direction": "UP"},
                {"indicator": "Groundwater Infiltration Lag", "previous": 62, "current": 68, "change_pct": +9.7, "direction": "UP"},
                {"indicator": "Ground Floor Demand Discount", "previous": -4.0, "current": -7.5, "change_pct": -87.5, "direction": "DOWN"}
            ],
            "interpretation": "Micro-drainage congestion in catchment pockets has widened the price penalty for stilt/ground floor units versus higher floors by 7.5%.",
            "recommended_action": "Avoid ground/first floor investments; mandate structural plinth height verification above 2015 high-water mark.",
            "data_sources": ["GCC WRD Drainage Survey", "State Disaster GIS"],
            "timestamp": "2026-08-18T14:15:00Z"
        },
        {
            "id": 3,
            "location_id": 8,
            "location_name": "Sholinganallur",
            "severity": "WARNING",
            "title": "Developer Inventory Concentration Overhang",
            "signal_type": "SUPPLY_SURPLUS",
            "signals": [
                {"indicator": "Unsold Completed Inventory", "previous": 1850, "current": 2240, "change_pct": +21.1, "direction": "UP"},
                {"indicator": "Absorption Velocity", "previous": 85, "current": 68, "change_pct": -20.0, "direction": "DOWN"},
                {"indicator": "Rental Yield Compression", "previous": 4.6, "current": 4.4, "change_pct": -4.3, "direction": "DOWN"}
            ],
            "interpretation": "High-density multi-tower completions entering the market simultaneously are creating temporary oversupply and softening rental yield momentum.",
            "recommended_action": "Selective entry only in ready-to-move projects with verified occupation certificates and tenant occupancy >80%.",
            "data_sources": ["TNRERA Quarterly Registry", "PropIndex"],
            "timestamp": "2026-08-15T09:00:00Z"
        },
        {
            "id": 4,
            "location_id": 3,
            "location_name": "Tambaram",
            "severity": "INFO",
            "title": "Affordability Migration & Velocity Acceleration",
            "signal_type": "GROWTH_SURGE",
            "signals": [
                {"indicator": "Demand Index", "previous": 77, "current": 84, "change_pct": +9.1, "direction": "UP"},
                {"indicator": "Selling Time (Days)", "previous": 72, "current": 60, "change_pct": -16.7, "direction": "DOWN"},
                {"indicator": "Capital Growth Rate (YoY)", "previous": 6.8, "current": 8.9, "change_pct": +30.8, "direction": "UP"}
            ],
            "interpretation": "Strong capital inflow driven by price-conscious buyers migrating from central zones, accelerating turnover and compression of listing days.",
            "recommended_action": "Attractive entry window for 2BHK mid-segment assets; strong rental liquidity.",
            "data_sources": ["NHB RESIDEX HPI", "Sub-Registrar Registration Filings"],
            "timestamp": "2026-08-12T11:45:00Z"
        },
        {
            "id": 5,
            "location_id": 5,
            "location_name": "Porur",
            "severity": "INFO",
            "title": "Metro Line 4 Construction Transit Premium Trigger",
            "signal_type": "INFRA_MOMENTUM",
            "signals": [
                {"indicator": "Infrastructure Score", "previous": 80, "current": 85, "change_pct": +6.2, "direction": "UP"},
                {"indicator": "Commercial Office Pre-leasing", "previous": 72, "current": 88, "change_pct": +22.2, "direction": "UP"},
                {"indicator": "YoY Capital Appreciation", "previous": 7.4, "current": 9.1, "change_pct": +23.0, "direction": "UP"}
            ],
            "interpretation": "Metro Phase 2 corridor progress reaching 70% physical completion in West Chennai is pricing in forward transit premiums.",
            "recommended_action": "Strategic HOLD for existing investors; prospective buyers should target properties within 1.2km of upcoming stations.",
            "data_sources": ["CMDA Infrastructure Progress Report", "CMRL Phase 2 Updates"],
            "timestamp": "2026-08-10T16:20:00Z"
        }
    ]
    return alerts

def main():
    print("Generating TerraSignal AI Real Estate Seed Datasets...")
    
    # 1. Micro-market metadata
    mm_file = os.path.join(RAW_DATA_DIR, "micro_markets.json")
    with open(mm_file, "w") as f:
        json.dump(MICRO_MARKETS, f, indent=2)
    print(f"Saved {len(MICRO_MARKETS)} micro-markets to {mm_file}")
    
    # 2. Data Sources provenance
    ds_file = os.path.join(RAW_DATA_DIR, "data_sources.json")
    with open(ds_file, "w") as f:
        json.dump(DATA_SOURCES, f, indent=2)
    print(f"Saved {len(DATA_SOURCES)} data sources to {ds_file}")
    
    # 3. Historical quarterly time-series
    history_df = generate_historical_market_data()
    history_file = os.path.join(RAW_DATA_DIR, "historical_market_data.csv")
    history_df.to_csv(history_file, index=False)
    print(f"Saved {len(history_df)} historical quarterly records to {history_file}")
    
    # 4. Property Transactions & Listings
    prop_df = generate_property_dataset(num_properties=3500)
    prop_file = os.path.join(RAW_DATA_DIR, "properties_dataset.csv")
    prop_df.to_csv(prop_file, index=False)
    print(f"Saved {len(prop_df)} property records to {prop_file}")
    
    # 5. Early Warning Alerts
    alerts = generate_early_warnings()
    alerts_file = os.path.join(RAW_DATA_DIR, "early_warnings.json")
    with open(alerts_file, "w") as f:
        json.dump(alerts, f, indent=2)
    print(f"Saved {len(alerts)} early-warning alert templates to {alerts_file}")
    
    print("\nDataset generation completed successfully.")

if __name__ == "__main__":
    main()
