import React, { useState } from 'react';
import { useTranslation, useLanguage } from '../../i18n';
import { LanguageSelectorModal, DataSourcesModal } from '../common';
import {
  Map,
  Camera,
  Mic,
  Satellite,
  Bot,
  BookOpen,
  ShieldCheck,
  FileBarChart,
  LayoutDashboard,
  Home,
  Waves,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  CheckCircle2,
  FileCheck,
  UserCheck2,
  Globe,
  Droplets,
  Database,
} from 'lucide-react';

export type NavItemKey =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'gis'
  | 'water'
  | 'images'
  | 'ivr'
  | 'satellite'
  | 'agent'
  | 'rag'
  | 'cases'
  | 'fieldVerification'
  | 'reports';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  alertCounts: {
    criticalCases: number;
    unverifiedImages: number;
    pendingCalls: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  alertCounts,
}) => {
  const { t } = useTranslation();
  const { languageInfo } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDataSourcesModal, setShowDataSourcesModal] = useState(false);

  const navItems = [
    {
      key: 'dashboard' as NavItemKey,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: 'Command',
      badgeColor: 'bg-emerald-50 text-[#075B45] border-emerald-200',
    },
    {
      key: 'gis' as NavItemKey,
      label: 'Watershed Map',
      icon: Map,
      badge: 'Bhuvan GIS',
      badgeColor: 'bg-emerald-50 text-[#075B45] border-emerald-200',
    },
    {
      key: 'water' as NavItemKey,
      label: 'Water Intelligence',
      icon: Droplets,
      badge: 'YoY +14%',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      key: 'satellite' as NavItemKey,
      label: 'Satellite Intelligence',
      icon: Satellite,
      badge: 'Sentinel-2',
      badgeColor: 'bg-sky-50 text-[#1677A8] border-sky-200',
    },
    {
      key: 'images' as NavItemKey,
      label: 'Field Evidence',
      icon: Camera,
      badge: alertCounts.unverifiedImages > 0 ? `${alertCounts.unverifiedImages} new` : 'OCR / EXIF',
      badgeColor:
        alertCounts.unverifiedImages > 0
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-emerald-50 text-[#075B45] border-emerald-200',
    },
    {
      key: 'ivr' as NavItemKey,
      label: 'Community Voice',
      icon: Mic,
      badge: alertCounts.pendingCalls > 0 ? `${alertCounts.pendingCalls} calls` : 'Bhashini',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      key: 'agent' as NavItemKey,
      label: 'AI Geo Agent',
      icon: Bot,
      badge: 'Reasoning',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      key: 'rag' as NavItemKey,
      label: 'Knowledge',
      icon: BookOpen,
      badge: 'DoLR / RAG',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      key: 'cases' as NavItemKey,
      label: 'Evidence Cases',
      icon: ShieldCheck,
      badge: alertCounts.criticalCases > 0 ? `${alertCounts.criticalCases} crit` : 'Active',
      badgeColor:
        alertCounts.criticalCases > 0
          ? 'bg-rose-50 text-[#B42318] border-rose-200'
          : 'bg-emerald-50 text-[#075B45] border-emerald-200',
    },
    {
      key: 'fieldVerification' as NavItemKey,
      label: 'Field Verification',
      icon: UserCheck2,
      badge: 'Ground Truth',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      key: 'reports' as NavItemKey,
      label: 'Reports',
      icon: FileBarChart,
      badge: 'DPR Engine',
      badgeColor: 'bg-emerald-50 text-[#075B45] border-emerald-200',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-[#DCE3DD] transition-all duration-300 ease-in-out select-none z-30 shadow-sm ${
        collapsed ? 'w-[68px]' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#DCE3DD]">
        <div
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          title="ELIM SPRINGS — Watershed Intelligence"
        >
          <div className="w-9 h-9 rounded-xl bg-[#075B45] flex items-center justify-center shadow-sm border border-[#075B45]/20 group-hover:scale-105 transition-all flex-shrink-0">
            <Waves className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold tracking-tight text-[15px] text-[#17211D] leading-none font-mono flex items-center gap-1.5">
                ELIM SPRINGS
              </span>
              <span className="text-[10px] text-[#075B45] font-mono tracking-wider uppercase mt-1 font-semibold truncate">
                WATERSHED INTELLIGENCE
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-[#F0F3EE] hover:bg-[#E3E8E1] text-[#075B45] hover:text-[#17211D] transition-colors border border-[#DCE3DD] cursor-pointer flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!collapsed ? (
          <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#66736C] font-mono">
            WORKSPACE
          </div>
        ) : (
          <div className="h-2" />
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 group relative text-left cursor-pointer ${
                isActive
                  ? 'bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/30 font-bold shadow-sm'
                  : 'text-[#66736C] hover:text-[#17211D] hover:bg-[#F0F3EE] border border-transparent'
              }`}
            >
              {/* Active Indicator Accent */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#075B45]" />
              )}

              <div
                className={`p-1.5 rounded-lg transition-all duration-150 flex-shrink-0 ${
                  isActive
                    ? 'bg-[#075B45]/15 text-[#075B45]'
                    : 'bg-[#F0F3EE] text-[#66736C] group-hover:text-[#075B45] group-hover:bg-[#E3E8E1]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                  <span className="truncate leading-tight font-sans">{item.label}</span>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0 whitespace-nowrap ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* 23-Indian-Language Selector Bar in Sidebar */}
      {!collapsed ? (
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowLanguageModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F0F3EE] hover:bg-[#E3E8E1] border border-[#DCE3DD] text-[11px] text-[#17211D] transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-[#075B45] group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-semibold truncate text-[#17211D]">
                {languageInfo.nativeName} ({languageInfo.name})
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-[#075B45] border border-[#DCE3DD] uppercase font-bold">
              23 LANG
            </span>
          </button>
        </div>
      ) : (
        <div className="px-2 pb-2 flex justify-center">
          <button
            onClick={() => setShowLanguageModal(true)}
            className="p-2 rounded-xl bg-[#F0F3EE] hover:bg-[#E3E8E1] border border-[#DCE3DD] text-[#075B45] transition-all cursor-pointer"
            title={`Language: ${languageInfo.nativeName} (${languageInfo.name})`}
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Institutional Data Sources & Provenance Button */}
      {!collapsed ? (
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowDataSourcesModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-[#F0F3EE] border border-[#DCE3DD] text-[11px] text-[#17211D] transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center gap-2 truncate">
              <Database className="w-3.5 h-3.5 text-[#1677A8] group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-semibold truncate text-[#17211D]">Data Sources</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F0F3EE] text-[#1677A8] border border-[#DCE3DD] uppercase font-bold">
              CATALOG
            </span>
          </button>
        </div>
      ) : (
        <div className="px-2 pb-2 flex justify-center">
          <button
            onClick={() => setShowDataSourcesModal(true)}
            className="p-2 rounded-xl bg-white hover:bg-[#F0F3EE] border border-[#DCE3DD] text-[#1677A8] transition-all cursor-pointer"
            title="Authoritative Data Sources & Transparency Catalog"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer Prototype Stamp */}
      <div className="px-4 py-3.5 border-t border-[#DCE3DD] bg-[#F7F8F4]">
        {!collapsed ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#075B45]">
                PROTOTYPE ENVIRONMENT
              </span>
              <span className="w-2 h-2 rounded-full bg-[#075B45] animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-[#66736C] flex items-center justify-between">
              <span>SIH 2026</span>
              <span className="text-[#DCE3DD]">•</span>
              <span className="text-[#075B45] font-semibold">PS 26015</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-[#075B45] animate-pulse" title="SIH 2026 • PS 26015" />
          </div>
        )}
      </div>

      <LanguageSelectorModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

      <DataSourcesModal
        isOpen={showDataSourcesModal}
        onClose={() => setShowDataSourcesModal(false)}
      />
    </aside>
  );
};
