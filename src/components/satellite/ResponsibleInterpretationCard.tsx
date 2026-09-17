import React from 'react';
import { ShieldCheck, ArrowRight, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';

interface ResponsibleInterpretationCardProps {
  watershedName: string;
  interpretationText?: string;
}

export const ResponsibleInterpretationCard: React.FC<ResponsibleInterpretationCardProps> = ({
  watershedName,
  interpretationText,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            Responsible Earth Observation Interpretation & Evidence Protocol
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold">
          SIH PS 26015 Standard
        </span>
      </div>

      {/* The Central ELIM SPRINGS Evidence Pipeline Flow */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Evidence Chain Workflow Protocol
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">STEP 1</span>
            <strong className="text-slate-200 block mt-0.5">Watershed GIS</strong>
            <span className="text-[9px] text-slate-400">Location</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">STEP 2</span>
            <strong className="text-emerald-400 block mt-0.5">Sentinel-2</strong>
            <span className="text-[9px] text-slate-400">Observation</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">STEP 3</span>
            <strong className="text-cyan-400 block mt-0.5">NDVI / NDWI</strong>
            <span className="text-[9px] text-slate-400">Spectral Index</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">STEP 4</span>
            <strong className="text-purple-400 block mt-0.5">LULC</strong>
            <span className="text-[9px] text-slate-400">Thematic Class</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">STEP 5</span>
            <strong className="text-amber-400 block mt-0.5">Change Delta</strong>
            <span className="text-[9px] text-slate-400">Differential</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">STEP 6</span>
            <strong className="text-sky-400 block mt-0.5">Field Photo</strong>
            <span className="text-[9px] text-slate-400">Geo-Evidence</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
            <span className="text-[10px] text-emerald-400 block font-mono">STEP 7</span>
            <strong className="text-white block mt-0.5">Verification</strong>
            <span className="text-[9px] text-emerald-300">Action / Sign-off</span>
          </div>
        </div>
      </div>

      {/* Responsible Policy Guidance Banner */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Scientific Neutrality Notice: Observations vs Proof</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {interpretationText ||
            `Vegetation index values show an observed spatial difference in ${watershedName} between the selected observation dates. Remote-sensing observations represent multi-spectral indicators of temporal change and must NOT be interpreted as unilateral proof of physical asset damage or confirmed structural recovery without ground truth verification.`}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>"Observed vegetation index difference"</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>"Potential anomaly detected"</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>"Field verification required"</span>
          </span>
        </div>
      </div>
    </div>
  );
};
