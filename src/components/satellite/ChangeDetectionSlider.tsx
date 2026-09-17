import React, { useState } from 'react';
import { ChangeDetectionRecord } from '../../types';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  Droplets,
  Leaf,
  ShieldAlert,
  ArrowRight,
  Split,
  Eye,
  ExternalLink,
  MapPin,
  AlertTriangle,
  Compass,
} from 'lucide-react';

interface ChangeDetectionSliderProps {
  data: ChangeDetectionRecord;
  onInspectAnomaly?: (lat: number, lng: number, title: string) => void;
}

// 2023 Pre-Intervention Geospatial Remote-Sensing SVG Canvas
const Baseline2023Canvas: React.FC<{ ndvi: number; waterHa: number }> = ({ ndvi, waterHa }) => (
  <svg className="w-full h-full" viewBox="0 0 800 450" preserveAspectRatio="none">
    <defs>
      <linearGradient id="base2023Grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3d3527" />
        <stop offset="35%" stopColor="#4f412c" />
        <stop offset="70%" stopColor="#453825" />
        <stop offset="100%" stopColor="#2c2419" />
      </linearGradient>
      <pattern id="fallowGrid" width="60" height="40" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 40" fill="none" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="0.8" />
      </pattern>
    </defs>
    {/* Base Dry Fallow Terrain */}
    <rect width="800" height="450" fill="url(#base2023Grad)" />
    <rect width="800" height="450" fill="url(#fallowGrid)" />

    {/* Sparse Dry Scrub Patches */}
    <ellipse cx="140" cy="180" rx="35" ry="20" fill="#525c38" opacity="0.4" />
    <ellipse cx="680" cy="120" rx="45" ry="22" fill="#525c38" opacity="0.35" />

    {/* Dry Eroded Gully Bed */}
    <path d="M 220 80 Q 280 140 360 210 T 520 270" fill="none" stroke="#785c37" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
    <path d="M 50 40 Q 140 90 220 130 T 360 210" fill="none" stroke="#785c37" strokeWidth="4" opacity="0.7" />

    {/* Faint Ephemeral Drainage Line */}
    <path d="M 360 210 Q 440 225 500 235 T 700 270" fill="none" stroke="#0284c7" strokeWidth="1.5" opacity="0.4" strokeDasharray="4,4" />

    {/* Tiny Degraded Water Puddle (14.8 ha) */}
    <ellipse cx="490" cy="235" rx="30" ry="12" fill="#0369a1" opacity="0.6" stroke="#38bdf8" strokeWidth="1" />

    {/* Pre-Intervention Contour Lines */}
    <g fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8">
      <path d="M 0 100 Q 250 130 500 90 T 800 120" />
      <path d="M 0 220 Q 300 240 550 200 T 800 230" />
      <path d="M 0 340 Q 350 360 600 320 T 800 350" />
    </g>

    {/* Metadata Stamp */}
    <text x="25" y="425" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
      [2023 BASELINE] NDVI: {ndvi} • Water Spread: {waterHa} ha • Sparse Rainfed Fallow
    </text>
  </svg>
);

// 2025 Post-Intervention Geospatial Remote-Sensing SVG Canvas
const Outcome2025Canvas: React.FC<{ ndvi: number; waterHa: number }> = ({ ndvi, waterHa }) => (
  <svg className="w-full h-full" viewBox="0 0 800 450" preserveAspectRatio="none">
    <defs>
      <linearGradient id="post2025Grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14361e" />
        <stop offset="35%" stopColor="#1e4620" />
        <stop offset="70%" stopColor="#22542a" />
        <stop offset="100%" stopColor="#102e18" />
      </linearGradient>
      <pattern id="cropGrid" width="60" height="40" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 40" fill="none" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="0.8" />
      </pattern>
    </defs>
    {/* Base Vegetative Canopy Surface */}
    <rect width="800" height="450" fill="url(#post2025Grad)" />
    <rect width="800" height="450" fill="url(#cropGrid)" />

    {/* Continuous Contour Trenches (CCT) on Upper Ridge */}
    <g stroke="#10b981" strokeWidth="2" strokeDasharray="12,6" opacity="0.85">
      <path d="M 40 85 Q 160 110 320 85 T 600 80" fill="none" />
      <path d="M 50 120 Q 180 145 350 120 T 640 115" fill="none" />
      <path d="M 60 155 Q 200 180 380 155 T 680 150" fill="none" />
    </g>

    {/* Vegetative Buffer Strips (Double Cropping) */}
    <rect x="80" y="240" width="160" height="80" fill="#059669" opacity="0.6" rx="6" />
    <rect x="280" y="260" width="180" height="110" fill="#10b981" opacity="0.5" rx="6" />
    <rect x="520" y="240" width="160" height="90" fill="#047857" opacity="0.65" rx="6" />

    {/* Perennial Stream Flow (Strahler Order 3) */}
    <path d="M 50 40 Q 140 90 220 130 T 360 210" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
    <path d="M 360 210 Q 420 220 480 230 T 700 270" fill="none" stroke="#0284c7" strokeWidth="3.5" />

    {/* Full Water Storage Impoundment Basin (43.5 ha) */}
    <ellipse cx="490" cy="230" rx="75" ry="32" fill="#0284c7" opacity="0.9" stroke="#38bdf8" strokeWidth="2" />

    {/* Check Dam Structure Wall */}
    <line x1="550" y1="205" x2="556" y2="255" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
    <circle cx="553" cy="230" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />

    {/* Metadata Stamp */}
    <text x="25" y="425" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold">
      [2025 OUTCOME] NDVI: {ndvi} • Water Spread: {waterHa} ha • 4 CCTs + Full Reservoir
    </text>
  </svg>
);

export const ChangeDetectionSlider: React.FC<ChangeDetectionSliderProps> = ({
  data,
  onInspectAnomaly,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Temporal Change Detection & Multi-Spectral Differential
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 font-bold uppercase">
              Sentinel-2 MSI 10m L2A
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparing Pre-Intervention baseline (2023) with Post-Intervention vegetative recovery & water retention (2025)
          </p>
        </div>

        {/* View Mode Toggle & Dates */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('slider')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'slider'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Split Slider</span>
            </button>
            <button
              onClick={() => setViewMode('sideBySide')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'sideBySide'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span className="text-slate-300">2023 Baseline</span>
            </div>
            <span className="text-slate-600">⇆</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span className="text-slate-300">2025 Outcome</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Area: Slider or Side-by-Side */}
      {viewMode === 'slider' ? (
        <div className="space-y-2">
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden select-none border border-slate-700 shadow-2xl group">
            {/* Baseline (Time A: 2023) Canvas */}
            <div className="absolute inset-0">
              <Baseline2023Canvas ndvi={data.timeA.ndviMean} waterHa={data.timeA.surfaceWaterAreaHa} />
            </div>
            <div className="absolute top-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-xs font-semibold text-amber-300 shadow">
              {data.timeA.label} • Mean NDVI: {data.timeA.ndviMean}
            </div>

            {/* Post-Intervention (Time B: 2025) Clipped Overlay Canvas */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <Outcome2025Canvas ndvi={data.timeB.ndviMean} waterHa={data.timeB.surfaceWaterAreaHa} />
              <div className="absolute top-4 right-4 z-10 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-semibold text-emerald-300 shadow">
                {data.timeB.label} • Mean NDVI: {data.timeB.ndviMean}
              </div>
            </div>

            {/* Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl font-bold text-xs">
                ↔
              </div>
            </div>

            {/* Hidden range input over entire canvas */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              title="Drag left or right to compare temporal satellite imagery"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>← Slide left to view 2025 post-intervention greening & full water impoundment</span>
            <span className="font-mono text-emerald-400 font-semibold">{sliderPos}% Temporal Split</span>
            <span>Slide right to view 2023 pre-intervention dry baseline →</span>
          </div>
        </div>
      ) : (
        /* Side by Side View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl h-84">
            <Baseline2023Canvas ndvi={data.timeA.ndviMean} waterHa={data.timeA.surfaceWaterAreaHa} />
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-xs font-semibold text-amber-300">
              {data.timeA.label} (NDVI: {data.timeA.ndviMean})
            </div>
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl text-xs text-slate-300 font-mono">
              Surface Water: {data.timeA.surfaceWaterAreaHa} ha • NDWI: {data.timeA.ndwiMean}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 shadow-xl h-84">
            <Outcome2025Canvas ndvi={data.timeB.ndviMean} waterHa={data.timeB.surfaceWaterAreaHa} />
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-semibold text-emerald-300">
              {data.timeB.label} (NDVI: {data.timeB.ndviMean})
            </div>
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl text-xs text-slate-300 font-mono">
              Surface Water: {data.timeB.surfaceWaterAreaHa} ha • NDWI: {data.timeB.ndwiMean}
            </div>
          </div>
        </div>
      )}

      {/* Quantitative Impact Metric Cards with Neutral Phrasing */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-500/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Leaf className="w-4 h-4" />
            <span>Observed Vegetation Difference</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            +{data.deltaMetrics.vegetationGrowthPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Mean NDVI index shifted from {data.timeA.ndviMean} to {data.timeB.ndviMean}
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <Droplets className="w-4 h-4" />
            <span>Water Retention Gain</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            +{data.deltaMetrics.waterStorageGainCuM.toLocaleString()} m³
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Surface spread expanded by +{(data.timeB.surfaceWaterAreaHa - data.timeA.surfaceWaterAreaHa).toFixed(1)} ha
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Soil Loss Mitigation (RUSLE)</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {data.deltaMetrics.soilErosionReductionPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Due to CCT ridges and continuous vegetative contour buffers
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-purple-500/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Canopy Biomass Density</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            +{data.deltaMetrics.biomassDensityDeltaPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Estimated dry matter index across drainage buffer zones
          </div>
        </div>
      </div>

      {/* Anomalies Detected */}
      {data.anomalies && data.anomalies.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Detected Change Anomalies & Priority Ground Check Locations
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {data.anomalies.length} anomaly locations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.anomalies.map((anom) => (
              <div
                key={anom.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2 text-xs transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-200">{anom.title}</div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      anom.severity === 'Critical'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {anom.severity}
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">{anom.notes}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    [{anom.lat.toFixed(4)}, {anom.lng.toFixed(4)}]
                  </span>
                  {onInspectAnomaly && (
                    <button
                      onClick={() => onInspectAnomaly(anom.lat, anom.lng, anom.title)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <span>Cross-verify with Ground Photo</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
