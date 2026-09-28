import React from 'react';
import { EvidenceContext } from '../../types';
import {
  Sparkles,
  MapPin,
  Camera,
  PhoneCall,
  Satellite,
  ExternalLink,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface EvidenceContextBannerProps {
  context: EvidenceContext;
  onSelectScenario: (scenarioIndex: number) => void;
  activeScenarioIndex: number;
  onNavigateToGis?: (structureId?: string) => void;
  onNavigateToImages?: () => void;
  onNavigateToIvr?: () => void;
}

export const PRESET_RAG_SCENARIOS: {
  title: string;
  query: string;
  context: EvidenceContext;
}[] = [
  {
    title: 'Scenario 1: Check Dam Silt Depletion',
    query: 'What should be checked when a check dam shows heavy silt accumulation?',
    context: {
      assetId: 'struct-cd-04',
      assetName: 'Rui East Cement Nala Bund #4',
      assetType: 'Check Dam',
      issue: 'Severe silt accumulation exceeding 70% storage capacity',
      voiceReportId: 'ivr-call-1082',
      voiceReportSnippet:
        'Tukaram Shinde: "Check dam #4 is completely choked with silt. Rain runoff simply washes over without recharging open borewells."',
      voiceCallerRole: 'Citizen (Farmer)',
      geoPhotoId: 'img-rui-001',
      satelliteAnomalyId: 'anom-dhr-01',
      watershedId: 'ws-dharashiv-ter',
      watershedName: 'Upper Sina - Ter (Dharashiv)',
      locationDescription: 'Rui Stream Order 3',
    },
  },
  {
    title: 'Scenario 2: Artificial Recharge & Percolation Tank',
    query: 'What should be verified for artificial groundwater recharge structures?',
    context: {
      assetId: 'struct-pt-02',
      assetName: 'Dhoki Village Percolation Tank',
      assetType: 'Percolation Tank',
      issue: 'Percolation basin clay silt sealing and sluggish aquifer infiltration',
      voiceReportId: 'ivr-call-1088',
      voiceReportSnippet:
        'Surveyor Anita Rao: "Water impounding at 45% capacity but percolation rate is sluggish due to fine clay layer."',
      voiceCallerRole: 'Field Surveyor',
      watershedId: 'ws-dharashiv-ter',
      watershedName: 'Upper Sina - Ter (Dharashiv)',
      locationDescription: 'Dhoki village stream order 4',
    },
  },
  {
    title: 'Scenario 3: Citizen Grievance & Social Audit Protocol',
    query: 'What evidence is required before approving watershed structure maintenance?',
    context: {
      assetId: 'struct-ap-01',
      assetName: 'Kalyandurg Stream Check Dam #1',
      assetType: 'Check Dam',
      issue: 'Community voice grievance alleging wingwall structural cracks and runoff waste',
      voiceReportId: 'ivr-call-1085',
      voiceReportSnippet:
        'K. Muruganathan: "Water not impounding properly after recent rain; flank stone masonry wall has developed structural cracks."',
      voiceCallerRole: 'Farmer',
      geoPhotoId: 'img-kalyandurg-007',
      watershedId: 'ws-rayalaseema-penna',
      watershedName: 'Penna Tributary - Kalyandurg',
      locationDescription: 'Kalyandurg Stream Order 3',
    },
  },
  {
    title: 'Scenario 4: Structural Seepage & Basal Piping',
    query: 'What corrective action is prescribed for foundation seepage under check dam?',
    context: {
      assetId: 'struct-bd-01',
      assetName: 'Alipura Masonry Check Dam',
      assetType: 'Check Dam',
      issue: 'Basal piping failure indicator and scour hole under downstream stilling apron',
      voiceReportId: 'ivr-call-1083',
      voiceReportSnippet:
        'Ganga Ram Kushwaha: "Water is seeping rapidly from beneath the foundation wall. High rain may cause structure collapse."',
      voiceCallerRole: 'Citizen',
      geoPhotoId: 'img-alipura-002',
      satelliteAnomalyId: 'anom-bnd-01',
      watershedId: 'ws-bundelkhand-ken',
      watershedName: 'Ken-Betwa Upper Catchment',
      locationDescription: 'Alipura Nalla',
    },
  },
];

export const EvidenceContextBanner: React.FC<EvidenceContextBannerProps> = ({
  context,
  onSelectScenario,
  activeScenarioIndex,
  onNavigateToGis,
  onNavigateToImages,
  onNavigateToIvr,
}) => {
  return (
    <div className="bg-white border border-[#DCE3DD] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Scenario Switcher Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE3DD]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#17211D] uppercase tracking-wider font-mono">
              Evidence-Linked Guideline Retrieval
            </h4>
            <p className="text-[10px] text-[#66736C]">
              Guideline search contextualized with active watershed field evidence
            </p>
          </div>
        </div>

        {/* 4 Demo Scenario Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {PRESET_RAG_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => onSelectScenario(idx)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeScenarioIndex === idx
                  ? 'bg-[#075B45] text-white font-bold shadow-xs'
                  : 'bg-[#F7F8F4] text-[#66736C] border border-[#DCE3DD] hover:border-[#075B45]/40 hover:text-[#17211D]'
              }`}
            >
              Demo {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Active Evidence Context Summary Card */}
      <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#075B45] bg-[#075B45]/10 px-2 py-0.5 rounded border border-[#075B45]/20">
              ACTIVE EVIDENCE CONTEXT
            </span>
            <span className="font-bold text-[#17211D] text-xs truncate">
              {context.assetName}
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#66736C]">
            {context.watershedName}
          </span>
        </div>

        {/* Reported Issue Summary */}
        <div className="text-xs text-[#17211D] bg-white p-3.5 rounded-xl border border-[#DCE3DD] space-y-1 shadow-2xs">
          <div className="text-[10px] font-bold text-[#66736C] uppercase tracking-wider font-mono">
            Observed Problem & Evidence Summary:
          </div>
          <p className="font-semibold text-[#17211D] text-xs leading-relaxed">
            {context.issue}
          </p>
          {context.voiceReportSnippet && (
            <p className="text-[11px] text-[#1677A8] italic font-sans pt-1 border-t border-[#DCE3DD]">
              {context.voiceReportSnippet}
            </p>
          )}
        </div>

        {/* Multimodal Evidence Badges & Direct Cross-Module Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {context.geoPhotoId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-mono font-medium">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Photo: {context.geoPhotoId}</span>
              </span>
            )}

            {context.voiceReportId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-mono font-medium">
                <PhoneCall className="w-3.5 h-3.5 text-cyan-600" />
                <span>Voice: {context.voiceReportId}</span>
              </span>
            )}

            {context.satelliteAnomalyId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-medium">
                <Satellite className="w-3.5 h-3.5 text-emerald-600" />
                <span>Anomaly: {context.satelliteAnomalyId}</span>
              </span>
            )}

            {context.assetId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-mono font-medium">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>GIS Asset: {context.assetId}</span>
              </span>
            )}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2">
            {context.assetId && onNavigateToGis && (
              <button
                onClick={() => onNavigateToGis(context.assetId)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] border border-[#DCE3DD] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="View Asset in Watershed GIS"
              >
                <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
                <span>View on GIS</span>
              </button>
            )}

            {context.geoPhotoId && onNavigateToImages && (
              <button
                onClick={onNavigateToImages}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] border border-[#DCE3DD] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="View Ground Photograph"
              >
                <Camera className="w-3.5 h-3.5 text-[#8A6A3F]" />
                <span>View Geo-Photo</span>
              </button>
            )}

            {context.voiceReportId && onNavigateToIvr && (
              <button
                onClick={onNavigateToIvr}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] border border-[#DCE3DD] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="View Inbound Voice Grievance"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>View Voice Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
