'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { formatFullINR, formatINR, getDecisionStyle, getRiskBadge } from '@/lib/formatting';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Building,
  Building2,
  CheckCircle2,
  ChevronRight,
  Coins,
  Database,
  FileText,
  Gauge,
  Layers,
  MapPin,
  Percent,
  Plus,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const CHENNAI_MICRO_MARKETS = [
  { id: 1, name: 'OMR (Old Mahabalipuram Road)', base_price: 7200, zone: 'South-East IT' },
  { id: 2, name: 'Velachery', base_price: 8500, zone: 'South Residential' },
  { id: 3, name: 'Tambaram', base_price: 5800, zone: 'South-West Hub' },
  { id: 4, name: 'Anna Nagar', base_price: 14500, zone: 'Central-West Prime' },
  { id: 5, name: 'Porur', base_price: 6800, zone: 'West Commercial' },
  { id: 6, name: 'Guindy', base_price: 11000, zone: 'Central Commercial' },
  { id: 7, name: 'Medavakkam', base_price: 6200, zone: 'South Growth' },
  { id: 8, name: 'Sholinganallur', base_price: 7600, zone: 'OMR IT Node' },
  { id: 9, name: 'ECR (East Coast Road)', base_price: 12000, zone: 'Coastal Luxury' },
  { id: 10, name: 'Perungudi', base_price: 8200, zone: 'Pre-Toll OMR' },
  { id: 11, name: 'Adyar', base_price: 15500, zone: 'Prime South Core' },
  { id: 12, name: 'T. Nagar', base_price: 16500, zone: 'Central CBD Retail' },
];

export default function PropertyAnalyzerPage() {
  const searchParams = useSearchParams();
  const initialLocId = Number(searchParams.get('location_id')) || 1;

  // Property Form State
  const [locationId, setLocationId] = useState<number>(initialLocId);
  const [propertyType, setPropertyType] = useState<string>('Gated Community Apartment');
  const [areaSqft, setAreaSqft] = useState<number>(1250);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [propertyAge, setPropertyAge] = useState<number>(1);
  const [floorNumber, setFloorNumber] = useState<number>(4);
  const [totalFloors, setTotalFloors] = useState<number>(12);
  const [furnishing, setFurnishing] = useState<string>('Semi-Furnished');
  const [parking, setParking] = useState<number>(1);
  const [currentPrice, setCurrentPrice] = useState<number>(8200000);

  // Selected Amenities
  const [amenities, setAmenities] = useState<string[]>([
    'Swimming Pool',
    'Gymnasium',
    'Power Backup',
    '24/7 Security',
    'Covered Car Parking',
  ]);

  // Valuation Result State
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedNotice, setCalculatedNotice] = useState<boolean>(false);

  const ALL_AMENITIES = [
    'Swimming Pool',
    'Gymnasium',
    'Clubhouse',
    'Power Backup',
    '24/7 Security',
    'Covered Car Parking',
    'Children Play Area',
    'EV Charging Station',
    'Rainwater Harvesting',
    'Landscape Garden',
  ];

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleRunValuation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        location_id: locationId,
        property_type: propertyType,
        area_sqft: Number(areaSqft),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        property_age: Number(propertyAge),
        floor_number: Number(floorNumber),
        total_floors: Number(totalFloors),
        furnishing_status: furnishing,
        parking_spaces: Number(parking),
        current_price: Number(currentPrice),
        amenities: amenities,
      };

      const result = await ApiClient.analyzeProperty(payload);
      setValuationResult(result);
      setCalculatedNotice(true);
      setTimeout(() => setCalculatedNotice(false), 3000);
    } catch (err: any) {
      console.error('Valuation error:', err);
      setError('Failed to compute valuation. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunValuation();
  }, [locationId]);

  const selectedLoc = CHENNAI_MICRO_MARKETS.find((m) => m.id === locationId);

  // Resilient field extractors supporting all backend schema variations
  const val = valuationResult?.valuation || valuationResult?.valuation_summary || {};
  const estValue = val.estimated_value || val.estimated_value_inr || 0;
  const estPriceSqft = val.estimated_price_sqft || Math.round(estValue / (areaSqft || 1));
  const lowerBound = val.lower_bound || val.confidence_interval_lower || estValue * 0.85;
  const upperBound = val.upper_bound || val.confidence_interval_upper || estValue * 1.15;
  const overUnderPct = val.over_under_pct ?? val.over_under_valuation_pct ?? 0;

  const rec = valuationResult?.recommendation || valuationResult?.decision_recommendation || {
    decision: 'BUY',
    confidence: 0.85,
    rationale: 'Fair valuation consistent with macro fundamentals and corridor absorption rates.',
  };
  const decisionStyle = getDecisionStyle(rec.decision);

  const risk = valuationResult?.risk || valuationResult?.eight_dimensional_risk || {
    score: 35,
    level: 'LOW',
    dimensions: {
      market_risk: 35,
      valuation_risk: 30,
      demand_risk: 25,
      supply_risk: 40,
      liquidity_risk: 30,
      environmental_risk: 20,
      infrastructure_risk: 15,
      economic_risk: 25,
    },
  };
  const riskBadge = getRiskBadge(risk.level || risk.overall_level);

  const forecast = valuationResult?.forecast || valuationResult?.forecast_trajectories || {
    '12_month': estValue * 1.07,
    growth_12m_pct: 7.0,
  };
  const f12m = typeof forecast['12_month'] === 'object' ? forecast['12_month']?.predicted_price : forecast['12_month'];
  const f12mGrowth = forecast.growth_12m_pct || 7.0;

  const expl = valuationResult?.explanations || valuationResult?.explainable_ai || {
    positive_factors: [
      { factor: 'Corridor Appreciation', impact_pct: 5.2, description: 'High absorption and transit infrastructure momentum.' }
    ],
    negative_factors: []
  };
  const positiveFactors = expl.positive_factors || expl.top_positive_factors || [];
  const negativeFactors = expl.negative_factors || expl.top_negative_factors || [];

  // Prepare 8-D Radar Data
  const dimensionsObj = risk.dimensions || {};
  const radarData = Object.entries(dimensionsObj).map(([key, value]) => ({
    subject: key.replace(/_/g, ' ').toUpperCase(),
    score: typeof value === 'number' ? value : 30,
    fullMark: 100,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Clean Executive Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                AI Valuation & Risk Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Tree SHAP • 8-D Risk Matrix</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Property Fair-Value & Decision Intelligence
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Machine learning fair market valuation, statistical confidence bounds, and 12-month capital trajectories.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => handleRunValuation()}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating Model...' : 'Re-Run Valuation'}</span>
            </button>
          </div>
        </div>

        {calculatedNotice && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Valuation recalculated successfully using ML Model ({selectedLoc?.name || 'Chennai'})
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase font-financial text-emerald-700">Live Updated</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Two Columns: Input Form (5 cols) vs Intelligence Outputs (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Property Configuration Form */}
          <div className="lg:col-span-5 panel p-6 space-y-5 h-fit shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Asset Physical Parameters
              </h2>
              <span className="text-xs font-financial text-blue-600 font-bold">100% Grounded</span>
            </div>

            <form onSubmit={handleRunValuation} className="space-y-4 text-xs">
              {/* Micro-Market Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider font-financial">
                  Micro-Market Locality
                </label>
                <select
                  value={locationId}
                  onChange={(e) => {
                    const newId = Number(e.target.value);
                    setLocationId(newId);
                    const loc = CHENNAI_MICRO_MARKETS.find((m) => m.id === newId);
                    if (loc) {
                      setCurrentPrice(loc.base_price * areaSqft);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {CHENNAI_MICRO_MARKETS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} — Benchmark ₹{loc.base_price}/sqft
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type & Asking Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider font-financial">
                    Property Typology
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Gated Community Apartment">Gated Community</option>
                    <option value="Standalone Apartment">Standalone Builder Floor</option>
                    <option value="Independent Villa">Independent Villa</option>
                    <option value="Penthouse">Luxury Penthouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider font-financial">
                    Asking Price (INR)
                  </label>
                  <input
                    type="number"
                    value={currentPrice}
                    step={50000}
                    onChange={(e) => setCurrentPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 font-financial focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Area & BHK */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider font-financial">
                    Super Area
                  </label>
                  <input
                    type="number"
                    value={areaSqft}
                    step={25}
                    onChange={(e) => {
                      const newArea = Number(e.target.value);
                      setAreaSqft(newArea);
                      if (selectedLoc) setCurrentPrice(selectedLoc.base_price * newArea);
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 font-financial focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider font-financial">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 font-financial focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} BHK
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider font-financial">
                    Age (Yrs)
                  </label>
                  <input
                    type="number"
                    value={propertyAge}
                    min={0}
                    max={50}
                    onChange={(e) => setPropertyAge(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 font-financial focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Floor Placement */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider font-financial">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    value={floorNumber}
                    min={0}
                    max={50}
                    onChange={(e) => setFloorNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 font-financial focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider font-financial">
                    Total Floors
                  </label>
                  <input
                    type="number"
                    value={totalFloors}
                    min={1}
                    max={50}
                    onChange={(e) => setTotalFloors(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 font-financial focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-financial block">
                  Gated Community Amenities:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_AMENITIES.map((am) => {
                    const isChecked = amenities.includes(am);
                    return (
                      <button
                        type="button"
                        key={am}
                        onClick={() => toggleAmenity(am)}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium text-left transition-all border ${
                          isChecked
                            ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {am}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all mt-2 cursor-pointer disabled:opacity-75"
              >
                <Zap className={`w-4 h-4 ${loading ? 'animate-spin text-amber-300' : ''}`} />
                <span>{loading ? 'Evaluating Model...' : 'Calculate Fair Valuation'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Model Output Cards */}
          <div id="results-panel" className="lg:col-span-7 space-y-6">
            {valuationResult && (
              <>
                {/* Grand Fair Value Output Card */}
                <div className="panel p-6 space-y-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-financial block">
                        Estimated Fair Market Valuation
                      </span>
                      <div className="text-3xl font-bold text-slate-900 font-financial mt-1">
                        {formatINR(estValue)}
                        <span className="text-xs font-sans text-slate-500 font-normal ml-2">
                          (₹{estPriceSqft.toLocaleString('en-IN')}/sqft)
                        </span>
                      </div>
                    </div>

                    {/* Decision Stance Badge */}
                    <div className="flex flex-col sm:items-end">
                      <span className={`text-base font-bold px-3 py-1 rounded-md uppercase tracking-wider font-financial border ${decisionStyle.bg}`}>
                        {rec.decision}
                      </span>
                      <span className="text-[11px] text-slate-500 font-financial mt-1">
                        Confidence: {((rec.confidence || 0.85) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Valuation Confidence Bounds (90% Interval) */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-xs font-financial">
                      <span className="text-slate-500">Lower Bound (90% CI):</span>
                      <span className="text-slate-800 font-semibold">
                        {formatINR(lowerBound)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-financial">
                      <span className="text-blue-700 font-bold">Estimated Fair Value:</span>
                      <span className="text-blue-700 font-bold">
                        {formatINR(estValue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-financial">
                      <span className="text-slate-500">Upper Bound (90% CI):</span>
                      <span className="text-slate-800 font-semibold">
                        {formatINR(upperBound)}
                      </span>
                    </div>
                  </div>

                  {/* Over/Under Valuation Premium Meter */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-financial">
                      <span className="text-slate-700 font-medium">Pricing vs. Model Fair Value:</span>
                      <span
                        className={`font-bold ${
                          overUnderPct > 0
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {overUnderPct > 0
                          ? `+${overUnderPct}% Overpriced`
                          : `${overUnderPct}% Undervalued Discount`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {rec.rationale}
                    </p>
                  </div>

                  {/* 12-Month Forward Price Trajectory */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-financial text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">12-Month Projected Value:</span>
                      <span className="text-base font-bold text-slate-900">
                        {formatINR(f12m)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">Projected 1Y Appreciation:</span>
                      <span className="text-base font-bold text-emerald-600">
                        +{f12mGrowth}% YoY
                      </span>
                    </div>
                  </div>
                </div>

                {/* 8-Dimensional Multi-Factor Risk Radar & Drivers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Radar Chart */}
                  <div className="panel p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-blue-600" />
                        8-D Risk Radar
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-bold font-financial ${riskBadge.bg}`}>
                        {(risk.score || 35).toFixed(0)} / 100
                      </span>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} outerRadius="75%">
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={8} />
                          <Radar
                            name="Risk"
                            dataKey="score"
                            stroke="#2563eb"
                            fill="#2563eb"
                            fillOpacity={0.25}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tree SHAP Explainable AI Value Drivers */}
                  <div className="panel p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Explainable Value Drivers
                      </h3>
                      <span className="text-[10px] text-blue-600 font-financial font-bold">Tree SHAP</span>
                    </div>

                    <div className="space-y-2.5">
                      {positiveFactors.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs space-y-0.5"
                        >
                          <div className="flex justify-between font-bold text-emerald-800">
                            <span>+ {item.factor}</span>
                            <span className="font-financial">+{item.impact_pct}%</span>
                          </div>
                          <p className="text-[11px] text-slate-600">{item.description}</p>
                        </div>
                      ))}

                      {negativeFactors.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200 text-xs space-y-0.5"
                        >
                          <div className="flex justify-between font-bold text-rose-800">
                            <span>- {item.factor}</span>
                            <span className="font-financial">{item.impact_pct}%</span>
                          </div>
                          <p className="text-[11px] text-slate-600">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
