'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Building2,
  Compass,
  Database,
  FileText,
  HelpCircle,
  Home,
  Layers,
  MapPin,
  Radio,
  Scale,
  Settings,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';

const NAV_ITEMS = [
  {
    category: 'CORE INTELLIGENCE',
    items: [
      { name: 'Executive Dashboard', href: '/dashboard', icon: Home, badge: 'LIVE' },
      { name: 'Property Valuation Engine', href: '/property-analyzer', icon: Building2, highlight: true },
      { name: 'Scenario Stress Simulator', href: '/scenario-simulator', icon: Zap },
      { name: 'AI Decision Analyst', href: '/ai-analyst', icon: Bot, badge: 'RAG' },
    ],
  },
  {
    category: 'SPATIAL & MACRO RADAR',
    items: [
      { name: 'Location Intelligence', href: '/location-intelligence', icon: MapPin },
      { name: 'Geospatial Risk Radar', href: '/risk-radar', icon: ShieldAlert },
      { name: 'Opportunity Radar', href: '/opportunity-radar', icon: Compass },
      { name: 'Early Warning Advisories', href: '/alerts', icon: Radio, alertCount: 2 },
      { name: 'Macro Time-Series', href: '/market-intelligence', icon: BarChart3 },
    ],
  },
  {
    category: 'PORTFOLIO & GOVERNANCE',
    items: [
      { name: 'Investment Dossiers', href: '/reports', icon: FileText },
      { name: 'Portfolio Exposure', href: '/portfolio', icon: Layers },
      { name: 'Model Card & Governance', href: '/admin', icon: Database },
      { name: 'Risk Weight Calibration', href: '/settings', icon: Sliders },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold">
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">
                TerraSignal
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-financial">AI</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Decision Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-none">
        {NAV_ITEMS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 font-financial">
              {section.category}
            </h4>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-blue-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-financial border ${
                          isActive
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.alertCount && (
                      <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold flex items-center justify-center font-financial">
                        {item.alertCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Telemetry Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-slate-800 font-financial">
                Chennai Q2-2026
              </span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-financial">
              v2.4 GB
            </span>
          </div>

          <div className="text-[10px] text-slate-500 font-financial flex justify-between">
            <span>Accuracy: <strong className="text-slate-800">98.7% R²</strong></span>
            <span>Latency: <strong className="text-emerald-600">24ms</strong></span>
          </div>
        </div>
      </div>
    </aside>
  );
};
