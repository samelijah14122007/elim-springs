import React, { useState } from 'react';
import { PageHeader } from '../components/common';
import { GeoAgentChat } from '../components/agent/GeoAgentChat';
import { AgentEvidenceTracePanel } from '../components/agent/AgentEvidenceTracePanel';
import { EvidenceChainModal } from '../components/cases/EvidenceChainModal';
import { WatershedCatchment, WatershedStructure, WatershedCase } from '../types';
import { useTranslation } from '../i18n';
import {
  Bot,
  Terminal,
  Sparkles,
  MapPin,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Camera,
  Mic,
  FileCheck,
  Satellite,
  Compass,
} from 'lucide-react';
import { mockGeoImages, mockIvrReports } from '../data/mockData';

interface AgentViewProps {
  catchment: WatershedCatchment;
  structures: WatershedStructure[];
  cases?: WatershedCase[];
  onNavigateToGis?: () => void;
  onNavigateToSatellite?: () => void;
  onNavigateToImages?: () => void;
  onNavigateToIvr?: () => void;
  onNavigateToRag?: () => void;
  onNavigateToCases?: () => void;
}

export const AgentView: React.FC<AgentViewProps> = ({
  catchment,
  structures,
  cases = [],
  onNavigateToGis,
  onNavigateToSatellite,
  onNavigateToImages,
  onNavigateToIvr,
  onNavigateToRag,
  onNavigateToCases,
}) => {
  const { t } = useTranslation();
  const [showEvidenceChain, setShowEvidenceChain] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-es-2026-0842');
  const [activeStructureId, setActiveStructureId] = useState<string>('struct-cd-04');

  const activeStructure =
    structures.find((s) => s.id === activeStructureId) ||
    structures.find((s) => s.id === 'struct-cd-04') ||
    structures[0];

  const activeCase =
    cases.find((c) => c.id === selectedCaseId) ||
    cases.find((c) => c.structureId === activeStructureId) ||
    cases[0];

  const targetPhoto = mockGeoImages.find((img) => img.structureId === activeStructure?.id) || mockGeoImages[0];
  const targetVoice = mockIvrReports.find((r) => r.watershedId === catchment.id) || mockIvrReports[0];

  const handleOpenEvidenceChain = (caseId?: string) => {
    if (caseId) setSelectedCaseId(caseId);
    setShowEvidenceChain(true);
  };

  return (
    <div className="space-y-6 pb-14 animate-fade-in">
      {/* 1. Header with Editorial Kicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3DD]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#075B45] uppercase">
              12 / GEO INTELLIGENCE WORKSPACE
            </span>
            <span className="text-[#DCE3DD] font-mono text-xs">/</span>
            <span className="text-[10px] font-mono text-[#075B45] bg-[#075B45]/10 px-2 py-0.5 rounded border border-[#075B45]/20 font-semibold uppercase">
              SHA-256 AUDIT ENABLED
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17211D] uppercase font-mono leading-tight">
            AI GEO AGENT WORKSPACE
          </h1>

          <p className="text-xs sm:text-sm text-[#66736C] mt-1 max-w-2xl">
            Autonomous multi-tool geospatial reasoner cross-referencing GIS, Sentinel-2 imagery, geo-photos, vernacular voice reports, and DoLR operational guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => handleOpenEvidenceChain()}
            className="px-3.5 py-2 rounded-xl bg-[#075B45]/10 hover:bg-[#075B45]/20 text-[#075B45] border border-[#075B45]/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#075B45]" />
            <span>Audit Trail (SHA-256)</span>
          </button>
        </div>
      </div>

      {/* 2. THREE-COLUMN GEO INTELLIGENCE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUMN 1 (Left 3.5 cols): Map & Selected Evidence */}
        <div className="lg:col-span-3 space-y-4">
          {/* Target Asset Spatial Card */}
          <div className="p-4 rounded-3xl bg-white border border-[#DCE3DD] space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#075B45] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
                <span>SPATIAL CONTEXT</span>
              </span>
              <span className="text-[9px] font-mono text-[#66736C]">TER BASIN</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#17211D] tracking-tight">
                {activeStructure?.name || 'Rui East Check Dam #4'}
              </h3>
              <span className="text-[11px] font-mono text-[#075B45] block font-semibold">
                {activeStructure?.code || 'MH-DHR-2024-CD-04'}
              </span>
            </div>

            {/* Static Spatial Coordinate HUD */}
            <div className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1 text-[10px] font-mono">
              <div className="flex items-center justify-between text-[#66736C]">
                <span>COORDINATES:</span>
                <span className="text-[#17211D] font-bold">18.2392° N, 75.9865° E</span>
              </div>
              <div className="flex items-center justify-between text-[#66736C]">
                <span>STREAM ORDER:</span>
                <span className="text-sky-700 font-bold">Order 3 (Tributary)</span>
              </div>
              <div className="flex items-center justify-between text-[#66736C]">
                <span>EST. SILT LOSS:</span>
                <span className="text-amber-700 font-bold">78% (17,160 m³)</span>
              </div>
            </div>

            {/* Evidence 1: Real Field Photo */}
            {targetPhoto && (
              <div className="p-2.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#66736C] flex items-center gap-1">
                    <Camera className="w-3 h-3 text-amber-600" />
                    <span>GEO-PHOTO EVIDENCE</span>
                  </span>
                  <span className="text-[#075B45] font-bold">EXIF PASSED</span>
                </div>
                <div className="aspect-video w-full rounded-xl overflow-hidden relative border border-[#DCE3DD] bg-black">
                  <img
                    src={targetPhoto.imageUrl}
                    alt={targetPhoto.caption}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-1 right-1 text-[8px] font-mono bg-white/90 text-[#17211D] px-1.5 py-0.5 rounded shadow-xs">
                    SHA-256: 0x48b2...
                  </div>
                </div>
                <p className="text-[10px] text-[#66736C] leading-tight">
                  {targetPhoto.caption}
                </p>
              </div>
            )}

            {/* Evidence 2: Voice Grievance */}
            {targetVoice && (
              <div className="p-2.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1 text-[10px]">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#66736C] flex items-center gap-1">
                    <Mic className="w-3 h-3 text-sky-600" />
                    <span>CITIZEN VOICE (BHASHINI)</span>
                  </span>
                  <span className="text-sky-700 font-bold">MARATHI</span>
                </div>
                <p className="text-[#17211D] font-sans leading-snug">
                  "{targetVoice.englishTranslation}"
                </p>
                <span className="text-[9px] font-mono text-[#66736C] block">
                  Caller: {targetVoice.callerName} • Rui Village
                </span>
              </div>
            )}

            {/* Evidence 3: Signboard OCR */}
            <div className="p-2.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1 text-[10px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#66736C] flex items-center gap-1">
                  <FileCheck className="w-3 h-3 text-purple-600" />
                  <span>SIGNBOARD OCR MATCH</span>
                </span>
                <span className="text-[#075B45] font-bold">96% MATCH</span>
              </div>
              <div className="text-[#17211D]">
                Work Code: <span className="text-[#075B45] font-bold">MH-DHR-2024-CD-04</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 (Center 5.5 cols): Investigation Conversation */}
        <div className="lg:col-span-6">
          <GeoAgentChat
            watershedId={catchment.code}
            initialStructureFocus={activeStructure?.name}
            onOpenEvidenceChain={(caseId) => handleOpenEvidenceChain(caseId)}
            onNavigateToGis={onNavigateToGis}
            onNavigateToSatellite={onNavigateToSatellite}
            onNavigateToImages={onNavigateToImages}
            onNavigateToIvr={onNavigateToIvr}
          />
        </div>

        {/* COLUMN 3 (Right 3 cols): Evidence Trace Execution Log */}
        <div className="lg:col-span-3">
          <AgentEvidenceTracePanel
            onOpenEvidenceChain={() => handleOpenEvidenceChain()}
            activeCaseNumber={activeCase?.caseNumber}
          />
        </div>
      </div>

      {/* Cryptographic Evidence Chain Modal */}
      {showEvidenceChain && (
        <EvidenceChainModal
          watershedCase={activeCase}
          caseNumber={activeCase?.caseNumber || 'ES-2026-0842'}
          caseTitle={activeCase?.title || 'Rui Check Dam #4 Siltation & Storage Impairment'}
          onClose={() => setShowEvidenceChain(false)}
        />
      )}
    </div>
  );
};
