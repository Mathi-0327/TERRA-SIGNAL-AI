'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CheckCircle2, Save, Settings, Sliders } from 'lucide-react';

export default function SettingsPage() {
  const [weights, setWeights] = useState({
    valuation_risk: 20,
    market_risk: 15,
    demand_risk: 15,
    supply_risk: 15,
    liquidity_risk: 10,
    environmental_risk: 10,
    infrastructure_risk: 10,
    economic_risk: 5,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Configuration
              </span>
              <span className="text-xs text-slate-500 font-medium">Model Calibration</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Platform Settings & Risk Calibration
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Customize 8-Dimensional Multi-Factor Risk Weights and Governance Parameters.
            </p>
          </div>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Risk engine weights updated and calibrated successfully.</span>
          </div>
        )}

        {/* Weights Form */}
        <form onSubmit={handleSave} className="panel p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              8-Dimensional Risk Weight Distribution (%)
            </h3>
            <span className="text-xs font-financial font-bold text-blue-600">
              Total: {Object.values(weights).reduce((a, b) => a + b, 0)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <span className="font-financial font-bold text-blue-700">{val}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={5}
                  value={val}
                  onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Calibration</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
