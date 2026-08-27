'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { ScenarioSimulationResponse } from '@/types/api';
import { formatINR, getDecisionStyle, getRiskBadge } from '@/lib/formatting';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Compass,
  Database,
  Gauge,
  Layers,
  MapPin,
  Percent,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';

const CHENNAI_MICRO_MARKETS = [
  { id: 1, name: 'OMR (Old Mahabalipuram Road)' },
  { id: 2, name: 'Velachery' },
  { id: 3, name: 'Tambaram' },
  { id: 4, name: 'Anna Nagar' },
  { id: 5, name: 'Porur' },
  { id: 6, name: 'Guindy' },
  { id: 7, name: 'Medavakkam' },
  { id: 8, name: 'Sholinganallur' },
  { id: 9, name: 'ECR (East Coast Road)' },
  { id: 10, name: 'Perungudi' },
  { id: 11, name: 'Adyar' },
  { id: 12, name: 'T. Nagar' },
];

export default function ScenarioSimulatorPage() {
  const searchParams = useSearchParams();
  const initialLocId = Number(searchParams.get('location_id')) || 1;
  const initialPrice = Number(searchParams.get('price')) || 8200000;
  const initialArea = Number(searchParams.get('area')) || 1250;

  const [locationId, setLocationId] = useState<number>(initialLocId);
  const [areaSqft, setAreaSqft] = useState<number>(initialArea);
  const [currentPrice, setCurrentPrice] = useState<number>(initialPrice);

  // Sliders for Macro / Market Shocks
  const [demandShock, setDemandShock] = useState<number>(-15);
  const [supplyShock, setSupplyShock] = useState<number>(20);
  const [rateShock, setRateShock] = useState<number>(50);
  const [infraShock, setInfraShock] = useState<number>(0);
  const [envShock, setEnvShock] = useState<number>(0);
  const [rentShock, setRentShock] = useState<number>(0);

  const [simulationData, setSimulationData] = useState<ScenarioSimulationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runSimulation = async () => {
    try {
      setLoading(true);
      const payload = {
        location_id: locationId,
        area_sqft: areaSqft,
        current_price: currentPrice,
        demand_change_pct: demandShock,
        supply_change_pct: supplyShock,
        interest_rate_change_bps: rateShock,
        infra_improvement_pct: infraShock,
        environmental_stress_delta: envShock,
        rental_growth_delta_pct: rentShock,
      };

      const res = await ApiClient.runScenario(payload);
      setSimulationData(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [locationId, demandShock, supplyShock, rateShock, infraShock, envShock, rentShock]);

  const baseDec = getDecisionStyle(simulationData?.decision_shift?.base_decision);
  const scenDec = getDecisionStyle(simulationData?.decision_shift?.scenario_decision);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-financial uppercase">
                Macroeconomic Stress Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Dynamic Posture Shift Matrix</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              What-If Scenario Simulation Engine
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Simulate Demand Shocks, Supply Surges, Repo Rate Shifts, and Inundation Events.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                setDemandShock(0);
                setSupplyShock(0);
                setRateShock(0);
                setInfraShock(0);
                setEnvShock(0);
                setRentShock(0);
              }}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all"
            >
              Reset Shocks to Baseline
            </button>
          </div>
        </div>

        {/* Two Columns: Sliders / Controls vs Output Matrices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 panel p-6 space-y-5 h-fit sticky top-20 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Scenario Stress Shocks
              </h3>
              <span className="text-xs text-blue-600 font-financial font-bold">Dynamic Calculation</span>
            </div>

            {/* Target Location Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider font-financial">
                Target Micro-Market
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                {CHENNAI_MICRO_MARKETS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preset Stress Test Quick Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-financial">
                Quick Stress Presets:
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDemandShock(-20);
                    setSupplyShock(25);
                    setRateShock(75);
                  }}
                  className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 hover:border-rose-300 text-left transition-all"
                >
                  <span className="text-rose-700 font-bold block">Market Cooling</span>
                  <span className="text-[10px] text-slate-500 font-financial">Demand -20%, Supply +25%</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDemandShock(15);
                    setSupplyShock(-10);
                    setInfraShock(20);
                  }}
                  className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 hover:border-blue-300 text-left transition-all"
                >
                  <span className="text-blue-700 font-bold block">Metro Expansion</span>
                  <span className="text-[10px] text-slate-500 font-financial">Demand +15%, Infra +20%</span>
                </button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
              {/* Slider 1: Demand */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-financial">
                  <span className="text-slate-700 font-bold uppercase text-[11px]">Demand Shock (%)</span>
                  <span className={`font-bold ${demandShock < 0 ? 'text-rose-600' : demandShock > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {demandShock > 0 ? `+${demandShock}%` : `${demandShock}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-40}
                  max={40}
                  step={5}
                  value={demandShock}
                  onChange={(e) => setDemandShock(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider 2: Supply */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-financial">
                  <span className="text-slate-700 font-bold uppercase text-[11px]">Unsold Supply Overhang (%)</span>
                  <span className={`font-bold ${supplyShock > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {supplyShock > 0 ? `+${supplyShock}%` : `${supplyShock}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={60}
                  step={5}
                  value={supplyShock}
                  onChange={(e) => setSupplyShock(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider 3: Interest Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-financial">
                  <span className="text-slate-700 font-bold uppercase text-[11px]">Mortgage Rate Shift (bps)</span>
                  <span className={`font-bold ${rateShock > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                    {rateShock > 0 ? `+${rateShock} bps` : `${rateShock} bps`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-150}
                  max={250}
                  step={25}
                  value={rateShock}
                  onChange={(e) => setRateShock(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider 4: Infrastructure */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-financial">
                  <span className="text-slate-700 font-bold uppercase text-[11px]">Infrastructure Catalyst (%)</span>
                  <span className="font-bold text-blue-600">
                    {infraShock > 0 ? `+${infraShock}%` : `${infraShock}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-10}
                  max={30}
                  step={5}
                  value={infraShock}
                  onChange={(e) => setInfraShock(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Simulation Output Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Decision Shift Master Card */}
            {simulationData && (
              <div className="panel p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Decision Posture Transition
                  </span>
                  <span className="text-xs font-financial text-slate-500">
                    Locality: <strong className="text-slate-900">{simulationData.location_name}</strong>
                  </span>
                </div>

                {/* Base vs Scenario Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 items-center">
                  {/* Base Case Decision */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-financial">
                      Base Case Posture
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-bold px-3 py-1 rounded-md uppercase font-financial border ${baseDec.bg}`}>
                        {simulationData.decision_shift.base_decision}
                      </span>
                      <span className="text-xs text-slate-700 font-financial font-semibold">
                        Risk: {simulationData.base_case.risk.score.toFixed(0)}/100
                      </span>
                    </div>
                  </div>

                  {/* Scenario Shift Decision */}
                  <div className="space-y-1 md:border-l md:border-slate-200 md:pl-4">
                    <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block font-financial">
                      Simulated Scenario Posture
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-bold px-3 py-1 rounded-md uppercase font-financial border ${scenDec.bg}`}>
                        {simulationData.decision_shift.scenario_decision}
                      </span>
                      <span className={`text-xs font-financial font-bold ${simulationData.scenario_case.risk.score > simulationData.base_case.risk.score ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Risk: {simulationData.scenario_case.risk.score.toFixed(0)}/100 ({simulationData.scenario_case.risk.score - simulationData.base_case.risk.score > 0 ? `+${(simulationData.scenario_case.risk.score - simulationData.base_case.risk.score).toFixed(0)}` : (simulationData.scenario_case.risk.score - simulationData.base_case.risk.score).toFixed(0)} pts)
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Scenario Synthesis */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    AI Scenario Causal Reasoning:
                  </span>
                  <p className="leading-relaxed">{simulationData.ai_scenario_synthesis}</p>
                </div>
              </div>
            )}

            {/* Comparison Matrix Table / Cards */}
            {simulationData && (
              <div className="panel p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Base Case vs. Simulated Scenario Comparison Matrix
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {simulationData.comparison_matrix.map((card, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2"
                    >
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-financial">
                        {card.metric}
                      </span>

                      <div className="space-y-0.5 font-financial">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Base:</span>
                          <span className="text-slate-700 font-semibold">{card.base_value}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-700 font-bold">Scenario:</span>
                          <span className="text-slate-900 font-bold">{card.scenario_value}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-financial">
                        <span className="text-[10px] text-slate-500">Shift:</span>
                        <span
                          className={`text-xs font-bold ${
                            card.impact === 'POSITIVE'
                              ? 'text-emerald-600'
                              : card.impact === 'NEGATIVE'
                              ? 'text-rose-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {card.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
