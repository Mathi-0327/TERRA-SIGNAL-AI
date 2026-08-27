'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { formatINR, getRiskBadge } from '@/lib/formatting';
import {
  Building2,
  CheckCircle2,
  Coins,
  Layers,
  MapPin,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Trash2
} from 'lucide-react';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getPortfolio();
      setPortfolio(res);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const summary = portfolio?.summary;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Asset Management
              </span>
              <span className="text-xs text-slate-500 font-medium">Portfolio Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Institutional Portfolio Asset Intelligence
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Multi-asset valuation tracking, portfolio composite risk exposure, and rental cashflow.
            </p>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="panel p-5 space-y-2 panel-hover">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">Total Portfolio Value</span>
              <div className="text-2xl font-bold text-slate-900 font-financial">
                {formatINR(summary.total_current_valuation_inr)}
              </div>
              <div className="text-xs text-emerald-600 flex items-center gap-1 font-financial font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> +{summary.portfolio_return_pct}% Unrealized Gain
              </div>
            </div>

            <div className="panel p-5 space-y-2 panel-hover">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">Annual Rental Cashflow</span>
              <div className="text-2xl font-bold text-slate-900 font-financial">
                {formatINR(summary.annual_rental_cashflow_inr)}
              </div>
              <div className="text-xs text-slate-500">Recurring Annual Yield</div>
            </div>

            <div className="panel p-5 space-y-2 panel-hover">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">Composite Risk Score</span>
              <div className="text-2xl font-bold text-amber-700 font-financial">
                {summary.composite_portfolio_risk.toFixed(1)} / 100
              </div>
              <div className="text-xs text-amber-700 font-semibold">Moderate Risk Exposure</div>
            </div>

            <div className="panel p-5 space-y-2 panel-hover">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">Geographic Concentration</span>
              <div className="text-2xl font-bold text-slate-900 font-financial">
                {summary.geographic_concentration}
              </div>
              <div className="text-xs text-slate-500 font-financial">{summary.total_assets_count} Tracked Properties</div>
            </div>
          </div>
        )}

        {/* Portfolio Assets Table */}
        <div className="panel p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Tracked Assets in Portfolio
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-financial">
                  <th className="pb-3">Property Asset</th>
                  <th className="pb-3">Micro-Market</th>
                  <th className="pb-3">Purchase Price</th>
                  <th className="pb-3">Current Valuation</th>
                  <th className="pb-3">Unrealized Gain</th>
                  <th className="pb-3">Monthly Rent</th>
                  <th className="pb-3 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-financial text-xs">
                {portfolio?.properties?.map((item: any) => {
                  const badge = getRiskBadge(item.risk_score > 60 ? 'HIGH' : item.risk_score > 40 ? 'MODERATE' : 'LOW');
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        <div>{item.property_name}</div>
                        <span className="text-xs text-slate-500 font-normal">{item.area_sqft} sq.ft • {item.property_type}</span>
                      </td>
                      <td className="py-3 text-slate-700">{item.location_name}</td>
                      <td className="py-3 text-slate-500">{formatINR(item.purchase_price)}</td>
                      <td className="py-3 font-bold text-slate-900">{formatINR(item.current_value)}</td>
                      <td className="py-3 text-emerald-600 font-bold">
                        +{formatINR(item.gain_inr)} (+{item.gain_pct}%)
                      </td>
                      <td className="py-3 text-blue-600">{formatINR(item.monthly_rental)}/mo</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge.bg}`}>
                          {item.risk_score} / 100
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
