'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Building2,
  ChevronDown,
  Layers,
  LogOut,
  MapPin,
  Radio,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  User
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/location-intelligence?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
      {/* Left: Global Search Bar */}
      <form onSubmit={handleSearch} className="relative w-96 hidden md:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search micro-markets (e.g. OMR, Anna Nagar, Adyar)..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-sans"
        />
      </form>

      {/* Right: Live Market Telemetry & Quick Action CTAs */}
      <div className="flex items-center gap-4">
        {/* Market Telemetry Pill */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-financial text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">NHB RESIDEX:</span>
            <span className="text-slate-900 font-semibold">142.8 (+6.4% YoY)</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Repo Rate:</span>
            <span className="text-slate-900 font-semibold">6.50%</span>
          </div>
        </div>

        {/* Quick CTA to Property Analyzer */}
        <Link
          href="/property-analyzer"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <Building2 className="w-4 h-4" />
          <span>New Valuation</span>
        </Link>

        {/* Alerts Link */}
        <Link
          href="/alerts"
          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors relative"
          title="Early Warning Signals"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </Link>

        {/* Investor Profile with Interactive Dropdown */}
        <div className="relative pl-3 border-l border-slate-200">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 font-financial">
              JD
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                <span>Judge Demo</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </p>
              <p className="text-[10px] text-slate-500 font-financial">Portfolio Manager</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-xl p-2 shadow-lg z-50 space-y-1 text-xs animate-in fade-in duration-150">
              <div className="p-2.5 border-b border-slate-100">
                <p className="font-bold text-slate-900">Institutional Investor</p>
                <p className="text-[11px] text-slate-500 font-financial">demo@terrasignal.ai</p>
              </div>

              <Link
                href="/portfolio"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Portfolio Assets</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Risk Calibration</span>
              </Link>

              <Link
                href="/login"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 p-2 rounded-lg text-rose-600 hover:bg-rose-50 border-t border-slate-100 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
