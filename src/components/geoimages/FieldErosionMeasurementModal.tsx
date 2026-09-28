import React, { useState } from 'react';
import {
  X,
  Ruler,
  Calculator,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Save,
} from 'lucide-react';
import { erosionService, FieldErosionObservation } from '../../services/erosionService';

interface FieldErosionMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  watershedId?: string;
  structureId?: string;
  caseId?: string;
  defaultLat?: number;
  defaultLng?: number;
  onSave?: (observation: FieldErosionObservation) => void;
}

export const FieldErosionMeasurementModal: React.FC<FieldErosionMeasurementModalProps> = ({
  isOpen,
  onClose,
  watershedId = 'ws-dharashiv-ter',
  structureId = 'struct-cd-04',
  caseId = 'case-es-2026-0842',
  defaultLat = 18.23724,
  defaultLng = 75.98451,
  onSave,
}) => {
  const [erosionType, setErosionType] = useState<FieldErosionObservation['measurements']['erosionType']>('CHECK_DAM_SILTATION');
  const [lengthM, setLengthM] = useState<number>(35.0);
  const [widthM, setWidthM] = useState<number>(14.0);
  const [depthM, setDepthM] = useState<number>(1.2);
  const [bulkDensity, setBulkDensity] = useState<number>(1.42);
  const [measuredBy, setMeasuredBy] = useState<string>('Junior Engineer (WDT)');
  const [tools, setTools] = useState<string>('Graduated Sounding Rod, Laser Rangefinder');
  const [notes, setNotes] = useState<string>('Measured siltation pool accumulation reaching 80% of spillway crest.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Real-time physical calculation
  const calculations = erosionService.calculatePhysicalErosion(lengthM, widthM, depthM, bulkDensity);

  const handleSave = () => {
    const observation: FieldErosionObservation = {
      id: `feo-${Date.now().toString(36)}`,
      caseId,
      structureId,
      watershedId,
      location: {
        lat: defaultLat,
        lng: defaultLng,
        description: `Physical measurement at coordinates [${defaultLat.toFixed(5)}, ${defaultLng.toFixed(5)}]`,
      },
      measurements: {
        erosionType,
        lengthMeters: lengthM,
        averageWidthMeters: widthM,
        averageDepthMeters: depthM,
        soilBulkDensityTonnesPerCuM: bulkDensity,
        measuredDate: new Date().toISOString().split('T')[0],
        measuredBy,
        measurementToolsUsed: tools.split(',').map((t) => t.trim()),
      },
      estimates: {
        voidVolumeCuMeters: calculations.volumeCuM,
        displacedSoilMassTonnes: calculations.massTonnes,
        estimatedAnnualExpansionMeters: 0.2,
        annualSoilLossRateTonnesPerYear: calculations.annualMassTonnes,
        riskSeverity: calculations.riskSeverity,
        confidenceGrade: 'MEASURED_PRIMARY',
      },
      fieldNotes: notes,
    };

    if (onSave) onSave(observation);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17211D]/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-[#DCE3DD] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-scale-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE3DD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Ruler className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17211D] flex items-center gap-2">
                Log Physical Soil Erosion / Siltation Measurement
              </h3>
              <p className="text-xs text-[#66736C] mt-0.5">
                Primary ground evidence: physical dimensions measured with rod/tape, calculated via volumetric bulk density
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#66736C] hover:text-[#17211D] hover:bg-[#F0F3EE] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#66736C] font-semibold mb-1">Erosion / Damage Type</label>
              <select
                value={erosionType}
                onChange={(e) => setErosionType(e.target.value as any)}
                className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-[#17211D] font-medium focus:border-[#075B45] outline-none"
              >
                <option value="CHECK_DAM_SILTATION">Check Dam Upstream Siltation</option>
                <option value="GULLY_HEAD">Gully Head Active Incision</option>
                <option value="STREAM_BANK_CUT">Stream Bank Scour & Undercutting</option>
                <option value="RILL_SYSTEM">Rill Network Erosion</option>
                <option value="SHEET_WASH">Sheet Wash Topsoil Denudation</option>
              </select>
            </div>

            <div>
              <label className="block text-[#66736C] font-semibold mb-1">Assigned Inspector / Role</label>
              <input
                type="text"
                value={measuredBy}
                onChange={(e) => setMeasuredBy(e.target.value)}
                className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-[#17211D] font-medium focus:border-[#075B45] outline-none"
              />
            </div>
          </div>

          {/* Dimension Inputs */}
          <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-2xl p-4 space-y-3">
            <div className="text-[11px] font-mono text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" />
              Physical Ground Measurements (Taped / Sounded)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[#66736C] mb-1">Length (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={lengthM}
                  onChange={(e) => setLengthM(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-[#DCE3DD] rounded-lg px-2.5 py-1.5 text-[#17211D] font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[#66736C] mb-1">Avg Width (m)</label>
                <input
                  type="number"
                  step="0.2"
                  value={widthM}
                  onChange={(e) => setWidthM(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-[#DCE3DD] rounded-lg px-2.5 py-1.5 text-[#17211D] font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[#66736C] mb-1">Avg Depth (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={depthM}
                  onChange={(e) => setDepthM(Math.max(0.05, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-[#DCE3DD] rounded-lg px-2.5 py-1.5 text-[#17211D] font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[#66736C] mb-1">Bulk Density (t/m³)</label>
                <input
                  type="number"
                  step="0.05"
                  value={bulkDensity}
                  onChange={(e) => setBulkDensity(Math.max(1.0, parseFloat(e.target.value) || 1.42))}
                  className="w-full bg-white border border-[#DCE3DD] rounded-lg px-2.5 py-1.5 text-[#1677A8] font-mono font-bold"
                />
              </div>
            </div>
            <div className="text-[10px] text-[#66736C]">
              * Trapezoidal cross-section shape factor (0.85) applied. Typical Indian Vertisol dry bulk density: 1.35 – 1.50 t/m³.
            </div>
          </div>

          {/* Derived Calculations Preview */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-[#075B45] flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                Deterministic Output (Calculated Estimate)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-100 text-rose-700 border border-rose-200">
                {calculations.riskSeverity} RISK
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-[#DCE3DD]">
                <span className="text-[10px] text-[#66736C] block uppercase font-medium">Void Volume</span>
                <span className="text-lg font-black text-[#17211D] font-mono">{calculations.volumeCuM} m³</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#DCE3DD]">
                <span className="text-[10px] text-[#66736C] block uppercase font-medium">Soil Mass</span>
                <span className="text-lg font-black text-amber-700 font-mono">{calculations.massTonnes} t</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#DCE3DD]">
                <span className="text-[10px] text-[#66736C] block uppercase font-medium">Est. Annual Rate</span>
                <span className="text-lg font-black text-[#1677A8] font-mono">~{calculations.annualMassTonnes} t/yr</span>
              </div>
            </div>

            <div className="text-[11px] text-[#66736C] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#075B45] shrink-0" />
              <span>
                <strong>Formula:</strong> Volume = Length × Width × Depth × 0.85; Soil Mass = Volume × Bulk Density ({bulkDensity} t/m³).
              </span>
            </div>
          </div>

          {/* Notes & Tools */}
          <div>
            <label className="block text-[#66736C] font-semibold mb-1">Measurement Tools & Calibration</label>
            <input
              type="text"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-[#17211D] focus:border-[#075B45] outline-none"
            />
          </div>

          <div>
            <label className="block text-[#66736C] font-semibold mb-1">Field Observations & Ground Truth</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl p-3 text-[#17211D] focus:border-[#075B45] outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#DCE3DD]">
          <div className="text-[11px] text-[#66736C] font-mono">
            Linked to: [{defaultLat.toFixed(4)}, {defaultLng.toFixed(4)}]
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#66736C] hover:text-[#17211D] hover:bg-[#F0F3EE] text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={savedSuccess}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Measurement Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Record Field Measurement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
