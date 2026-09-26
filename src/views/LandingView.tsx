import React from 'react';
import {
  Waves,
  ArrowRight,
  ShieldCheck,
  Satellite,
  Mic,
  Camera,
  MapPin,
  Bot,
  FileCheck,
  Sparkles,
  ChevronRight,
  Layers,
  Award,
  Compass,
  FileBarChart,
  CheckCircle2,
  Lock,
  UserCheck2,
  Workflow,
  Cpu,
  Database,
  ExternalLink,
} from 'lucide-react';
import { NavItemKey } from '../components/layout/Sidebar';
import { useTranslation } from '../i18n';
import { LandingMapHero } from '../components/landing/LandingMapHero';

interface LandingViewProps {
  onEnterPortal: (tab: NavItemKey) => void;
  onSelectRole: (role: string) => void;
  onStartDemo?: () => void;
  onOpenLogin?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterPortal,
  onSelectRole,
  onStartDemo,
  onOpenLogin,
}) => {
  const { t } = useTranslation();

  const evidenceJourneySteps = [
    { step: '01', label: 'FIELD VOICE', sub: 'Citizen dial-in / Bhashini', tab: 'ivr' as NavItemKey, icon: Mic },
    { step: '02', label: 'GEO-PHOTO', sub: 'EXIF GPS & Signboard OCR', tab: 'images' as NavItemKey, icon: Camera },
    { step: '03', label: 'GIS', sub: 'Drainage & Micro-Catchment', tab: 'gis' as NavItemKey, icon: Layers },
    { step: '04', label: 'SATELLITE', sub: 'Sentinel-2 NDVI & NDWI', tab: 'satellite' as NavItemKey, icon: Satellite },
    { step: '05', label: 'AI GEO AGENT', sub: 'Statutory RAG Reasoning', tab: 'agent' as NavItemKey, icon: Bot },
    { step: '06', label: 'EVIDENCE CHAIN', sub: 'SHA-256 Tamper-Proof Trail', tab: 'cases' as NavItemKey, icon: Lock },
    { step: '07', label: 'FIELD VERIFICATION', sub: 'Sounding Rod Audit', tab: 'fieldVerification' as NavItemKey, icon: UserCheck2 },
    { step: '08', label: 'ACTION', sub: 'Sanctioned De-siltation Order', tab: 'cases' as NavItemKey, icon: CheckCircle2 },
    { step: '09', label: 'REPORT', sub: 'Verifiable DPR Generation', tab: 'reports' as NavItemKey, icon: FileBarChart },
  ];

  const roles = [
    {
      title: 'CITIZEN',
      roleId: 'Citizen',
      tag: 'GRASSROOTS VOICE',
      description:
        'Lodge dial-in voice grievances in 23 constitutional Indian languages via Bhashini, or capture geo-tagged camera evidence of local watershed distress.',
      targetTab: 'ivr' as NavItemKey,
      icon: Mic,
      color: 'border-sky-200 text-sky-800 bg-sky-50/70',
    },
    {
      title: 'FIELD WORKER',
      roleId: 'Gram Rozgar Sevak',
      tag: 'GROUND TRUTH SCOUT',
      description:
        'Upload verified EXIF geo-photos, extract signboard OCR inscriptions, log physical sounding rod silt measurements, and execute field ground-truth audits.',
      targetTab: 'images' as NavItemKey,
      icon: Camera,
      color: 'border-amber-200 text-amber-800 bg-amber-50/70',
    },
    {
      title: 'OFFICER',
      roleId: 'Junior Engineer (WDT)',
      tag: 'TECHNICAL AUTHORITY',
      description:
        'Analyze multi-spectral Sentinel-2 NDVI/NDWI anomalies, review RUSLE soil loss calculations, verify SHA-256 evidence ledgers, and sanction DPR work orders.',
      targetTab: 'cases' as NavItemKey,
      icon: ShieldCheck,
      color: 'border-[#075B45]/20 text-[#075B45] bg-[#075B45]/5',
    },
    {
      title: 'DEMO / EVALUATOR',
      roleId: 'Evaluator (Read-Only)',
      tag: 'SIH 2026 EVALUATION',
      description:
        'Complete end-to-end guided walkthrough from citizen distress call to engineer-verified DPR execution across all 17 integrated modules.',
      targetTab: 'dashboard' as NavItemKey,
      icon: Sparkles,
      color: 'border-indigo-200 text-indigo-800 bg-indigo-50/70',
    },
  ];

  const systemHighlights = [
    {
      title: 'Real Field Evidence, Zero AI Hallucination',
      desc: 'GPS EXIF metadata, SHA-256 cryptographic hashing, and automated signboard OCR ensure uploaded photos are authentic physical evidence.',
    },
    {
      title: 'ISRO Bhuvan & Sentinel-2 Remote Sensing',
      desc: '10m multi-spectral indices (NDVI vegetation vigor, NDWI surface water persistence) combined with Bhuvan WMS thematic layers.',
    },
    {
      title: '23-Indian-Language Voice Inclusion',
      desc: 'MeitY Bhashini integration enables vernacular voice reporting across 22 constitutional languages plus English with automated translation.',
    },
    {
      title: 'Empirical Soil Erosion & Gully Quantification',
      desc: 'Scientific RUSLE (A = R × K × LS × C × P) soil loss modeling combined with physical gully void measurements (V = L × W × D × 0.85).',
    },
  ];

  return (
    <div className="min-h-full space-y-12 pb-20">
      {/* 1. EDITORIAL FULL-SCREEN HERO */}
      <section className="relative pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Editorial Typography & Problem Statement Context */}
          <div className="lg:col-span-6 space-y-6">
            {/* Small Location Label */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#075B45] animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#075B45] uppercase">
                DHARASHIV, MAHARASHTRA, INDIA
              </span>
              <span className="text-[#DCE3DD] font-mono text-xs">/</span>
              <span className="text-[10px] font-mono text-[#66736C] uppercase tracking-widest">
                SIH PS 26015
              </span>
            </div>

            {/* Large Title */}
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight text-[#17211D] font-mono leading-none">
                ELIM<br />
                <span className="text-[#075B45]">SPRINGS.</span>
              </h1>
              <p className="pt-3 text-sm sm:text-base font-bold text-[#66736C] tracking-[0.14em] uppercase font-mono">
                {t('landing.tagline', 'FROM FIELD VOICES TO WATERSHED ACTION')}
              </p>
            </div>

            {/* Description */}
            <p className="text-[#17211D]/80 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              An evidence-driven watershed intelligence platform connecting community voice
              reports, real geo-coded field evidence, Sentinel-2 earth observations, GIS hydrological
              analysis, and tamper-proof field ground verification into accountable watershed outcomes.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartDemo ? onStartDemo : () => onEnterPortal('dashboard')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs sm:text-sm tracking-wide uppercase shadow-md shadow-[#075B45]/20 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>START SIH 2026 DEMO</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/20 text-emerald-100">
                  Rui Dam #4
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onEnterPortal('gis')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] font-semibold text-xs sm:text-sm border border-[#DCE3DD] shadow-xs transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#075B45]" />
                <span>EXPLORE WATERSHED</span>
              </button>

              <button
                onClick={() => onEnterPortal('cases')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] font-semibold text-xs sm:text-sm border border-[#DCE3DD] shadow-xs transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-600" />
                <span>SEE THE EVIDENCE CHAIN</span>
              </button>

              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] font-bold text-xs sm:text-sm border border-[#075B45]/30 hover:border-[#075B45] text-[#075B45] shadow-xs transition-all cursor-pointer"
                >
                  <UserCheck2 className="w-4 h-4 text-[#075B45]" />
                  <span>SIGN IN</span>
                </button>
              )}
            </div>

            {/* Quick Scientific Badges Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#66736C]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#075B45]" />
                <span>RUSLE Soil Erosion Model</span>
              </div>
              <span className="text-[#DCE3DD]">•</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                <span>23 Indian Languages</span>
              </div>
              <span className="text-[#DCE3DD]">•</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>SHA-256 Audit Trail</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Leaflet GIS Map Context */}
          <div className="lg:col-span-6">
            <LandingMapHero onExploreWatershed={() => onEnterPortal('gis')} />
          </div>
        </div>
      </section>

      {/* 2. THE EVIDENCE JOURNEY (Information Architecture Sequence) */}
      <section className="pt-6 border-t border-[#DCE3DD]">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-[0.18em] text-[#075B45] uppercase">
                SYSTEM WORKFLOW ARCHITECTURE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17211D] uppercase mt-0.5">
                THE EVIDENCE JOURNEY
              </h2>
            </div>
            <span className="text-xs font-mono text-[#66736C]">
              From field signal to accountable engineering action
            </span>
          </div>

          {/* Horizontal Diagram Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
            {evidenceJourneySteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  onClick={() => onEnterPortal(step.tab)}
                  className="group relative p-3 rounded-xl bg-white hover:bg-[#F0F3EE] border border-[#DCE3DD] hover:border-[#075B45]/40 shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[105px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#075B45]">
                      {step.step}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-[#66736C] group-hover:text-[#075B45] transition-colors" />
                  </div>

                  <div className="mt-2">
                    <div className="font-mono text-[11px] font-bold text-[#17211D] group-hover:text-[#075B45] transition-colors leading-tight">
                      {step.label}
                    </div>
                    <div className="text-[10px] text-[#66736C] leading-snug mt-1 truncate">
                      {step.sub}
                    </div>
                  </div>

                  {/* Connecting Arrow for desktop */}
                  {idx < evidenceJourneySteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-1.5 top-1/2 -translate-y-1/2 z-10 text-[#DCE3DD] pointer-events-none">
                      ›
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. ROLE-BASED ACCESS & INVESTIGATION REGISTER */}
      <section className="space-y-4 pt-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-[0.18em] text-[#075B45] uppercase">
            OPERATIONAL STAKEHOLDERS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17211D] uppercase mt-0.5">
            CHOOSE YOUR WORKSPACE ROLE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                onClick={() => {
                  onSelectRole(role.roleId);
                  onEnterPortal(role.targetTab);
                }}
                className={`p-5 rounded-2xl border ${role.color} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border border-current tracking-widest">
                      {role.tag}
                    </span>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#17211D] tracking-tight leading-tight">
                      {role.title}
                    </h3>
                    <p className="text-xs text-[#66736C] mt-2 leading-relaxed font-sans">
                      {role.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-semibold text-[#17211D]">
                  <span>Enter as {role.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CORE SCIENTIFIC HIGHLIGHTS (SIH PS 26015) */}
      <section className="p-6 rounded-2xl bg-white border border-[#DCE3DD] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#DCE3DD]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#075B45]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#075B45]">
              SMART INDIA HACKATHON 2026 • PROBLEM STATEMENT PS 26015
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#66736C]">
            MINISTRY OF JAL SHAKTI • DEPT OF LAND RESOURCES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHighlights.map((hl, i) => (
            <div key={i} className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#17211D] uppercase font-mono tracking-tight">
                {hl.title}
              </h4>
              <p className="text-[11px] text-[#66736C] leading-relaxed font-sans">
                {hl.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
