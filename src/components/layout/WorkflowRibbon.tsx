import React from 'react';
import {
  Mic,
  Eye,
  Bot,
  FolderGit2,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { NavItemKey } from './Sidebar';

export type WorkflowStageKey = 'VOICE' | 'EVIDENCE' | 'ANALYSIS' | 'CASE' | 'VERIFICATION' | 'ACTION';

interface WorkflowRibbonProps {
  activeTab: NavItemKey;
  onNavigateStage: (tab: NavItemKey) => void;
  isDemoModeActive?: boolean;
}

export const WorkflowRibbon: React.FC<WorkflowRibbonProps> = ({
  activeTab,
  onNavigateStage,
  isDemoModeActive = false,
}) => {
  // Determine active stage from current tab
  const getActiveStage = (): WorkflowStageKey => {
    switch (activeTab) {
      case 'ivr':
        return 'VOICE';
      case 'images':
        return 'EVIDENCE';
      case 'gis':
      case 'satellite':
      case 'agent':
      case 'rag':
        return 'ANALYSIS';
      case 'cases':
        return 'CASE';
      case 'fieldVerification':
        return 'VERIFICATION';
      case 'reports':
        return 'ACTION';
      default:
        return 'ANALYSIS';
    }
  };

  const currentStage = getActiveStage();

  const stages: Array<{
    key: WorkflowStageKey;
    label: string;
    targetTab: NavItemKey;
    icon: React.ElementType;
    desc: string;
  }> = [
    { key: 'VOICE', label: 'VOICE', targetTab: 'ivr', icon: Mic, desc: 'Bhashini IVR' },
    { key: 'EVIDENCE', label: 'EVIDENCE', targetTab: 'images', icon: Eye, desc: 'Geo-Photo & OCR' },
    { key: 'ANALYSIS', label: 'ANALYSIS', targetTab: 'agent', icon: Bot, desc: 'GIS & AI Geo Agent' },
    { key: 'CASE', label: 'CASE', targetTab: 'cases', icon: FolderGit2, desc: 'Priority Dispatch' },
    { key: 'VERIFICATION', label: 'VERIFICATION', targetTab: 'cases', icon: UserCheck, desc: 'Ground Truth Audit' },
    { key: 'ACTION', label: 'ACTION', targetTab: 'reports', icon: CheckCircle2, desc: 'DPR & Work Order' },
  ];

  return (
    <div className="bg-white border-b border-[#DCE3DD] px-4 py-2 flex items-center justify-between gap-3 text-xs font-mono shadow-xs">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider">
          Evidence Continuum:
        </span>
      </div>

      <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {stages.map((st, idx) => {
          const isActive = currentStage === st.key;
          const Icon = st.icon;

          return (
            <React.Fragment key={st.key}>
              <button
                type="button"
                onClick={() => onNavigateStage(st.targetTab)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/30 shadow-xs font-bold scale-[1.02]'
                    : 'text-[#66736C] hover:text-[#17211D] hover:bg-[#F0F3EE] border border-transparent'
                }`}
                title={`Navigate to ${st.desc}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#075B45]' : 'text-[#66736C]'}`} />
                <span className="text-[11px] font-bold">{st.label}</span>
              </button>

              {idx < stages.length - 1 && (
                <ChevronRight className="w-3 h-3 text-[#DCE3DD] shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center gap-2 shrink-0 text-[10px] text-[#66736C]">
        {isDemoModeActive ? (
          <span className="flex items-center gap-1 text-[#075B45] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>DEMO MODE ACTIVE</span>
          </span>
        ) : (
          <span>SIH PS 26015</span>
        )}
      </div>
    </div>
  );
};
