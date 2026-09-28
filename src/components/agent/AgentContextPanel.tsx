import React from 'react';
import { WatershedCatchment, WatershedStructure, EvidenceBadgeType } from '../../types';
import {
  MapPin,
  Satellite,
  Smartphone,
  FileCheck,
  ShieldCheck,
  Terminal,
  BookOpen,
  Info,
  Layers,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronDown,
  Clock,
  ClipboardCheck,
} from 'lucide-react';

interface AgentContextPanelProps {
  catchment: WatershedCatchment;
  structures: WatershedStructure[];
  activeStructureId: string;
  onSelectStructure: (structureId: string) => void;
  onOpenEvidenceChain: () => void;
  onNavigateToGis?: () => void;
  onNavigateToSatellite?: () => void;
  onNavigateToImages?: () => void;
  onNavigateToIvr?: () => void;
}

export const AgentContextPanel: React.FC<AgentContextPanelProps> = ({
  catchment,
  structures,
  activeStructureId,
  onSelectStructure,
  onOpenEvidenceChain,
  onNavigateToGis,
  onNavigateToSatellite,
  onNavigateToImages,
  onNavigateToIvr,
}) => {
  const currentAsset =
    structures.find((s) => s.id === activeStructureId) ||
    structures.find((s) => s.id === 'struct-cd-04') ||
    structures[0] || {
      id: 'struct-cd-04',
      name: 'Rui East Check Dam #4',
      code: 'MH-DHR-2024-CD-04',
      lat: 18.2372,
      lng: 75.9845,
      streamOrder: 3,
      currentSiltPct: 78,
      health: 'At Risk',
      capacityCuM: 22000,
    };

  const isRui = currentAsset.id === 'struct-cd-04' || currentAsset.name.includes('Rui');
  const isShiradhon = currentAsset.id === 'struct-cd-02' || currentAsset.name.includes('Shiradhon');

  // Dynamic context for the 10 context attributes (Section 8)
  const contextDetails = {
    watershed: `${catchment.name} (${catchment.code})`,
    asset: currentAsset.name,
    assetCode: currentAsset.code,
    coordinates: `${currentAsset.lat.toFixed(4)}° N, ${currentAsset.lng.toFixed(4)}° E`,
    issue: isRui
      ? 'Severe Silt Choking (78% silt, 17,160 m³ storage loss)'
      : isShiradhon
      ? 'Right Abutment Scour & Flank Leakage (24% silt)'
      : 'Sediment Infilling & Silt Deposition (45% silt)',
    satelliteObservation: isRui
      ? 'Sentinel-2 NDWI: -78.9% moisture deficit (anom-dhr-01 flagged)'
      : isShiradhon
      ? 'Sentinel-2 NDVI: Normal vegetation Canopy, localized moisture seep'
      : 'Sentinel-2 MSI: Baseline temporal comparison available',
    geoPhotos: isRui
      ? '2 Field Photos (img-rui-001, img-rui-002 • Tamper PASSED)'
      : isShiradhon
      ? '1 Field Photo (img-shr-001 • Tamper PASSED)'
      : '1 Ground Photograph available',
    voiceReports: isRui
      ? '1 Bhashini Call (ivr-call-1082 • Marathi • Urgency 8.4/10)'
      : isShiradhon
      ? '1 Grievance Call (ivr-call-1083 • Urgency 6.2/10)'
      : 'No open voice grievances',
    ocrStatus: isRui
      ? 'Milestone plaque matched 96% (MH-DHR-2024-CD-04)'
      : isShiradhon
      ? 'Work Code verified on stone masonry plaque'
      : 'Registry cross-reference available',
    guidelineContext: isRui
      ? 'PMKSY-WDC 2.0 Sec 4.3 (>40% Desiltation Mandate) & MGNREGA Para 8.4'
      : isShiradhon
      ? 'PMKSY-WDC 2.0 Sec 5.1 (Apron Boulder Pitching Norms)'
      : 'PMKSY-WDC 2.0 Ridge-to-Valley Soil Conservation Standards',
    verificationStatus: isRui
      ? 'PENDING FIELD VERIFICATION (Assigned: Er. S. Patil)'
      : isShiradhon
      ? 'SCHEDULED FOR PRE-MONSOON AUDIT'
      : 'PENDING FIELD VERIFICATION',
  };

  const toolsAvailable = [
    {
      name: 'QueryWatershedGIS',
      desc: 'Retrieves slope, stream order, cadastral coordinates, and upstream check dam network',
    },
    {
      name: 'FetchSatelliteIndices',
      desc: 'Queries Sentinel-2 multispectral reflectance for NDVI biomass & NDWI water deficit',
    },
    {
      name: 'FindGeoPhotos',
      desc: 'Searches geotagged field photos with EXIF timestamp, azimuth, and hardware tamper check',
    },
    {
      name: 'FindVoiceReports',
      desc: 'Queries Bhashini multilingual speech-to-text pipeline for citizen telephone calls',
    },
    {
      name: 'RunOCRRegistryAudit',
      desc: 'Extracts physical milestone text and cross-references against state PMKSY registry',
    },
    {
      name: 'ConsultRagGuidelines',
      desc: 'Retrieves PMKSY-WDC 2.0, MGNREGA circulars, and CGWB manuals with exact page citations',
    },
    {
      name: 'BuildEvidenceTrail',
      desc: 'Calculates deterministic SHA-256 hash linking multi-source evidence into an audit chain',
    },
  ];

  const evidenceClassifications: Array<{
    type: EvidenceBadgeType;
    label: string;
    desc: string;
    colorClass: string;
  }> = [
    {
      type: 'SATELLITE OBSERVATION',
      label: 'SATELLITE OBSERVATION',
      desc: 'Sentinel-2 MSI multispectral reflectance (NDVI/NDWI change detection)',
      colorClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
    },
    {
      type: 'GIS RECORD',
      label: 'GIS RECORD',
      desc: 'Spatial topography, stream order, slope gradient, and asset coordinates',
      colorClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    },
    {
      type: 'GEO-CODED IMAGE',
      label: 'GEO-CODED IMAGE',
      desc: 'Geotagged ground photograph with hardware EXIF tamper check',
      colorClass: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    },
    {
      type: 'OCR EXTRACTION',
      label: 'OCR EXTRACTION',
      desc: 'Text extracted from physical milestone signboard & registry audit',
      colorClass: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
    },
    {
      type: 'VOICE REPORT',
      label: 'VOICE REPORT',
      desc: 'Inbound IVR telephone grievance transcribed via Digital India Bhashini',
      colorClass: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    },
    {
      type: 'GUIDELINE CONTEXT',
      label: 'GUIDELINE CONTEXT',
      desc: 'Mandatory government scheme rules, thresholds, and page references',
      colorClass: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    },
    {
      type: 'FIELD VERIFICATION',
      label: 'FIELD VERIFICATION',
      desc: 'Physical on-site inspection checklist for Junior Engineer sign-off',
      colorClass: 'bg-pink-500/15 text-pink-300 border-pink-500/25',
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Active Agent Context Panel (Section 8) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Live Evidence Context</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {catchment.code}
          </span>
        </div>

        {/* Asset Switcher Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">
            Select Inspected Asset:
          </label>
          <div className="relative">
            <select
              value={currentAsset.id}
              onChange={(e) => onSelectStructure(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 appearance-none pr-8 cursor-pointer"
            >
              {structures.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.health}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* The 10 Live Context Attributes (Section 8) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5 text-xs font-mono">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/60">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Target Asset:</span>
              <strong className="text-white text-xs">{contextDetails.asset}</strong>
              <div className="text-[10px] text-emerald-400">{contextDetails.assetCode}</div>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${
                isRui
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{isRui ? '78% Silt Choked' : 'At Risk'}</span>
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {/* Watershed */}
            <div className="flex justify-between items-center text-slate-400">
              <span>Watershed:</span>
              <span className="text-slate-200 font-semibold">{contextDetails.watershed}</span>
            </div>

            {/* Coordinates */}
            <div className="flex justify-between items-center text-slate-400">
              <span>Coordinates:</span>
              <span className="text-slate-200">{contextDetails.coordinates}</span>
            </div>

            {/* Issue */}
            <div className="pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 text-[10px] block">Detected Issue:</span>
              <span className="text-red-300 font-sans text-xs">{contextDetails.issue}</span>
            </div>

            {/* Satellite Observation */}
            <div className="pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                <Satellite className="w-3 h-3 text-cyan-400" />
                <span>Satellite Observation:</span>
              </span>
              <span className="text-cyan-300 font-sans text-xs">
                {contextDetails.satelliteObservation}
              </span>
            </div>

            {/* Geo-photos */}
            <div className="pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Geo-Coded Photos:</span>
              </span>
              <span className="text-amber-300 font-sans text-xs">
                {contextDetails.geoPhotos}
              </span>
            </div>

            {/* Voice Reports */}
            <div className="pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-blue-400" />
                <span>Voice Reports:</span>
              </span>
              <span className="text-blue-300 font-sans text-xs">
                {contextDetails.voiceReports}
              </span>
            </div>

            {/* OCR Status */}
            <div className="pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-purple-400" />
                <span>OCR Signboard Status:</span>
              </span>
              <span className="text-purple-300 font-sans text-xs">{contextDetails.ocrStatus}</span>
            </div>

            {/* Guideline Context */}
            <div className="pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-orange-400" />
                <span>Guideline Context:</span>
              </span>
              <span className="text-orange-300 font-sans text-xs">
                {contextDetails.guidelineContext}
              </span>
            </div>

            {/* Verification Status */}
            <div className="pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                <ClipboardCheck className="w-3 h-3 text-pink-400" />
                <span>Verification Status:</span>
              </span>
              <span className="text-emerald-400 font-bold font-sans text-xs">
                {contextDetails.verificationStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Inspect Cryptographic Evidence Chain */}
        <button
          onClick={onOpenEvidenceChain}
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 group"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
          <span>Inspect Cryptographic Evidence Chain (SHA-256)</span>
        </button>
      </div>

      {/* 2. Registered Autonomous Tools Registry (Section 3) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">7 Registered Autonomous Tools</h3>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            Local Execution
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          The AI Geo Agent autonomously executes and chains these 7 tools during multi-source evidence reasoning:
        </p>

        <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
          {toolsAvailable.map((t, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-0.5"
            >
              <div className="font-mono text-xs font-semibold text-emerald-400 flex items-center justify-between">
                <span>{t.name}()</span>
                <span className="text-[9px] text-slate-500 font-mono">0{idx + 1}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Evidence Classification Standards (Section 5) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Info className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Evidence Classification Standards</h3>
        </div>
        <p className="text-[11px] text-slate-400">
          Every statement produced by the agent is stamped with one of 7 evidentiary classifications:
        </p>

        <div className="space-y-1.5">
          {evidenceClassifications.map((item, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-0.5"
            >
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${item.colorClass}`}
              >
                {item.label}
              </span>
              <p className="text-[10px] text-slate-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
