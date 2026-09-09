import React, { useState } from 'react';
import {
  GeoCodedImage,
  WatershedCatchment,
  WatershedStructure,
  GeoImageEvidenceStatus,
  ObservedConditionTag,
} from '../types';
import { PhotoInspectorModal } from '../components/geoimages/PhotoInspectorModal';
import { PhotoUploadModal } from '../components/geoimages/PhotoUploadModal';
import { ReferenceImageLibraryModal } from '../components/geoimages/ReferenceImageLibraryModal';
import { FieldErosionMeasurementModal } from '../components/geoimages/FieldErosionMeasurementModal';
import { mockCatchments, mockStructures } from '../data/mockData';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { useTranslation } from '../i18n';
import {
  Camera,
  MapPin,
  FileText,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Tag,
  ExternalLink,
  ShieldAlert,
  BookOpen,
  Ruler,
} from 'lucide-react';

interface GeoImagesViewProps {
  watershedId: string;
  catchment?: WatershedCatchment;
  catchments?: WatershedCatchment[];
  onSelectCatchment?: (catchment: WatershedCatchment) => void;
  images: GeoCodedImage[];
  structures?: WatershedStructure[];
  onAddImage: (image: GeoCodedImage) => void;
  onOpenCase: (caseId: string) => void;
  onNavigateToGis?: (structureId?: string, lat?: number, lng?: number) => void;
}

export const GeoImagesView: React.FC<GeoImagesViewProps> = ({
  watershedId,
  catchment,
  catchments = mockCatchments,
  onSelectCatchment,
  images,
  structures = mockStructures,
  onAddImage,
  onOpenCase,
  onNavigateToGis,
}) => {
  const activeCatchment =
    catchment ||
    catchments.find((c) => c.id === watershedId) ||
    catchments[0];

  const currentWatershedId = activeCatchment.id;

  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<GeoCodedImage | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [showErosionModal, setShowErosionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTag, setFilterTag] = useState<string>('ALL');

  // Filtered by current watershed
  const watershedImages = images.filter((img) => img.watershedId === currentWatershedId);

  // Compute Summary Metrics
  const totalPhotos = watershedImages.length;
  const pendingVerificationCount = watershedImages.filter(
    (img) =>
      img.evidenceStatus === 'Pending Review' ||
      img.evidenceStatus === 'Needs Verification'
  ).length;
  const ocrProcessedCount = watershedImages.filter((img) => !!img.ocr).length;
  const registryMatchesCount = watershedImages.filter(
    (img) =>
      img.evidenceStatus === 'Registry Match' ||
      (img.ocr && !img.ocr.mismatchDetected)
  ).length;
  const registryMismatchesCount = watershedImages.filter(
    (img) =>
      img.evidenceStatus === 'Registry Mismatch' ||
      (img.ocr && img.ocr.mismatchDetected)
  ).length;
  const assetsWithEvidenceCount = new Set(
    watershedImages.filter((img) => img.structureId).map((img) => img.structureId)
  ).size;

  // Apply filters
  const filteredImages = watershedImages
    .filter((img) => {
      if (filterStatus === 'ALL') return true;
      return img.evidenceStatus === filterStatus;
    })
    .filter((img) => {
      if (filterTag === 'ALL') return true;
      return img.observedTags?.includes(filterTag as ObservedConditionTag);
    })
    .filter((img) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        img.caption.toLowerCase().includes(q) ||
        img.uploadedBy.name.toLowerCase().includes(q) ||
        img.uploadedBy.village.toLowerCase().includes(q) ||
        (img.structureId && img.structureId.toLowerCase().includes(q)) ||
        (img.ocr?.detectedFields.workCode &&
          img.ocr.detectedFields.workCode.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & WATERSHED SELECTOR */}
      <PageHeader
        icon={Camera}
        iconColor="text-sky-400"
        iconBg="bg-sky-500/10 border-sky-500/20"
        moduleNumber="07–08"
        title={t('geoImages.title', 'Geo-Coded Ground Evidence & Signboard OCR Engine')}
        tagline={t('geoImages.subtitle', 'Ground-truth photo records with EXIF precision, observation tags, signboard OCR entity parsing & GIS registry auditing')}
        breadcrumbs={[
          { label: t('geoImages.geoCodedFieldEvidence', 'Ground Evidence') },
          { label: t('nav.geoImages', 'Geo-Photos & OCR') },
          { label: activeCatchment.name },
        ]}
        statusBadge={
          <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 font-bold uppercase">
            EXIF & OCR Engine
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {catchments.length > 0 && onSelectCatchment && (
              <div className="flex items-center gap-2 bg-white border border-[#DCE3DD] rounded-xl px-3 py-1.5 shadow-xs">
                <MapPin className="w-4 h-4 text-[#075B45] shrink-0" />
                <span className="text-xs text-[#66736C] shrink-0 font-mono">Basin:</span>
                <select
                  value={activeCatchment.id}
                  onChange={(e) => {
                    const target = catchments.find((c) => c.id === e.target.value);
                    if (target) onSelectCatchment(target);
                  }}
                  className="bg-transparent text-xs font-bold text-[#075B45] focus:outline-none cursor-pointer pr-1"
                >
                  {catchments.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white text-[#17211D]">
                      {c.name} ({c.district})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowReferenceModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] border border-[#DCE3DD] font-semibold text-xs transition cursor-pointer shadow-xs"
              title="Browse verified photographic benchmarks for field inspections"
            >
              <BookOpen className="w-4 h-4 text-[#075B45]" />
              <span>Reference Library</span>
            </button>

            <button
              onClick={() => setShowErosionModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F0F3EE] text-amber-800 border border-amber-300 font-semibold text-xs transition cursor-pointer shadow-xs"
              title="Log physical measurements for gully or check dam siltation"
            >
              <Ruler className="w-4 h-4 text-amber-700" />
              <span>Measure Soil Erosion</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-md shadow-[#075B45]/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{t('geoImages.uploadPhoto', 'Upload Field Evidence')}</span>
            </button>
          </div>
        }
      />

      {/* 2. FIELD EVIDENCE SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Geo-Photos"
          value={totalPhotos}
          icon={Camera}
          iconColor="text-sky-600"
          iconBg="bg-sky-50 border-sky-200"
          trend={{ value: `${activeCatchment.name.split(' ')[0]} Basin`, isNeutral: true }}
        />
        <StatCard
          label="Pending Review"
          value={pendingVerificationCount}
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-200"
          trend={{ value: 'Requires ground audit', isPositive: false }}
        />
        <StatCard
          label="OCR Processed"
          value={ocrProcessedCount}
          icon={FileText}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-200"
          trend={{ value: 'Plaque text extracted', isPositive: true }}
        />
        <StatCard
          label="Registry Matches"
          value={registryMatchesCount}
          icon={CheckCircle2}
          iconColor="text-[#075B45]"
          iconBg="bg-emerald-50 border-emerald-200"
          trend={{ value: 'GIS records verified', isPositive: true }}
        />
        <StatCard
          label="Registry Mismatch"
          value={registryMismatchesCount}
          icon={ShieldAlert}
          iconColor="text-rose-600"
          iconBg="bg-rose-50 border-rose-200"
          trend={{ value: registryMismatchesCount > 0 ? 'Manual review required' : 'All clear', isPositive: registryMismatchesCount === 0 }}
        />
        <StatCard
          label="Assets Linked"
          value={assetsWithEvidenceCount}
          icon={ShieldCheck}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50 border-cyan-200"
          trend={{ value: 'Linked structures', isPositive: true }}
        />
      </div>

      {/* 3. SEARCH & ADVANCED EVIDENCE FILTER BAR */}
      <div className="bg-white border border-[#DCE3DD] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photo caption, reporter, asset code, village..."
              className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45]"
            />
          </div>

          {/* Evidence Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-colors duration-200 ${
                filterStatus === 'ALL'
                  ? 'bg-[#075B45] text-white font-bold border-[#075B45]'
                  : 'text-[#66736C] border-[#DCE3DD] hover:text-[#17211D] hover:bg-[#F0F3EE] bg-white'
              }`}
            >
              All ({watershedImages.length})
            </button>
            <button
              onClick={() => setFilterStatus('Registry Match')}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-colors duration-200 ${
                filterStatus === 'Registry Match'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-300'
                  : 'text-[#66736C] border-[#DCE3DD] hover:text-emerald-800 hover:border-emerald-300 bg-white'
              }`}
            >
              Registry Match
            </button>
            <button
              onClick={() => setFilterStatus('Registry Mismatch')}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-colors duration-200 ${
                filterStatus === 'Registry Mismatch'
                  ? 'bg-rose-50 text-rose-800 font-bold border-rose-300'
                  : 'text-[#66736C] border-[#DCE3DD] hover:text-rose-800 hover:border-rose-300 bg-white'
              }`}
            >
              Registry Mismatch
            </button>
            <button
              onClick={() => setFilterStatus('Needs Verification')}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-colors duration-200 ${
                filterStatus === 'Needs Verification'
                  ? 'bg-amber-50 text-amber-800 font-bold border-amber-300'
                  : 'text-[#66736C] border-[#DCE3DD] hover:text-amber-800 hover:border-amber-300 bg-white'
              }`}
            >
              Needs Verification
            </button>
            <button
              onClick={() => setFilterStatus('Pending Review')}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-colors duration-200 ${
                filterStatus === 'Pending Review'
                  ? 'bg-purple-50 text-purple-800 font-bold border-purple-300'
                  : 'text-[#66736C] border-[#DCE3DD] hover:text-purple-800 hover:border-purple-300 bg-white'
              }`}
            >
              Pending Review
            </button>
          </div>
        </div>

        {/* Observation Tag Filter Chips */}
        <div className="pt-2.5 border-t border-[#DCE3DD] flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-[#66736C] font-medium mr-1 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-[#66736C]" />
            <span className="uppercase tracking-wide text-[10px] font-semibold text-[#66736C]">Condition Tag:</span>
          </span>
          {[
            'ALL',
            'Silt accumulation',
            'Crack / structural concern',
            'Water presence',
            'Signboard visible',
            'Encroachment concern',
            'Completed intervention',
          ].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-2.5 py-1 rounded-xl border transition-colors duration-200 ${
                filterTag === tag
                  ? 'bg-[#075B45]/10 text-[#075B45] font-bold border-[#075B45]/40'
                  : 'bg-white text-[#66736C] hover:text-[#17211D] hover:bg-[#F0F3EE] border-[#DCE3DD]'
              }`}
            >
              {tag === 'ALL' ? 'All Tags' : tag}
            </button>
          ))}
        </div>
      </div>

      {/* 4. SECTION HEADER + PROFESSIONAL EVIDENCE GALLERY GRID */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-[#075B45]" />
          <span className="text-sm font-semibold text-[#17211D] uppercase tracking-wide">
            Photo Evidence Records
          </span>
          {filteredImages.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white text-[#66736C] border border-[#DCE3DD] shadow-xs">
              {filteredImages.length} / {watershedImages.length}
            </span>
          )}
        </div>
        {filteredImages.length > 0 && (
          <span className="text-[11px] text-[#66736C] font-mono">
            {activeCatchment.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredImages.length > 0 ? (
          filteredImages.map((img) => {
            const asset = structures.find((s) => s.id === img.structureId);
            const hashValue = img.evidenceHash || (img as any).sha256;
            const hashDisplay = hashValue ? hashValue.substring(0, 16) + '…' : null;

            return (
              <div
                key={img.id}
                className="bg-white border border-[#DCE3DD] hover:border-[#075B45]/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Display Banner with Floating Badges */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={img.imageUrl}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />

                    {/* Top Left: Floating Evidence Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                      {img.isSimulated || img.imageClassification === 'SIMULATED' || img.isDemoImage ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50/95 text-amber-900 border border-amber-300 backdrop-blur shadow-xs">
                          SIMULATED / TEST IMAGE — NOT FIELD EVIDENCE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50/95 text-emerald-900 border border-emerald-300 backdrop-blur shadow-xs">
                          FIELD EVIDENCE
                        </span>
                      )}
                      <div
                        className={`flex items-center gap-1.5 backdrop-blur-md px-2 py-0.5 rounded-lg border text-[10px] font-mono shadow-xs ${
                          img.locationSource === 'EXIF_GPS' || (img.hasGps !== false && img.gps?.accuracyM <= 10)
                            ? 'bg-white/95 text-[#075B45] border-[#075B45]/40 font-bold'
                            : img.locationSource === 'MANUAL_ASSOCIATION'
                            ? 'bg-white/95 text-amber-800 border-amber-300 font-bold'
                            : 'bg-white/95 text-rose-700 border-rose-300 font-bold'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>
                          {img.locationSource === 'EXIF_GPS' || (img.hasGps !== false && img.gps?.accuracyM <= 10)
                            ? `GPS VERIFIED ±${img.gps?.accuracyM || 2.4}m`
                            : img.locationSource === 'MANUAL_ASSOCIATION'
                            ? 'MANUALLY ASSOCIATED'
                            : 'GPS NOT AVAILABLE'}
                        </span>
                      </div>
                    </div>

                    {/* Top Right: Evidence Status Badge */}
                    {img.evidenceStatus && (
                      <div
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border shadow-xs ${
                          img.evidenceStatus === 'Registry Match' ||
                          img.evidenceStatus === 'Verified Metadata'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : img.evidenceStatus === 'Registry Mismatch'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {img.evidenceStatus}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 bg-white space-y-3">
                    {/* Caption */}
                    <h3 className="font-bold text-sm text-[#17211D] group-hover:text-[#075B45] transition-colors line-clamp-2">
                      {img.caption}
                    </h3>

                    {/* SHA-256 Hash Row */}
                    {hashDisplay && (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-[#66736C] shrink-0" />
                        <span className="font-mono text-[10px] text-[#66736C] truncate" title={hashValue}>
                          SHA-256 Hash: {hashDisplay}
                        </span>
                      </div>
                    )}

                    {/* Observed Field Tags */}
                    {img.observedTags && img.observedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {img.observedTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#F0F3EE] text-[#17211D] border border-[#DCE3DD]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Associated Asset Link (if any) */}
                    {asset ? (
                      <div className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] flex items-center justify-between text-xs shadow-xs">
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] text-[#66736C] block font-mono">
                            Associated Asset:
                          </span>
                          <span className="font-semibold text-[#17211D] truncate block">
                            {asset.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#075B45] bg-[#075B45]/10 px-2 py-0.5 rounded border border-[#075B45]/20 shrink-0 font-bold">
                          {asset.code}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] text-[11px] text-[#66736C] italic">
                        General catchment drainage point
                      </div>
                    )}

                    {/* GPS Coordinates & Sensor */}
                    {img.locationSource === 'EXIF_GPS' || (img.hasGps !== false && img.gps?.lat) ? (
                      <div className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] text-[11px] font-mono text-[#17211D] flex items-center justify-between shadow-xs">
                        <span>{img.gps.lat.toFixed(4)}°N, {img.gps.lng.toFixed(4)}°E</span>
                        <span className="text-[#66736C]">{img.gps.altitudeM ? `${img.gps.altitudeM}m MSL` : 'Altitude N/A'}</span>
                      </div>
                    ) : img.locationSource === 'MANUAL_ASSOCIATION' ? (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900 flex items-center justify-between shadow-xs">
                        <span>{img.gps.lat.toFixed(4)}°N, {img.gps.lng.toFixed(4)}°E</span>
                        <span className="text-amber-800 text-[10px] font-semibold">Manually Associated</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 flex items-center justify-between shadow-xs">
                        <span>Location not available from image metadata</span>
                        <button
                          type="button"
                          onClick={() => setSelectedImage(img)}
                          className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
                        >
                          Associate Location
                        </button>
                      </div>
                    )}

                    {/* OCR Status Banner if present */}
                    {img.ocr && (
                      <div
                        className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                          img.ocr.mismatchDetected
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1 text-indigo-700">
                            <FileText className="w-3 h-3" />
                            <span>OCR RESULT</span>
                          </span>
                          <span
                            className={
                              img.ocr.mismatchDetected
                                ? 'text-rose-700 font-mono'
                                : 'text-emerald-700 font-mono'
                            }
                          >
                            {img.ocr.mismatchDetected ? 'MANUAL REVIEW REQUIRED' : 'MATCH'}
                          </span>
                        </div>
                        <div className="font-mono text-[#17211D] text-[11px] truncate">
                          Code: <strong>{img.ocr.detectedFields.workCode || 'N/A'}</strong>
                          {img.ocr.detectedFields.sanctionCost && (
                            <span> • {img.ocr.detectedFields.sanctionCost}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Analysis Advisory Summary */}
                    {img.aiDamageAssessment && (
                      <div className="p-2 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] text-[11px] flex items-center justify-between text-[#66736C]">
                        <span className="font-semibold text-[#075B45] text-[10px] uppercase tracking-wider">
                          AI ANALYSIS — ADVISORY
                        </span>
                        <span className="font-mono text-[10px] text-[#66736C]">
                          {img.aiDamageAssessment.structureIdentified} • {Math.round(img.aiDamageAssessment.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-3 bg-[#F7F8F4] border-t border-[#DCE3DD] flex items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-[#66736C] truncate">
                    By <strong className="text-[#17211D]">{img.uploadedBy.name}</strong>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onNavigateToGis && (
                      <button
                        onClick={() =>
                          onNavigateToGis(img.structureId, img.gps.lat, img.gps.lng)
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] border border-[#DCE3DD] font-medium text-xs transition-colors duration-200 flex items-center gap-1 cursor-pointer shadow-xs"
                        title="View photo on GIS map"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
                        <span>Map</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedImage(img)}
                      className="px-3 py-1.5 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs transition-colors duration-200 shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Evidence</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-dashed border-[#DCE3DD] rounded-2xl space-y-4 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#F0F3EE] border border-[#DCE3DD] flex items-center justify-center">
              <Camera className="w-8 h-8 text-[#66736C]" />
            </div>
            <div>
              <p className="text-[#17211D] font-bold text-sm">No ground photos matching criteria</p>
              <p className="text-xs text-[#66736C] max-w-sm mx-auto mt-1.5">
                Try adjusting the evidence status filter, condition tag, or search query. Or upload new field evidence below.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-md shadow-[#075B45]/20 transition-all duration-200 hover:scale-[1.02] cursor-pointer mt-1"
            >
              <Camera className="w-4 h-4" />
              <span>Upload Field Evidence</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. PHOTO INSPECTOR MODAL */}
      {selectedImage && (
        <PhotoInspectorModal
          image={selectedImage}
          structures={structures}
          onClose={() => setSelectedImage(null)}
          onOpenCase={onOpenCase}
          onViewOnMap={(structId, lat, lng) => {
            if (onNavigateToGis) {
              onNavigateToGis(structId, lat, lng);
            }
          }}
        />
      )}

      {/* 6. PHOTO UPLOAD MODAL */}
      {showUploadModal && (
        <PhotoUploadModal
          watershedId={currentWatershedId}
          structures={structures}
          onClose={() => setShowUploadModal(false)}
          onAddImage={(newImg) => {
            onAddImage(newImg);
            setSelectedImage(newImg);
          }}
        />
      )}

      {/* 7. REAL-WORLD REFERENCE IMAGE SOURCES MODAL */}
      <ReferenceImageLibraryModal
        isOpen={showReferenceModal}
        onClose={() => setShowReferenceModal(false)}
      />

      {/* 8. FIELD EROSION MEASUREMENT MODAL */}
      <FieldErosionMeasurementModal
        isOpen={showErosionModal}
        onClose={() => setShowErosionModal(false)}
        watershedId={currentWatershedId}
        defaultLat={activeCatchment.center[0]}
        defaultLng={activeCatchment.center[1]}
      />
    </div>
  );
};
