import React, { useState } from 'react';
import {
  WatershedReportCard,
  WatershedCatchment,
  WatershedStructure,
  WatershedCase,
  GeoCodedImage,
  IvrVoiceReport,
  ReportType,
} from '../types';
import { PageHeader } from '../components/common';
import { useTranslation } from '../i18n';
import {
  FileBarChart,
  Download,
  Printer,
  Award,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Building,
  FileCheck,
  Calendar,
  Layers,
  MapPin,
  Satellite,
  Smartphone,
  Eye,
  BookOpen,
  Bot,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  Filter,
  ClipboardCheck,
} from 'lucide-react';

interface ReportsViewProps {
  reportCards: WatershedReportCard[];
  catchment?: WatershedCatchment;
  structures?: WatershedStructure[];
  cases?: WatershedCase[];
  images?: GeoCodedImage[];
  ivrReports?: IvrVoiceReport[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reportCards,
  catchment,
  structures = [],
  cases = [],
  images = [],
  ivrReports = [],
}) => {
  const { t } = useTranslation();
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType>('DPR_MAINTENANCE_REQUISITION');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    cases[0]?.id || 'case-es-2026-0842'
  );
  const [selectedCard, setSelectedCard] = useState<WatershedReportCard>(
    reportCards[0] || null
  );
  const [selectedStructureId, setSelectedStructureId] = useState<string>(
    structures[0]?.id || 'struct-cd-04'
  );
  const [downloadNotice, setDownloadNotice] = useState(false);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const activeStructure =
    structures.find((s) => s.id === selectedStructureId) || structures[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3500);
  };

  const reportTypes = [
    {
      id: 'DPR_MAINTENANCE_REQUISITION' as ReportType,
      label: 'F. DPR / Maintenance Requisition',
      desc: 'Official project proposal with engineering estimate and evidence links',
      accent: 'bg-purple-500',
    },
    {
      id: 'WATERSHED_EVIDENCE_SUMMARY' as ReportType,
      label: 'A. Watershed Evidence Summary',
      desc: 'Comprehensive multi-source audit across GIS, Satellite, Voice & Field Photos',
      accent: 'bg-emerald-500',
    },
    {
      id: 'ASSET_VERIFICATION' as ReportType,
      label: 'B. Asset Verification Report',
      desc: 'Single-asset lifecycle report uniting construction records and telemetry',
      accent: 'bg-sky-500',
    },
    {
      id: 'FIELD_VERIFICATION' as ReportType,
      label: 'C. Field Verification Report',
      desc: 'Ground-truth inspection memorandum with measurements & digital sign-offs',
      accent: 'bg-orange-500',
    },
    {
      id: 'EVIDENCE_CHAIN' as ReportType,
      label: 'D. Evidence Chain Audit Ledger',
      desc: 'Cryptographic SHA-256 verifiable hash blocks from Genesis to Tip',
      accent: 'bg-amber-500',
    },
    {
      id: 'WATER_SECURITY_SCORECARD' as ReportType,
      label: 'E. Gram Panchayat Scorecard',
      desc: 'Prototype water security rating (A+ to C) and sustainability metrics',
      accent: 'bg-sky-500',
    },
  ];

  return (
    <div className="space-y-6 pb-12 print:p-0 print:m-0 animate-fade-in">
      {/* 1. STANDARDIZED PAGE HEADER */}
      <div className="print:hidden">
        <PageHeader
          module="MOD 17"
          title={t('reports.title') || 'Reports & Detailed Project Report (DPR) Engine'}
          description={t('reports.subtitle') || 'Automated statutory reporting, DPR requisitions, Gram Panchayat scorecards, and verifiable evidence summaries with zero unexplained text generation.'}
          icon={FileBarChart}
          breadcrumbs={[
            { label: 'India' },
            { label: catchment?.state || 'Maharashtra' },
            { label: catchment?.district || 'Dharashiv' },
            { label: catchment?.name || 'Rui Sub-Basin' },
            { label: 'DPR Engine' },
          ]}
          badge={
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#075B45] bg-[#075B45]/10 px-2.5 py-0.5 rounded-full border border-[#075B45]/20 font-semibold">
                STATUTORY READY
              </span>
              <span className="text-[10px] font-mono text-[#1677A8] bg-[#1677A8]/10 px-2 py-0.5 rounded border border-[#1677A8]/20 font-semibold">
                6 REPORT FORMATS
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2.5 flex-wrap">
              {downloadNotice && (
                <span className="text-xs font-semibold text-[#075B45] flex items-center gap-1.5 animate-fade-in font-mono bg-[#075B45]/10 px-2.5 py-1 rounded-xl border border-[#075B45]/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>DPR PDF Generated (Prototype)</span>
                </span>
              )}

              <button
                onClick={handleExportPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Generate Report / DPR</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] font-semibold text-xs transition-colors border border-[#DCE3DD] cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 text-[#66736C]" />
                <span>{t('reports.print') || 'Print View'}</span>
              </button>

              <button
                onClick={handleExportPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] font-semibold text-xs border border-[#DCE3DD] transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#66736C]" />
                <span>{t('reports.exportPdf') || 'Export (PDF)'}</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Report Traceability Banner (Section 25) */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#DCE3DD] flex flex-wrap items-center justify-between gap-2 text-xs print:hidden shadow-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#17211D]">
          <ShieldCheck className="w-4 h-4 text-[#075B45] flex-shrink-0" />
          <span>
            <strong>Report Traceability:</strong> Generated from: GIS • Satellite • Geo-photo • OCR • Voice • RAG • AI Agent • Field Verification • Evidence Chain
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#66736C]">
          Zero Unexplained Text Generation
        </span>
      </div>

      {/* Report Type Selector Tabs (Section 19) */}
      <div className="print:hidden">
        <p className="text-xs font-semibold text-[#66736C] uppercase tracking-wider mb-3">Report Types</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {reportTypes.map((rt) => {
          const isActive = selectedReportType === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setSelectedReportType(rt.id)}
              className={`rounded-2xl border text-left transition-all duration-200 overflow-hidden group cursor-pointer ${
                isActive
                  ? 'bg-[#075B45]/5 border-2 border-[#075B45] text-[#17211D] shadow-xs'
                  : 'bg-white border-[#DCE3DD] text-[#66736C] hover:border-[#075B45]/40 hover:bg-[#F0F3EE] shadow-2xs'
              }`}
            >
              {/* Accent color band */}
              <div className={`h-1 w-full ${rt.accent}`} />
              {/* Card body */}
              <div className="p-3 space-y-1">
                <strong className={`text-xs block font-bold leading-tight ${isActive ? 'text-[#075B45]' : 'text-[#17211D]'}`}>{rt.label}</strong>
                <p className="text-[10px] text-[#66736C] line-clamp-2 leading-snug">{rt.desc}</p>
              </div>
            </button>
          );
        })}
        </div>
      </div>

      {/* Selectors Bar (Watershed, Case, Asset) */}
      <div className="p-4 bg-white border border-[#DCE3DD] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs print:hidden shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#66736C] font-mono text-[11px] font-semibold">Select Case Focus:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-1.5 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45] cursor-pointer"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#66736C] font-mono text-[11px] font-semibold">Select Asset:</span>
          <select
            value={selectedStructureId}
            onChange={(e) => setSelectedStructureId(e.target.value)}
            className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-1.5 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45] cursor-pointer"
          >
            {structures.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REPORT CONTENT RENDERER (Based on selectedReportType)                     */}
      {/* ========================================================================= */}

      {/* REPORT TYPE F: DPR / MAINTENANCE REQUISITION (Section 23) */}
      {selectedReportType === 'DPR_MAINTENANCE_REQUISITION' && (
        <div className="bg-white border border-[#DCE3DD] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-xs font-sans print:border-none print:shadow-none print:p-0">
          {/* Official Letterhead */}
          <div className="pb-6 border-b border-[#DCE3DD] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs uppercase font-mono text-[#075B45] font-bold tracking-wider">
                Government of India • Ministry of Jal Shakti • PMKSY-WDC 2.0
              </span>
              <span className="text-[10px] font-mono text-[#17211D] bg-[#F0F3EE] px-2.5 py-1 rounded-lg border border-[#DCE3DD] font-semibold">
                Requisition Ref: DPR-PMKSY-2026-0842
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[#17211D] tracking-tight">
              Detailed Project Report (DPR): Drainage Line Treatment & Reservoir De-siltation
            </h3>
            <p className="text-xs text-[#66736C]">
              Micro-Watershed 4B1C2d3 (Upper Sina Basin) • Gram Panchayat Rui, Taluka Dharashiv, Maharashtra
            </p>
          </div>

          {/* Project Abstract Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono p-4 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] text-[11px]">
            <div>
              <span className="text-[10px] uppercase text-[#66736C] block font-semibold">Target Asset:</span>
              <strong className="text-[#17211D]">Rui East Check Dam #4</strong>
              <div className="text-[#075B45] text-[10px] font-bold">MH-DHR-2024-CD-04</div>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#66736C] block font-semibold">Stream Order:</span>
              <span className="text-[#17211D]">Order 3 (Cement Nala Bund)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#66736C] block font-semibold">Coordinates:</span>
              <span className="text-[#17211D]">18.2372° N, 75.9845° E</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#66736C] block font-semibold">Implementing Agency:</span>
              <span className="text-[#17211D]">WDC Project Cell / ZP</span>
            </div>
          </div>

          {/* Problem Statement & Available Evidence */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#17211D] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#075B45]/15 text-[#075B45] flex items-center justify-center text-xs font-mono font-bold">
                1
              </span>
              <span>Problem Description & Available Multi-Source Evidence</span>
            </h4>
            <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-2 text-[#17211D] leading-relaxed">
              <p>
                Rui East Check Dam #4 (designed pondage storage 22,000 m³) is experiencing acute storage loss due to heavy alluvial siltation. Multiple digital evidence feeds confirm that the reservoir bed is silt-choked to weir crest level:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#17211D] pl-2 font-mono text-[11px]">
                <li>
                  <strong>Satellite Remote Sensing:</strong> Sentinel-2 NDWI reflects a -78.9% post-monsoon moisture drop, flagging spatial anomaly anom-dhr-01.
                </li>
                <li>
                  <strong>Citizen Telephony Grievance:</strong> Farmer Dnyaneshwar Shinde lodged inbound call ivr-call-1082 in Marathi reporting dried dug-wells.
                </li>
                <li>
                  <strong>Geotagged Field Photos:</strong> Ground photos (img-rui-001 & img-rui-002) with hardware EXIF confirm crest-level sediment fill.
                </li>
                <li>
                  <strong>Optical Character Recognition:</strong> Physical milestone plaque matches work code MH-DHR-2024-CD-04 with 96% confidence.
                </li>
              </ul>
            </div>
          </div>

          {/* Field Verification Findings & Ground Truth */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#17211D] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#075B45]/15 text-[#075B45] flex items-center justify-center text-xs font-mono font-bold">
                2
              </span>
              <span>Field Verification Findings & Measurements</span>
            </h4>
            <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-2 text-[#17211D] leading-relaxed">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px] mb-2">
                <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] shadow-2xs">
                  <span className="text-[10px] text-[#66736C] block">Measured Silt Depth:</span>
                  <strong className="text-[#17211D]">1.4 meters (Staff rod)</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] shadow-2xs">
                  <span className="text-[10px] text-[#66736C] block">Estimated Silt Volume:</span>
                  <strong className="text-amber-800">17,160 m³ (78% capacity)</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] shadow-2xs">
                  <span className="text-[10px] text-[#66736C] block">Structural Condition:</span>
                  <strong className="text-[#075B45]">Weir Sound • Apron Scour</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] shadow-2xs">
                  <span className="text-[10px] text-[#66736C] block">Beneficiary Farmers:</span>
                  <strong className="text-[#1677A8]">14 Marginal Plots</strong>
                </div>
              </div>
              <p>
                Joint inspection was carried out by <strong>Er. S. Patil (WDT Junior Engineer)</strong> and <strong>Smt. Sunita Shinde (Sarpanch, Rui GP)</strong>. Sounding measurements across 3 points confirm silt depth exceeds the 40% mandatory threshold under PMKSY Section 4.3. Downstream left apron requires boulder pitching to avert foundation scour.
              </p>
            </div>
          </div>

          {/* Recommended Engineering Action & Demo Cost Estimate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#17211D] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#075B45]/15 text-[#075B45] flex items-center justify-center text-xs font-mono font-bold">
                  3
                </span>
                <span>Intervention Requisition & Demo Cost Estimate</span>
              </h4>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300 font-bold">
                DEMO ESTIMATE — NOT FOR SANCTION
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-3">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-[#DCE3DD] text-[#66736C] text-[10px] uppercase">
                    <th className="pb-2">Item of Work</th>
                    <th className="pb-2">Statutory Basis</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Rate (₹)</th>
                    <th className="pb-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3DD] text-[#17211D]">
                  <tr>
                    <td className="py-2.5">Mechanical desiltation of reservoir bed (hydraulic excavator)</td>
                    <td className="py-2.5 text-[#66736C]">PMKSY-WDC 2.0 Sec 4.3</td>
                    <td className="py-2.5">17,160 m³</td>
                    <td className="py-2.5">₹18.00 / m³</td>
                    <td className="py-2.5 text-right font-bold text-[#17211D]">₹3,08,880</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">Boulder pitching on downstream left apron flank (masonry mortar)</td>
                    <td className="py-2.5 text-[#66736C]">MGNREGA Category A</td>
                    <td className="py-2.5">48 m³</td>
                    <td className="py-2.5">₹1,100 / m³</td>
                    <td className="py-2.5 text-right font-bold text-[#17211D]">₹52,800</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">Topsoil haulage & spreading on 14 marginal farmer plots</td>
                    <td className="py-2.5 text-[#66736C]">MGNREGA Para 12.3</td>
                    <td className="py-2.5">Lump sum</td>
                    <td className="py-2.5">Convergence</td>
                    <td className="py-2.5 text-right font-bold text-[#17211D]">₹23,320</td>
                  </tr>
                  <tr className="border-t border-[#DCE3DD] text-[#17211D] font-bold text-xs">
                    <td className="pt-3" colSpan={4}>
                      Total Estimated Requisition (Convergence Funding):
                    </td>
                    <td className="pt-3 text-right text-[#075B45] font-mono text-sm font-bold">
                      ₹ 3,85,000
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] text-[10px] text-[#66736C] font-mono italic">
                * Note: Estimates provided represent demonstrative calculation based on Maharashtra Standard Schedule of Rates (SoR 2024-25). Does not imply official sanction or administrative grant release.
              </div>
            </div>
          </div>

          {/* Signatures & Attestation Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#DCE3DD] text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1">
              <span className="text-[10px] text-[#66736C] uppercase block font-semibold">Inspecting Engineer Sign-off:</span>
              <strong className="text-[#17211D] block">Er. S. Patil (WDT Civil)</strong>
              <span className="text-[#075B45] text-[10px] font-bold">Signed & Verified • SHA-256 Attested</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1">
              <span className="text-[10px] text-[#66736C] uppercase block font-semibold">Gram Panchayat Sarpanch Attestation:</span>
              <strong className="text-[#17211D] block">Smt. Sunita Shinde (Sarpanch, Rui)</strong>
              <span className="text-[#1677A8] text-[10px] font-bold">Gram Sabha Resolution #44/2026 Passed</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TYPE A: WATERSHED EVIDENCE SUMMARY (Section 20) */}
      {selectedReportType === 'WATERSHED_EVIDENCE_SUMMARY' && (
        <div className="bg-white border border-[#DCE3DD] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-xs">
          <div className="pb-4 border-b border-[#DCE3DD]">
            <span className="text-xs uppercase font-mono text-[#075B45] font-bold">
              Watershed Audit Summary
            </span>
            <h3 className="text-xl font-bold text-[#17211D] mt-1">
              Comprehensive Evidence Audit: Micro-Watershed 4B1C2d3
            </h3>
            <p className="text-xs text-[#66736C] mt-0.5">
              Multi-source synthesis across Remote Sensing, Citizen Voice, Field Photos, and RAG Guidelines
            </p>
          </div>

          <div className="space-y-4">
            {/* OBSERVATION */}
            <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-1.5">
              <div className="font-mono font-bold text-cyan-800 uppercase text-xs flex items-center gap-1.5">
                <Satellite className="w-4 h-4 text-cyan-700" />
                <span>OBSERVATION (Remote Sensing & GIS Telemetry)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#17211D] pl-1 text-[11px]">
                <li>Sentinel-2 NDVI increased from 0.29 to 0.48 across treated ridge plots (+65.5% relative gain).</li>
                <li>Surface water persistence spread expanded from 14.8 ha to 43.5 ha (+142,500 m³ retention capacity).</li>
                <li>Localized spectral anomaly (anom-dhr-01) confirmed at Rui East Check Dam #4 (-79% moisture drop).</li>
              </ul>
            </div>

            {/* REPORTED */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1.5">
              <div className="font-mono font-bold text-blue-800 uppercase text-xs flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-700" />
                <span>REPORTED (Citizen Voice & Field Photo Evidence)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#17211D] pl-1 text-[11px]">
                <li>Citizen telephone report ivr-call-1082 in Marathi from Rui village farmer reporting dried open dug-wells.</li>
                <li>Geotagged photos img-rui-001 & img-rui-002 with hardware tamper check confirm crest-level sediment deposition.</li>
                <li>Milestone signboard plaque OCR extraction matched work code MH-DHR-2024-CD-04 with 96% confidence.</li>
              </ul>
            </div>

            {/* PROTOTYPE GUIDANCE */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
              <div className="font-mono font-bold text-amber-800 uppercase text-xs flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>PROTOTYPE GUIDANCE (Government Manuals & Statutory Norms)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#17211D] pl-1 text-[11px]">
                <li>PMKSY-WDC 2.0 Section 4.3 mandates mechanical desiltation once silt exceeds 40% of storage basin capacity.</li>
                <li>MGNREGA Circular Para 8.4 authorizes community de-silting under drought relief category.</li>
                <li>CGWB Manual Section 5.2 stipulates scraping percolation tank clay skin to restore aquifer infiltration.</li>
              </ul>
            </div>

            {/* FIELD VERIFIED */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
              <div className="font-mono font-bold text-emerald-800 uppercase text-xs flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                <span>FIELD VERIFIED (Physical On-Site Inspection)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#17211D] pl-1 text-[11px]">
                <li>Sounding rod measurement recorded 1.4 m sediment depth (78% storage loss).</li>
                <li>Joint memorandum signed by Er. S. Patil (WDT Civil) and Smt. Sunita Shinde (Sarpanch, Rui GP).</li>
                <li>Action recommended: Emergency pre-monsoon de-silting (17,160 m³) and left apron boulder pitching.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TYPE B: ASSET VERIFICATION REPORT (Section 21) */}
      {selectedReportType === 'ASSET_VERIFICATION' && (
        <div className="bg-white border border-[#DCE3DD] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 text-xs">
          <div className="pb-4 border-b border-[#DCE3DD]">
            <span className="text-xs uppercase font-mono text-[#075B45] font-bold">
              Single Asset Life-Cycle Report
            </span>
            <h3 className="text-xl font-bold text-[#17211D] mt-1">
              Asset Record: {activeStructure.name} ({activeStructure.code})
            </h3>
            <p className="text-xs text-[#66736C]">
              Micro-Watershed 4B1C2d3 • Sanction Year: {activeStructure.sanctionYear} • Scheme: {activeStructure.scheme}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono p-4 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] text-[11px]">
            <div>
              <span className="text-[#66736C] block text-[10px] font-semibold">Designed Capacity:</span>
              <strong className="text-[#17211D]">{activeStructure.capacityCuM.toLocaleString()} m³</strong>
            </div>
            <div>
              <span className="text-[#66736C] block text-[10px] font-semibold">Estimated Silt Deposition:</span>
              <strong className="text-amber-800">{activeStructure.currentSiltPct}%</strong>
            </div>
            <div>
              <span className="text-[#66736C] block text-[10px] font-semibold">Sanction Cost:</span>
              <strong className="text-[#075B45]">₹ {activeStructure.estimatedCostInr.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[#66736C] block text-[10px] font-semibold">Assigned Authority:</span>
              <span className="text-[#17211D]">{activeStructure.assignedEngineer}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-2 text-[#17211D]">
            <span className="font-bold text-[#17211D] block">Connected Life-Cycle Telemetry:</span>
            <p className="text-[#66736C] leading-relaxed">
              This asset possesses 2 geotagged field photos (img-rui-001, img-rui-002), 1 citizen voice grievance (ivr-call-1082), 1 satellite spectral anomaly (anom-dhr-01), and 1 registered case (ES-2026-0842). Cryptographic evidence chain contains 7 linked blocks.
            </p>
          </div>
        </div>
      )}

      {/* REPORT TYPE C: FIELD VERIFICATION REPORT */}
      {selectedReportType === 'FIELD_VERIFICATION' && (
        <div className="bg-white border border-[#DCE3DD] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 text-xs">
          <div className="pb-4 border-b border-[#DCE3DD]">
            <span className="text-xs uppercase font-mono text-[#075B45] font-bold">
              Ground-Truth Inspection Memorandum
            </span>
            <h3 className="text-xl font-bold text-[#17211D] mt-1">
              Field Verification Sign-off: Case {activeCase.caseNumber}
            </h3>
            <p className="text-xs text-[#66736C]">
              Joint Ground Audit Conducted at {activeCase.location.village} ({activeCase.location.lat.toFixed(4)}°N, {activeCase.location.lng.toFixed(4)}°E)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-3 font-mono text-[11px]">
            <div className="flex justify-between border-b border-[#DCE3DD] pb-2">
              <span className="text-[#66736C]">Inspecting Engineer:</span>
              <span className="text-[#17211D] font-bold">{activeCase.fieldVerification?.assignedTo || 'Er. S. Patil (WDT Civil)'}</span>
            </div>
            <div className="flex justify-between border-b border-[#DCE3DD] pb-2">
              <span className="text-[#66736C]">Local Authority Concurrence:</span>
              <span className="text-[#17211D] font-bold">{activeCase.fieldVerification?.signatures?.sarpanch || 'Smt. Sunita Shinde (Sarpanch, Rui GP)'}</span>
            </div>
            <div className="flex justify-between border-b border-[#DCE3DD] pb-2">
              <span className="text-[#66736C]">Ground Truth Status:</span>
              <span className="text-[#075B45] font-bold">GROUND TRUTH CONFIRMED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66736C]">Observed Condition:</span>
              <span className="text-amber-800 font-bold">REQUIRES MAINTENANCE (78% SILT)</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TYPE D: EVIDENCE CHAIN AUDIT LEDGER */}
      {selectedReportType === 'EVIDENCE_CHAIN' && (
        <div className="bg-white border border-[#DCE3DD] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 text-xs font-mono">
          <div className="pb-4 border-b border-[#DCE3DD]">
            <span className="text-xs uppercase font-mono text-[#075B45] font-bold">
              Cryptographic Audit Ledger
            </span>
            <h3 className="text-xl font-bold text-[#17211D] mt-1">
              PROTOTYPE EVIDENCE CHAIN: Case {activeCase.caseNumber}
            </h3>
            <p className="text-xs text-[#66736C] font-sans">
              Immutable SHA-256 blocks ensuring multi-source evidentiary traceability for social audits
            </p>
          </div>

          <div className="space-y-3">
            {activeCase.evidenceChain.map((entry) => (
              <div key={entry.step} className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#075B45]">BLOCK #{entry.step} • {entry.action}</span>
                  <span className="text-[#66736C]">{entry.timestamp}</span>
                </div>
                <div className="text-[11px] text-[#17211D] font-sans">{entry.inputPayloadExcerpt}</div>
                <div className="pt-1 text-[10px] text-[#66736C] border-t border-[#DCE3DD] flex justify-between">
                  <span>Actor: {entry.actor}</span>
                  <span className="text-[#075B45] font-bold">{entry.sha256Hash.slice(0, 24)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORT TYPE E: WATER SECURITY SCORECARD (Section 22) */}
      {selectedReportType === 'WATER_SECURITY_SCORECARD' && (
        <div className="space-y-6">
          {/* Disclaimer Callout (Section 22) */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>PROTOTYPE WATER SECURITY SCORECARD:</strong> Prototype composite indicator for Gram Panchayat planning. Not an official government rating.
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-700 shrink-0">
              Methodology: Composite Hydrologic Index
            </span>
          </div>

          {/* Scorecards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportCards.map((rc) => {
              const isSelected = selectedCard?.watershedId === rc.watershedId;
              return (
                <div
                  key={rc.watershedId}
                  onClick={() => setSelectedCard(rc)}
                  className={`p-6 rounded-3xl border cursor-pointer transition-all space-y-4 ${
                    isSelected
                      ? 'bg-[#075B45]/5 border-2 border-[#075B45] shadow-xs text-[#17211D]'
                      : 'bg-white border-[#DCE3DD] hover:border-[#075B45]/40 text-[#17211D] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#66736C] font-mono">
                        {rc.district} District • {rc.gramPanchayat}
                      </span>
                      <h3 className="text-base font-bold text-[#17211D] mt-0.5">{rc.watershedName}</h3>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-inner ${
                        rc.healthGrade === 'A+' || rc.healthGrade === 'A'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : rc.healthGrade === 'B'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {rc.healthGrade}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-[#F7F8F4] p-3 rounded-xl border border-[#DCE3DD]">
                      <span className="text-[10px] text-[#66736C] block font-sans">Water Security</span>
                      <strong className="text-[#1677A8]">{rc.waterSecurityDays} Days</strong>
                    </div>
                    <div className="bg-[#F7F8F4] p-3 rounded-xl border border-[#DCE3DD]">
                      <span className="text-[10px] text-[#66736C] block font-sans">Health Score</span>
                      <strong className="text-[#17211D]">{rc.score} / 100</strong>
                    </div>
                    <div className="bg-[#F7F8F4] p-3 rounded-xl border border-[#DCE3DD]">
                      <span className="text-[10px] text-[#66736C] block font-sans">Assets Audited</span>
                      <strong className="text-[#075B45]">
                        {rc.structuresOperational}/{rc.structuresAudited}
                      </strong>
                    </div>
                    <div className="bg-[#F7F8F4] p-3 rounded-xl border border-[#DCE3DD]">
                      <span className="text-[10px] text-[#66736C] block font-sans">Complaint Resolution</span>
                      <strong className="text-[#17211D]">{rc.communityComplaintsResolvedPct}%</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#66736C] pt-1 flex items-center justify-between border-t border-[#DCE3DD] font-mono">
                    <span>Biomass Density Delta:</span>
                    <span className="text-[#075B45] font-bold">+{rc.biomassCoverageChangePct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
