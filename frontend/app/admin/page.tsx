'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { formatINR } from '@/lib/formatting';
import {
  Activity,
  CheckCircle2,
  Database,
  Layers,
  Radar,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function AdminPage() {
  const [adminData, setAdminData] = useState<any>(null);
  const [retraining, setRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getAdminOverview();
      setAdminData(res);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      const res = await ApiClient.triggerRetraining();
      setRetrainResult(res);
      await loadAdminData();
    } catch (err) {
      console.error('Retraining error:', err);
    } finally {
      setRetraining(false);
    }
  };

  const sys = adminData?.system_status;
  const gov = adminData?.model_governance;
  const qr = adminData?.data_quality_report;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Model Governance
              </span>
              <span className="text-xs text-slate-500 font-medium">Production Scikit-Learn Card</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Model Governance & Data Provenance Registry
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live model metrics (MAE, RMSE, R²), training pipelines, and dataset provenance.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining Pipeline...' : 'Trigger Model Retrain'}</span>
            </button>
          </div>
        </div>

        {retrainResult && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{retrainResult.message} Production weights refreshed successfully.</span>
            </div>
            <span className="font-financial font-bold text-blue-900">R² = {retrainResult.metrics?.r2_score}</span>
          </div>
        )}

        {/* System Health Snapshot */}
        {sys && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="panel p-5 space-y-1.5 panel-hover">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">Inference Engine</span>
              <div className="text-base font-bold text-blue-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {sys.ml_inference_engine}
              </div>
              <div className="text-xs text-slate-500 font-financial">Version: {sys.active_version}</div>
            </div>

            <div className="panel p-5 space-y-1.5 panel-hover">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">Indexed Properties</span>
              <div className="text-2xl font-bold text-slate-900 font-financial">{sys.indexed_properties.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Chennai Metro Clean DB</div>
            </div>

            <div className="panel p-5 space-y-1.5 panel-hover">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">Monitored Zones</span>
              <div className="text-2xl font-bold text-slate-900 font-financial">{sys.monitored_micro_markets} Zones</div>
              <div className="text-xs text-slate-500">100% Spatial Coverage</div>
            </div>

            <div className="panel p-5 space-y-1.5 panel-hover">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-financial">Risk Engine</span>
              <div className="text-base font-bold text-slate-800">{sys.risk_engine}</div>
              <div className="text-xs text-slate-500">8-Dimensional Formulation</div>
            </div>
          </div>
        )}

        {/* Model Card Metrics */}
        {gov && (
          <div className="panel p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Active Model Card: {gov.model_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Algorithm: {gov.algorithm} • Version: {gov.version}</p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-financial font-bold border border-blue-200">
                {gov.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-financial">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Coefficient of Determination (R²)</span>
                <span className="text-xl font-bold text-blue-700">{gov.metrics?.r2_score}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Mean Abs Error (MAE)</span>
                <span className="text-xl font-bold text-slate-900">₹{gov.metrics?.mae_inr?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Root Mean Sq Error (RMSE)</span>
                <span className="text-xl font-bold text-slate-900">₹{gov.metrics?.rmse_inr?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Mean Abs Pct Error (MAPE)</span>
                <span className="text-xl font-bold text-emerald-600">{gov.metrics?.mape_pct}%</span>
              </div>
            </div>

            {/* Feature Weights */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block font-financial">
                Top Predictive Feature Weights:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-financial">
                {Object.entries(gov.feature_importances || {}).slice(0, 8).map(([feat, imp]: any) => (
                  <div key={feat} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="text-slate-600 truncate pr-1">{feat}:</span>
                    <span className="text-blue-700 font-bold">{(imp * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Sources Provenance Registry Table */}
        <div className="panel p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-blue-600" />
            Statutory Data Sources Provenance Registry
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-financial">
                  <th className="pb-3">Data Source Name</th>
                  <th className="pb-3">Authority / Organization</th>
                  <th className="pb-3">Dataset Coverage</th>
                  <th className="pb-3">Frequency</th>
                  <th className="pb-3 text-right">License</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-financial text-slate-700">
                {adminData?.data_sources_registry?.map((ds: any) => (
                  <tr key={ds.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 font-sans">{ds.name}</td>
                    <td className="py-3 font-sans text-slate-500">{ds.organization}</td>
                    <td className="py-3 text-blue-700 font-bold">{ds.dataset}</td>
                    <td className="py-3">{ds.frequency}</td>
                    <td className="py-3 text-right text-slate-500 font-sans">{ds.license}</td>
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
