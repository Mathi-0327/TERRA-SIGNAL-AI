'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { LocationDetail } from '@/types/api';
import { formatINR, getRiskBadge } from '@/lib/formatting';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  Database,
  Layers,
  MapPin,
  Percent,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export default function LocationIntelligencePage() {
  const searchParams = useSearchParams();
  const searchLoc = searchParams.get('search') || '';

  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<LocationDetail | null>(null);
  const [locProfile, setLocProfile] = useState<any>(null);

  // Comparison State
  const [compareLoc1Id, setCompareLoc1Id] = useState<number>(1); // OMR
  const [compareLoc2Id, setCompareLoc2Id] = useState<number>(3); // Tambaram
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const list = await ApiClient.getLocations();
        setLocations(list);

        if (list.length > 0) {
          const match = searchLoc
            ? list.find((l) => l.name.toLowerCase().includes(searchLoc.toLowerCase())) || list[0]
            : list[0];
          setSelectedLoc(match);
          loadProfile(match.id);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLocations();
  }, [searchLoc]);

  const loadProfile = async (id: number) => {
    try {
      const p = await ApiClient.getLocationProfile(id);
      setLocProfile(p);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const runComparison = async () => {
    try {
      const res = await ApiClient.compareLocations([compareLoc1Id, compareLoc2Id]);
      setComparisonResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
    }
  };

  useEffect(() => {
    if (compareLoc1Id && compareLoc2Id) {
      runComparison();
    }
  }, [compareLoc1Id, compareLoc2Id]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Location Intelligence
              </span>
              <span className="text-xs text-slate-500 font-medium">Comparative Trade-Off Matrix</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Micro-Market Valuation Dynamics & Trade-Offs
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Granular micro-market indices, 12-quarter price trajectories, and multi-locality comparative trade-off analysis.
            </p>
          </div>
        </div>

        {/* Micro-Market Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {locations.map((loc) => {
            const isSelected = selectedLoc?.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  setSelectedLoc(loc);
                  loadProfile(loc.id);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {loc.name}
              </button>
            );
          })}
        </div>

        {/* Selected Micro-Market Deep Dive */}
        {selectedLoc && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Locality Metric Snapshot (5 cols) */}
            <div className="lg:col-span-5 panel p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedLoc.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedLoc.zone || 'Chennai Metro'}</p>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-md border font-bold font-financial ${getRiskBadge(selectedLoc.risk_level).bg}`}>
                  {selectedLoc.market_status}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                {selectedLoc.summary}
              </p>

              {/* 6 Key Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-financial">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">Base Rate / sq.ft</span>
                  <span className="text-sm font-bold text-slate-900">{formatINR(selectedLoc.base_price_sqft)}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">1Y Capital Growth</span>
                  <span className={`text-sm font-bold ${selectedLoc.price_growth_1y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    +{selectedLoc.price_growth_1y}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">Rental Yield</span>
                  <span className="text-sm font-bold text-blue-600">{selectedLoc.rental_yield}%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">Resale Days</span>
                  <span className="text-sm font-bold text-slate-800">{selectedLoc.selling_days} days</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">Infrastructure Grade</span>
                  <span className="text-sm font-bold text-blue-600">{selectedLoc.infra_score} / 100</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">Flood Hazard Score</span>
                  <span className={`text-sm font-bold ${selectedLoc.flood_risk_score > 60 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {selectedLoc.flood_risk_score} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Historical Quarterly Trend for Locality (7 cols) */}
            <div className="lg:col-span-7 panel p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    12-Quarter Historical Price & Absorption Trajectory
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedLoc.name} Quarterly Trend (2023-Q3 to 2026-Q2)</p>
                </div>
              </div>

              <div className="h-64 w-full">
                {locProfile?.historical_trends && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={locProfile.historical_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="lightLocPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="quarter" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 300', 'dataMax + 300']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}/sq.ft`, 'Avg Price']}
                      />
                      <Area type="monotone" dataKey="avg_price_sqft" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#lightLocPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Multi-Location Trade-Off Comparison Section */}
        <div className="panel p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Side-by-Side Micro-Market Comparison (e.g. OMR vs. Tambaram)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Objective Trade-Off Analysis Across Pricing, Growth, Rental Yields, Flood Vulnerability, and Resale Liquidity
              </p>
            </div>

            {/* Micro-Market Selectors */}
            <div className="flex items-center gap-2 text-xs font-financial">
              <select
                value={compareLoc1Id}
                onChange={(e) => setCompareLoc1Id(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>

              <span className="text-xs text-blue-600 font-bold">VS</span>

              <select
                value={compareLoc2Id}
                onChange={(e) => setCompareLoc2Id(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Cards & Tradeoffs */}
          {comparisonResult && (
            <div className="space-y-4">
              {/* Compared Profiles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonResult.compared_locations.map((item: any, idx: number) => (
                  <div key={item.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-blue-600 font-financial font-bold uppercase tracking-wider">
                          Candidate #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{item.name}</h4>
                        <p className="text-xs text-slate-500 font-mono">{item.zone}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded border font-bold font-financial ${getRiskBadge(item.risk_level).bg}`}>
                        Risk: {item.risk_score.toFixed(0)}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-200 font-financial">
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase block font-sans">Base Price</span>
                        <span className="font-bold text-slate-800">{formatINR(item.base_price_sqft)}/sqft</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase block font-sans">1Y Growth</span>
                        <span className="font-bold text-emerald-600">+{item.price_growth_1y}%</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase block font-sans">Rental Yield</span>
                        <span className="font-bold text-blue-600">{item.rental_yield}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trade-Off Matrix Observations */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-800 tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  Key Trade-Off Synthesis:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  {comparisonResult.tradeoff_analysis.map((to: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                      <span className="font-bold text-blue-700 text-xs block">{to.dimension}</span>
                      <p className="text-xs text-slate-600 leading-relaxed">{to.observation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
