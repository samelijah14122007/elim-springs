import React from 'react';
import {
  Terminal,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Satellite,
  Camera,
  Mic,
  FileCheck,
  BookOpen,
  Lock,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface AgentEvidenceTracePanelProps {
  onOpenEvidenceChain: () => void;
  activeCaseNumber?: string;
}

export const AgentEvidenceTracePanel: React.FC<AgentEvidenceTracePanelProps> = ({
  onOpenEvidenceChain,
  activeCaseNumber = 'ES-2026-0842',
}) => {
  const traceSteps = [
    {
      step: '01',
      name: 'QUERY GIS',
      tool: 'gis_spatial_query',
      desc: 'Queried PostGIS layer for structure MH-DHR-2024-CD-04 on 3rd-order tributary.',
      status: 'SUCCESS',
      latency: '42ms',
      icon: Layers,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      step: '02',
      name: 'FETCH SATELLITE DATA',
      tool: 'sentinel_multispectral_fetch',
      desc: 'Sampled Sentinel-2 MSI L2A surface reflectance: NDWI drop from +0.38 to +0.08.',
      status: 'ANOMALY DETECTED',
      latency: '180ms',
      icon: Satellite,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      step: '03',
      name: 'FIND FIELD PHOTOS',
      tool: 'exif_integrity_filter',
      desc: 'Extracted 2 uploaded JPGs within 25m buffer. GPS EXIF integrity verified, hash locked.',
      status: 'VERIFIED',
      latency: '65ms',
      icon: Camera,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      step: '04',
      name: 'READ VOICE REPORT',
      tool: 'bhashini_asr_query',
      desc: 'Retrieved call #1082 (Marathi): citizen reported silt infilling and dried borewells.',
      status: 'TRANSLATED',
      latency: '95ms',
      icon: Mic,
      color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    },
    {
      step: '05',
      name: 'RUN OCR',
      tool: 'tesseract_signboard_ocr',
      desc: 'Signboard plaque OCR matched work code MH-DHR-2024-CD-04 with 96% confidence.',
      status: 'REGISTRY MATCH',
      latency: '110ms',
      icon: FileCheck,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    {
      step: '06',
      name: 'SEARCH KNOWLEDGE',
      tool: 'pmksy_guideline_rag',
      desc: 'Retrieved PMKSY-WDC 2.0 Sec 4.3 (>40% de-siltation threshold) and MoJS norms.',
      status: 'FOUND',
      latency: '78ms',
      icon: BookOpen,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    },
    {
      step: '07',
      name: 'BUILD EVIDENCE CHAIN',
      tool: 'sha256_audit_commit',
      desc: 'Committed cryptographic SHA-256 block linking all 6 evidence hashes.',
      status: 'COMMITTED',
      latency: '15ms',
      icon: Lock,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
  ];

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            EVIDENCE TRACE LOG
          </span>
        </div>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
          7 TOOLS EXECUTED
        </span>
      </div>

      {/* Execution Stepper */}
      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
        {traceSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.step}
              className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500">
                    {step.step}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-white">
                    {step.name}
                  </span>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${step.color}`}>
                  {step.status}
                </span>
              </div>

              <div className="text-[10px] font-mono text-slate-500">
                tool: <span className="text-slate-400">{step.tool}</span> • {step.latency}
              </div>

              <p className="text-[11px] text-slate-300 leading-snug font-sans">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Cryptographic Commit Action */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenEvidenceChain}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono transition-all cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>INSPECT SHA-256 EVIDENCE CHAIN</span>
        </button>

        {/* Advisory Warning */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-[10px] text-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Advisory Notice:</strong> AI synthesizes evidence for decision support. Physical sounding rod field ground audit is required before fund release.
          </p>
        </div>
      </div>
    </div>
  );
};
