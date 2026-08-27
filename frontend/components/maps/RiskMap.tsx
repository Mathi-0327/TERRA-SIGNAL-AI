'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LocationDetail } from '@/types/api';
import { formatINR, getRiskBadge } from '@/lib/formatting';
import { MapPin, Navigation, Radio, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

interface RiskMapProps {
  locations: LocationDetail[];
  selectedLocationId?: number | null;
  onSelectLocation?: (location: LocationDetail) => void;
  height?: string;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  height = '440px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<LocationDetail | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (selectedLocationId && locations.length > 0) {
      const match = locations.find((l) => l.id === selectedLocationId);
      if (match) setSelectedLoc(match);
    } else if (locations.length > 0 && !selectedLoc) {
      setSelectedLoc(locations[0]);
    }
  }, [selectedLocationId, locations]);

  // Leaflet initialization
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let L: any;
    const initLeaflet = async () => {
      L = (await import('leaflet')).default;

      // Import Leaflet CSS dynamically if not present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [12.98, 80.20],
          zoom: 11,
          zoomControl: false,
        });

        // Use ArcGIS World Light Gray Canvas - free, clean, high performance, zero watermark
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 16,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      // Add custom clean HTML markers
      locations.forEach((loc) => {
        const riskScore = loc.risk_score || 35;
        let colorClass = '#10b981'; // Emerald (Low)
        if (riskScore > 65) {
          colorClass = '#e11d48'; // Rose (Critical)
        } else if (riskScore > 50) {
          colorClass = '#ea580c'; // Orange (High)
        } else if (riskScore > 35) {
          colorClass = '#d97706'; // Amber (Moderate)
        }

        const isSelected = selectedLoc?.id === loc.id;
        const iconHtml = `
          <div style="
            position: relative;
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            background: ${colorClass};
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="color: white; font-size: 11px; font-weight: 700; font-family: sans-serif;">
              ${Math.round(riskScore)}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-marker',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedLoc(loc);
          if (onSelectLocation) onSelectLocation(loc);
        });

        markersRef.current.push(marker);
      });
    };

    initLeaflet();

    return () => {
      // clean up on unmount if needed
    };
  }, [isClient, locations, selectedLoc, onSelectLocation]);

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm" style={{ height }}>
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Legend */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-lg text-xs space-y-1.5 shadow-md">
        <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
          <span>Micro-Market Risk Radar</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-financial">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">0–35 (Low Risk)</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-financial">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-600">36–50 (Moderate)</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-financial">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-slate-600">51–65 (High Risk)</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-financial">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-600">&gt;65 (Critical Stress)</span>
        </div>
      </div>

      {/* Selected Micro-Market Overlay Card */}
      {selectedLoc && (
        <div className="absolute bottom-3 left-3 right-3 lg:left-auto lg:right-3 lg:w-96 z-[1000] bg-white border border-slate-200 p-4 rounded-xl shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">{selectedLoc.name}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold font-financial ${getRiskBadge(selectedLoc.risk_level).bg}`}>
                  {selectedLoc.risk_score ? `${selectedLoc.risk_score.toFixed(0)} / 100` : 'Evaluated'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedLoc.zone || 'Chennai Metro'}</p>
            </div>
            {selectedLoc.anomaly_signal !== 'NONE' && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-financial">
                <Radio className="w-3 h-3 text-rose-600" />
                <span>ALERT</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center font-financial">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Base Rate</span>
              <span className="text-xs font-bold text-slate-800">{formatINR(selectedLoc.base_price_sqft)}/sqft</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">1Y Growth</span>
              <span className={`text-xs font-bold ${selectedLoc.price_growth_1y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {selectedLoc.price_growth_1y > 0 ? `+${selectedLoc.price_growth_1y}%` : `${selectedLoc.price_growth_1y}%`}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Yield</span>
              <span className="text-xs font-bold text-blue-600">{selectedLoc.rental_yield}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
            {selectedLoc.summary}
          </p>

          <div className="mt-3 flex items-center justify-between font-financial">
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Demand: <strong className="text-slate-800">{selectedLoc.demand_index}</strong></span>
              <span>Supply: <strong className="text-slate-800">{selectedLoc.supply_index}</strong></span>
              <span>Selling: <strong className="text-slate-800">{selectedLoc.selling_days}d</strong></span>
            </div>
            
            <Link
              href={`/location-intelligence?search=${encodeURIComponent(selectedLoc.name)}`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 font-sans bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-100"
            >
              <span>View Details</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
