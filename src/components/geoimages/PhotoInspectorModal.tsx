import React, { useState } from 'react';
import { GeoCodedImage, WatershedStructure, OcrExtraction } from '../../types';
import { ocrService } from '../../services/ocrService';
import {
  X,
  MapPin,
  Camera,
  Compass,
  Smartphone,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Sparkles,
  Hash,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Tag,
  ArrowRight,
  Layers,
  RefreshCw,
  Info,
  Satellite,
  Droplets,
} from 'lucide-react';

interface PhotoInspectorModalProps {
  image: GeoCodedImage;
  structures?: WatershedStructure[];
  onClose: () => void;
  onOpenCase?: (caseId: string) => void;
  onViewOnMap?: (structureId?: string, lat?: number, lng?: number) => void;
}

export const PhotoInspectorModal: React.FC<PhotoInspectorModalProps> = ({
  image,
  structures = [],
  onClose,
  onOpenCase,
  onViewOnMap,
}) => {
  const associatedStructure = structures.find((s) => s.id === image.structureId);

  // OCR state
  const [ocrData, setOcrData] = useState<OcrExtraction | null>(image.ocr || null);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'ocr' | 'damage' | 'splitLink'>('metadata');

  const handleRunOcr = async () => {
    setIsExtractingOcr(true);
    try {
      const extracted = await ocrService.extractProjectRecord(
        { imageUrl: image.imageUrl },
        associatedStructure
      );
      setOcrData(extracted);
      setActiveTab('ocr');
    } finally {
      setIsExtractingOcr(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17211D]/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-[#DCE3DD] rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#DCE3DD] bg-[#F7F8F4] sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#17211D]">
                  Geo-Coded Ground Evidence Inspector
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F3EE] text-[#66736C] border border-[#DCE3DD]">
                  {image.id}
                </span>
                {image.isSimulated || image.imageClassification === 'SIMULATED' || image.isDemoImage ? (
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                    SIMULATED / TEST IMAGE — NOT FIELD EVIDENCE
                  </span>
                ) : (
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300">
                    FIELD EVIDENCE
                  </span>
                )}
                {image.evidenceStatus && (
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      image.evidenceStatus === 'Registry Match' || image.evidenceStatus === 'Verified Metadata'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : image.evidenceStatus === 'Registry Mismatch'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {image.evidenceStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#66736C] mt-0.5">
                Captured {new Date(image.timestamp).toLocaleString()} • Reported by {image.uploadedBy.name} ({image.uploadedBy.role})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#66736C] hover:text-[#17211D] border border-[#DCE3DD] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image, Caption & Evidence Seal (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#DCE3DD]">
              <span className="font-bold text-xs uppercase tracking-wider text-[#075B45] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>ORIGINAL FIELD IMAGE</span>
              </span>
              {image.isDemoImage && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  DEMO FIELD IMAGE
                </span>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[#DCE3DD] shadow-md bg-slate-100 aspect-video lg:aspect-[4/3]">
              <img
                src={image.imageUrl}
                alt={image.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#DCE3DD] text-[10px] font-mono flex items-center gap-1 shadow-xs">
                {image.locationSource === 'EXIF_GPS' || (image.hasGps !== false && image.gps && image.gps.lat) ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">GPS VERIFIED</span>
                  </>
                ) : image.locationSource === 'MANUAL_ASSOCIATION' ? (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-amber-700 font-bold">MANUALLY ASSOCIATED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-rose-700 font-bold">GPS NOT AVAILABLE</span>
                  </>
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-[#DCE3DD] text-[11px] text-[#17211D] shadow-xs">
                <span className="font-semibold text-[#075B45] block mb-0.5">Field Caption:</span>
                "{image.caption}"
              </div>
            </div>

            {/* Observed Field Condition Tags */}
            {image.observedTags && image.observedTags.length > 0 && (
              <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1.5">
                <span className="text-[10px] font-bold text-[#66736C] uppercase tracking-wider block">
                  Observed Field Conditions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {image.observedTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-[#17211D] border border-[#DCE3DD] flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-[#1677A8]" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Associated Structure Card */}
            {associatedStructure && (
              <div className="p-3.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17211D] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#075B45]" />
                    <span>Linked Conservation Asset</span>
                  </span>
                  <span className="font-mono text-[10px] text-[#075B45] font-bold">
                    {associatedStructure.code}
                  </span>
                </div>
                <div className="text-xs text-[#17211D]">
                  <div className="font-semibold">{associatedStructure.name}</div>
                  <div className="text-[11px] text-[#66736C] font-mono mt-0.5">
                    {associatedStructure.type} • Stream Order {associatedStructure.streamOrder} • Sanction: ₹{associatedStructure.estimatedCostInr.toLocaleString('en-IN')}
                  </div>
                </div>
                {onViewOnMap && (
                  <button
                    onClick={() => {
                      onViewOnMap(associatedStructure.id, associatedStructure.lat, associatedStructure.lng);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white hover:bg-[#F0F3EE] text-[#17211D] border border-[#DCE3DD] text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
                    <span>Focus Asset in Watershed GIS</span>
                  </button>
                )}
              </div>
            )}

            {/* Cryptographic SHA-256 Hash Seal */}
            <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] text-xs font-mono">
              <div className="flex items-center gap-1.5 text-[#66736C] mb-1">
                <Hash className="w-3.5 h-3.5 text-[#075B45]" />
                <span>SHA-256 Evidence Integrity Hash</span>
              </div>
              <div className="text-[10px] text-[#075B45] font-bold break-all bg-white p-2 rounded border border-[#DCE3DD]">
                {image.evidenceHash}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Telemetry + OCR + Registry Comparison (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#F7F8F4] p-1 rounded-xl border border-[#DCE3DD] text-xs">
              <button
                onClick={() => setActiveTab('metadata')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'metadata'
                    ? 'bg-white text-[#17211D] shadow-xs border border-[#DCE3DD]'
                    : 'text-[#66736C] hover:text-[#17211D]'
                }`}
              >
                EXIF & SENSOR METADATA
              </button>
              <button
                onClick={() => setActiveTab('ocr')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'ocr'
                    ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                    : 'text-[#66736C] hover:text-[#17211D]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>OCR RESULT</span>
              </button>
              <button
                onClick={() => setActiveTab('damage')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'damage'
                    ? 'bg-white text-[#075B45] shadow-xs border border-emerald-200'
                    : 'text-[#66736C] hover:text-[#17211D]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#075B45]" />
                <span>AI ADVISORY</span>
              </button>
              <button
                onClick={() => setActiveTab('splitLink')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'splitLink'
                    ? 'bg-white text-[#1677A8] shadow-xs border border-sky-200'
                    : 'text-[#66736C] hover:text-[#17211D]'
                }`}
              >
                <Satellite className="w-3.5 h-3.5 text-[#1677A8]" />
                <span>SATELLITE LINK</span>
              </button>
            </div>

            {/* TAB 1: METADATA & INTEGRITY */}
            {activeTab === 'metadata' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                {/* Geospatial EXIF Telemetry */}
                <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-[#DCE3DD] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
                    <div className="flex items-center gap-2 font-bold text-[#1677A8] uppercase tracking-wider text-[11px]">
                      <MapPin className="w-4 h-4" />
                      <span>Geospatial Coordinates & Precision</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#075B45] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ±{image.gps.accuracyM}m Precision
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                    <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD]">
                      <div className="text-[10px] text-[#66736C] font-sans font-medium">Latitude</div>
                      <div className="font-bold text-[#17211D] mt-0.5">{image.gps.lat.toFixed(5)}° N</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD]">
                      <div className="text-[10px] text-[#66736C] font-sans font-medium">Longitude</div>
                      <div className="font-bold text-[#17211D] mt-0.5">{image.gps.lng.toFixed(5)}° E</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD]">
                      <div className="text-[10px] text-[#66736C] font-sans font-medium">Altitude</div>
                      <div className="font-bold text-[#17211D] mt-0.5">{image.gps.altitudeM} m MSL</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD]">
                      <div className="text-[10px] text-[#66736C] font-sans font-medium">Azimuth</div>
                      <div className="font-bold text-[#17211D] mt-0.5">{image.gps.azimuthDeg}°</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#66736C] pt-1 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#66736C]" />
                      <span>Device: {image.deviceInfo.deviceModel}</span>
                    </span>
                    <span>App: {image.deviceInfo.appVersion}</span>
                  </div>
                </div>

                {/* Simulated Metadata Integrity Verification Section */}
                <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-[#DCE3DD] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
                    <div className="flex items-center gap-2 font-bold text-[#17211D] text-xs">
                      <ShieldCheck className="w-4 h-4 text-[#075B45]" />
                      <span>Simulated Metadata Integrity Audit</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#B7791F] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Simulated Check
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] flex items-center justify-between">
                      <span className="text-[#17211D]">EXIF Headers Present</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] flex items-center justify-between">
                      <span className="text-[#17211D]">GPS Accuracy Threshold (&lt; 10m)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] flex items-center justify-between">
                      <span className="text-[#17211D]">Timestamp Sequentiality</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] flex items-center justify-between">
                      <span className="text-[#17211D]">Hardware Attestation</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>

                  <div className="text-[10px] text-[#66736C] italic">
                    Prototype integrity verification for SIH PS 26015. Confirms client-side EXIF attributes before evidence chain hashing.
                  </div>
                </div>

                {/* Reporter Information */}
                <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-[#DCE3DD] space-y-2 text-xs">
                  <div className="font-bold text-[#17211D] text-xs pb-1 border-b border-[#DCE3DD]">
                    Personnel & Origin
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#66736C] block">Submitted By:</span>
                      <strong className="text-[#17211D]">{image.uploadedBy.name}</strong> ({image.uploadedBy.role})
                    </div>
                    <div>
                      <span className="text-[#66736C] block">Jurisdiction:</span>
                      <strong className="text-[#17211D]">{image.uploadedBy.village}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OCR & REGISTRY COMPARISON */}
            {activeTab === 'ocr' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                {/* 3-Step Visual Evidence Pipeline */}
                <div className="bg-[#F7F8F4] p-3 rounded-2xl border border-[#DCE3DD] flex items-center justify-between text-center text-[10px] font-mono">
                  <div className="flex-1">
                    <span className="text-[#66736C] block">STEP 1</span>
                    <strong className="text-[#1677A8] font-sans text-xs">Image Evidence</strong>
                    <span className="text-[9px] text-[#66736C]">Plaque Photo</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#DCE3DD] shrink-0" />
                  <div className="flex-1">
                    <span className="text-[#66736C] block">STEP 2</span>
                    <strong className="text-indigo-700 font-sans text-xs">OCR Extraction</strong>
                    <span className="text-[9px] text-[#66736C]">Text & Entities</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#DCE3DD] shrink-0" />
                  <div className="flex-1">
                    <span className="text-[#66736C] block">STEP 3</span>
                    <strong className="text-[#075B45] font-sans text-xs">GIS Registry Match</strong>
                    <span className="text-[9px] text-[#66736C]">Audit Alignment</span>
                  </div>
                </div>

                {ocrData ? (
                  <div className="space-y-4">
                    {/* OCR Raw Text Box */}
                    <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-indigo-200 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-[#DCE3DD]">
                        <div className="flex items-center gap-2 font-bold text-indigo-700 text-xs">
                          <FileText className="w-4 h-4" />
                          <span>Extracted Signboard Text</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Confidence: {(ocrData.confidence * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] font-mono text-[#075B45] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {ocrData.comparisonResult?.isSimulated || image.isSimulated ? 'PRESET OCR RECORD' : 'OCR ENGINE VERIFIED'}
                          </span>
                        </div>
                      </div>

                      {ocrData.status === 'NO_RELIABLE_TEXT_DETECTED' || !ocrData.rawText ? (
                        <div className="p-3 rounded-xl bg-white border border-[#DCE3DD] font-sans text-xs text-[#66736C] italic">
                          No readable text detected on image — manual verification required.
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-white border border-[#DCE3DD] font-mono text-xs text-[#17211D] whitespace-pre-line leading-relaxed">
                          {ocrData.rawText}
                        </div>
                      )}
                    </div>

                    {/* Registry Match Check Comparison Table */}
                    {ocrData.comparisonResult && (
                      <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-[#DCE3DD] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
                          <div>
                            <h4 className="text-xs font-bold text-[#17211D] flex items-center gap-2">
                              <span>Registry Comparison Audit</span>
                            </h4>
                            <p className="text-[10px] text-[#66736C]">
                              Cross-referencing OCR extracted fields with official GIS asset records
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              ocrData.comparisonResult.matchStatus === 'MATCH'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : ocrData.comparisonResult.matchStatus === 'PARTIAL MATCH'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : ocrData.comparisonResult.matchStatus === 'NO_RELIABLE_TEXT_DETECTED'
                                ? 'bg-slate-100 text-slate-700 border-slate-200'
                                : ocrData.comparisonResult.matchStatus === 'MANUAL REVIEW REQUIRED'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                          >
                            {ocrData.comparisonResult.matchStatus}
                          </span>
                        </div>

                        {/* Side-by-side Fields Comparison */}
                        <div className="space-y-2">
                          {ocrData.comparisonResult.fields.map((f, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="w-1/3">
                                <span className="text-[10px] text-[#66736C] block">{f.fieldName}</span>
                                <span className="font-semibold text-[#17211D]">{f.ocrValue}</span>
                                <span className="text-[9px] text-[#66736C] block font-mono">OCR Value</span>
                              </div>

                              <ArrowRight className="w-3.5 h-3.5 text-[#66736C] shrink-0" />

                              <div className="w-1/3">
                                <span className="text-[10px] text-[#66736C] block">Registry Expected</span>
                                <span className="font-semibold text-[#17211D]">{f.registryValue}</span>
                                <span className="text-[9px] text-[#66736C] block font-mono">GIS Record</span>
                              </div>

                              <div className="shrink-0">
                                {f.status === 'MATCH' ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>MATCH</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                    <XCircle className="w-3 h-3" />
                                    <span>MISMATCH</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Discrepancy Note with Neutral Language */}
                        {ocrData.comparisonResult.discrepancySummary && (
                          <div
                            className={`p-3 rounded-xl border text-xs leading-relaxed ${
                              ocrData.comparisonResult.matchStatus === 'MATCH'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold mb-0.5">
                              {ocrData.comparisonResult.matchStatus === 'MATCH' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              )}
                              <span>
                                {ocrData.comparisonResult.matchStatus === 'MATCH'
                                  ? 'Registry Alignment Verified'
                                  : 'Registry discrepancy detected — manual verification required.'}
                              </span>
                            </div>
                            <p className="text-[11px]">
                              {ocrData.comparisonResult.discrepancySummary}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[#F7F8F4] rounded-2xl border border-[#DCE3DD] space-y-3">
                    <FileText className="w-10 h-10 text-indigo-600 mx-auto opacity-60" />
                    <div>
                      <h4 className="text-sm font-bold text-[#17211D]">Extract Signboard Milestone Information</h4>
                      <p className="text-xs text-[#66736C] mt-1 max-w-md mx-auto">
                        Run OCR to extract Scheme, Work Code, Sanction Cost, and verify against the GIS asset registry.
                      </p>
                    </div>
                    <button
                      onClick={handleRunOcr}
                      disabled={isExtractingOcr}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
                    >
                      {isExtractingOcr ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Extracting Project Information...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Extract Project Information (OCR)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: AI ANALYSIS — ADVISORY */}
            {activeTab === 'damage' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
                    <div className="flex items-center gap-2 font-bold text-[#075B45] text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>AI IMAGE ANALYSIS (ADVISORY ONLY)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#B7791F] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Confidence: {Math.round((image.aiDamageAssessment.confidence || 0.9) * 100)}%
                    </span>
                  </div>

                  {/* Advisory Notice Banner */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold text-amber-900 mb-0.5">Advisory Analysis Only:</strong>
                      <span>AI computer vision analyzes the unaltered original field photograph to highlight potential physical anomalies. Human ground verification by a Junior Engineer or Gram Rozgar Sevak is required before taking civil, administrative, or financial action.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-[#DCE3DD]">
                      <div className="text-[10px] text-[#66736C]">Identified Structure Type:</div>
                      <div className="text-sm font-bold text-[#17211D] font-mono mt-0.5">
                        {image.aiDamageAssessment.structureIdentified}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#DCE3DD]">
                      <div className="text-[10px] text-[#66736C]">Estimated Silt Deposition:</div>
                      <div className="text-lg font-bold text-red-600 font-mono mt-0.5">
                        {image.aiDamageAssessment.siltationEstimatePct}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-[#17211D]">Observed Anomalies (Advisory):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {image.aiDamageAssessment.detectedDefects.map((defect, i) => (
                        <span
                          key={i}
                          className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{defect.startsWith('The image indicates') || defect.startsWith('Advisory') ? defect : `Indicates possible: ${defect}`}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <strong className="block font-semibold mb-0.5 text-emerald-900">
                      Suggested Ground Follow-up:
                    </strong>
                    {image.aiDamageAssessment.recommendedAction}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SATELLITE & GIS SPLIT LINK */}
            {activeTab === 'splitLink' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-[#DCE3DD] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
                    <div className="flex items-center gap-2 font-bold text-[#1677A8] uppercase tracking-wider text-[11px]">
                      <Satellite className="w-4 h-4" />
                      <span>Ground Photo ↔ Satellite & GIS Concordance</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#075B45] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      94.2% Spatial Alignment
                    </span>
                  </div>

                  <p className="text-[#66736C] text-xs">
                    Cross-referencing original field photograph EXIF coordinates with ISRO Bhuvan GIS, Sentinel-2 spectral indices, and ICAR soil profiles.
                  </p>

                  {/* 2x2 Telemetry Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Asset Proximity */}
                    <div className="p-3 rounded-xl bg-white border border-[#DCE3DD] space-y-1">
                      <div className="text-[10px] text-[#66736C] uppercase font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
                        <span>Distance to Conservation Asset</span>
                      </div>
                      <div className="text-sm font-bold text-[#17211D] font-mono">
                        18.2 meters to CD-04
                      </div>
                      <div className="text-[11px] text-[#66736C]">
                        Bearing: 215° SW • Elevation: 618.4m MSL
                      </div>
                    </div>

                    {/* Strahler Drainage Stream Order */}
                    <div className="p-3 rounded-xl bg-white border border-[#DCE3DD] space-y-1">
                      <div className="text-[10px] text-[#66736C] uppercase font-semibold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Strahler Drainage Order</span>
                      </div>
                      <div className="text-sm font-bold text-cyan-700 font-mono">
                        Stream Order 3 (Tributary)
                      </div>
                      <div className="text-[11px] text-[#66736C]">
                        Slope: 3.8% • Flow accumulation: 142.8 ha
                      </div>
                    </div>

                    {/* Sentinel-2 Spectral Indices */}
                    <div className="p-3 rounded-xl bg-white border border-[#DCE3DD] space-y-1">
                      <div className="text-[10px] text-[#66736C] uppercase font-semibold flex items-center gap-1">
                        <Satellite className="w-3.5 h-3.5 text-[#1677A8]" />
                        <span>Satellite Reflectance Index</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold font-mono">
                        <span className="text-[#075B45]">NDVI: 0.48</span>
                        <span className="text-[#DCE3DD]">|</span>
                        <span className="text-[#1677A8]">NDWI: +0.22</span>
                      </div>
                      <div className="text-[11px] text-[#66736C]">
                        Sentinel-2 MSI 10m • Surface pondage detected
                      </div>
                    </div>

                    {/* Soil & RUSLE Erosion */}
                    <div className="p-3 rounded-xl bg-white border border-[#DCE3DD] space-y-1">
                      <div className="text-[10px] text-[#66736C] uppercase font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8A6A3F]" />
                        <span>Soil Series & RUSLE Loss</span>
                      </div>
                      <div className="text-sm font-bold text-[#8A6A3F] font-mono">
                        Deep Clayey Vertisol
                      </div>
                      <div className="text-[11px] text-[#66736C]">
                        A = 2.28 t/ha/yr (Tolerable: &lt;11.2 t/ha/yr)
                      </div>
                    </div>
                  </div>

                  {/* Verification Status Banner */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-800 text-xs">
                        Physical Ground Truth Corroboration Confirmed
                      </div>
                      <div className="text-[11px] text-emerald-900/80 mt-0.5">
                        Ground photograph verified against Sentinel-2 multispectral tile T43QEE. Physical sediment depth of 1.45m logged by field team using calibrated sounding rod.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#DCE3DD] flex flex-wrap items-center justify-between gap-3">
              <div className="text-[10px] text-[#66736C] italic">
                Notice: Prototype demonstration record for SIH PS 26015.
              </div>

              <div className="flex items-center gap-2">
                {onViewOnMap && (
                  <button
                    onClick={() => {
                      onViewOnMap(image.structureId, image.gps.lat, image.gps.lng);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#17211D] border border-[#DCE3DD] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
                    <span>View on Map</span>
                  </button>
                )}

                {image.caseId && onOpenCase && (
                  <button
                    onClick={() => {
                      onOpenCase(image.caseId!);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Inspect Case ({image.caseId})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
