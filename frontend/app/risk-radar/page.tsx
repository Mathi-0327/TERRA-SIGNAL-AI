'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskMap } from '@/components/maps/RiskMap';
import { ApiClient } from '@/lib/api-client';
import { LocationDetail } from '@/types/api';
import { formatINR, getRiskBadge } from '@/lib/formatting';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
  MapPin,
  Radio,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function RiskRadarPage() {
  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const list = await ApiClient.getLocations();
        setLocations(list);
        if (list.length > 0) setSelectedLoc(list[0]);
      } catch (err) {
        console.error('Error fetching risk locations:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Geospatial Intelligence
              </span>
              <span className="text-xs text-slate-500 font-medium">8-D Multi-Factor Vulnerability</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Geospatial Risk Radar & Vulnerability Mapping
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Spatial multi-dimensional vulnerability matrices and 100-year inundation hazard mapping.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-financial shrink-0 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Anomaly Scanners Active</span>
          </div>
        </div>

        {/* Full-Screen Map Component */}
        <div className="panel p-4 shadow-sm">
          <RiskMap
            locations={locations}
            selectedLocationId={selectedLoc?.id}
            onSelectLocation={(loc) => setSelectedLoc(loc)}
            height="500px"
          />
        </div>

        {/* Micro-Market Vulnerability Table */}
        <div className="panel p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            Micro-Market Vulnerability Index Ranking
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-financial">
                  <th className="pb-3">Micro-Market</th>
                  <th className="pb-3">Zone</th>
                  <th className="pb-3">Composite Risk</th>
                  <th className="pb-3">Flood Hazard</th>
                  <th className="pb-3">Supply Index</th>
                  <th className="pb-3">Selling Days</th>
                  <th className="pb-3">Market Status</th>
                  <th className="pb-3 text-right">Anomaly Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-financial">
                {locations.map((loc) => {
                  const badge = getRiskBadge(loc.risk_level);
                  return (
                    <tr
                      key={loc.id}
                      onClick={() => setSelectedLoc(loc)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedLoc?.id === loc.id ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                        <span>{loc.name}</span>
                      </td>
                      <td className="py-3 text-slate-500 font-sans">{loc.zone || 'Chennai'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded border text-xs font-bold ${badge.bg}`}>
                          {loc.risk_score?.toFixed(0) || 38} / 100
                        </span>
                      </td>
                      <td className={`py-3 ${loc.flood_risk_score > 60 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {loc.flood_risk_score} / 100
                      </td>
                      <td className={`py-3 ${loc.supply_index > 75 ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                        {loc.supply_index} / 100
                      </td>
                      <td className="py-3 text-slate-700">{loc.selling_days} days</td>
                      <td className="py-3 font-sans">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {loc.market_status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-sans">
                        {loc.anomaly_signal !== 'NONE' ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold font-financial">
                            {loc.anomaly_signal}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Normal</span>
                        )}
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
