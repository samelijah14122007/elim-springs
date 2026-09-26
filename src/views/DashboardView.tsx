import React, { useState } from 'react';
import {
  WatershedCatchment,
  WatershedStructure,
  GeoCodedImage,
  IvrVoiceReport,
  WatershedCase,
} from '../types';
import { NavItemKey } from '../components/layout/Sidebar';
import {
  Layers,
  Activity,
  AlertTriangle,
  Droplets,
  Leaf,
  PhoneCall,
  Camera,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  BookOpen,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ClipboardCheck,
  Eye,
  FileCheck,
  Lock,
  Satellite,
  Waves,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { LeafletWatershedMap } from '../components/gis/LeafletWatershedMap';
import { mockStreams, mockAlerts } from '../data/mockData';
import { PanIndiaHierarchyBar } from '../components/common/PanIndiaHierarchyBar';
import { useTranslation } from '../i18n';
import { waterHistoryService, MonitoredWaterBodyProfile } from '../services/waterHistoryService';

interface DashboardViewProps {
  catchment: WatershedCatchment;
  catchments?: WatershedCatchment[];
  onSelectCatchment?: (catchment: WatershedCatchment) => void;
  structures: WatershedStructure[];
  images: GeoCodedImage[];
  ivrReports: IvrVoiceReport[];
  cases: WatershedCase[];
  onNavigate: (tab: NavItemKey) => void;
  onInspectImage: (img: GeoCodedImage) => void;
  onInspectCase: (caseItem: WatershedCase) => void;
  onStartDemo?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  catchment,
  catchments = [],
  onSelectCatchment,
  structures,
  images,
  ivrReports,
  cases,
  onNavigate,
  onInspectImage,
  onInspectCase,
  onStartDemo,
}) => {
  const { t } = useTranslation();
  const [selectedStructure, setSelectedStructure] = useState<WatershedStructure | null>(
    structures.find((s) => s.id === 'struct-rui-cd4') || structures[0] || null
  );

  const activeCasesCount = cases.filter((c) => c.status !== 'RESOLVED').length;
  const pendingVerificationCount = cases.filter(
    (c) => c.status === 'FIELD_VERIFICATION_DISPATCHED' || !c.fieldVerification?.groundTruthConfirmed
  ).length;

  const priorityWaterBodies = waterHistoryService.getAllWaterBodies();

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* 1. Header with Micro-Label and Catchment Context */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-[#DCE3DD]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#075B45] uppercase">
              00 / COMMAND CENTER
            </span>
            <span className="text-[#DCE3DD] font-mono text-xs">/</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-[#075B45] font-semibold uppercase">
              ● PAN-INDIA WATERSHED GIS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17211D] uppercase font-mono leading-tight">
            WATERSHED COMMAND CENTER
          </h1>

          <p className="text-xs sm:text-sm text-[#66736C] mt-1">
            Real-time geospatial intelligence combining grassroots citizen reports, Sentinel-2 remote sensing, and field verification across India's river basins.
          </p>
        </div>

        {/* Catchment Selector & SIH Demo Launch */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          {onStartDemo && (
            <button
              onClick={onStartDemo}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs font-mono uppercase tracking-wider shadow-md shadow-[#075B45]/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>START SIH DEMO</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}

          {catchments.length > 0 && onSelectCatchment && (
            <div className="flex items-center gap-2 bg-white border border-[#DCE3DD] rounded-xl px-3 py-1.5 shadow-xs">
              <span className="text-xs text-[#66736C] font-mono">Catchment:</span>
              <select
                value={catchment.id}
                onChange={(e) => {
                  const found = catchments.find((c) => c.id === e.target.value);
                  if (found) onSelectCatchment(found);
                }}
                className="bg-transparent text-xs font-bold text-[#075B45] focus:outline-none cursor-pointer"
              >
                {catchments.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-[#17211D]">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Pan-India 10-Tier Hierarchy Bar */}
      <PanIndiaHierarchyBar
        currentCatchment={catchment}
        catchments={catchments.length > 0 ? catchments : [catchment]}
        onSelectCatchment={(c) => onSelectCatchment && onSelectCatchment(c)}
        currentStructure={selectedStructure || structures[0]}
      />

      {/* ========================================================================= */}
      {/* SECTION 1: PAN-INDIA GIS MAP & INSTITUTIONAL INDICATORS                   */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#075B45] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#075B45]" />
            <span>SECTION 1 / 4 • SPATIAL CONTEXT — NATIONAL INDIA WATERSHED REPOSITORY</span>
          </span>
          <span className="text-[10px] font-mono text-[#66736C]">
            ISRO BHUVAN / SENTINEL-2 WGS-84 • 28 STATES + 8 UTs
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Large Interactive Watershed Map with Sovereign India Bounds */}
          <div className="lg:col-span-8 flex flex-col space-y-2">
            <div className="h-[460px] lg:h-[500px] rounded-3xl overflow-hidden border border-[#DCE3DD] shadow-lg relative bg-[#F0F3EE]">
              <LeafletWatershedMap
                catchment={catchment}
                catchments={catchments}
                onSelectCatchment={onSelectCatchment}
                structures={structures}
                geoImages={images}
                streams={mockStreams.filter((s) => s.watershedId === catchment.id)}
                alerts={mockAlerts.filter((a) => a.watershedId === catchment.id)}
                voiceReports={ivrReports}
                selectedStructureId={selectedStructure?.id}
                onSelectStructure={(st) => setSelectedStructure(st)}
                onSelectImage={(img) => onInspectImage(img)}
                onNavigateToWaterIntelligence={() => onNavigate('water')}
              />
            </div>
          </div>

          {/* Right 4 Cols: 4 Meaningful Metrics + Selected Asset Dossier */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => onNavigate('cases')}
                className="p-3.5 rounded-2xl bg-white border border-[#DCE3DD] hover:border-[#075B45]/40 shadow-xs transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-mono font-bold text-[#66736C] uppercase block tracking-wider">
                  ACTIVE CASES
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-[#17211D] font-mono group-hover:text-[#075B45] transition-colors">
                    0{activeCasesCount}
                  </span>
                  <span className="text-[10px] text-[#66736C] font-mono">cases</span>
                </div>
                <span className="text-[10px] text-rose-600 mt-1 block">1 critical breach risk</span>
              </div>

              <div
                onClick={() => onNavigate('ivr')}
                className="p-3.5 rounded-2xl bg-white border border-[#DCE3DD] hover:border-sky-500/40 shadow-xs transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-mono font-bold text-[#66736C] uppercase block tracking-wider">
                  FIELD REPORTS
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-[#17211D] font-mono group-hover:text-sky-700 transition-colors">
                    {ivrReports.length < 10 ? `0${ivrReports.length}` : ivrReports.length}
                  </span>
                  <span className="text-[10px] text-[#66736C] font-mono">voice</span>
                </div>
                <span className="text-[10px] text-sky-700 mt-1 block">23 Indian languages</span>
              </div>

              <div
                onClick={() => onNavigate('images')}
                className="p-3.5 rounded-2xl bg-white border border-[#DCE3DD] hover:border-amber-500/40 shadow-xs transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-mono font-bold text-[#66736C] uppercase block tracking-wider">
                  GEO-PHOTOS
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-[#17211D] font-mono group-hover:text-amber-700 transition-colors">
                    {images.length < 10 ? `0${images.length}` : images.length}
                  </span>
                  <span className="text-[10px] text-[#66736C] font-mono">EXIF</span>
                </div>
                <span className="text-[10px] text-amber-700 mt-1 block">SHA-256 tamper-checked</span>
              </div>

              <div
                onClick={() => onNavigate('fieldVerification')}
                className="p-3.5 rounded-2xl bg-white border border-[#DCE3DD] hover:border-[#075B45]/40 shadow-xs transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-mono font-bold text-[#66736C] uppercase block tracking-wider">
                  VERIFICATION
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-[#17211D] font-mono group-hover:text-[#075B45] transition-colors">
                    0{pendingVerificationCount}
                  </span>
                  <span className="text-[10px] text-[#66736C] font-mono">pending</span>
                </div>
                <span className="text-[10px] text-[#075B45] mt-1 block">Sounding rod audit</span>
              </div>
            </div>

            {/* Target Asset Spotlight Dossier */}
            <div className="flex-1 p-4 rounded-3xl bg-white border border-[#DCE3DD] shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
                  <span className="text-[10px] font-mono font-bold text-[#075B45] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>TARGET ASSET DOSSIER</span>
                  </span>
                  <span className="text-[9px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                    NEEDS DE-SILTATION
                  </span>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-bold text-[#17211D] tracking-tight">
                    {selectedStructure?.name || 'Rui East Check Dam #4'}
                  </h3>
                  <span className="text-[11px] font-mono text-[#075B45]">
                    {selectedStructure?.code || 'MH-DHR-2024-CD-04'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#DCE3DD] text-[11px] font-mono">
                  <div>
                    <span className="text-[#66736C] block text-[10px]">SILTATION</span>
                    <span className="text-amber-700 font-bold">{selectedStructure?.currentSiltPct || 78}% capacity loss</span>
                  </div>
                  <div>
                    <span className="text-[#66736C] block text-[10px]">STREAM ORDER</span>
                    <span className="text-sky-700 font-bold">Order {selectedStructure?.streamOrder || 3} (Tributary)</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#66736C] mt-2.5 leading-relaxed font-sans">
                  Evidence suggests heavy sediment buildup restricting post-monsoon groundwater percolation into 14 surrounding community borewells.
                </p>
              </div>

              <div className="pt-2 border-t border-[#DCE3DD] flex items-center justify-between">
                <button
                  onClick={() => onNavigate('cases')}
                  className="text-xs font-bold text-[#075B45] hover:text-[#0E8065] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Open Evidence Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('gis')}
                  className="text-[10px] font-mono text-[#66736C] hover:text-[#075B45] cursor-pointer"
                >
                  View Full GIS →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: PRIORITY WATER OBSERVATIONS (MULTI-TEMPORAL EO MONITORING)     */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#DCE3DD] pb-2">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-[0.18em] text-[#075B45] uppercase">
              REMOTE SENSING HYDROLOGY
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#17211D] uppercase mt-0.5">
              SECTION 2 / 4 • PRIORITY WATER OBSERVATIONS
            </h2>
          </div>
          <button
            onClick={() => onNavigate('water')}
            className="text-xs font-bold text-[#075B45] hover:underline flex items-center gap-1"
          >
            <span>Open Dedicated Water Body Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#66736C] italic">
          Surface-water extent observations (Sentinel-2 MSI & Bhuvan WMS). Volumetric capacity requires bathymetric survey.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityWaterBodies.slice(0, 4).map((wb) => (
            <div
              key={wb.id}
              onClick={() => onNavigate('water')}
              className="p-4 rounded-2xl bg-white border border-[#DCE3DD] hover:border-[#075B45]/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-mono text-[9px] font-bold text-[#66736C] uppercase bg-[#F0F3EE] px-1.5 py-0.5 rounded">
                    {wb.type}
                  </span>
                  <span
                    className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      wb.siltRisk === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : wb.siltRisk === 'MODERATE'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {wb.siltRisk} RISK
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#17211D] tracking-tight line-clamp-1">
                  {wb.name}
                </h4>
                <div className="text-[10px] font-mono text-[#66736C] mt-0.5">
                  {wb.district}, {wb.state}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-[#DCE3DD] text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] text-[#66736C] block">CURRENT SPREAD</span>
                    <span className="font-bold text-sky-800">
                      {wb.currentSpreadHa !== null ? `${wb.currentSpreadHa} ha` : 'Unavailable'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#66736C] block">NDWI INDEX</span>
                    <span className="font-bold text-[#075B45]">
                      {wb.ndwiIndex !== null ? `+${wb.ndwiIndex.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-[#66736C] line-clamp-2 italic font-sans">
                  {wb.statusText}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#DCE3DD] flex items-center justify-between text-[10px] font-mono text-[#075B45]">
                <span>Timeline 2022–2026</span>
                <span className="font-bold flex items-center gap-0.5">
                  Analyze ›
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: ACTIVE FIELD CASES & DUAL-SIGNATORY VERIFICATION               */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#DCE3DD] pb-2">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-[0.18em] text-[#075B45] uppercase">
              FIELD VERIFICATION PIPELINE
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#17211D] uppercase mt-0.5">
              SECTION 3 / 4 • ACTIVE FIELD CASES
            </h2>
          </div>
          <button
            onClick={() => onNavigate('cases')}
            className="text-xs font-bold text-[#075B45] hover:underline flex items-center gap-1"
          >
            <span>Manage All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cases.slice(0, 4).map((c) => {
            const isVerified = c.fieldVerification?.groundTruthConfirmed;
            return (
              <div
                key={c.id}
                onClick={() => onInspectCase(c)}
                className="p-4 rounded-2xl bg-white border border-[#DCE3DD] hover:border-[#075B45]/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-mono text-[9px] font-bold text-[#075B45] bg-[#075B45]/5 px-2 py-0.5 rounded border border-[#075B45]/20">
                      {c.caseNumber}
                    </span>
                    <span
                      className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        c.priority === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : c.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#17211D] tracking-tight line-clamp-2">
                    {c.title}
                  </h4>
                  <div className="text-[10px] font-mono text-[#66736C] mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#075B45]" />
                    <span>{c.location?.village || 'Rui Gram Panchayat'}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#DCE3DD]">
                    <span className="text-[9px] font-mono text-[#66736C] uppercase block">
                      GROUND TRUTH STATUS
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {isVerified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-800">
                            Dual-Verified by WDT & Sarpanch
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[10px] font-bold text-amber-800">
                            Verification Inspection Dispatched
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#DCE3DD] flex items-center justify-between text-[10px] font-mono text-[#075B45]">
                  <span>Evidence Steps: {c.evidenceChain?.length || 2}</span>
                  <span className="font-bold flex items-center gap-0.5">
                    Dossier ›
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: RECENT FIELD EVIDENCE & MULTILINGUAL CITIZEN SIGNALS          */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#DCE3DD] pb-2">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-[0.18em] text-[#075B45] uppercase">
              FIELD EVIDENCE REPOSITORY
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#17211D] uppercase mt-0.5">
              SECTION 4 / 4 • RECENT EVIDENCE
            </h2>
          </div>
          <span className="text-xs font-mono text-[#66736C]">
            EXIF Geo-Photos, Bhashini Voice Transcripts & SHA-256 Audit Hashes
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column A: Recent Field Geo-Photos */}
          <div className="bg-white border border-[#DCE3DD] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD] mb-3">
              <span className="text-[11px] font-mono font-bold text-[#17211D] uppercase flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>EXIF GEO-CODED FIELD PHOTOGRAPHS</span>
              </span>
              <button
                onClick={() => onNavigate('images')}
                className="text-xs font-bold text-[#075B45] hover:underline"
              >
                View all ({images.length})
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {images.slice(0, 4).map((img) => (
                <div
                  key={img.id}
                  onClick={() => onInspectImage(img)}
                  className="rounded-xl border border-[#DCE3DD] overflow-hidden hover:border-[#075B45]/50 transition-all cursor-pointer group bg-[#F7F8F4]"
                >
                  <div className="h-28 bg-slate-200 overflow-hidden relative">
                    <img
                      src={img.imageUrl}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white font-mono text-[8px] px-1 py-0.5 rounded">
                      GPS ±{img.gps?.accuracyM || 4}m
                    </span>
                  </div>
                  <div className="p-2">
                    <div className="text-[10px] font-bold text-[#17211D] truncate">
                      {img.caption}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-[#66736C]">
                      <span>{img.locationSource}</span>
                      <span className="text-[#075B45] font-bold">SHA-256 ✓</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column B: Recent Citizen Voice Grievances */}
          <div className="bg-white border border-[#DCE3DD] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD] mb-3">
                <span className="text-[11px] font-mono font-bold text-[#17211D] uppercase flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-sky-600" />
                  <span>COMMUNITY VOICE GRIEVANCES (BHASHINI AI)</span>
                </span>
                <button
                  onClick={() => onNavigate('ivr')}
                  className="text-xs font-bold text-[#075B45] hover:underline"
                >
                  View all ({ivrReports.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {ivrReports.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onNavigate('ivr')}
                    className="p-2.5 rounded-xl border border-[#DCE3DD] hover:border-sky-500/40 bg-[#F7F8F4] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold uppercase text-[9px]">
                          {r.sourceLanguageName || r.sourceLanguage}
                        </span>
                        <span className="font-bold text-[#17211D]">{r.callerName}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          r.urgency === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {r.urgency || 'High'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#17211D] mt-1.5 line-clamp-2 font-sans">
                      "{r.englishTranslation || r.originalTranscript}"
                    </p>
                    <div className="mt-1 text-[9px] font-mono text-[#66736C]">
                      Location: {r.callerVillage || 'Rui'}, Dharashiv
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#DCE3DD] flex items-center justify-between text-xs text-[#075B45]">
              <span className="text-[10px] font-mono text-[#66736C]">Toll-Free Voice Helpline 1800-ELIM-JAL</span>
              <button
                onClick={() => onNavigate('ivr')}
                className="font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Live Audio Stream</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
