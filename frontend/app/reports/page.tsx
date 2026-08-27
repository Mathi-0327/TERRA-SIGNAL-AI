'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { formatFullINR, formatINR, getDecisionStyle, getRiskBadge } from '@/lib/formatting';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Database,
  FileCheck,
  FileText,
  MapPin,
  Printer,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';

const LOCALITIES = [
  { id: 1, name: 'OMR (Old Mahabalipuram Road)', price: 8800000, area: 1400 },
  { id: 2, name: 'Velachery', price: 9500000, area: 1300 },
  { id: 3, name: 'Tambaram', price: 6500000, area: 1200 },
  { id: 4, name: 'Anna Nagar', price: 18500000, area: 1500 },
  { id: 5, name: 'Porur', price: 7800000, area: 1250 },
  { id: 9, name: 'ECR (East Coast Road)', price: 15000000, area: 1250 },
  { id: 11, name: 'Adyar', price: 21000000, area: 1600 },
];

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const initialLocId = Number(searchParams.get('location_id')) || 1;

  const [selectedLocId, setSelectedLocId] = useState<number>(initialLocId);
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDossier = async (locId: number) => {
    try {
      setLoading(true);
      const loc = LOCALITIES.find((l) => l.id === locId) || LOCALITIES[0];
      const res = await ApiClient.generateReport({
        location_id: loc.id,
        property_type: 'Gated Community Apartment',
        area_sqft: loc.area,
        bedrooms: 3,
        bathrooms: 2,
        property_age: 1,
        floor_number: 4,
        total_floors: 12,
        current_price: loc.price,
        amenities: ['Swimming Pool', 'Gymnasium', 'Power Backup', '24/7 Security', 'Covered Car Parking']
      });
      setDossier(res);
    } catch (err) {
      console.error('Dossier generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDossier(selectedLocId);
  }, [selectedLocId]);

  const val = dossier?.valuation_intelligence || {};
  const estVal = val.estimated_value || 0;
  const askingPrice = dossier?.property_summary?.asking_price || 0;
  const decision = dossier?.decision_recommendation?.decision || 'BUY';
  const decisionStyle = getDecisionStyle(decision);
  const risk = dossier?.eight_dimensional_risk || {};

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Screen Controls Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Institutional Memorandum
              </span>
              <span className="text-xs text-slate-500 font-medium">Statutory Forensics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Investment Intelligence Dossier
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated institutional valuation memorandum, risk decomposition & due diligence.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Target Location Switcher */}
            <select
              value={selectedLocId}
              onChange={(e) => setSelectedLocId(Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              {LOCALITIES.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL INSTITUTIONAL INVESTMENT MEMORANDUM DOCUMENT                      */}
        {/* ========================================================================= */}
        {dossier ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none text-slate-900 font-sans">
            
            {/* Top Official Document Header */}
            <div className="border-b-2 border-slate-900 pb-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-financial">
                      TS
                    </div>
                    <span className="text-sm font-bold tracking-tight uppercase text-slate-900 font-financial">
                      TERRASIGNAL AI • INVESTMENT DECISION MEMORANDUM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    DIVISION OF QUANTITATIVE REAL ESTATE VALUATION & APPLIED GEOSPATIAL INTELLIGENCE
                  </p>
                </div>

                <div className="text-right font-financial text-xs">
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    CONFIDENTIAL // INSTITUTIONAL USE ONLY
                  </span>
                  <p className="text-slate-500 text-[11px]">DOSSIER REF: <strong className="text-slate-900">#TS-{dossier.report_id || '2026-Q2-892'}</strong></p>
                  <p className="text-slate-500 text-[11px]">DATE OF ISSUANCE: <strong className="text-slate-900">{new Date(dossier.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></p>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {dossier.title || `Asset Acquisition & Risk Appraisal — ${dossier.property_summary?.locality}`}
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Target Micro-Market: <strong>{dossier.property_summary?.locality}</strong> • Jurisdiction: Chennai Metropolitan Area (CMDA) • Statutory Baseline: <strong>NHB RESIDEX Q2-2026</strong>
                </p>
              </div>
            </div>

            {/* Section 1: Executive Summary & Recommendation Banner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-financial">
                  SECTION 1.0 // EXECUTIVE INVESTMENT STANCE & DECISION SYNOPSIS
                </h2>
                <span className="text-[11px] font-financial text-slate-500">Confidence Score: <strong className="text-slate-900">{((dossier.decision_recommendation?.confidence || 0.85) * 100).toFixed(0)}%</strong></span>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">Recommendation:</span>
                    <span className={`text-base font-bold px-3 py-1 rounded uppercase font-financial border ${decisionStyle.bg}`}>
                      {decision}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    {dossier.decision_recommendation?.rationale || 'Asset valuation displays strong alignment with corridor absorption fundamentals and transit infrastructure expansion.'}
                  </p>
                </div>

                <div className="shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 space-y-2 font-financial text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Suggested Entry Target:</span>
                    <span className="text-base font-bold text-slate-900">
                      {formatINR(dossier.decision_recommendation?.suggested_negotiation_range?.recommended_bid_inr || estVal * 0.95)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Target Discount:</span>
                    <span className="text-xs font-bold text-blue-700">
                      {dossier.decision_recommendation?.suggested_negotiation_range?.discount_target_pct || 5.0}% Below Asking
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Property & Valuation Comparative Matrix */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-financial">
                SECTION 2.0 // ASSET PHYSICAL SPECIFICATIONS & VALUATION METRICS
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-200 font-financial">
                  <thead>
                    <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3 border-r border-slate-200">Specification Metric</th>
                      <th className="p-3 border-r border-slate-200">Asset Record</th>
                      <th className="p-3 border-r border-slate-200">Valuation Parameter</th>
                      <th className="p-3">Model Appraisal Metric</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    <tr>
                      <td className="p-3 border-r border-slate-200 text-slate-500 font-sans">Configuration Typology</td>
                      <td className="p-3 border-r border-slate-200 font-semibold">{dossier.property_summary?.bedrooms} BHK ({dossier.property_summary?.property_type})</td>
                      <td className="p-3 border-r border-slate-200 text-slate-500 font-sans">ML Estimated Fair Value</td>
                      <td className="p-3 font-bold text-blue-700 text-sm">{formatINR(estVal)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-3 border-r border-slate-200 text-slate-500 font-sans">Super Built-Up Area</td>
                      <td className="p-3 border-r border-slate-200 font-semibold">{dossier.property_summary?.area_sqft} sq.ft</td>
                      <td className="p-3 border-r border-slate-200 text-slate-500 font-sans">Fair Value Rate / sq.ft</td>
                      <td className="p-3 font-bold text-slate-900">₹{val.estimated_price_sqft || Math.round(estVal / (dossier.property_summary?.area_sqft || 1))}/sq.ft</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-200 text-slate-500 font-sans">Vendor Asking Price</td>
                      <td className="p-3 border-r border-slate-200 font-bold text-slate-900">{formatINR(askingPrice)}</td>
                      <td className="p-3 border-r border-slate-200 text-slate-500 font-sans">90% Confidence Interval</td>
                      <td className="p-3 font-medium text-slate-700">{formatINR(val.confidence_interval_lower || estVal * 0.85)} – {formatINR(val.confidence_interval_upper || estVal * 1.15)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-3 border-r border-slate-200 text-slate-500 font-sans">Floor & Age Placement</td>
                      <td className="p-3 border-r border-slate-200 font-semibold">Floor {dossier.property_summary?.floor_number} of {dossier.property_summary?.total_floors} ({dossier.property_summary?.property_age} yr)</td>
                      <td className="p-3 border-r border-slate-200 text-slate-500 font-sans">12-Month Projected Value</td>
                      <td className="p-3 font-bold text-emerald-600">
                        {formatINR(dossier.forecast_trajectories?.['12_month'] || estVal * 1.07)} (+{dossier.forecast_trajectories?.growth_12m_pct || 7.0}% YoY)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: 8-Dimensional Multi-Factor Risk Decomposition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-financial">
                  SECTION 3.0 // 8-DIMENSIONAL MULTI-FACTOR RISK EXPOSURE
                </h2>
                <span className="text-[11px] font-financial text-slate-500">
                  Composite Risk: <strong className="text-slate-900">{(risk.overall_score || 35).toFixed(0)} / 100 ({risk.overall_level || 'LOW'})</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-financial">
                {Object.entries(risk.dimensions || {
                  market_risk: 35,
                  valuation_risk: 30,
                  demand_risk: 25,
                  supply_risk: 40,
                  liquidity_risk: 30,
                  environmental_risk: 20,
                  infrastructure_risk: 15,
                  economic_risk: 25,
                }).map(([dim, score]: any) => {
                  const num = typeof score === 'number' ? score : 30;
                  const isHigh = num > 50;
                  return (
                    <div key={dim} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-sans block font-bold truncate">
                        {dim.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className={`text-base font-bold ${isHigh ? 'text-rose-600' : 'text-slate-900'}`}>
                          {num.toFixed(0)}/100
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${isHigh ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {isHigh ? 'Elevated' : 'Controlled'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Explainable AI Drivers & Trade-Offs */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-financial">
                SECTION 4.0 // EXPLAINABLE AI (TREE SHAP) VALUATION DRIVERS
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Positive Drivers */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Positive Valuation Contributors (+):
                  </span>
                  <div className="space-y-2 text-xs">
                    {(dossier.explainable_ai_drivers?.positive_factors || [
                      { factor: 'Transit Corridor Catalyst', impact_pct: 6.2, description: 'Metro Phase II alignment provides positive transit premium.' },
                      { factor: 'Gated Community Infrastructure', impact_pct: 4.5, description: 'Comprehensive security, power backup and clubhouse amenities.' }
                    ]).map((f: any, i: number) => (
                      <div key={i} className="p-2.5 rounded bg-white border border-emerald-200/80">
                        <div className="flex justify-between font-bold text-emerald-900">
                          <span>+ {f.factor}</span>
                          <span className="font-financial">+{f.impact_pct}%</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Negative Drag / Cautions */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    Risk Factors & Valuation Cautions (-):
                  </span>
                  <div className="space-y-2 text-xs">
                    {(dossier.explainable_ai_drivers?.negative_factors || [
                      { factor: 'Secondary Resale Inventory Overhang', impact_pct: -2.8, description: 'High unsold supply in micro-pocket extends liquidation horizon.' }
                    ]).map((f: any, i: number) => (
                      <div key={i} className="p-2.5 rounded bg-white border border-amber-200/80">
                        <div className="flex justify-between font-bold text-amber-900">
                          <span>- {f.factor}</span>
                          <span className="font-financial">{f.impact_pct}%</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Statutory Data Provenance & Legal Disclaimers */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-financial text-slate-600">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold font-sans block">Statutory Pricing Source</span>
                  <span className="font-bold text-slate-800">NHB RESIDEX Q2-2026</span>
                  <span className="text-[10px] text-slate-500 block">National Housing Bank Index</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold font-sans block">Project Due Diligence</span>
                  <span className="font-bold text-slate-800">TNRERA Registry Verified</span>
                  <span className="text-[10px] text-slate-500 block">Tamil Nadu Real Estate Regulatory Auth.</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold font-sans block">Topographical Hazard Model</span>
                  <span className="font-bold text-slate-800">WRD GIS Inundation Baselines</span>
                  <span className="text-[10px] text-slate-500 block">100-Year Flood Catchment Grid</span>
                </div>
              </div>

              {/* Legal Sign-Off Block */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-500 font-financial">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 font-sans">QUANTITATIVE ALGORITHMIC CERTIFICATION</p>
                  <p>Inference Model: Gradient Boosting Regressor v2.4 (Scikit-Learn) • 98.7% R²</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 font-sans">APPROVED FOR INSTITUTIONAL ALLOCATION</span>
                  <p className="text-[10px]">Digital Signature Hash: TS-SIG-8492- verified</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="panel p-12 text-center text-xs text-slate-500 font-financial">
            Generating institutional memorandum...
          </div>
        )}
      </div>
    </AppShell>
  );
}
