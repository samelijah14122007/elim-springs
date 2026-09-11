import React, { useState, useEffect } from 'react';
import {
  IvrVoiceReport,
  LanguageCode,
  WatershedCatchment,
  WatershedStructure,
  GeoCodedImage,
  VoiceUrgency,
  VoiceReportProcessingStatus,
  BhashiniConnectionStatus,
} from '../types';
import { PageHeader, StatCard } from '../components/common';
import { useTranslation } from '../i18n';
import { AudioWaveformPlayer } from '../components/ivr/AudioWaveformPlayer';
import { StructuredFieldReportCard } from '../components/ivr/StructuredFieldReportCard';
import { IvrSimulationModal } from '../components/ivr/IvrSimulationModal';
import { ElimVoiceAssistant } from '../components/ivr/ElimVoiceAssistant';
import { mockCatchments, mockStructures, mockGeoImages } from '../data/mockData';
import { ivrService } from '../services/ivrService';
import { bhashiniService } from '../services/bhashiniService';

import {
  PhoneIncoming,
  PhoneCall,
  Mic,
  Languages,
  Sparkles,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCheck,
  Camera,
  Layers,
  ShieldCheck,
  User,
  Plus,
} from 'lucide-react';

interface IvrReportsViewProps {
  watershedId: string;
  catchment?: WatershedCatchment;
  catchments?: WatershedCatchment[];
  onSelectCatchment?: (catchment: WatershedCatchment) => void;
  reports: IvrVoiceReport[];
  structures?: WatershedStructure[];
  geoImages?: GeoCodedImage[];
  onAddReport: (report: IvrVoiceReport) => void;
  onCreateCaseFromReport: (report: IvrVoiceReport) => void;
  onNavigateToGis?: (structureId?: string, lat?: number, lng?: number) => void;
  onInspectImage?: (image: GeoCodedImage) => void;
}

export const IvrReportsView: React.FC<IvrReportsViewProps> = ({
  watershedId,
  catchment,
  catchments = mockCatchments,
  onSelectCatchment,
  reports,
  structures = mockStructures,
  geoImages = mockGeoImages,
  onAddReport,
  onCreateCaseFromReport,
  onNavigateToGis,
  onInspectImage,
}) => {
  const activeCatchment =
    catchment ||
    catchments.find((c) => c.id === watershedId) ||
    catchments[0];

  const currentWatershedId = activeCatchment.id;
  const { t } = useTranslation();

  // Selected report for inspector
  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports[0]?.id || ''
  );
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // Filters
  const [filterLang, setFilterLang] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Watershed-specific reports (or all if desired, but default to active watershed with option to see all)
  const [showAllWatersheds, setShowAllWatersheds] = useState(false);

  const baseReports = showAllWatersheds
    ? reports
    : reports.filter((r) => r.watershedId === currentWatershedId);

  // Filtered reports
  const filteredReports = ivrService.filterReports(baseReports, {
    language: filterLang,
    urgency: filterUrgency,
    processingStatus: filterStatus,
    searchQuery,
  });

  const selectedReport =
    reports.find((r) => r.id === selectedReportId) || filteredReports[0] || reports[0] || null;

  // 6 KPIs
  const totalReportsCount = baseReports.length;
  const highCriticalCount = baseReports.filter(
    (r) => r.urgency === 'Critical' || r.urgency === 'High' || r.aiExtractedEntities.severity === 'High'
  ).length;
  const languagesCount = new Set(baseReports.map((r) => r.sourceLanguage)).size;
  const convertedCasesCount = baseReports.filter(
    (r) => r.status === 'Converted to Case' || r.processingStatus === 'Converted to Case'
  ).length;
  const pendingCount = baseReports.filter(
    (r) => r.status !== 'Converted to Case' && r.processingStatus !== 'Converted to Case'
  ).length;
  const withCoordinatesCount = baseReports.filter((r) => r.lat && r.lng).length;

  const [bhashiniStatus, setBhashiniStatus] = useState<BhashiniConnectionStatus>('BHASHINI_SIMULATED');
  const [bhashiniMessage, setBhashiniMessage] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    bhashiniService.testBhashiniConnection().then((res) => {
      if (mounted) {
        setBhashiniStatus(res.status);
        setBhashiniMessage(res.message);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* 1. TOP STANDARDIZED PAGE HEADER */}
      <PageHeader
        module="MOD 09–10"
        title={t('ivr.title', 'ELIM Voice Assistant & Multilingual Bhashini Hub')}
        description={t('ivr.subtitle', 'Browser-based Indic voice assistant enabling citizens, farmers, and field workers to lodge watershed observations in 23 regional languages via Bhashini Indic AI.')}
        icon={Radio}
        breadcrumbs={[
          { label: t('common.india', 'India') },
          { label: activeCatchment.state },
          { label: activeCatchment.district },
          { label: activeCatchment.name },
        ]}
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#075B45] bg-[#075B45]/10 px-2.5 py-0.5 rounded-md border border-[#075B45]/30 font-bold">
              1800-ELIM-WATER
            </span>
            {bhashiniStatus === 'BHASHINI_LIVE' ? (
              <span
                className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-bold"
                title={bhashiniMessage || 'MeitY Bhashini Live API Connected'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                BHASHINI LIVE
              </span>
            ) : bhashiniStatus === 'BHASHINI_AUTH_FAILED' ? (
              <span
                className="text-[10px] font-mono text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1 font-bold"
                title={bhashiniMessage}
              >
                ● BHASHINI AUTH FAILED (FALLBACK)
              </span>
            ) : bhashiniStatus === 'BHASHINI_NETWORK_ERROR' ? (
              <span
                className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 font-bold"
                title={bhashiniMessage}
              >
                ● BHASHINI UNAVAILABLE — USING PROTOTYPE PIPELINE
              </span>
            ) : (
              <span
                className="text-[10px] font-mono text-[#075B45] bg-[#075B45]/10 px-2 py-0.5 rounded border border-[#075B45]/30 flex items-center gap-1 font-bold"
                title={bhashiniMessage || 'Prototype Indic Language NLP Simulation'}
              >
                ● BHASHINI SIMULATION
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-extrabold text-xs shadow-md shadow-[#075B45]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Simulate citizen dial-in to 1800-ELIM-WATER"
            >
              <PhoneCall className="w-3.5 h-3.5 fill-current" />
              <span>+ Simulate Citizen Dial-in</span>
            </button>

            {catchments.length > 0 && onSelectCatchment && (
              <div className="flex items-center gap-1.5 bg-white border border-[#DCE3DD] rounded-xl px-2.5 py-1.5 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-[#075B45] shrink-0" />
                <span className="text-[11px] text-[#66736C] shrink-0 font-medium">Basin:</span>
                <select
                  value={activeCatchment.id}
                  onChange={(e) => {
                    const target = catchments.find((c) => c.id === e.target.value);
                    if (target) onSelectCatchment(target);
                  }}
                  className="bg-transparent text-xs font-semibold text-[#075B45] focus:outline-none cursor-pointer pr-1"
                >
                  {catchments.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white text-[#17211D]">
                      {c.name} ({c.district})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        }
      />

      {/* 2. COMMUNITY VOICE DASHBOARD: 6 SUMMARY KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Incoming Reports"
          value={totalReportsCount}
          subValue="Total caller submissions"
          icon={PhoneIncoming}
        />
        <StatCard
          label="High / Critical"
          value={highCriticalCount}
          subValue="Requiring immediate action"
          icon={AlertTriangle}
          trend={highCriticalCount > 0 ? { direction: 'up', label: 'Actionable' } : undefined}
        />
        <StatCard
          label="Languages"
          value={languagesCount}
          subValue="Regional dialects handled"
          icon={Languages}
        />
        <StatCard
          label="Converted to Cases"
          value={convertedCasesCount}
          subValue="Linked to Case Engine"
          icon={FileCheck}
          trend={{ direction: 'up', label: 'In workflow' }}
        />
        <StatCard
          label="Pending Review"
          value={pendingCount}
          subValue="Awaiting verification"
          icon={Clock}
        />
        <StatCard
          label="Geotagged"
          value={withCoordinatesCount}
          subValue="Spatial coordinates mapped"
          icon={MapPin}
        />
      </div>

      {/* 3. ELIM Multilingual Browser Voice Assistant Console (Part 12-27) */}
      <ElimVoiceAssistant
        currentWatershed={activeCatchment}
        catchments={catchments}
        structures={structures}
        onReportSaved={(report) => {
          onAddReport(report);
          setSelectedReportId(report.id);
        }}
        onCreateCase={(report) => {
          if (onCreateCaseFromReport) onCreateCaseFromReport(report);
        }}
      />

      {/* 4. MULTIMODAL FILTER & SEARCH BAR */}
      <div className="bg-white border border-[#DCE3DD] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#66736C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search caller, village, keyword..."
              className="w-full pl-9 pr-4 py-2 bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl text-xs text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45]/50 focus:ring-1 focus:ring-[#075B45]/20 transition-colors"
            />
          </div>

          {/* Toggle all watersheds vs current */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs">
            <button
              onClick={() => setShowAllWatersheds(!showAllWatersheds)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-all duration-150 ${
                showAllWatersheds
                  ? 'bg-[#075B45]/10 text-[#075B45] border-[#075B45]/40 font-semibold'
                  : 'bg-white text-[#66736C] border-[#DCE3DD] hover:text-[#17211D] hover:bg-[#F0F3EE]'
              }`}
            >
              {showAllWatersheds ? 'Showing All Watersheds' : `Showing: ${activeCatchment.name}`}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#DCE3DD] text-xs">
          {/* Language filter */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] font-mono text-[#66736C] mr-1 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-[#66736C]" />
              <span>Language:</span>
            </span>
            {['ALL', 'mr', 'hi', 'te', 'ta', 'kn', 'en'].map((lang) => (
              <button
                key={lang}
                onClick={() => setFilterLang(lang)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-all duration-150 ${
                  filterLang === lang
                    ? 'bg-[#075B45] text-white border-[#075B45] font-bold shadow-xs'
                    : 'bg-white text-[#66736C] border-[#DCE3DD] hover:text-[#17211D] hover:bg-[#F0F3EE]'
                }`}
              >
                {lang === 'ALL'
                  ? 'All'
                  : lang === 'mr'
                  ? 'Marathi'
                  : lang === 'hi'
                  ? 'Hindi'
                  : lang === 'te'
                  ? 'Telugu'
                  : lang === 'ta'
                  ? 'Tamil'
                  : lang === 'kn'
                  ? 'Kannada'
                  : 'English'}
              </button>
            ))}
          </div>

          {/* Urgency filter */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] font-mono text-[#66736C] mr-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#66736C]" />
              <span>Urgency:</span>
            </span>
            {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((urg) => (
              <button
                key={urg}
                onClick={() => setFilterUrgency(urg)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-all duration-150 ${
                  filterUrgency === urg
                    ? urg === 'Critical'
                      ? 'bg-rose-600 text-white border-rose-600 font-bold'
                      : urg === 'High'
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'bg-[#075B45] text-white border-[#075B45] font-bold'
                    : 'bg-white text-[#66736C] border-[#DCE3DD] hover:text-[#17211D] hover:bg-[#F0F3EE]'
                }`}
              >
                {urg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE: VOICE LOGS LIST (5 cols) + DETAILED INSPECTOR (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Master List of Inbound Voice Logs */}
        <div className="lg:col-span-5 bg-white border border-[#DCE3DD] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD] px-1">
            <h3 className="text-sm font-bold text-[#17211D] flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#075B45]" />
              <span>Inbound Voice Logs</span>
            </h3>
            <span className="text-xs font-mono text-[#66736C]">
              {filteredReports.length} of {baseReports.length} Reports
            </span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredReports.length === 0 ? (
              <div className="animate-fade-in flex flex-col items-center justify-center py-16 text-center gap-4 px-6">
                <Mic className="w-12 h-12 text-[#66736C] mb-4" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#17211D]">No voice reports found</p>
                  <p className="text-xs text-[#66736C] mt-1 max-w-[200px] leading-relaxed">
                    No reports match your current filter criteria. Try adjusting the language or urgency filters.
                  </p>
                </div>
                <button
                  onClick={() => { setFilterLang('ALL'); setFilterUrgency('ALL'); setSearchQuery(''); }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F0F3EE] hover:bg-[#E5EAE4] border border-[#DCE3DD] text-xs font-medium text-[#17211D] transition-all duration-200 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const urgency = report.urgency || (report.aiExtractedEntities.severity === 'High' ? 'High' : 'Medium');

                const urgencyBadgeColor =
                  urgency === 'Critical'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : urgency === 'High'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : urgency === 'Medium'
                    ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                    : 'bg-[#F0F3EE] text-[#66736C] border-[#DCE3DD]';

                const langIsEnglish = report.sourceLanguage === 'en';
                const languageBadgeColor = langIsEnglish
                  ? 'bg-[#F0F3EE] text-[#66736C] border-[#DCE3DD]'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200';

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2.5 hover:shadow-xs ${
                      isSelected
                        ? 'border-[#075B45]/40 bg-[#075B45]/5 shadow-xs ring-1 ring-[#075B45]/20'
                        : 'bg-[#F7F8F4] border-[#DCE3DD] hover:border-[#075B45]/30 hover:bg-[#F0F3EE]'
                    }`}
                  >
                    {/* Top line: Name, Role, Language badge */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#075B45] shrink-0"></span>
                        <span className="text-sm font-semibold text-[#17211D] truncate">{report.callerName}</span>
                        <span className="text-[10px] text-[#075B45] bg-[#075B45]/10 px-2 py-0.5 rounded border border-[#075B45]/20 font-medium shrink-0">
                          {report.callerRole || 'Citizen'}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide shrink-0 ${languageBadgeColor}`}>
                        {report.sourceLanguage.toUpperCase()}
                      </span>
                    </div>

                    {/* Translation Snippet */}
                    <p className="text-xs text-[#17211D]/80 line-clamp-2 leading-relaxed italic font-sans">
                      "{report.englishTranslation}"
                    </p>

                    {/* Bottom Metadata: Village, Urgency, Status */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#DCE3DD]">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-[#66736C] shrink-0" />
                        <span className="text-[10px] font-mono text-[#66736C] truncate">{report.callerVillage}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {report.status === 'Converted to Case' ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide bg-emerald-50 text-emerald-800 border-emerald-200">
                            Case Active
                          </span>
                        ) : (
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${urgencyBadgeColor}`}>
                            {urgency}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#66736C]">
                          {report.durationSeconds}s
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Audio Player & Detailed Structured Field Report */}
        <div className="lg:col-span-7 space-y-6">
          {selectedReport ? (
            <>
              {/* Audio Waveform Player with Simulated Disclaimer */}
              <AudioWaveformPlayer report={selectedReport} />

              {/* Structured Field Report Card with 3-Step Pipeline & Related Geo-Photos */}
              <StructuredFieldReportCard
                report={selectedReport}
                structures={structures}
                geoImages={geoImages}
                onCreateCase={onCreateCaseFromReport}
                onViewOnMap={onNavigateToGis}
                onInspectImage={onInspectImage}
              />
            </>
          ) : (
            <div className="animate-fade-in flex flex-col items-center justify-center py-16 px-8 text-center gap-4 bg-white border border-[#DCE3DD] rounded-3xl shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#F0F3EE] border border-[#DCE3DD] flex items-center justify-center">
                <PhoneIncoming className="w-7 h-7 text-[#66736C]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[#17211D]">No report selected</p>
                <p className="text-xs text-[#66736C] max-w-[240px] leading-relaxed">
                  Select an IVR voice log from the left panel to review playback, translation, and AI-extracted field data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. SIMULATE INBOUND CITIZEN CALL MODAL */}
      {showSimulateModal && (
        <IvrSimulationModal
          watershed={activeCatchment}
          onClose={() => setShowSimulateModal(false)}
          onAddReport={(newReport) => {
            onAddReport(newReport);
            setSelectedReportId(newReport.id);
          }}
        />
      )}
    </div>
  );
};
