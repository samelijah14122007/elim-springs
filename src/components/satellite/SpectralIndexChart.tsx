import React from 'react';
import { SpectralIndexResult } from '../../types';
import {
  Activity,
  Droplets,
  Leaf,
  Info,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

interface SpectralIndexChartProps {
  analysis: SpectralIndexResult;
  onInspectAnomaly?: (lat: number, lng: number, title: string) => void;
}

export const SpectralIndexChart: React.FC<SpectralIndexChartProps> = ({
  analysis,
  onInspectAnomaly,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Spectral Index Analysis: NDVI & NDWI
            </h3>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
              DEMO / SIMULATED VALUES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sensor: <span className="font-mono text-slate-300">{analysis.sensor}</span> • Cloud Cover:{' '}
            <span className="font-semibold text-emerald-400">{analysis.cloudCoverPct}%</span> • Pass:{' '}
            <span className="font-mono text-slate-300">{analysis.acquisitionDate}</span>
          </p>
        </div>
      </div>

      {/* Grid: Left Column NDVI | Right Column NDWI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ==================== 1. NDVI ANALYSIS PANEL ==================== */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-emerald-500/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Title & Formula */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Leaf className="w-4 h-4" />
                  <span>NDVI (Normalized Difference Vegetation Index)</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Formula: NDVI = (NIR - RED) / (NIR + RED)
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold font-mono text-white block">
                  {analysis.ndvi.mean.toFixed(2)}
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  +{analysis.ndvi.changePct}% vs 2023
                </span>
              </div>
            </div>

            {/* Scientific Explanation */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                NDVI is a vegetation index derived from near-infrared (Band 8) and red (Band 4) reflectance. Chlorophyll absorbs red light for photosynthesis while mesophyll reflects NIR.
              </span>
            </div>

            {/* Before vs After Metric Strip */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Pre-2023 Mean</span>
                <strong className="text-amber-400">{analysis.ndvi.comparisonMean.toFixed(2)}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Post-2025 Mean</span>
                <strong className="text-emerald-400">{analysis.ndvi.mean.toFixed(2)}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Observed Range</span>
                <strong className="text-white">{analysis.ndvi.min} to {analysis.ndvi.max}</strong>
              </div>
            </div>

            {/* 5-Tier Vegetation Health Distribution */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                Vegetation Health Class Distribution
              </span>
              <div className="space-y-2">
                {analysis.ndvi.distribution.map((dist, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: dist.color }}
                        />
                        <span>{dist.category} ({dist.range})</span>
                      </span>
                      <span className="font-mono text-slate-300">
                        {dist.percentage}% ({dist.areaHa} ha)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${dist.percentage}%`,
                          backgroundColor: dist.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Anomaly Areas */}
            {analysis.ndvi.anomalies.length > 0 && (
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Vegetation Stress Anomaly Flagged</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {analysis.ndvi.anomalies.length} Area(s)
                  </span>
                </div>
                {analysis.ndvi.anomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-red-300">{anom.title}</div>
                      <div className="text-[11px] text-slate-400">{anom.notes}</div>
                    </div>
                    {onInspectAnomaly && (
                      <button
                        onClick={() => onInspectAnomaly(anom.lat, anom.lng, anom.title)}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 text-emerald-400 hover:text-white shrink-0 font-medium"
                      >
                        Inspect GIS
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 italic pt-2 border-t border-slate-800/80">
            Simulated demonstration metric for SIH 2026 PS 26015.
          </div>
        </div>

        {/* ==================== 2. NDWI ANALYSIS PANEL ==================== */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-cyan-500/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Title & Formula */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Droplets className="w-4 h-4" />
                  <span>NDWI (Normalized Difference Water Index)</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Formula: NDWI = (GREEN - NIR) / (GREEN + NIR)
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold font-mono text-white block">
                  +{analysis.ndwi.mean.toFixed(2)}
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  +{analysis.ndwi.changePct}% vs 2023
                </span>
              </div>
            </div>

            {/* Scientific Explanation */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                NDWI is used here as a water/moisture-related spectral indicator. Water reflects green light (Band 3) and absorbs near-infrared (Band 8). Positive values (&gt; 0.0) denote open surface water.
              </span>
            </div>

            {/* Before vs After Surface Water Area */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Pre-2023 Water</span>
                <strong className="text-amber-400">{analysis.ndwi.comparisonSurfaceWaterAreaHa} ha</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Post-2025 Water</span>
                <strong className="text-cyan-400">{analysis.ndwi.surfaceWaterAreaHa} ha</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Persistence</span>
                <strong className="text-emerald-400">{analysis.ndwi.seasonalPersistenceMonths} Months</strong>
              </div>
            </div>

            {/* 4-Tier Moisture Distribution */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                Moisture & Water Spread Distribution
              </span>
              <div className="space-y-2">
                {analysis.ndwi.distribution.map((dist, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: dist.color }}
                        />
                        <span>{dist.category} ({dist.range})</span>
                      </span>
                      <span className="font-mono text-slate-300">
                        {dist.percentage}% ({dist.areaHa} ha)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${dist.percentage}%`,
                          backgroundColor: dist.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seasonal Persistence Summary Box */}
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Post-Monsoon Water Spread Gain:</span>
                <span className="font-semibold text-cyan-300 font-mono">
                  +{(analysis.ndwi.surfaceWaterAreaHa - analysis.ndwi.comparisonSurfaceWaterAreaHa).toFixed(1)} ha
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Impoundment Persistence:</span>
                <span className="font-semibold text-emerald-400">
                  Extended to mid-January (+2.4 months)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deep Water Storage:</span>
                <span className="font-semibold text-sky-400">Check dams & percolation tanks</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 italic pt-2 border-t border-slate-800/80">
            Simulated demonstration metric for SIH 2026 PS 26015.
          </div>
        </div>
      </div>
    </div>
  );
};
