'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { RiskMap } from '@/components/maps/RiskMap';
import { ApiClient } from '@/lib/api-client';
import { DashboardOverview, LocationDetail } from '@/types/api';
import { formatFullINR, formatINR, getRiskBadge, getSeverityBadge } from '@/lib/formatting';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  Database,
  Layers,
  MapPin,
  Radio,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const DEFAULT_LOCATIONS: LocationDetail[] = [
  { id: 1, name: 'OMR (Old Mahabalipuram Road)', slug: 'omr', city: 'Chennai', zone: 'South-East IT Corridor', lat: 12.9150, lng: 80.2280, base_price_sqft: 7200, rental_yield: 3.8, demand_index: 68, supply_index: 82, selling_days: 115, price_growth_1y: 5.8, flood_risk_score: 55, infra_score: 82, risk_score: 58, risk_level: 'MODERATE', market_status: 'COOLING', anomaly_signal: 'DIVERGENCE_WARNING', summary: 'IT growth corridor along Rajiv Gandhi Salai.' },
  { id: 2, name: 'Velachery', slug: 'velachery', city: 'Chennai', zone: 'South Residential', lat: 12.9750, lng: 80.2200, base_price_sqft: 8500, rental_yield: 4.1, demand_index: 74, supply_index: 65, selling_days: 72, price_growth_1y: 6.2, flood_risk_score: 75, infra_score: 80, risk_score: 52, risk_level: 'MODERATE', market_status: 'STABLE', anomaly_signal: 'NONE', summary: 'Established south residential node with elevated flood exposure.' },
  { id: 3, name: 'Tambaram', slug: 'tambaram', city: 'Chennai', zone: 'South-West Hub', lat: 12.9250, lng: 80.1200, base_price_sqft: 5800, rental_yield: 4.4, demand_index: 82, supply_index: 55, selling_days: 58, price_growth_1y: 8.5, flood_risk_score: 30, infra_score: 78, risk_score: 28, risk_level: 'LOW', market_status: 'EXPANDING', anomaly_signal: 'NONE', summary: 'Major south-west gateway with high absorption.' },
  { id: 4, name: 'Anna Nagar', slug: 'anna-nagar', city: 'Chennai', zone: 'Central-West Premium', lat: 13.0850, lng: 80.2100, base_price_sqft: 14500, rental_yield: 3.2, demand_index: 78, supply_index: 50, selling_days: 62, price_growth_1y: 7.0, flood_risk_score: 25, infra_score: 92, risk_score: 22, risk_level: 'LOW', market_status: 'EXPANDING', anomaly_signal: 'NONE', summary: 'Prime mature central residential micro-market.' },
  { id: 5, name: 'Porur', slug: 'porur', city: 'Chennai', zone: 'West Commercial', lat: 13.0350, lng: 80.1550, base_price_sqft: 6800, rental_yield: 4.3, demand_index: 85, supply_index: 52, selling_days: 52, price_growth_1y: 9.1, flood_risk_score: 35, infra_score: 82, risk_score: 26, risk_level: 'LOW', market_status: 'EXPANDING', anomaly_signal: 'NONE', summary: 'Western commercial hub with fast absorption.' },
];

const DEFAULT_TRENDS = [
  { quarter: '2024-Q3', avg_price_sqft: 8050, demand_index: 75.0, supply_index: 68.0, avg_selling_days: 78, avg_rental_yield: 4.1 },
  { quarter: '2024-Q4', avg_price_sqft: 8150, demand_index: 76.5, supply_index: 66.0, avg_selling_days: 76, avg_rental_yield: 4.15 },
  { quarter: '2025-Q1', avg_price_sqft: 8280, demand_index: 78.0, supply_index: 64.5, avg_selling_days: 75, avg_rental_yield: 4.2 },
  { quarter: '2025-Q2', avg_price_sqft: 8390, demand_index: 79.5, supply_index: 63.0, avg_selling_days: 73, avg_rental_yield: 4.25 },
  { quarter: '2025-Q3', avg_price_sqft: 8520, demand_index: 81.0, supply_index: 62.0, avg_selling_days: 71, avg_rental_yield: 4.3 },
  { quarter: '2025-Q4', avg_price_sqft: 8650, demand_index: 82.5, supply_index: 61.0, avg_selling_days: 69, avg_rental_yield: 4.35 },
  { quarter: '2026-Q1', avg_price_sqft: 8780, demand_index: 83.0, supply_index: 61.5, avg_selling_days: 68, avg_rental_yield: 4.4 },
  { quarter: '2026-Q2', avg_price_sqft: 8920, demand_index: 84.5, supply_index: 60.5, avg_selling_days: 67, avg_rental_yield: 4.45 },
];

const DEFAULT_DASHBOARD: DashboardOverview = {
  kpis: {
    avg_price_sqft: 8920,
    price_growth_1y_pct: 6.8,
    active_properties: 3500,
    active_early_warnings: 2,
    metro_risk_score: 38.5,
    metro_risk_level: 'LOW',
    gross_rental_yield_pct: 4.35,
    avg_selling_days: 67,
  },
  market_pulse: {
    status: 'STABLE',
    summary: 'Balanced market equilibrium with selective capital appreciation in transit-oriented nodes.',
    cooling_markets: ['OMR', 'Perungudi'],
    strong_markets: ['Porur', 'Tambaram', 'Anna Nagar'],
  },
  historical_metro_trends: DEFAULT_TRENDS,
  early_warning_alerts: [
    {
      id: 'al-omr-div',
      location_id: 1,
      location_name: 'OMR (Old Mahabalipuram Road)',
      severity: 'HIGH',
      title: 'Price-Demand Decoupling & Supply Overhang in OMR',
      signals: [
        { indicator: 'Buyer Demand Velocity', previous: '77/100', current: '68/100', change_pct: -11.7, direction: 'DOWN' },
        { indicator: 'Unsold Developer Inventory', previous: '69/100', current: '82/100', change_pct: 18.8, direction: 'UP' },
        { indicator: 'Average Resale Horizon', previous: '92 days', current: '115 days', change_pct: 25.0, direction: 'UP' },
      ],
      interpretation: 'Asking prices remain rigid while active inquiry volumes fell by 11.7% with unsold inventory expanding.',
      recommended_action: 'Target 8-12% negotiation discounts on non-RERA secondary sales; exercise selective accumulation.',
      data_sources: ['NHB RESIDEX', 'TNRERA Registry'],
    },
    {
      id: 'al-vel-flood',
      location_id: 2,
      location_name: 'Velachery',
      severity: 'WARNING',
      title: 'Inundation Vulnerability & Ground Floor Valuation Drag',
      signals: [
        { indicator: 'Flood Hazard Inundation', previous: '70/100', current: '75/100', change_pct: 7.1, direction: 'UP' },
        { indicator: 'Ground Floor Resale Discount', previous: '10%', current: '14%', change_pct: 40.0, direction: 'UP' },
      ],
      interpretation: 'Catchment survey indicates prolonged surface water retention in low-lying micro-pockets.',
      recommended_action: 'Require flood elevation clearance certificates; prioritize 3rd floor and above.',
      data_sources: ['WRD GIS', 'State Disaster Mgmt'],
    },
  ],
  top_opportunities: [
    {
      rank: 1,
      location_id: 5,
      location_name: 'Porur',
      zone: 'West Commercial Hub',
      base_price_sqft: 6800,
      price_growth_1y: 9.1,
      rental_yield: 4.3,
      selling_days: 52,
      opportunity_score: 88,
      opportunity_grade: 'A+',
      why_this_location: ['Metro Corridor 4 interchange operational catalyst', 'High rental absorption driven by commercial tech clusters'],
    },
    {
      rank: 2,
      location_id: 3,
      location_name: 'Tambaram',
      zone: 'South-West Hub',
      base_price_sqft: 5800,
      price_growth_1y: 8.5,
      rental_yield: 4.4,
      selling_days: 58,
      opportunity_score: 84,
      opportunity_grade: 'A',
      why_this_location: ['Suburban rail & arterial hub with strong end-user demand', 'Attractive entry price points with steady appreciation'],
    },
    {
      rank: 3,
      location_id: 4,
      location_name: 'Anna Nagar',
      zone: 'Central-West Premium',
      base_price_sqft: 14500,
      price_growth_1y: 7.0,
      rental_yield: 3.2,
      selling_days: 62,
      opportunity_score: 79,
      opportunity_grade: 'A-',
      why_this_location: ['Prime institutional core with low default risk', 'Consistent capital preservation and high prestige yield'],
    },
  ],
  recent_analyses: [],
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview>(DEFAULT_DASHBOARD);
  const [locations, setLocations] = useState<LocationDetail[]>(DEFAULT_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail>(DEFAULT_LOCATIONS[0]);
  const [activeTab, setActiveTab] = useState<'trends' | 'supply_demand'>('trends');

  useEffect(() => {
    let isMounted = true;
    const fetchLatestTelemetry = async () => {
      try {
        const [dashRes, locsRes] = await Promise.all([
          ApiClient.getDashboardOverview(),
          ApiClient.getLocations(),
        ]);
        if (isMounted) {
          if (dashRes && dashRes.kpis) setData(dashRes);
          if (locsRes && locsRes.length > 0) {
            setLocations(locsRes);
            setSelectedLocation(locsRes[0]);
          }
        }
      } catch (err) {
        console.warn('Using instant baseline telemetry:', err);
      }
    };

    fetchLatestTelemetry();
    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = data.kpis;
  const pulse = data.market_pulse;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Clean Executive Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial tracking-wide">
                Q2-2026 BENCHMARK ACTIVE
              </span>
              <span className="text-xs text-slate-500 font-medium">Chennai Metropolitan Area</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Real Estate Decision Intelligence
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated fair market valuation, forward capital forecasting, and 8-dimensional multi-factor risk engine.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/property-analyzer"
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
            >
              New Valuation
            </Link>
            <Link
              href="/scenario-simulator"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Simulate Shocks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Market Condition Strip */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-financial">
                Market Equilibrium Pulse
              </div>
              <div className="text-xs font-medium text-slate-800">
                <span className="font-bold text-amber-700">{pulse.status}</span> • {pulse.summary}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-financial text-slate-500">
            <span>Expanding: <strong className="text-emerald-600">Porur, Tambaram</strong></span>
            <span>Cooling: <strong className="text-amber-600">OMR</strong></span>
          </div>
        </div>

        {/* 4 Professional Light KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Benchmark Rate */}
          <div className="panel p-5 space-y-3 panel-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">
                Metro Benchmark Rate
              </span>
              <Coins className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 font-financial tracking-tight">
                {formatINR(kpis.avg_price_sqft)}
                <span className="text-xs font-sans text-slate-500 font-normal"> / sq.ft</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1 font-financial">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{kpis.price_growth_1y_pct}% YoY Appreciation</span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between font-financial">
              <span>3,500 Units Analyzed</span>
              <span className="text-slate-800 font-semibold">NHB RESIDEX</span>
            </div>
          </div>

          {/* Card 2: Market Risk Exposure */}
          <div className="panel p-5 space-y-3 panel-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">
                Metro Risk Exposure
              </span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-700 font-financial tracking-tight">
                {kpis.metro_risk_score.toFixed(1)}
                <span className="text-xs font-sans text-slate-500 font-normal"> / 100</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{kpis.metro_risk_level} Composite Risk</span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between font-financial">
              <span>8 Risk Dimensions</span>
              <span className="text-slate-800 font-semibold">WRD GIS Inundation</span>
            </div>
          </div>

          {/* Card 3: Liquidity Horizon */}
          <div className="panel p-5 space-y-3 panel-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">
                Resale Liquidity Horizon
              </span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 font-financial tracking-tight">
                {kpis.avg_selling_days}
                <span className="text-xs font-sans text-slate-500 font-normal"> Days</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-700 font-medium mt-1">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>Turnover Velocity</span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between font-financial">
              <span>Gross Yield: <strong className="text-slate-800">{kpis.gross_rental_yield_pct}%</strong></span>
              <span className="text-slate-800">TNRERA Registry</span>
            </div>
          </div>

          {/* Card 4: Early Warnings */}
          <div className="panel p-5 space-y-3 panel-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">
                Early Warning Advisories
              </span>
              <AlertOctagon className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-600 font-financial tracking-tight">
                {kpis.active_early_warnings}
                <span className="text-xs font-sans text-slate-500 font-normal"> Active Signals</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-rose-600 font-semibold mt-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Divergence Traps</span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between font-financial">
              <span>Top Risk: <strong className="text-rose-700">OMR</strong></span>
              <Link href="/alerts" className="text-blue-600 font-semibold hover:underline">
                View Feed ➔
              </Link>
            </div>
          </div>
        </div>

        {/* Middle Section: Macro Time-Series Charts */}
        <div className="panel p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Quarterly Macro Trajectory & Market Absorption
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                12-Quarter Historical Moving Averages & Demand-Supply Pressure Indices (2023-Q3 to 2026-Q2)
              </p>
            </div>

            {/* Segmented View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('trends')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'trends'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Price Trajectory
              </button>
              <button
                onClick={() => setActiveTab('supply_demand')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'supply_demand'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Demand vs Supply
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'trends' ? (
                <AreaChart data={data.historical_metro_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lightPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="quarter" stroke="#64748b" fontSize={11} tickMargin={6} />
                  <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}/sq.ft`, 'Metro Avg Rate']}
                  />
                  <Area type="monotone" dataKey="avg_price_sqft" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#lightPriceGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={data.historical_metro_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="quarter" stroke="#64748b" fontSize={11} tickMargin={6} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="demand_index" name="Buyer Demand Index" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="supply_index" name="Unsold Supply Index" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spatial Intelligence Section: Interactive Map */}
        <div className="panel p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Geospatial Risk & Opportunity Radar
              </h2>
              <p className="text-xs text-slate-500">
                Spatial distribution of composite micro-market risk levels and active divergence warnings
              </p>
            </div>

            <Link
              href="/risk-radar"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Full Screen Risk Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <RiskMap
            locations={locations}
            selectedLocationId={selectedLocation?.id}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            height="420px"
          />
        </div>

        {/* Bottom Grid: Early Warnings vs Top Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Early Warning Signals (6 cols) */}
          <div className="lg:col-span-6 panel p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-amber-600" />
                  Live Early Warning Signals ({data.early_warning_alerts.length})
                </h3>
                <Link href="/alerts" className="text-xs text-blue-600 font-semibold hover:underline">
                  View All ➔
                </Link>
              </div>

              <div className="space-y-3">
                {data.early_warning_alerts.slice(0, 3).map((alert) => {
                  const badge = getSeverityBadge(alert.severity);
                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-lg bg-slate-50 border ${badge.border} space-y-2 hover:border-slate-300 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-financial font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-800 font-financial">{alert.location_name}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900">{alert.title}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{alert.interpretation}</p>

                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate"><strong>Action:</strong> {alert.recommended_action}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              href="/alerts"
              className="w-full py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold text-center transition-colors block mt-2"
            >
              Open Early Warning Feed
            </Link>
          </div>

          {/* Top Opportunities (6 cols) */}
          <div className="lg:col-span-6 panel p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  Top Opportunity Nodes
                </h3>
                <Link href="/opportunity-radar" className="text-xs text-blue-600 font-semibold hover:underline">
                  View Rankings ➔
                </Link>
              </div>

              <div className="space-y-3">
                {data.top_opportunities.slice(0, 3).map((opp) => (
                  <div
                    key={opp.location_id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 font-financial text-xs font-bold flex items-center justify-center border border-blue-200">
                          #{opp.rank}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{opp.location_name}</h4>
                      </div>
                      <span className="text-xs font-financial font-bold text-blue-700">
                        Score: {opp.opportunity_score.toFixed(0)}/100 (Grade {opp.opportunity_grade})
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-financial py-1">
                      <div className="p-1 rounded bg-white border border-slate-200">
                        <span className="text-[9px] text-slate-500 uppercase block font-sans">Base Rate</span>
                        <span className="font-bold text-slate-800">{formatINR(opp.base_price_sqft)}</span>
                      </div>
                      <div className="p-1 rounded bg-white border border-slate-200">
                        <span className="text-[9px] text-slate-500 uppercase block font-sans">Growth</span>
                        <span className="font-bold text-emerald-600">+{opp.price_growth_1y}%</span>
                      </div>
                      <div className="p-1 rounded bg-white border border-slate-200">
                        <span className="text-[9px] text-slate-500 uppercase block font-sans">Yield</span>
                        <span className="font-bold text-blue-600">{opp.rental_yield}%</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      {opp.why_this_location?.[0] || 'High appreciation node with upcoming metro expansion.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/property-analyzer"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs text-center transition-colors shadow-sm block mt-2"
            >
              Analyze Property in Opportunity Node
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
