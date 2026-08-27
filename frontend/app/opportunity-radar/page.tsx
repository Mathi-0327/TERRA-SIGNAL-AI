'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { formatINR, getRiskBadge } from '@/lib/formatting';
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Compass,
  Database,
  Layers,
  MapPin,
  Percent,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function OpportunityRadarPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.getOpportunities();
        setOpportunities(res);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOpportunities();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Opportunity Rankings
              </span>
              <span className="text-xs text-slate-500 font-medium">Capital Growth Convergence</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Top Opportunity Micro-Markets
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Rankings based on capital growth momentum, transit infrastructure catalysts, and rental yields.
            </p>
          </div>

          <span className="text-xs font-financial text-blue-700 font-bold bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shrink-0 shadow-sm">
            Ranked by Opportunity Index (0-100)
          </span>
        </div>

        {/* Opportunity Ranking Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map((opp) => (
            <div
              key={opp.location_id}
              className="panel p-5 flex flex-col justify-between space-y-4 panel-hover group shadow-sm"
            >
              {/* Header: Rank + Name + Grade */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs font-financial border border-blue-200">
                    #{opp.rank}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {opp.location_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{opp.zone || 'Chennai'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-blue-700 font-financial">
                    {opp.opportunity_score.toFixed(0)} / 100
                  </span>
                  <span className="text-[10px] text-slate-500 block font-bold font-financial">
                    Grade {opp.opportunity_grade}
                  </span>
                </div>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-financial">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-sans">Base Rate</span>
                  <span className="font-bold text-slate-800 text-xs">{formatINR(opp.base_price_sqft)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-sans">1Y Growth</span>
                  <span className="font-bold text-emerald-600 text-xs">+{opp.price_growth_1y}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-sans">Rental Yield</span>
                  <span className="font-bold text-blue-600 text-xs">{opp.rental_yield}%</span>
                </div>
              </div>

              {/* Why This Location */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block font-financial">
                  Key Investment Catalysts:
                </span>
                <div className="space-y-1">
                  {opp.why_this_location.map((r: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Turnover: <strong className="text-slate-800 font-financial">{opp.selling_days}d</strong></span>
                <Link
                  href={`/property-analyzer?location_id=${opp.location_id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors font-financial"
                >
                  <span>Analyze Node</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
