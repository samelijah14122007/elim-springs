import React, { useState } from 'react';
import {
  WatershedCase,
  CaseStatus,
  CasePriority,
  CaseVerificationOutcome,
} from '../types';
import { PageHeader, PriorityBadge, StatusBadge } from '../components/common';
import { EvidenceChainModal } from '../components/cases/EvidenceChainModal';
import { FieldVerificationModal } from '../components/cases/FieldVerificationModal';
import { useTranslation } from '../i18n';
import {
  ShieldCheck,
  FolderGit2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
  FileText,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  PlusCircle,
  Satellite,
  Smartphone,
  Eye,
  FileCheck,
  BookOpen,
  Bot,
  Layers,
  ArrowRight,
  Check,
  Lock,
  X,
} from 'lucide-react';

interface EvidenceCasesViewProps {
  cases: WatershedCase[];
  onUpdateCaseStatus: (caseId: string, newStatus: CaseStatus) => void;
  onConfirmVerification: (
    caseId: string,
    notes: string,
    confirmed: boolean,
    outcome?: CaseVerificationOutcome,
    measurements?: any,
    signatures?: { inspector: string; sarpanch: string }
  ) => void;
  onCreateCase?: (newCase: WatershedCase) => void;
  onNavigateToGis?: () => void;
  onNavigateToSatellite?: () => void;
  onNavigateToImages?: () => void;
  onNavigateToIvr?: () => void;
  onNavigateToRag?: () => void;
  onNavigateToAgent?: () => void;
  onNavigateToReports?: () => void;
  initialShowVerification?: boolean;
}

export const EvidenceCasesView: React.FC<EvidenceCasesViewProps> = ({
  cases,
  onUpdateCaseStatus,
  onConfirmVerification,
  onCreateCase,
  onNavigateToGis,
  onNavigateToSatellite,
  onNavigateToImages,
  onNavigateToIvr,
  onNavigateToRag,
  onNavigateToAgent,
  onNavigateToReports,
  initialShowVerification = false,
}) => {
  const { t } = useTranslation();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    cases[0]?.id || 'case-es-2026-0842'
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(initialShowVerification);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Case State
  const [newTitle, setNewTitle] = useState('');
  const [newAsset, setNewAsset] = useState('Rui East Check Dam #4');
  const [newSource, setNewSource] = useState<'Satellite Anomaly' | 'Geo-coded Field Photo' | 'OCR Mismatch' | 'AI Geo Agent'>('Satellite Anomaly');
  const [newPriority, setNewPriority] = useState<CasePriority>('HIGH');
  const [newDescription, setNewDescription] = useState('');

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Filters (Section 3)
  const filteredCases = cases.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = c.caseNumber.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchVillage = c.location.village.toLowerCase().includes(q);
      const matchAsset = (c.assetName || '').toLowerCase().includes(q);
      if (!matchNumber && !matchTitle && !matchVillage && !matchAsset) return false;
    }
    return true;
  });

  const getPriorityBadgeClass = (priority: CasePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeClass = (status: CaseStatus) => {
    switch (status) {
      case 'REPORTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING_REVIEW':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FIELD_VERIFICATION_DISPATCHED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ENGINEER_APPROVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'REQUIRES_MORE_EVIDENCE':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'RESOLVED':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-[#F0F3EE] text-[#17211D] border-[#DCE3DD]';
    }
  };

  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCaseItem: WatershedCase = {
      id: `case-${Date.now()}`,
      caseNumber: `ES-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      watershedId: 'ws-dharashiv-ter',
      title: newTitle,
      description: newDescription || `Initiated from ${newSource} on asset ${newAsset}.`,
      assetName: newAsset,
      reportedVia: newSource,
      source: newSource,
      status: 'REPORTED',
      priority: newPriority,
      assignedOfficer: 'Er. S. Patil (WDT Civil)',
      evidenceCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: {
        village: 'Rui, Dharashiv',
        lat: 18.2372,
        lng: 75.9845,
      },
      evidenceChain: [
        {
          step: 1,
          eventId: 'EV-01',
          eventType:
            newSource === 'Satellite Anomaly'
              ? 'SATELLITE_ANOMALY'
              : newSource === 'Geo-coded Field Photo'
              ? 'GEO_IMAGE'
              : newSource === 'OCR Mismatch'
              ? 'OCR_EXTRACTION'
              : 'AI_REASONING',
          source: newSource,
          actor: 'ELIM SPRINGS Evidence Pipeline',
          action: `Case lodged from ${newSource}`,
          timestamp: new Date().toISOString(),
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          sha256Hash: `0x${Date.now().toString(16)}8f41c9b207e4d8`,
          inputPayloadExcerpt: newDescription.slice(0, 100),
          verificationStatus: 'VERIFIED',
          status: 'VERIFIED',
        },
      ],
      aiRecommendation: {
        summary: `Dispatch ground-truth audit team to inspect ${newAsset}.`,
        schemeReference: 'PMKSY-WDC 2.0 Section 6.1 (Social Audit & Verification)',
        estimatedRepairCostInr: 320000,
        expectedWaterRetentionCuM: 15000,
        urgencyIndex: newPriority === 'CRITICAL' ? 9.5 : 7.8,
      },
      fieldVerification: {
        assignedTo: 'Er. S. Patil (WDT Civil)',
        deadline: '7 days',
        groundTruthConfirmed: false,
        verificationPhotos: [],
        signatures: {
          inspector: 'Er. S. Patil',
          sarpanch: 'Gram Panchayat Sarpanch',
        },
      },
    };

    if (onCreateCase) {
      onCreateCase(newCaseItem);
    }
    setSelectedCaseId(newCaseItem.id);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        module="MOD 14–15"
        title={t('cases.title', 'Evidence Case Management & Field Verification')}
        description={t('cases.subtitle', 'Centralized meeting point uniting Citizen Voice, Geotagged Photos, OCR, Satellite, RAG, AI Geo Agent, and Field Audit into actionable verified interventions.')}
        icon={FolderGit2}
        breadcrumbs={[
          { label: t('common.india', 'India') },
          { label: 'Maharashtra' },
          { label: 'Dharashiv' },
          { label: 'Rui Sub-Basin' },
          { label: t('nav.cases', 'Cases') },
        ]}
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#075B45] bg-[#075B45]/10 px-2.5 py-0.5 rounded-full border border-[#075B45]/20 font-semibold">
              MODULE 14–15
            </span>
            <span className="text-[10px] font-mono text-[#1677A8] bg-[#1677A8]/10 px-2 py-0.5 rounded border border-[#1677A8]/20">
              {t('cases.openCasesCount', { count: cases.length })}
            </span>
          </div>
        }
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ {t('cases.createCase', 'Create Case from Evidence')}</span>
          </button>
        }
      />

      {/* Priority Disclaimer Callout (Section 2) */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Prototype Classification Notice:</strong> Priority is a prototype classification based on available evidence and report context. Not an official emergency declaration.
          </span>
        </div>
        <span className="text-[10px] font-mono text-amber-700 whitespace-nowrap">
          {cases.length} Total Registered Cases
        </span>
      </div>

      {/* Filter and Search Bar (Section 3) */}
      <div className="bg-white border border-[#DCE3DD] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-[#66736C] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Case ID, Asset, Village..."
              className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl pl-9 pr-4 py-2 text-sm text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45] focus:ring-1 focus:ring-[#075B45]/20 transition-all w-full sm:w-72"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#66736C]" />
            <span className="text-[#66736C] text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-lg px-2.5 py-1.5 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">REPORTED</option>
              <option value="FIELD_VERIFICATION_DISPATCHED">FIELD VERIFICATION DISPATCHED</option>
              <option value="ENGINEER_APPROVED">ENGINEER APPROVED</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="PENDING_REVIEW">PENDING REVIEW</option>
              <option value="REQUIRES_MORE_EVIDENCE">REQUIRES MORE EVIDENCE</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#66736C] text-[11px]">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-lg px-2.5 py-1.5 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45] cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Workspace (Cases List & Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cases List / Board (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredCases.map((c) => {
            const isSelected = selectedCase?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 space-y-3 ${
                  isSelected
                    ? 'border-2 border-[#075B45] bg-[#075B45]/5 shadow-xs'
                    : 'border border-[#DCE3DD] bg-white hover:border-[#075B45]/40 hover:bg-[#F0F3EE]/50 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-[#F0F3EE] text-[#17211D] px-2 py-0.5 rounded-md border border-[#DCE3DD] font-semibold">
                      {c.caseNumber}
                    </span>
                    <span className="text-[10px] text-[#66736C] font-medium">
                      via {c.reportedVia}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold rounded-full px-2 py-0.5 border ${getPriorityBadgeClass(
                      c.priority
                    )}`}
                  >
                    {c.priority}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#17211D] line-clamp-1">{c.title}</h4>
                  <p className="text-xs text-[#66736C] line-clamp-2 mt-1 leading-snug font-sans">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#66736C] pt-2 border-t border-[#DCE3DD] font-mono">
                  <span className="text-xs text-[#66736C] flex items-center gap-1 font-sans">
                    <MapPin className="w-3 h-3 text-[#075B45]" />
                    <span>{c.location.village}</span>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusBadgeClass(
                      c.status
                    )}`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Case Details, Evidence Summary & Verification (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 shadow-xs space-y-6">
              {/* 1. Case Header & Lifecycle Stepper (Section 1) */}
              <div className="space-y-4 pb-4 border-b border-[#DCE3DD]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="font-mono text-[10px] bg-[#F0F3EE] text-[#17211D] px-2 py-0.5 rounded border border-[#DCE3DD] font-semibold">
                        {selectedCase.caseNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold rounded-full px-2 py-0.5 border ${getPriorityBadgeClass(
                          selectedCase.priority
                        )}`}
                      >
                        PRIORITY: {selectedCase.priority}
                      </span>
                      <span className="text-xs text-[#66736C]">
                        Source: <strong className="text-[#17211D]">{selectedCase.reportedVia}</strong>
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#17211D] tracking-tight mt-1.5">{selectedCase.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <button
                      onClick={() => setShowEvidenceModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#075B45] border border-[#075B45]/30 text-xs font-semibold transition-colors cursor-pointer"
                      title="Inspect SHA-256 audit ledger"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#075B45]" />
                      <span>Evidence Chain</span>
                    </button>
                  </div>
                </div>

                {/* Visual Lifecycle Stepper (Section 1) */}
                <div className="p-3.5 bg-[#F7F8F4] rounded-2xl border border-[#DCE3DD] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#66736C] font-mono block">
                    Case Lifecycle Status:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center text-[10px] font-mono font-bold">
                    <div
                      className={`p-2 rounded-xl border ${
                        selectedCase.status === 'REPORTED' ||
                        selectedCase.status === 'PENDING_REVIEW' ||
                        selectedCase.status === 'FIELD_VERIFICATION_DISPATCHED' ||
                        selectedCase.status === 'ENGINEER_APPROVED' ||
                        selectedCase.status === 'RESOLVED'
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'bg-white border-[#DCE3DD] text-[#66736C]'
                      }`}
                    >
                      1. REPORTED
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${
                        selectedCase.status === 'PENDING_REVIEW' ||
                        selectedCase.status === 'FIELD_VERIFICATION_DISPATCHED' ||
                        selectedCase.status === 'ENGINEER_APPROVED' ||
                        selectedCase.status === 'RESOLVED'
                          ? 'bg-purple-50 border-purple-200 text-purple-800'
                          : 'bg-white border-[#DCE3DD] text-[#66736C]'
                      }`}
                    >
                      2. EVIDENCE REVIEW
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${
                        selectedCase.status === 'FIELD_VERIFICATION_DISPATCHED' ||
                        selectedCase.status === 'ENGINEER_APPROVED' ||
                        selectedCase.status === 'RESOLVED'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-white border-[#DCE3DD] text-[#66736C]'
                      }`}
                    >
                      3. FIELD VERIFY
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${
                        selectedCase.status === 'ENGINEER_APPROVED' || selectedCase.status === 'RESOLVED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-white border-[#DCE3DD] text-[#66736C]'
                      }`}
                    >
                      4. ENGINEER REVIEW
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${
                        selectedCase.status === 'RESOLVED'
                          ? 'bg-teal-50 border-teal-200 text-teal-800'
                          : 'bg-white border-[#DCE3DD] text-[#66736C]'
                      }`}
                    >
                      5. RESOLVED
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Evidence Summary Matrix with Direct Navigation (Section 4 & 6) */}
              <div className="space-y-2.5">
                <span className="font-bold text-xs uppercase text-[#66736C] font-mono block">
                  Connected Cross-Module Evidence Feeds:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* GIS Button */}
                  <button
                    onClick={onNavigateToGis}
                    className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-[#075B45] hover:bg-[#F0F3EE] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#075B45] mb-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">Linked</span>
                    </div>
                    <strong className="text-[#17211D] text-xs block group-hover:text-[#075B45]">
                      Watershed GIS
                    </strong>
                    <span className="text-[10px] text-[#66736C]">Stream Order 3</span>
                  </button>

                  {/* Satellite Button */}
                  <button
                    onClick={onNavigateToSatellite}
                    className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-[#1677A8] hover:bg-[#F0F3EE] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#1677A8] mb-1">
                      <Satellite className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">-79% NDWI</span>
                    </div>
                    <strong className="text-[#17211D] text-xs block group-hover:text-[#1677A8]">
                      Satellite Anomaly
                    </strong>
                    <span className="text-[10px] text-[#66736C]">Sentinel-2 L2A</span>
                  </button>

                  {/* Geo-photo Button */}
                  <button
                    onClick={onNavigateToImages}
                    className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-[#8A6A3F] hover:bg-[#F0F3EE] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#8A6A3F] mb-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">2 Photos</span>
                    </div>
                    <strong className="text-[#17211D] text-xs block group-hover:text-[#8A6A3F]">
                      Geo-Photos & EXIF
                    </strong>
                    <span className="text-[10px] text-[#66736C]">Tamper Passed</span>
                  </button>

                  {/* Voice Button */}
                  <button
                    onClick={onNavigateToIvr}
                    className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-blue-600 hover:bg-[#F0F3EE] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-blue-600 mb-1">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">0.94 Conf</span>
                    </div>
                    <strong className="text-[#17211D] text-xs block group-hover:text-blue-600">
                      Bhashini Voice
                    </strong>
                    <span className="text-[10px] text-[#66736C]">Marathi Audio</span>
                  </button>

                  {/* OCR Button */}
                  <button
                    onClick={onNavigateToImages}
                    className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-purple-600 hover:bg-[#F0F3EE] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-purple-600 mb-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">96% Match</span>
                    </div>
                    <strong className="text-[#17211D] text-xs block group-hover:text-purple-600">
                      OCR Signboard
                    </strong>
                    <span className="text-[10px] text-[#66736C]">MH-DHR-2024</span>
                  </button>

                  {/* RAG Button */}
                  <button
                    onClick={onNavigateToRag}
                    className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-amber-600 hover:bg-[#F0F3EE] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-amber-600 mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">Sec 4.3</span>
                    </div>
                    <strong className="text-[#17211D] text-xs block group-hover:text-amber-600">
                      RAG Guidelines
                    </strong>
                    <span className="text-[10px] text-[#66736C]">PMKSY-WDC 2.0</span>
                  </button>

                  {/* AI Agent Button */}
                  <button
                    onClick={onNavigateToAgent}
                    className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-[#075B45] hover:bg-[#F0F3EE] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#075B45] mb-1">
                      <Bot className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">Reasoning</span>
                    </div>
                    <strong className="text-[#17211D] text-xs block group-hover:text-[#075B45]">
                      AI Geo Agent
                    </strong>
                    <span className="text-[10px] text-[#66736C]">Tool Trace Ready</span>
                  </button>

                  {/* Reports Button */}
                  <button
                    onClick={onNavigateToReports}
                    className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-teal-600 hover:bg-[#F0F3EE] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-teal-600 mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">DPR Form</span>
                    </div>
                    <strong className="text-[#17211D] text-xs block group-hover:text-teal-600">
                      Generate DPR
                    </strong>
                    <span className="text-[10px] text-[#66736C]">PDF / Print</span>
                  </button>
                </div>
              </div>

              {/* 3. AI Synthesized Intervention Plan */}
              <div className="bg-emerald-50/40 p-4 rounded-2xl border border-[#075B45]/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-[#075B45] font-mono">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-[#075B45]" />
                    <span>AI SYNTHESIZED ANALYSIS</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300 font-bold uppercase">
                    ADVISORY ONLY • NOT AN INDEPENDENTLY VERIFIED FACT
                  </span>
                </div>

                <p className="text-xs text-[#17211D] leading-relaxed font-sans">
                  {selectedCase.aiRecommendation.summary}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1 font-mono">
                  <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] shadow-2xs">
                    <span className="text-[10px] text-[#66736C] block font-medium">Estimated Budget</span>
                    <strong className="text-[#075B45] font-mono text-sm">
                      ₹ {selectedCase.aiRecommendation.estimatedRepairCostInr.toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] shadow-2xs">
                    <span className="text-[10px] text-[#66736C] block font-medium">Storage Restored</span>
                    <strong className="text-[#1677A8] font-mono text-sm">
                      +{selectedCase.aiRecommendation.expectedWaterRetentionCuM.toLocaleString()} m³
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] shadow-2xs">
                    <span className="text-[10px] text-[#66736C] block font-medium">Statutory Scheme</span>
                    <strong className="text-[#17211D] truncate block text-[11px]">
                      {selectedCase.aiRecommendation.schemeReference.split(' ')[0]}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] shadow-2xs">
                    <span className="text-[10px] text-[#66736C] block font-medium">Guideline / RAG</span>
                    <strong className="text-[#8A6A3F] truncate block text-[11px]">
                      PMKSY Sec 4.3
                    </strong>
                  </div>
                </div>
              </div>

              {/* 4. Ground-Truth Field Verification Status & Action (Module 15) */}
              <div className="bg-[#F7F8F4] p-5 rounded-2xl border border-[#DCE3DD] space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE3DD]">
                  <div className="flex items-center gap-2 font-bold text-[#17211D]">
                    <UserCheck className="w-4 h-4 text-[#075B45]" />
                    <span>Ground-Truth Field Verification</span>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedCase.fieldVerification?.groundTruthConfirmed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {selectedCase.fieldVerification?.groundTruthConfirmed
                      ? 'GROUND TRUTH CONFIRMED'
                      : 'PENDING INSPECTION'}
                  </span>
                </div>

                <div className="space-y-1.5 text-[#17211D] text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#66736C]">Assigned Engineer:</span>
                    <span className="font-semibold text-[#17211D]">
                      {selectedCase.fieldVerification?.assignedTo || 'Er. S. Patil (WDT Civil)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66736C]">Target Deadline:</span>
                    <span className="font-mono text-amber-800 font-semibold">
                      {selectedCase.fieldVerification?.deadline || '7 days'}
                    </span>
                  </div>
                </div>

                {/* REPORTED vs FIELD VERIFIED distinction */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      Reported Condition
                    </span>
                    <p className="text-xs text-[#17211D] leading-relaxed">
                      {selectedCase.description || 'Condition reported via evidence source.'}
                    </p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Field Verified Condition
                    </span>
                    {selectedCase.fieldVerification?.observedCondition ? (
                      <p className="text-xs text-emerald-900 font-mono font-bold">
                        {selectedCase.fieldVerification.observedCondition}
                      </p>
                    ) : (
                      <p className="text-xs text-[#66736C] italic">Pending field inspection.</p>
                    )}
                    {selectedCase.fieldVerification?.signatures && (
                      <p className="text-[11px] text-[#075B45] font-mono mt-1 font-semibold">
                        {selectedCase.fieldVerification.signatures.inspector} &amp; {selectedCase.fieldVerification.signatures.sarpanch}
                      </p>
                    )}
                  </div>
                </div>

                {/* SHA-256 Evidence Integrity Hash (Requirement 6 & 7) */}
                <div className="p-3.5 rounded-xl bg-white border border-[#DCE3DD] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[#17211D]">
                    <ShieldCheck className="w-4 h-4 text-[#075B45] shrink-0" />
                    <span className="font-semibold">SHA-256 Evidence Integrity Hash:</span>
                  </div>
                  <span className="text-[11px] text-[#075B45] truncate max-w-xs font-bold font-mono">
                    {selectedCase.evidenceChain && selectedCase.evidenceChain.length > 0
                      ? selectedCase.evidenceChain[selectedCase.evidenceChain.length - 1].sha256Hash
                      : '0x8f2c3b8871ab93821033d4e8b01e459039a8c7e2'}
                  </span>
                </div>

                {/* Verification Trigger Button */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setShowVerificationModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Perform Field Audit &amp; Sign-off</span>
                  </button>
                </div>
              </div>

              {/* Action / Outcome Section */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 text-xs text-[#17211D] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                    <strong className="text-[#17211D] text-xs">Action / Sanctioned Outcome:</strong>
                  </div>
                  <button
                    onClick={onNavigateToReports}
                    className="flex items-center gap-1 text-[11px] text-[#075B45] hover:underline font-mono cursor-pointer font-bold"
                  >
                    <span>View DPR Requisition</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[#17211D] text-xs leading-relaxed font-sans">
                  Approved for ₹3,85,000 de-siltation & apron boulder pitching under PMKSY-WDC 2.0 Component B. 17,160 m³ storage restoration planned with topsoil distribution to 14 marginal farmers in Rui village.
                </p>
              </div>

              {/* 5. Sanction Outcome Status */}
              {selectedCase.finalOutcome && (
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 text-xs text-[#17211D] space-y-2">
                  <div className="font-bold flex items-center justify-between">
                    <span>Work Sanctioned & Contractor Allocated</span>
                    <span className="font-mono text-teal-800">
                      {selectedCase.finalOutcome.sanctionOrderNo}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#66736C] flex justify-between">
                    <span>Target Completion: {selectedCase.finalOutcome.completionTarget}</span>
                    <span>Actual Storage Restored: {selectedCase.finalOutcome.actualImpactCapacityCuM?.toLocaleString()} m³</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#66736C] bg-white border border-[#DCE3DD] rounded-2xl shadow-xs">
              Select a case from the list to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Create Case from Evidence Modal (Section 5) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#17211D]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE3DD] rounded-3xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3DD]">
              <h3 className="font-bold text-base text-[#17211D] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#075B45]" />
                <span>Create Case from Evidence Source</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#66736C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCaseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#17211D] font-semibold mb-1">Evidence Source:</label>
                <select
                  value={newSource}
                  onChange={(e: any) => setNewSource(e.target.value)}
                  className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-[#17211D] focus:outline-none focus:border-[#075B45]"
                >
                  <option value="Satellite Anomaly">Satellite Anomaly (Sentinel-2)</option>
                  <option value="Geo-coded Field Photo">Geo-coded Field Photo (EXIF Verified)</option>
                  <option value="OCR Mismatch">OCR Signboard Mismatch</option>
                  <option value="AI Geo Agent">AI Geo Agent Multimodal Synthesis</option>
                </select>
              </div>

              <div>
                <label className="block text-[#17211D] font-semibold mb-1">Case Title / Issue:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siltation & Scour at Check Dam #4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17211D] font-semibold mb-1">Target Asset:</label>
                  <input
                    type="text"
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45]"
                  />
                </div>
                <div>
                  <label className="block text-[#17211D] font-semibold mb-1">Initial Priority:</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-[#17211D] focus:outline-none focus:border-[#075B45]"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#17211D] font-semibold mb-1">Description / Observations:</label>
                <textarea
                  rows={3}
                  placeholder="Describe observed ground condition or anomaly metrics..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#17211D] font-semibold cursor-pointer border border-[#DCE3DD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold cursor-pointer shadow-xs"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Chain Modal */}
      {showEvidenceModal && selectedCase && (
        <EvidenceChainModal
          watershedCase={selectedCase}
          caseNumber={selectedCase.caseNumber}
          caseTitle={selectedCase.title}
          onClose={() => setShowEvidenceModal(false)}
        />
      )}

      {/* Field Verification Modal */}
      {showVerificationModal && selectedCase && (
        <FieldVerificationModal
          watershedCase={selectedCase}
          onClose={() => setShowVerificationModal(false)}
          onConfirmVerification={(caseId, notes, confirmed, outcome, measurements, signatures) => {
            onConfirmVerification(caseId, notes, confirmed, outcome, measurements, signatures);
          }}
        />
      )}
    </div>
  );
};
