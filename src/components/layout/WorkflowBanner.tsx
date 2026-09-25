import React from 'react';
import {
  User,
  PhoneCall,
  Languages,
  Bot,
  MapPin,
  ShieldCheck,
  FolderGit2,
  CheckCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { NavItemKey } from './Sidebar';

interface WorkflowBannerProps {
  onNavigate: (tab: NavItemKey) => void;
  activeTab?: NavItemKey;
}

export const WorkflowBanner: React.FC<WorkflowBannerProps> = ({ onNavigate, activeTab }) => {
  const steps = [
    {
      id: 'person',
      label: 'PERSON',
      sub: 'Citizen / GRS',
      icon: User,
      targetTab: 'ivr' as NavItemKey,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'input',
      label: 'IVR / GEO-PHOTO',
      sub: 'Voice & EXIF Photo',
      icon: PhoneCall,
      targetTab: 'images' as NavItemKey,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'pipeline',
      label: 'BHASHINI / OCR',
      sub: 'Indic NLP + Vision',
      icon: Languages,
      targetTab: 'ivr' as NavItemKey,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'agent',
      label: 'AI GEO AGENT',
      sub: 'Autonomous Reasoner',
      icon: Bot,
      targetTab: 'agent' as NavItemKey,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    },
    {
      id: 'gis-sat',
      label: 'GIS + SAT + RAG',
      sub: 'Spectral & Norms',
      icon: MapPin,
      targetTab: 'gis' as NavItemKey,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'evidence',
      label: 'EVIDENCE CHAIN',
      sub: 'SHA-256 Audit Log',
      icon: ShieldCheck,
      targetTab: 'cases' as NavItemKey,
      color: 'from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'case',
      label: 'CASE',
      sub: 'Lifecycle Ticket',
      icon: FolderGit2,
      targetTab: 'cases' as NavItemKey,
      color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'verification',
      label: 'FIELD VERIFY',
      sub: 'Signed Ground Audit',
      icon: CheckCircle,
      targetTab: 'cases' as NavItemKey,
      color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'action',
      label: 'ACTION / OUTCOME',
      sub: 'Desiltation & DPR',
      icon: TrendingUp,
      targetTab: 'reports' as NavItemKey,
      color: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30',
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-200 tracking-wide uppercase font-mono">
            Core SIH Intelligence Architecture
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400 italic">
            — "From Field Voices to Watershed Action"
          </span>
        </div>
        <div className="text-[11px] text-emerald-400 font-semibold cursor-pointer hover:underline">
          Click any stage to inspect module →
        </div>
      </div>

      {/* Horizontal Workflow Stepper */}
      <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => onNavigate(step.targetTab)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border bg-gradient-to-b text-center transition-all duration-200 hover:scale-[1.03] group ${step.color}`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] font-mono opacity-70">#{idx + 1}</span>
                <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-[11px] font-extrabold tracking-tight leading-tight line-clamp-1">
                {step.label}
              </div>
              <div className="text-[9px] text-slate-400 font-medium truncate mt-0.5 max-w-[90px]">
                {step.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
