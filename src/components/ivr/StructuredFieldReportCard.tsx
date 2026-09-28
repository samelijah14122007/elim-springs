import React from 'react';
import {
  IvrVoiceReport,
  GeoCodedImage,
  WatershedStructure,
} from '../../types';
import {
  Languages,
  Sparkles,
  ArrowRight,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  FileText,
  ExternalLink,
  ShieldCheck,
  Tag,
  Info,
  Building,
  User,
} from 'lucide-react';
import { ivrService } from '../../services/ivrService';

interface StructuredFieldReportCardProps {
  report: IvrVoiceReport;
  structures?: WatershedStructure[];
  geoImages?: GeoCodedImage[];
  onCreateCase?: (report: IvrVoiceReport) => void;
  onViewOnMap?: (structureId?: string, lat?: number, lng?: number) => void;
  onInspectImage?: (image: GeoCodedImage) => void;
}

export const StructuredFieldReportCard: React.FC<StructuredFieldReportCardProps> = ({
  report,
  structures = [],
  geoImages = [],
  onCreateCase,
  onViewOnMap,
  onInspectImage,
}) => {
  // Convert into structured record
  const structured = ivrService.convertVoiceReportToFieldReport(report);

  // Associated structure (if any)
  const linkedStructure = structures.find(
    (s) => s.id === report.associatedStructureId || s.name === report.aiExtractedEntities.structureMentioned
  );

  // Related Field Photos: matched by associatedImageId, structureId, or proximity
  const relatedPhotos = geoImages.filter(
    (img) =>
      img.id === report.associatedImageId ||
      (linkedStructure && img.structureId === linkedStructure.id) ||
      (report.lat && report.lng && Math.abs(img.gps.lat - report.lat) < 0.006 && Math.abs(img.gps.lng - report.lng) < 0.006)
  );

  const urgencyColor =
    structured.urgency === 'Critical'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      : structured.urgency === 'High'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : structured.urgency === 'Medium'
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  const statusColor =
    report.status === 'Converted to Case'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';

  return (
    <div className="bg-white border border-[#DCE3DD] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* 1. VISUAL 3-STEP PIPELINE HEADER */}
      <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-2xl p-3.5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#66736C] mb-2 flex items-center justify-between">
          <span>Multilingual Voice-to-Action Pipeline</span>
          <span className="text-[#1677A8] font-bold">Prototype Bhashini Pipeline</span>
        </div>
        <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs py-1">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-6 h-6 rounded-full bg-sky-50 text-[#1677A8] border border-sky-200 flex items-center justify-center font-bold text-[10px]">
              1
            </span>
            <span className="font-semibold text-[#17211D]">Voice Report (IVR)</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#DCE3DD] shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-6 h-6 rounded-full bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20 flex items-center justify-center font-bold text-[10px]">
              2
            </span>
            <span className="font-semibold text-[#075B45]">Structured Field Record</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#DCE3DD] shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-[10px]">
              3
            </span>
            <span className="font-semibold text-[#66736C]">Pending Case / Verification</span>
          </div>
        </div>
      </div>

      {/* 2. SIDE-BY-SIDE TRANSCRIPTS (Indic Script vs English Translation) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#1677A8]" />
            <h4 className="text-sm font-bold text-[#17211D]">
              Bhashini Multilingual Speech-to-Text & Translation
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[#1677A8] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 font-semibold">
            {report.sourceLanguageName} • {(report.bhashiniConfidence * 100).toFixed(0)}% ASR Confidence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Native Script */}
          <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-[#DCE3DD] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#66736C] pb-1 border-b border-[#DCE3DD]">
              <span className="font-bold text-[#17211D]">
                Original Audio Transcript ({report.sourceLanguage.toUpperCase()})
              </span>
              <span className="text-[10px] text-[#1677A8]">Bhashini ASR-v2</span>
            </div>
            <p className="text-sm text-[#17211D] leading-relaxed font-sans italic">
              "{report.originalTranscript}"
            </p>
          </div>

          {/* English Translation */}
          <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#1677A8] pb-1 border-b border-sky-200">
              <span className="font-bold">English Translation</span>
              <span className="text-[10px] text-[#1677A8]">IndicTrans2 (AI4Bharat)</span>
            </div>
            <p className="text-sm text-[#17211D] leading-relaxed">
              "{report.englishTranslation}"
            </p>
          </div>
        </div>

        <p className="text-[10px] text-[#66736C] italic">
          * Note: Transcripts and translations are prototype demonstrations of the MeitY Bhashini Indic pipeline.
        </p>
      </div>

      {/* 3. STRUCTURED FIELD REPORT DETAILS */}
      <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-[#17211D]">Structured Field Report</h4>
            <span className="text-[10px] font-mono text-[#66736C]">[{structured.reportId}]</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
              {structured.processingStatus}
            </span>
          </div>
        </div>

        {/* 6 Grid Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-[#DCE3DD]">
            <span className="text-[10px] text-[#66736C] font-mono block">Issue Category</span>
            <span className="font-bold text-[#17211D] text-xs mt-0.5 block">
              {structured.issueCategory}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#DCE3DD]">
            <span className="text-[10px] text-[#66736C] font-mono block">Associated Structure</span>
            <span className="font-bold text-[#075B45] text-xs mt-0.5 block truncate">
              {structured.associatedStructureName || 'Drainage network stream'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#DCE3DD]">
            <span className="text-[10px] text-[#66736C] font-mono block">Assessed Urgency</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${urgencyColor}`}>
                {structured.urgency} ({structured.urgencyScore}/10)
              </span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#DCE3DD]">
            <span className="text-[10px] text-[#66736C] font-mono block">Caller & Role</span>
            <span className="font-semibold text-[#17211D] text-xs mt-0.5 block truncate">
              {structured.reporterName} ({structured.reporterRole})
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#DCE3DD]">
            <span className="text-[10px] text-[#66736C] font-mono block">Village / Location</span>
            <span className="font-semibold text-[#17211D] text-xs mt-0.5 block truncate">
              {structured.village}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#DCE3DD]">
            <span className="text-[10px] text-[#66736C] font-mono block">Spatial Coordinates</span>
            {structured.lat && structured.lng ? (
              <span className="font-mono text-[#1677A8] text-xs mt-0.5 block">
                {structured.lat.toFixed(4)}°N, {structured.lng.toFixed(4)}°E
              </span>
            ) : (
              <span className="text-[#66736C] text-xs mt-0.5 block">Pending GPS geotag</span>
            )}
          </div>
        </div>

        {/* Responsible Urgency Notice */}
        <div className="p-3 rounded-xl bg-white border border-[#DCE3DD] text-[11px] text-[#17211D] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#1677A8] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[#17211D]">Interpretation Protocol: </strong>
            Urgency is a prototype classification derived from the structured report and keyword indicators.
            It does not constitute an authoritative emergency determination. Voice reports represent citizen field observations requiring on-site engineer verification.
          </p>
        </div>
      </div>

      {/* 4. GEO-PHOTO CONNECTION: RELATED FIELD EVIDENCE */}
      {relatedPhotos.length > 0 && (
        <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#1677A8]" />
              <h4 className="text-sm font-bold text-[#17211D]">
                Related Ground Evidence (Geo-Coded Photos)
              </h4>
            </div>
            <span className="text-xs font-mono text-[#1677A8] bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-semibold">
              {relatedPhotos.length} Photo{relatedPhotos.length > 1 ? 's' : ''} Linked
            </span>
          </div>

          <p className="text-xs text-[#66736C]">
            Ground-truth photographs captured near the reported asset corroborate physical site conditions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {relatedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white border border-[#DCE3DD] hover:border-[#075B45]/40 rounded-2xl p-3 flex gap-3 transition-all group"
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.caption}
                  className="w-20 h-20 rounded-xl object-cover border border-[#DCE3DD] shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-[#66736C] font-mono mb-1">
                      <span>{photo.id}</span>
                      <span className="text-[#075B45] font-bold">{photo.evidenceStatus || 'Ground Verified'}</span>
                    </div>
                    <p className="text-xs text-[#17211D] line-clamp-2 leading-tight">
                      {photo.caption}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-[#66736C] font-mono">
                      GPS: ±{photo.gps.accuracyM}m
                    </span>
                    {onInspectImage && (
                      <button
                        onClick={() => onInspectImage(photo)}
                        className="text-[#1677A8] hover:text-[#1677A8]/80 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Inspect Photo</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ACTION BUTTONS: CONVERT TO CASE + VIEW ON MAP */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {report.lat && report.lng && onViewOnMap && (
            <button
              onClick={() => onViewOnMap(report.associatedStructureId, report.lat, report.lng)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#17211D] text-xs font-semibold border border-[#DCE3DD] transition-all shadow-xs cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
              <span>View Location on Map</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onCreateCase && (
            <button
              onClick={() => onCreateCase(report)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {report.status === 'Converted to Case' ? 'View Converted Case' : 'Convert to Case'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
