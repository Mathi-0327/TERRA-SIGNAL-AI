'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { formatINR } from '@/lib/formatting';
import {
  Activity,
  BarChart3,
  Building2,
  Database,
  Layers,
  LineChart as LineChartIcon,
  MapPin,
  Percent,
  RefreshCw,
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
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export default function MarketIntelligencePage() {
  const [metroTrends, setMetroTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrends = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.getMetroTrends();
        setMetroTrends(res);
      } catch (err) {
        console.error('Error fetching metro trends:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTrends();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Time-Series Dynamics
              </span>
              <span className="text-xs text-slate-500 font-medium">12-Quarter Historical Model</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Market Intelligence & Macro Trends
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Price momentum, inventory turnover cycles, and rental yield distribution.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-700 font-financial bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shrink-0 shadow-sm">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>NHB RESIDEX (12 Quarters)</span>
          </div>
        </div>

        {/* 2 Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Trajectory */}
          <div className="panel p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LineChartIcon className="w-4 h-4 text-blue-600" />
                  Metro Residential Price Trajectory (INR/sqft)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Quarterly Aggregate Moving Average</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metroTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lightMetroPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="quarter" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}/sqft`, 'Avg Rate']}
                  />
                  <Area type="monotone" dataKey="avg_price_sqft" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#lightMetroPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Selling Days */}
          <div className="panel p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Resale Turnover Velocity (Days on Market)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Days to Transact across Metro Sub-Markets</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metroTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="quarter" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[40, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v: any) => [`${v} days`, 'Avg Selling Time']}
                  />
                  <Bar dataKey="avg_selling_days" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quarterly Data Provenance Table */}
        <div className="panel p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Quarterly Metro Index Historical Table
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-financial">
                  <th className="pb-3">Quarter</th>
                  <th className="pb-3">Avg Rate / sq.ft</th>
                  <th className="pb-3">Demand Index</th>
                  <th className="pb-3">Supply Index</th>
                  <th className="pb-3">Avg Selling Days</th>
                  <th className="pb-3 text-right">Gross Rental Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-financial">
                {metroTrends.map((q) => (
                  <tr key={q.quarter} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 font-sans">{q.quarter}</td>
                    <td className="py-3 text-blue-700 font-bold">₹{q.avg_price_sqft.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-slate-700">{q.demand_index} / 100</td>
                    <td className="py-3 text-amber-600 font-semibold">{q.supply_index} / 100</td>
                    <td className="py-3 text-slate-600">{q.avg_selling_days} days</td>
                    <td className="py-3 text-right text-blue-600 font-bold">{q.avg_rental_yield}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
