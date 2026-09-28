import React, { useState } from 'react';
import {
  Mic,
  Camera,
  Layers,
  Bot,
  ShieldCheck,
  FolderGit2,
  UserCheck,
  Sparkles,
  FileBarChart,
  ChevronRight,
  ChevronLeft,
  X,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Maximize2,
  Minimize2,
  ArrowRight,
} from 'lucide-react';
import { NavItemKey } from '../layout/Sidebar';

export interface DemoStepConfig {
  stepNumber: string;
  shortLabel: string;
  fullTitle: string;
  tab: NavItemKey;
  workflowStage: 'VOICE' | 'EVIDENCE' | 'ANALYSIS' | 'CASE' | 'VERIFICATION' | 'ACTION';
  assetName: string;
  assetCode: string;
  location: string;
  evidenceHeadline: string;
  evidenceDetails: string;
  liveComponents: string[];
  demoComponents: string[];
  presenterTip: string;
}

export const SIH_DEMO_STEPS: DemoStepConfig[] = [
  {
    stepNumber: '01',
    shortLabel: 'Field Voice',
    fullTitle: 'Citizen Marathi Voice Grievance Lodged',
    tab: 'ivr',
    workflowStage: 'VOICE',
    assetName: 'Rui East Check Dam #4',
    assetCode: 'MH-DHR-2024-CD-04',
    location: 'Rui Village, Dharashiv, Maharashtra (Upper Sina - Ter Basin)',
    evidenceHeadline: 'Marathi Voice Call via Toll-Free Helpline 1800-ELIM-WATER',
    evidenceDetails:
      'Farmer Tukaram / Dnyaneshwar Shinde reported that Rui Check Dam #4 is completely silted up, overflow bypasses storage, and downstream borewells are drying up.',
    liveComponents: [
      'Bhashini IndicTrans2 translation (mr→en)',
      'Browser Web Speech API ASR capture',
      'Supabase voice_reports commit',
    ],
    demoComponents: ['Bundled 26s Marathi rain/creek audio sample'],
    presenterTip:
      'Play the Marathi audio sample or tap the microphone to demonstrate real-time Indian-language translation.',
  },
  {
    stepNumber: '02',
    shortLabel: 'Geo Evidence',
    fullTitle: 'Geo-Photo & Milestone Plaque OCR Extraction',
    tab: 'images',
    workflowStage: 'EVIDENCE',
    assetName: 'Rui East Check Dam #4',
    assetCode: 'MH-DHR-2024-CD-04',
    location: 'Rui Village Reservoir Bed (18.23724° N, 75.98451° E)',
    evidenceHeadline: 'Hardware-Validated EXIF GPS + Tesseract Signboard Extraction',
    evidenceDetails:
      'Gram Rozgar Sevak Ramesh Kadam uploaded field photo img-rui-001. Hardware safety check passed. OCR matched PMKSY milestone plate with 96% confidence.',
    liveComponents: [
      'Tesseract.js OCR engine running locally in browser',
      'RFC 6234 SHA-256 integrity hash calculation',
      'HTML5 native file picker integration',
    ],
    demoComponents: ['Bundled reservoir siltation field photo'],
    presenterTip:
      'Click the photo card to inspect EXIF metadata, GPS azimuth, and OCR bounding box.',
  },
  {
    stepNumber: '03',
    shortLabel: 'GIS',
    fullTitle: 'Hydrological Drainage & 7-Tier Spatial Hierarchy',
    tab: 'gis',
    workflowStage: 'ANALYSIS',
    assetName: 'Rui East Check Dam #4',
    assetCode: 'MH-DHR-2024-CD-04',
    location: 'Upper Sina - Ter Micro-Watershed (Code: 4B1C2d3)',
    evidenceHeadline: 'Strahler Stream Order 3 Drainage Network & Cadastral Overlay',
    evidenceDetails:
      'Structure CD-04 sits on a 3rd order stream draining 3,420 ha. Spatial buffer identifies 14 vulnerable downstream well-owners within 1.2 km recharge zone.',
    liveComponents: [
      'Real Leaflet GIS interactive map',
      'Bhuvan WMS / OpenStreetMap tile layers',
      'LTR spatial coordinates display',
    ],
    demoComponents: ['Digitized catchment boundary GeoJSON (4B1C2d3)'],
    presenterTip:
      'Zoom into the Dharashiv cluster to show Rui Check Dam #4 mapped precisely on the drainage stream.',
  },
  {
    stepNumber: '04',
    shortLabel: 'AI Analysis',
    fullTitle: 'AI Geo Agent Multimodal Synthesis & Guideline RAG',
    tab: 'agent',
    workflowStage: 'ANALYSIS',
    assetName: 'Rui East Check Dam #4',
    assetCode: 'MH-DHR-2024-CD-04',
    location: 'Upper Sina - Ter Micro-Watershed (4B1C2d3)',
    evidenceHeadline: 'Multimodal Synthesis: Voice + Photo + Satellite NDWI + PMKSY RAG',
    evidenceDetails:
      'AI Geo Agent correlated citizen complaint with Sentinel-2 NDWI deficit (-79%) and diagnosed 78% silt volume (17,160 m³ storage loss). Retrieved PMKSY-WDC 2.0 Section 4.3.',
    liveComponents: [
      'Indexed PMKSY-WDC 2.0 operational guidelines',
      'Structured tool execution log & reasoning trace',
    ],
    demoComponents: ['Simulated Sentinel-2 NDWI reflectance anomaly'],
    presenterTip:
      'Highlight the AI reasoning trace and explain that AI output is advisory, not an unverified truth.',
  },
  {
    stepNumber: '05',
    shortLabel: 'Evidence Chain',
    fullTitle: 'Chronological Cryptographic Audit Ledger',
    tab: 'cases',
    workflowStage: 'EVIDENCE',
    assetName: 'Rui East Check Dam #4',
    assetCode: 'MH-DHR-2024-CD-04',
    location: 'Immutable Ledger (Genesis to Tip)',
    evidenceHeadline: 'Cryptographic Chain of Custody with SHA-256 Hashes',
    evidenceDetails:
      'Chronological sequence: 1. Voice Inbound → 2. Bhashini Translation → 3. Geo-Photo EXIF → 4. OCR Milestone → 5. Satellite NDWI → 6. AI Synthesis → 7. Field Verification.',
    liveComponents: [
      'Deterministic RFC 6234 SHA-256 Evidence Integrity Hash calculation',
      'Cryptographic block linkage (previousHash → currentHash)',
      'Tamper detection simulation test',
    ],
    demoComponents: ['Preconfigured presentation audit trail'],
    presenterTip:
      'Point out the exact wording: "SHA-256 Evidence Integrity Hash". Click "Simulate Tamper Test" to show immediate cryptographic detection.',
  },
  {
    stepNumber: '06',
    shortLabel: 'Case',
    fullTitle: 'Case ES-2026-0842 Priority Dispatch',
    tab: 'cases',
    workflowStage: 'CASE',
    assetName: 'Rui East Check Dam #4',
    assetCode: 'MH-DHR-2024-CD-04',
    location: 'Case Registry • Gram Panchayat Rui, Dharashiv',
    evidenceHeadline: 'Statutory Case File: Severe Silt Choking & Storage Impairment',
    evidenceDetails:
      'Case ES-2026-0842 assigned Priority: HIGH. All evidence streams linked into one case card with statutory PMKSY scheme recommendations.',
    liveComponents: [
      'Supabase cases schema persistence',
      'Case lifecycle status state transitions',
    ],
    demoComponents: ['Baseline case metadata'],
    presenterTip:
      'Show how all multi-source evidence is united into a single, cohesive case for the Junior Engineer.',
  },
  {
    stepNumber: '07',
    shortLabel: 'Verification',
    fullTitle: 'Field Ground-Truth Verification & Dual Sign-Off',
    tab: 'cases',
    workflowStage: 'VERIFICATION',
    assetName: 'Rui East Check Dam #4',
    assetCode: 'MH-DHR-2024-CD-04',
    location: 'Ground-Truth Station (Sounding Rod Depth: 1.4m)',
    evidenceHeadline: 'Technical Audit + Village Panchayat Dual Authorization',
    evidenceDetails:
      'Junior Engineer Er. S. Patil verified 78% silt depth on site. Ground truth confirmed with dual digital sign-off alongside Sarpanch Smt. Sunita Shinde.',
    liveComponents: [
      'Dual authority digital sign-off protocol',
      'Ground verification measurement capture',
      'Evidence chain block commitment',
    ],
    demoComponents: ['Simulated verification inspection photo'],
    presenterTip:
      'Emphasize the REPORTED vs FIELD VERIFIED contrast. Ground truth prevents fraudulent de-siltation claims.',
  },
  {
    stepNumber: '08',
    shortLabel: 'Outcome',
    fullTitle: 'Verified Action & De-siltation Sanction',
    tab: 'cases',
    workflowStage: 'ACTION',
    assetName: 'Rui East Check Dam #4',
    assetCode: 'MH-DHR-2024-CD-04',
    location: 'Rui Village Watershed Committee & Zilla Parishad',
    evidenceHeadline: '₹3,85,000 De-siltation Work Order Approved under PMKSY Component B',
    evidenceDetails:
      'Outcome: 17,160 m³ fertile silt excavation approved. Topsoil distributed to 14 marginal farmers under MGNREGA Category A. Storage restored to 100%.',
    liveComponents: [
      'State transition to ENGINEER_APPROVED',
      'Audit step appending to immutable chain',
    ],
    demoComponents: ['Estimated cost & water retention metrics'],
    presenterTip:
      'Show how the citizen voice in Step 01 directly materialized into a funded engineering intervention.',
  },
  {
    stepNumber: '09',
    shortLabel: 'Report / DPR',
    fullTitle: 'Detailed Project Report (DPR) Requisition Generated',
    tab: 'reports',
    workflowStage: 'ACTION',
    assetName: 'Rui East Check Dam #4',
    assetCode: 'MH-DHR-2024-CD-04',
    location: 'Ministry of Jal Shakti • PMKSY-WDC 2.0 Statutory Format',
    evidenceHeadline: 'Statutory Requisition DPR-PMKSY-2026-0842 with Zero Hallucination',
    evidenceDetails:
      'Official statutory DPR prepared with engineering estimate, technical drawing references, Gram Sabha resolution, and cryptographic SHA-256 evidence appendix.',
    liveComponents: [
      'Official DPR document rendering engine',
      'Browser print and PDF export ready',
      'Traceability back to raw evidence records',
    ],
    demoComponents: ['Statutory letterhead template'],
    presenterTip:
      'Click "Export Report (PDF)" or "Print View" to demonstrate how ELIM SPRINGS creates production-ready government paperwork.',
  },
];

interface SihDemoControllerProps {
  currentStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
  onExitDemo: () => void;
  onOpenEvidenceChainModal?: () => void;
}

export const SihDemoController: React.FC<SihDemoControllerProps> = ({
  currentStepIndex,
  onSelectStep,
  onExitDemo,
  onOpenEvidenceChainModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const currentStep = SIH_DEMO_STEPS[currentStepIndex] || SIH_DEMO_STEPS[0];

  const handleNext = () => {
    if (currentStepIndex < SIH_DEMO_STEPS.length - 1) {
      onSelectStep(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onSelectStep(currentStepIndex - 1);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y sm:border sm:rounded-2xl border-emerald-500/40 shadow-2xl mb-4 overflow-hidden transition-all">
      {/* 1. Controller Top Header Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              SIH 2026 LIVE DEMO
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              STEP {currentStep.stepNumber} / 09
            </span>
            <span className="hidden md:inline-block text-xs text-slate-400 truncate">
              Scenario: <strong>{currentStep.assetName}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Evidence Chain Trigger if on Case / Evidence step */}
          {onOpenEvidenceChainModal && (currentStepIndex === 4 || currentStepIndex === 5) && (
            <button
              onClick={onOpenEvidenceChainModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Inspect Chain</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Demo Bar' : 'Expand Demo Bar'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onExitDemo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Exit Demo Guide"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Demo</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal 9-Step Sequence Pills */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {SIH_DEMO_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={step.stepNumber}
                onClick={() => onSelectStep(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400 scale-[1.02]'
                    : isCompleted
                    ? 'bg-slate-800/90 text-emerald-300 border border-emerald-500/30 hover:bg-slate-700'
                    : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-extrabold opacity-80">{step.stepNumber}</span>
                <span className="font-semibold">{step.shortLabel}</span>
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Guide Drawer (when expanded) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-slate-950/70 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  STAGE {currentStep.stepNumber}: {currentStep.workflowStage}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{currentStep.location}</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                {currentStep.fullTitle}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {currentStep.evidenceDetails}
              </p>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentStepIndex === SIH_DEMO_STEPS.length - 1}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Next: {SIH_DEMO_STEPS[currentStepIndex + 1]?.shortLabel || 'Finish'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4. Truth Labels Grid: LIVE vs DEMO Distinction (Requirement 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            {/* LIVE Backed Features */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE / BACKED INTEGRATIONS AT THIS STEP:</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {currentStep.liveComponents.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DEMO / Bundled Features */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>DEMO / BUNDLED AT THIS STEP:</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {currentStep.demoComponents.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. Presenter Guidance Box */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="text-emerald-400 font-bold shrink-0">💡 Presenter Cue:</span>
              <span className="text-slate-300 truncate">{currentStep.presenterTip}</span>
            </div>
            <span className="text-[10px] text-slate-500 shrink-0 hidden sm:inline">
              Target Asset: {currentStep.assetCode}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
