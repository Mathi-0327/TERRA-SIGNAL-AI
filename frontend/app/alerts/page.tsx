'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { EarlyWarningAlert } from '@/types/api';
import { getSeverityBadge } from '@/lib/formatting';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Filter,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Zap
} from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async (sev?: string) => {
    try {
      setLoading(true);
      const res = await ApiClient.getAlerts(sev === 'ALL' ? undefined : sev);
      setAlerts(res);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts(filterSeverity);
  }, [filterSeverity]);

  const handleScan = async () => {
    try {
      setScanning(true);
      const res = await ApiClient.triggerAnomalyScan();
      setScanResult(res);
      await loadAlerts(filterSeverity);
      setTimeout(() => setScanResult(null), 4000);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Early Warning Intelligence
              </span>
              <span className="text-xs text-slate-500 font-medium">Anomaly Detectors Active</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Early Warning Signals & Anomaly Advisories
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated anomaly detection, price-demand divergence traps, and inventory overhang advisories.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Trigger Anomaly Scan'}</span>
            </button>
          </div>
        </div>

        {scanResult && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Anomaly Scanner Complete: {scanResult.micro_markets_scanned || 12} Micro-Markets Evaluated • {scanResult.anomalies_detected || 2} Warning Traps Active
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase font-financial text-emerald-700">Scan Finished</span>
          </div>
        )}

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'WARNING', 'WATCH', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border font-financial ${
                filterSeverity === sev
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Alerts Feed Cards */}
        <div className="space-y-4">
          {alerts.map((alert) => {
            const badge = getSeverityBadge(alert.severity);
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl panel border ${badge.border} space-y-4 transition-all hover:border-slate-300 shadow-sm`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border font-financial ${badge.bg}`}>
                      {alert.severity}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{alert.title}</h3>
                  </div>

                  <span className="text-xs font-financial text-slate-500">
                    Locality: <strong className="text-slate-800">{alert.location_name}</strong>
                  </span>
                </div>

                {/* Signals Data Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 font-financial text-xs">
                  {alert.signals?.map((sig, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans truncate font-bold">
                        {sig.indicator}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-400">{sig.previous} ➔</span>
                        <span className="text-xs font-bold text-slate-900">{sig.current}</span>
                        <span
                          className={`text-xs font-bold ${
                            sig.direction === 'UP' && sig.indicator.includes('Demand')
                              ? 'text-emerald-600'
                              : sig.direction === 'DOWN' && sig.indicator.includes('Demand')
                              ? 'text-rose-600'
                              : sig.direction === 'UP' && sig.indicator.includes('Inventory')
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}
                        >
                          ({sig.change_pct > 0 ? `+${sig.change_pct}%` : `${sig.change_pct}%`})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interpretation */}
                <div className="space-y-1 text-xs leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider block">
                    Causal Interpretation:
                  </span>
                  <p className="text-slate-600 leading-relaxed">{alert.interpretation}</p>
                </div>

                {/* Recommended Action & Provenance Footer */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span><strong>Recommended Action:</strong> {alert.recommended_action}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-financial shrink-0">
                    Source: {alert.data_sources?.join(', ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
