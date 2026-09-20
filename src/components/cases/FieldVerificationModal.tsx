import React, { useState } from 'react';
import { WatershedCase, CaseVerificationOutcome } from '../../types';
import {
  CheckSquare,
  X,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  PenTool,
  Camera,
  MapPin,
  Clock,
  AlertTriangle,
  Info,
  Ruler,
  Check,
  FileCheck,
} from 'lucide-react';

interface FieldVerificationModalProps {
  watershedCase: WatershedCase;
  onClose: () => void;
  onConfirmVerification: (
    caseId: string,
    notes: string,
    confirmed: boolean,
    outcome?: CaseVerificationOutcome,
    measurements?: {
      siltDepthM?: number;
      scourLengthM?: number;
      waterLevelM?: number;
      gpsAccuracyM?: number;
      observations?: string;
    },
    signatures?: { inspector: string; sarpanch: string }
  ) => void;
}

export const FieldVerificationModal: React.FC<FieldVerificationModalProps> = ({
  watershedCase,
  onClose,
  onConfirmVerification,
}) => {
  const isRegistryIssue =
    watershedCase.title.toLowerCase().includes('ocr') ||
    watershedCase.title.toLowerCase().includes('registry') ||
    watershedCase.description.toLowerCase().includes('signboard');

  // Checklist appropriate to issue (Section 8)
  const [siltChecklist, setSiltChecklist] = useState({
    confirmGps: true,
    inspectStructure: true,
    measureSediment: true,
    inspectSpillway: true,
    inspectApron: true,
    captureGeoPhoto: true,
    compareEvidence: true,
    recordMeasurements: true,
    recordObservations: true,
    obtainLocalSignoff: true,
  });

  const [registryChecklist, setRegistryChecklist] = useState({
    confirmIdentity: true,
    photographPlaque: true,
    verifyWorkCode: true,
    verifyStructureType: true,
    verifyProjectInfo: true,
    compareRegistry: true,
    recordExplanation: true,
    obtainReview: true,
  });

  // Measurements
  const [siltDepthM, setSiltDepthM] = useState<number>(1.4);
  const [scourLengthM, setScourLengthM] = useState<number>(3.2);
  const [waterLevelM, setWaterLevelM] = useState<number>(0.3);
  const [gpsAccuracyM, setGpsAccuracyM] = useState<number>(2.4);

  // Verification Outcome (Section 11)
  const [outcome, setOutcome] = useState<CaseVerificationOutcome>('REQUIRES MAINTENANCE');

  // Notes
  const [engineerNotes, setEngineerNotes] = useState(
    'Conducted physical inspection with Rui Gram Panchayat Sarpanch. Siltation measured at 1.4m depth across pondage zone (78% storage loss). Apron boulder pitching required on downstream left flank. Excavation topsoil recommended for distribution to 14 marginal farmers.'
  );

  // Inspector & Sign-offs (Section 10)
  const [inspectorName, setInspectorName] = useState(
    watershedCase.fieldVerification?.assignedTo || 'Er. S. Patil (WDT Junior Engineer)'
  );
  const [sarpanchName, setSarpanchName] = useState('Smt. Sunita Shinde (Sarpanch, Rui GP)');
  const [inspectorSigned, setInspectorSigned] = useState(true);
  const [sarpanchSigned, setSarpanchSigned] = useState(true);

  // Simulated photo capture (Section 9)
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80'
  );

  const toggleSilt = (key: keyof typeof siltChecklist) => {
    setSiltChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRegistry = (key: keyof typeof registryChecklist) => {
    setRegistryChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleComplete = () => {
    const measurements = {
      siltDepthM,
      scourLengthM,
      waterLevelM,
      gpsAccuracyM,
      observations: engineerNotes,
    };
    const signatures = {
      inspector: inspectorName,
      sarpanch: sarpanchName,
    };

    onConfirmVerification(
      watershedCase.id,
      engineerNotes,
      true,
      outcome,
      measurements,
      signatures
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17211D]/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-[#DCE3DD] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#DCE3DD] bg-[#F7F8F4]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#17211D]">FIELD VERIFICATION & GROUND SIGN-OFF</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  {watershedCase.caseNumber}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                  PROTOTYPE VERIFICATION
                </span>
              </div>
              <p className="text-xs text-[#66736C] mt-0.5 line-clamp-1">{watershedCase.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#66736C] hover:text-[#17211D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body (Section 7) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs bg-white">
          {/* Metadata Card: Case, Asset, Coordinates, Date/Time */}
          <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div>
              <span className="text-[10px] uppercase text-[#66736C] block font-semibold">Case ID:</span>
              <strong className="text-[#17211D]">{watershedCase.caseNumber}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#66736C] block font-semibold">Asset:</span>
              <strong className="text-[#075B45] truncate block">
                {watershedCase.assetName || watershedCase.structureId || 'Rui East Check Dam #4'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#66736C] block font-semibold">GPS Coordinates:</span>
              <span className="text-[#17211D]">
                {watershedCase.location.lat.toFixed(4)}°N, {watershedCase.location.lng.toFixed(4)}°E
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#66736C] block font-semibold">Inspection Date:</span>
              <span className="text-[#17211D]">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Statutory / Field Checklist (Section 8) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#17211D]">
                {isRegistryIssue
                  ? 'Physical Milestone Registry Audit Checklist'
                  : 'Check Dam & Drainage Line Physical Audit Checklist'}
              </span>
              <span className="text-[10px] font-mono text-[#075B45] bg-[#075B45]/10 px-2.5 py-0.5 rounded-full border border-[#075B45]/20 font-semibold">
                PMKSY-WDC 2.0 Section 6.1
              </span>
            </div>

            <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-[#DCE3DD] space-y-2.5">
              {!isRegistryIssue ? (
                <>
                  {[
                    { key: 'confirmGps', label: 'Confirm GPS coordinates on site (±2.4m accuracy verified)' },
                    { key: 'inspectStructure', label: 'Inspect weir masonry wall, crest, and abutment flanks' },
                    { key: 'measureSediment', label: 'Measure sediment depth with probe staff (exceeds 40% threshold)' },
                    { key: 'inspectSpillway', label: 'Inspect spillway crest for free discharge and silt blinding' },
                    { key: 'inspectApron', label: 'Inspect downstream apron for scour undermining or loose boulders' },
                    { key: 'captureGeoPhoto', label: 'Capture current geo-coded ground photo with hardware EXIF' },
                    { key: 'compareEvidence', label: 'Compare on-site condition with satellite & previous photos' },
                    { key: 'recordMeasurements', label: 'Record physical measurements in field memorandum book' },
                    { key: 'recordObservations', label: 'Record engineer notes & de-silting volume calculation' },
                    { key: 'obtainLocalSignoff', label: 'Obtain local Gram Panchayat Sarpanch concurrence & sign-off' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 cursor-pointer text-[#17211D] hover:text-[#075B45]"
                    >
                      <input
                        type="checkbox"
                        checked={siltChecklist[item.key as keyof typeof siltChecklist]}
                        onChange={() => toggleSilt(item.key as keyof typeof siltChecklist)}
                        className="rounded border-[#DCE3DD] text-[#075B45] focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11px] font-sans">{item.label}</span>
                    </label>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { key: 'confirmIdentity', label: 'Confirm physical structure identity on cadastral map' },
                    { key: 'photographPlaque', label: 'Photograph milestone plaque with clear lettering' },
                    { key: 'verifyWorkCode', label: 'Verify work code matches administrative sanction registry' },
                    { key: 'verifyStructureType', label: 'Verify physical structure type (Cement Nala Bund / Masonry Dam)' },
                    { key: 'verifyProjectInfo', label: 'Verify visible project cost, year, and implementing agency' },
                    { key: 'compareRegistry', label: 'Compare against state PMKSY database entries' },
                    { key: 'recordExplanation', label: 'Record explanation for any financial year crossover discrepancy' },
                    { key: 'obtainReview', label: 'Obtain Sub-Divisional Engineer administrative review' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 cursor-pointer text-[#17211D] hover:text-[#075B45]"
                    >
                      <input
                        type="checkbox"
                        checked={registryChecklist[item.key as keyof typeof registryChecklist]}
                        onChange={() => toggleRegistry(item.key as keyof typeof registryChecklist)}
                        className="rounded border-[#DCE3DD] text-[#075B45] focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11px] font-sans">{item.label}</span>
                    </label>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Field Evidence Upload / Capture (Section 9) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#17211D] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#8A6A3F]" />
                <span>Field Evidence Capture (Current Geo-Photo)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300 font-semibold">
                SIMULATED FIELD CAPTURE — PROTOTYPE
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden border border-[#DCE3DD] bg-[#F0F3EE] relative flex-shrink-0">
                <img
                  src={capturedPhotoUrl}
                  alt="Simulated verification photo"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-white/90 text-[9px] font-mono text-[#075B45] px-1.5 py-0.5 rounded border border-[#DCE3DD] font-bold">
                  GPS Attested
                </span>
              </div>
              <div className="flex-1 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#66736C] font-mono">
                  <span>GPS Precision:</span>
                  <span className="text-[#075B45] font-semibold">±{gpsAccuracyM} meters (Differential GPS)</span>
                </div>
                <div className="flex justify-between text-[#66736C] font-mono">
                  <span>Timestamp:</span>
                  <span className="text-[#17211D]">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#66736C] font-mono">
                  <span>Inspector Device:</span>
                  <span className="text-[#17211D]">WDT Field Tablet v2.4 (Android 14)</span>
                </div>
                <div className="flex justify-between text-[#66736C] font-mono">
                  <span>Hardware Tamper Check:</span>
                  <span className="text-[#075B45] font-semibold">PASSED (Hardware Keystore Sealed)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Measurements Grid */}
          <div className="space-y-2">
            <span className="font-bold text-sm text-[#17211D] flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-[#1677A8]" />
              <span>Physical Field Measurements</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD]">
                <span className="text-[10px] text-[#66736C] block font-semibold">Silt Depth:</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={siltDepthM}
                    onChange={(e) => setSiltDepthM(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-white border border-[#DCE3DD] rounded px-2 py-0.5 text-xs text-[#17211D] font-mono focus:border-[#075B45]"
                  />
                  <span className="text-xs text-[#66736C]">m</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD]">
                <span className="text-[10px] text-[#66736C] block font-semibold">Scour Length:</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={scourLengthM}
                    onChange={(e) => setScourLengthM(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-white border border-[#DCE3DD] rounded px-2 py-0.5 text-xs text-[#17211D] font-mono focus:border-[#075B45]"
                  />
                  <span className="text-xs text-[#66736C]">m</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD]">
                <span className="text-[10px] text-[#66736C] block font-semibold">Static Water Level:</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={waterLevelM}
                    onChange={(e) => setWaterLevelM(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-white border border-[#DCE3DD] rounded px-2 py-0.5 text-xs text-[#17211D] font-mono focus:border-[#075B45]"
                  />
                  <span className="text-xs text-[#66736C]">m</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD]">
                <span className="text-[10px] text-[#66736C] block font-semibold">GPS Accuracy:</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={gpsAccuracyM}
                    onChange={(e) => setGpsAccuracyM(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-white border border-[#DCE3DD] rounded px-2 py-0.5 text-xs text-[#17211D] font-mono focus:border-[#075B45]"
                  />
                  <span className="text-xs text-[#66736C]">±m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Outcome Selector (Section 11) */}
          <div className="space-y-2">
            <span className="font-bold text-sm text-[#17211D]">Verification Outcome Assessment:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  'VERIFIED CONDITION',
                  'REQUIRES MAINTENANCE',
                  'NO ISSUE FOUND',
                  'MORE EVIDENCE REQUIRED',
                  'OTHER',
                ] as CaseVerificationOutcome[]
              ).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOutcome(opt)}
                  className={`p-2.5 rounded-xl border text-left font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                    outcome === opt
                      ? 'bg-[#075B45]/10 border-2 border-[#075B45] text-[#075B45] shadow-xs'
                      : 'bg-white border-[#DCE3DD] text-[#66736C] hover:border-[#075B45]/40 hover:bg-[#F0F3EE]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Inspection Memorandum Notes */}
          <div className="space-y-1.5">
            <label className="block font-bold text-sm text-[#17211D]">
              Field Engineer Memorandum & Recommended Ground Action:
            </label>
            <textarea
              rows={3}
              value={engineerNotes}
              onChange={(e) => setEngineerNotes(e.target.value)}
              className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl p-3 text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45] resize-none font-sans text-xs"
            />
          </div>

          {/* Field Verification Sign-Off Controls (Section 10) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#17211D] flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-[#075B45]" />
                <span>Field Sign-Off Authorities</span>
              </span>
              <span className="text-[10px] font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                PROTOTYPE SIGN-OFF
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Role 1: WDT Engineer */}
              <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17211D] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#1677A8]" />
                    <span>Role 1: Inspecting Engineer</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#075B45] font-semibold">WDT Civil</span>
                </div>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-white border border-[#DCE3DD] rounded-lg px-2.5 py-1.5 text-xs text-[#17211D] focus:border-[#075B45]"
                />
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#17211D] pt-1">
                  <input
                    type="checkbox"
                    checked={inspectorSigned}
                    onChange={(e) => setInspectorSigned(e.target.checked)}
                    className="rounded border-[#DCE3DD] text-[#075B45] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Affix Prototype Digital Signature & Timestamp</span>
                </label>
              </div>

              {/* Role 2: Local Sarpanch */}
              <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17211D] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8A6A3F]" />
                    <span>Role 2: Local Sarpanch / GP</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 font-semibold">Gram Sabha</span>
                </div>
                <input
                  type="text"
                  value={sarpanchName}
                  onChange={(e) => setSarpanchName(e.target.value)}
                  className="w-full bg-white border border-[#DCE3DD] rounded-lg px-2.5 py-1.5 text-xs text-[#17211D] focus:border-[#075B45]"
                />
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#17211D] pt-1">
                  <input
                    type="checkbox"
                    checked={sarpanchSigned}
                    onChange={(e) => setSarpanchSigned(e.target.checked)}
                    className="rounded border-[#DCE3DD] text-amber-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Affix Local GP Attestation & Concurrence</span>
                </label>
              </div>
            </div>

            <p className="text-[10px] text-[#66736C] italic">
              Notice: Prototype sign-off controls demonstrate two-party accountability. Not legally valid digital signatures.
            </p>
          </div>
        </div>

        {/* Footer Actions (Section 10 & 12) */}
        <div className="p-4 border-t border-[#DCE3DD] bg-[#F7F8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-[#66736C] text-[11px]">
            Submitting will seal a new <strong className="text-[#075B45]">FIELD_VERIFICATION</strong> block
            into the SHA-256 Evidence Chain.
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#17211D] font-semibold transition-colors cursor-pointer border border-[#DCE3DD]"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={!inspectorSigned}
              className="px-5 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Submit Verification (Append to Chain)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
