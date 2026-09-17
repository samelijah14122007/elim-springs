import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Info,
  Layers,
  Ruler,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Flame,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  FileText,
  MapPin,
  Check,
} from 'lucide-react';
import { erosionService, RusleModelResult, FieldErosionObservation, LandDegradationMatrix } from '../../services/erosionService';
import { WatershedCase } from '../../types';
import { computeSha256 } from '../../services/evidenceService';

interface SoilErosionAnalyticsPanelProps {
  watershedId?: string;
  watershedName?: string;
  onOpenFieldMeasurementModal?: () => void;
  onCreateCase?: (newCase: WatershedCase) => void;
  onNavigateToCases?: () => void;
}

export const SoilErosionAnalyticsPanel: React.FC<SoilErosionAnalyticsPanelProps> = ({
  watershedId = 'ws-dharashiv-ter',
  watershedName = 'Upper Sina - Ter Micro-Watershed',
  onOpenFieldMeasurementModal,
  onCreateCase,
  onNavigateToCases,
}) => {
  const [activeTab, setActiveTab] = useState<'rusle' | 'fieldVoid' | 'degradation'>('rusle');
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  // Verification Case Flow State
  const [verifyingHotspot, setVerifyingHotspot] = useState<{
    id?: string;
    name: string;
    lat: number;
    lng: number;
    primaryDriver: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    soilLossRate: number;
    recommendedIntervention: string;
    evidenceText: string;
  } | null>(null);

  const [selectedIntervention, setSelectedIntervention] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('Er. S. Patil (WDT Civil / Watershed Team)');
  const [verificationDeadline, setVerificationDeadline] = useState('7 Calendar Days');
  const [fieldNotes, setFieldNotes] = useState('');
  const [createdCaseResult, setCreatedCaseResult] = useState<{ caseNumber: string; hash: string } | null>(null);

  const rusleData: RusleModelResult = erosionService.getWatershedRusle(watershedId);
  const demoObservations: FieldErosionObservation[] = erosionService.getDemoFieldObservations();
  const degradationData: LandDegradationMatrix = erosionService.getLandDegradationMatrix(watershedId);

  const handleDispatchVerificationCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingHotspot) return;

    const caseNum = `ES-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const caseId = `case-soil-${Date.now().toString().slice(-4)}`;
    const timestamp = new Date().toISOString();

    const payloadString = `SOIL_EROSION_HOTSPOT|watershed:${watershedId}|lat:${verifyingHotspot.lat}|lng:${verifyingHotspot.lng}|rate:${verifyingHotspot.soilLossRate}t_ha_yr|driver:${verifyingHotspot.primaryDriver}|intervention:${selectedIntervention}`;
    const evidenceHash = computeSha256(payloadString);

    const newCase: WatershedCase = {
      id: caseId,
      caseNumber: caseNum,
      watershedId,
      title: `Soil Erosion Hotspot Verification: ${verifyingHotspot.name}`,
      description: `Targeted ground-truth audit dispatched for soil loss hotspot. Primary driver: ${verifyingHotspot.primaryDriver}. Remote sensing evidence: ${verifyingHotspot.evidenceText}. Estimated soil loss: ${verifyingHotspot.soilLossRate} t/ha/yr. Recommended PMKSY-WDC 2.0 intervention: ${selectedIntervention}. Field Notes: ${fieldNotes || 'Standard pre-monsoon physical cross-section and sounding survey required.'}`,
      reportedVia: 'Satellite Anomaly',
      source: 'Remote Sensing RUSLE / Land Degradation Hotspot',
      status: 'REPORTED',
      priority: verifyingHotspot.severity,
      assignedOfficer: assignedOfficer,
      evidenceCount: 2,
      createdAt: timestamp,
      updatedAt: timestamp,
      location: {
        village: `${verifyingHotspot.name.split(' ')[0]} Catchment Zone`,
        lat: verifyingHotspot.lat,
        lng: verifyingHotspot.lng,
      },
      evidenceChain: [
        {
          step: 1,
          eventId: 'EV-RUSLE-01',
          eventType: 'SATELLITE_ANOMALY',
          source: 'Sentinel-2 MSI Level-2A & RUSLE Empirical Pipeline',
          actor: 'ELIM SPRINGS Geospatial Engine',
          action: 'Soil Loss Hotspot Flagged from Multi-Temporal Remote Sensing',
          timestamp,
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          sha256Hash: evidenceHash,
          inputPayloadExcerpt: payloadString.slice(0, 100),
          verificationStatus: 'VERIFIED',
          status: 'VERIFIED',
        },
        {
          step: 2,
          eventId: 'EV-VERIF-02',
          eventType: 'FIELD_VERIFICATION',
          source: 'WDT Civil Engineering Verification Workflow',
          actor: assignedOfficer,
          action: 'Ground-Truth Verification Work Order Dispatched',
          timestamp,
          previousHash: evidenceHash,
          sha256Hash: computeSha256(`${evidenceHash}:${assignedOfficer}:${verificationDeadline}`),
          inputPayloadExcerpt: `Assigned: ${assignedOfficer} | Deadline: ${verificationDeadline} | Intervention: ${selectedIntervention}`,
          verificationStatus: 'PENDING',
          status: 'PENDING',
        },
      ],
      aiRecommendation: {
        summary: `Prioritize ${selectedIntervention} to arrest further soil loss (${verifyingHotspot.soilLossRate} t/ha/yr).`,
        schemeReference: 'PMKSY-WDC 2.0 Section 4.2 & Section 6.1 (Field Verification Protocol)',
        estimatedRepairCostInr: 350000,
        expectedWaterRetentionCuM: 16500,
        urgencyIndex: verifyingHotspot.severity === 'CRITICAL' ? 9.2 : 7.6,
      },
      fieldVerification: {
        assignedTo: assignedOfficer,
        deadline: verificationDeadline,
        groundTruthConfirmed: false,
        verificationPhotos: [],
        inspectorNotes: fieldNotes,
        signatures: {
          inspector: assignedOfficer.split(' (')[0],
          sarpanch: 'Gram Panchayat Sarpanch',
        },
      },
    };

    if (onCreateCase) {
      onCreateCase(newCase);
    }

    setCreatedCaseResult({
      caseNumber: caseNum,
      hash: evidenceHash,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Soil Erosion Analytics & Land Degradation Dynamics (SIH PS 26015)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase">
              RUSLE Empirical Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard ICAR-NBSS&LUP soil loss modeling (A = R × K × LS × C × P) integrated with physical gully void measurements
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('rusle')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'rusle'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RUSLE Analytical Model
          </button>
          <button
            onClick={() => setActiveTab('fieldVoid')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'fieldVoid'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Field Void Observations
          </button>
          <button
            onClick={() => setActiveTab('degradation')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'degradation'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Land Degradation Matrix
          </button>
        </div>
      </div>

      {/* TAB 1: RUSLE ANALYTICAL MODEL */}
      {activeTab === 'rusle' && (
        <div className="space-y-6 animate-fade-in">
          {/* Formula Display Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                Mathematical Governing Equation
              </div>
              <div className="flex items-center gap-3 text-2xl sm:text-3xl font-black text-white font-mono tracking-wide">
                <span>A</span>
                <span className="text-slate-500">=</span>
                <span className="text-cyan-400 hover:underline cursor-pointer" onClick={() => setSelectedFactor('R')}>R</span>
                <span className="text-slate-500">×</span>
                <span className="text-amber-400 hover:underline cursor-pointer" onClick={() => setSelectedFactor('K')}>K</span>
                <span className="text-slate-500">×</span>
                <span className="text-purple-400 hover:underline cursor-pointer" onClick={() => setSelectedFactor('LS')}>LS</span>
                <span className="text-slate-500">×</span>
                <span className="text-emerald-400 hover:underline cursor-pointer" onClick={() => setSelectedFactor('C')}>C</span>
                <span className="text-slate-500">×</span>
                <span className="text-blue-400 hover:underline cursor-pointer" onClick={() => setSelectedFactor('P')}>P</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Where <strong>A</strong> is the average annual soil loss (t/ha/yr), derived from rainfall erosivity (R), soil erodibility (K), slope length-steepness (LS), cover management (C), and support practice (P).
              </p>
            </div>

            {/* Calculated Soil Loss Metric */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 min-w-[240px] text-right space-y-1 shadow-lg">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Predicted Soil Loss (A)
              </div>
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-3xl font-black text-white font-mono">
                  {rusleData.calculatedSoilLossTonnesPerHaYear}
                </span>
                <span className="text-xs text-slate-400 font-mono">t/ha/year</span>
              </div>
              <div>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono"
                  style={{ backgroundColor: `${rusleData.categoryColor}20`, color: rusleData.categoryColor, border: `1px solid ${rusleData.categoryColor}50` }}
                >
                  {rusleData.categoryLabel}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Tolerable limit (T): {rusleData.tolerableSoilLossTValue} t/ha/yr ({rusleData.exceedsTolerance ? 'EXCEEDED' : 'WITHIN LIMITS'})
              </div>
            </div>
          </div>

          {/* Factor Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {Object.values(rusleData.factors).map((factor) => {
              const isSelected = selectedFactor === factor.code;
              return (
                <div
                  key={factor.code}
                  onClick={() => setSelectedFactor(isSelected ? null : factor.code)}
                  className={`bg-slate-950/70 border rounded-xl p-3.5 space-y-2 cursor-pointer transition-all hover:border-slate-600 ${
                    isSelected ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-slate-900' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 font-mono font-bold text-xs flex items-center justify-center text-slate-200">
                      {factor.code}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{factor.spatialResolution}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 truncate">{factor.name}</div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">
                      {factor.value}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{factor.unit}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5 truncate">
                    {factor.dataSource}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Factor Methodology Details Drawer */}
          {selectedFactor && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Methodology & Scientific Data Source for Factor [{selectedFactor}]</span>
                <button
                  onClick={() => setSelectedFactor(null)}
                  className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-slate-400">
                {rusleData.factors[selectedFactor as keyof typeof rusleData.factors].description}
              </p>
              <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 border border-slate-800">
                Algorithm: {rusleData.factors[selectedFactor as keyof typeof rusleData.factors].methodology}
              </div>
            </div>
          )}

          {/* Engineering Interventions Checklist & Dispatch Action */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Targeted PMKSY-WDC 2.0 Interventions for this Soil Loss Profile
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {rusleData.interventionsRecommended.map((intv, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{intv}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                Predicted soil loss exceeds tolerable threshold. Initiate official ground truth verification order for field audit unit.
              </span>
              <button
                onClick={() => {
                  setCreatedCaseResult(null);
                  setSelectedIntervention(rusleData.interventionsRecommended[0] || 'Continuous Contour Trenches (CCT) on upper ridges');
                  setVerifyingHotspot({
                    name: `${watershedName} Ridge Sedimentation Zone`,
                    lat: 18.2374,
                    lng: 75.9847,
                    primaryDriver: 'Sheet and rill erosion across sloping upper ridges',
                    severity: rusleData.exceedsTolerance ? 'CRITICAL' : 'HIGH',
                    soilLossRate: rusleData.calculatedSoilLossTonnesPerHaYear,
                    recommendedIntervention: rusleData.interventionsRecommended[0] || 'Continuous Contour Trenches (CCT) on upper ridges',
                    evidenceText: `RUSLE empirical soil loss calculation (${rusleData.calculatedSoilLossTonnesPerHaYear} t/ha/yr) exceeds tolerable threshold (${rusleData.tolerableSoilLossTValue} t/ha/yr).`,
                  });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Create Verification Case for this Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FIELD VOID OBSERVATIONS */}
      {activeTab === 'fieldVoid' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-slate-400">
              Ground-measured gully and siltation voids logged by field personnel using calibrated rods and laser meters.
            </span>
            {onOpenFieldMeasurementModal && (
              <button
                onClick={onOpenFieldMeasurementModal}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                + Log Physical Field Measurement
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoObservations.map((obs) => (
              <div
                key={obs.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">{obs.id}</span>
                    <h5 className="text-sm font-bold text-slate-200 mt-0.5">
                      {obs.measurements.erosionType.replace('_', ' ')}
                    </h5>
                    <p className="text-[11px] text-slate-400">{obs.location.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    {obs.estimates.riskSeverity} RISK
                  </span>
                </div>

                {/* Primary Physical Measurements Grid */}
                <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono">Length</div>
                    <div className="text-xs font-bold text-white font-mono">{obs.measurements.lengthMeters}m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono">Avg Width</div>
                    <div className="text-xs font-bold text-white font-mono">{obs.measurements.averageWidthMeters}m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono">Avg Depth</div>
                    <div className="text-xs font-bold text-white font-mono">{obs.measurements.averageDepthMeters}m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono">Bulk Density</div>
                    <div className="text-xs font-bold text-cyan-400 font-mono">{obs.measurements.soilBulkDensityTonnesPerCuM} t/m³</div>
                  </div>
                </div>

                {/* Calculated Estimates vs Direct Measurement Tag */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Void Volume</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {obs.estimates.voidVolumeCuMeters} m³
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Displaced Soil Mass</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {obs.estimates.displacedSoilMassTonnes} Tonnes
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Annual Rate</span>
                    <span className="font-mono font-bold text-rose-400 text-sm">
                      ~{obs.estimates.annualSoilLossRateTonnesPerYear} t/yr
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center justify-between gap-2 text-[10px] pt-1">
                  <span className="inline-flex items-center gap-1 font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Ruler className="w-3 h-3" />
                    FIELD MEASUREMENT
                  </span>
                  <span className="font-mono text-slate-500">
                    Tools: {obs.measurements.measurementToolsUsed.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LAND DEGRADATION MATRIX */}
      {activeTab === 'degradation' && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Restored Area</span>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                +{degradationData.summary.totalRestoredAreaHa} ha
              </div>
              <span className="text-[10px] text-slate-500">2023 → 2025</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Active Degradation</span>
              <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
                {degradationData.summary.totalDegradedAreaHa} ha
              </div>
              <span className="text-[10px] text-slate-500">Siltation Hotspots</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Canopy Cover Delta</span>
              <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">
                {degradationData.summary.vegetationCanopyDeltaPct > 0 ? '+' : ''}{degradationData.summary.vegetationCanopyDeltaPct}%
              </div>
              <span className="text-[10px] text-slate-500">Mean Sentinel-2 NDVI</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Bare Soil Contraction</span>
              <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                {degradationData.summary.bareSoilSpreadDeltaPct}%
              </div>
              <span className="text-[10px] text-slate-500">Reduced Fallow Footprint</span>
            </div>
          </div>

          {/* Transitions Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">2023 Baseline Class</th>
                  <th className="py-2.5 px-3">2025 Current Class</th>
                  <th className="py-2.5 px-3">Extent (ha)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Evidence Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {degradationData.transitions.map((tr, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-300">{tr.fromClass}</td>
                    <td className="py-2.5 px-3 text-white font-medium">{tr.toClass}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">{tr.areaHectares} ha</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          tr.degradationStatus === 'RESTORED' || tr.degradationStatus === 'IMPROVED'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : tr.degradationStatus === 'DEGRADED'
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {tr.degradationStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{tr.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hotspots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Identified Soil & Watershed Degradation Hotspots
              </h5>
              <span className="text-[11px] text-slate-400">
                Derived from Sentinel-2 Bare Soil Expansion + ICAR-NBSS&LUP slope zones
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {degradationData.hotspots.map((hs) => (
                <div key={hs.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-sm">{hs.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
                        hs.severity === 'High'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {hs.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>

                    <div className="text-slate-300 text-xs">
                      <strong className="text-slate-400">Primary Cause:</strong> {hs.primaryDriver}
                    </div>

                    <div className="text-slate-400 text-[11px] font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      🛰️ {hs.satelliteEvidence}
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{hs.lat.toFixed(4)}°N, {hs.lng.toFixed(4)}°E</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Status: Field Audit Pending
                    </span>
                    <button
                      onClick={() => {
                        setCreatedCaseResult(null);
                        setSelectedIntervention(rusleData.interventionsRecommended[0] || 'Earthen Gully Plugs (EGP)');
                        setVerifyingHotspot({
                          id: hs.id,
                          name: hs.name,
                          lat: hs.lat,
                          lng: hs.lng,
                          primaryDriver: hs.primaryDriver,
                          severity: hs.severity === 'High' ? 'CRITICAL' : 'HIGH',
                          soilLossRate: rusleData.calculatedSoilLossTonnesPerHaYear,
                          recommendedIntervention: rusleData.interventionsRecommended[0] || 'Earthen Gully Plugs (EGP)',
                          evidenceText: hs.satelliteEvidence,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Create Verification Case</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH FIELD VERIFICATION CASE MODAL */}
      {verifyingHotspot && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    PMKSY Ground-Truth Verification Case Dispatch
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Formalize remote sensing soil degradation hotspot into an auditable field verification work order.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setVerifyingHotspot(null);
                  setCreatedCaseResult(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Created Case Success Confirmation */}
            {createdCaseResult ? (
              <div className="space-y-4 py-3 animate-fade-in">
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Verification Case Dispatched Successfully!</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Official case reference <strong className="text-white font-mono">{createdCaseResult.caseNumber}</strong> has been created with cryptographic SHA-256 evidence chain anchoring.
                  </p>
                  <div className="font-mono text-[10px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800 break-all">
                    SHA-256 Audit Hash: <span className="text-emerald-400">{createdCaseResult.hash}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setVerifyingHotspot(null);
                      setCreatedCaseResult(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    Done
                  </button>
                  {onNavigateToCases && (
                    <button
                      onClick={() => {
                        setVerifyingHotspot(null);
                        setCreatedCaseResult(null);
                        onNavigateToCases();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View in Case Management</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Verification Case Dispatch Form */
              <form onSubmit={handleDispatchVerificationCase} className="space-y-4 text-xs">
                {/* 1. Location & Hotspot Summary */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                    Target Hotspot & Spatial Coordinates
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-white block">{verifyingHotspot.name}</span>
                      <span className="text-xs text-slate-400">{watershedName} ({watershedId})</span>
                    </div>
                    <div className="font-mono text-emerald-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] self-start sm:self-auto">
                      Lat: {verifyingHotspot.lat.toFixed(5)}°N, Lng: {verifyingHotspot.lng.toFixed(5)}°E
                    </div>
                  </div>
                </div>

                {/* 2. Scientific Remote Sensing & RUSLE Profile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Predicted Soil Loss (RUSLE A)</span>
                    <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {verifyingHotspot.soilLossRate} t/ha/yr
                    </span>
                    <span className="text-[10px] text-amber-400">
                      Tolerable limit: {rusleData.tolerableSoilLossTValue} t/ha/yr ({verifyingHotspot.severity} SEVERITY)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Primary Degradation Driver</span>
                    <span className="text-xs text-slate-300 mt-0.5 block">
                      {verifyingHotspot.primaryDriver}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block truncate">
                      Evidence: {verifyingHotspot.evidenceText}
                    </span>
                  </div>
                </div>

                {/* 3. Recommended PMKSY-WDC 2.0 Intervention Selection */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block">
                    Recommended PMKSY-WDC 2.0 Engineering Intervention:
                  </label>
                  <select
                    value={selectedIntervention}
                    onChange={(e) => setSelectedIntervention(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {rusleData.interventionsRecommended.map((intv, idx) => (
                      <option key={idx} value={intv}>
                        {intv}
                      </option>
                    ))}
                    <option value="Deep Silt Excavation and Pond Desiltation">
                      Deep Silt Excavation and Pond Desiltation
                    </option>
                    <option value="Continuous Contour Trenches (CCT) on upper ridges">
                      Continuous Contour Trenches (CCT) on upper ridges
                    </option>
                    <option value="Earthen Gully Plugs (EGP) along 2nd order drainage">
                      Earthen Gully Plugs (EGP) along 2nd order drainage
                    </option>
                    <option value="Loose Boulder Structures (LBS) on stream reaches">
                      Loose Boulder Structures (LBS) on stream reaches
                    </option>
                    <option value="Vegetative Vetiver Grass Bunding">
                      Vegetative Vetiver Grass Bunding
                    </option>
                  </select>
                </div>

                {/* 4. Inspection Officer & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">
                      Assigned WDT Civil Engineer:
                    </label>
                    <input
                      type="text"
                      value={assignedOfficer}
                      onChange={(e) => setAssignedOfficer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">
                      Verification Deadline:
                    </label>
                    <select
                      value={verificationDeadline}
                      onChange={(e) => setVerificationDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="3 Calendar Days (Urgent Hotspot)">3 Calendar Days (Urgent Hotspot)</option>
                      <option value="7 Calendar Days">7 Calendar Days (Standard Audit)</option>
                      <option value="14 Calendar Days">14 Calendar Days (Pre-Monsoon Review)</option>
                    </select>
                  </div>
                </div>

                {/* 5. Custom Field Notes */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block">
                    Special Instructions for Field Audit Team (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={fieldNotes}
                    onChange={(e) => setFieldNotes(e.target.value)}
                    placeholder="e.g., Take 3 cross-section depth measurements; inspect upstream ridge runoff; verify Gram Sabha topsoil reuse resolution..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                  />
                </div>

                {/* 6. Cryptographic Integrity Preview */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Cryptographic Anchor: SHA-256 RFC 6234</span>
                  <span className="text-emerald-400">Audit Trail Block #1 & #2 Ready</span>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setVerifyingHotspot(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Field Verification Order</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
