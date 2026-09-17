import React from 'react';
import { SatelliteObservationMetadata } from '../../types';
import { Satellite, Globe, Sun, Layers, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ObservationMetadataCardProps {
  metadata: SatelliteObservationMetadata;
}

export const ObservationMetadataCard: React.FC<ObservationMetadataCardProps> = ({ metadata }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{metadata.sensor}</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {metadata.level}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Coverage: {metadata.watershedName} ({metadata.watershedCode}) • {metadata.spatialCoverageHa.toLocaleString()} ha
            </p>
          </div>
        </div>

        {/* Demo Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>DEMO / SIMULATED REMOTE-SENSING DATA</span>
          </span>
        </div>
      </div>

      {/* Acquisition Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 block font-medium">Observation Date</span>
          <strong className="text-white text-xs">{metadata.observationDate}</strong>
          <span className="text-[9px] text-slate-500 block font-sans">Post-Intervention</span>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 block font-medium">Comparison Date</span>
          <strong className="text-amber-300 text-xs">{metadata.comparisonDate}</strong>
          <span className="text-[9px] text-slate-500 block font-sans">Pre-Intervention Baseline</span>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 block font-medium">Cloud Cover</span>
          <strong className="text-emerald-400 text-xs">{metadata.cloudCoverPct}%</strong>
          <span className="text-[9px] text-slate-500 block font-sans">Clear Atmospheric Pass</span>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 block font-medium">Spatial Resolution</span>
          <strong className="text-sky-400 text-xs">{metadata.spatialResolutionM}m Ground GSD</strong>
          <span className="text-[9px] text-slate-500 block font-sans">Bands 2, 3, 4, 8</span>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 block font-medium">Orbit Pass</span>
          <strong className="text-slate-200 text-xs">{metadata.orbitPass}</strong>
          <span className="text-[9px] text-slate-500 block font-sans">Sun Azimuth {metadata.sunAzimuthAngleDeg}°</span>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 block font-medium">Processing Status</span>
          <strong className="text-purple-300 text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
            <span>{metadata.processingStatus}</span>
          </strong>
          <span className="text-[9px] text-slate-500 block font-sans">Simulated L2A BOA</span>
        </div>
      </div>
    </div>
  );
};
