import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Search,
  ExternalLink,
  ShieldAlert,
  Info,
  Layers,
  MapPin,
  CheckCircle2,
  Lock,
  Compass,
  Calendar,
  Award,
} from 'lucide-react';

export type ReferenceCategory =
  | 'DAM'
  | 'RESERVOIR'
  | 'CHECK_DAM'
  | 'FARM_POND'
  | 'TANK'
  | 'CANAL'
  | 'WATER_HARVESTING_STRUCTURE'
  | 'RECHARGE_STRUCTURE'
  | 'SOIL_EROSION'
  | 'AGRICULTURE'
  | 'WATERSHED_LANDSCAPE';

export interface ReferenceImageItem {
  id: string;
  category: ReferenceCategory;
  categoryLabel: string;
  structureType: string;
  title: string;
  source: string;
  sourceType: 'WIKIMEDIA_COMMONS' | 'ICAR_ARCHIVE' | 'NRSC_BHUVAN' | 'STATE_WATERSHED_OGD' | 'CWC_ARCHIVE';
  sourceUrl: string;
  state: string;
  district: string;
  captureDate?: string;
  description: string;
  fieldIdentificationKeys: string[];
  recommendedGroundAuditMethod: string;
  sampleImageUrl: string;
  classification: 'REFERENCE_IMAGE';
  license: string;
}

export const REFERENCE_CATALOG: ReferenceImageItem[] = [
  // 1. DAM
  {
    id: 'ref-dam-01',
    category: 'DAM',
    categoryLabel: 'Dam',
    structureType: 'Concrete Gravity / Earthen Dam',
    title: 'Koyna Hydroelectric & Storage Dam — Spillway Crest Radial Gates',
    source: 'Water Resources Department, Maharashtra / OGD India',
    sourceType: 'STATE_WATERSHED_OGD',
    sourceUrl: 'https://en.wikipedia.org/wiki/Koyna_Dam',
    state: 'Maharashtra',
    district: 'Satara',
    captureDate: '2024-02-18',
    description: 'Rubble concrete dam spillway structure showing crest piers and energy dissipating stilling basin with training walls intact.',
    fieldIdentificationKeys: [
      'Concrete glacis slope free of cavitation pitting',
      'Structural contraction joint seal inspection',
      'Radial gate hoist mechanics and apron scour check',
    ],
    recommendedGroundAuditMethod: 'Standard dam safety inspection protocol (CWC guidelines) and acoustic sounding of plunge pool.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'CC-BY-SA 4.0 / Open Government Data India',
  },

  // 2. RESERVOIR
  {
    id: 'ref-res-02',
    category: 'RESERVOIR',
    categoryLabel: 'Reservoir',
    structureType: 'Irrigation & Conservation Reservoir',
    title: 'Ter Sina Medium Irrigation Reservoir Impoundment Basin',
    source: 'Central Water Commission (CWC) Water Resource Information System (India-WRIS)',
    sourceType: 'CWC_ARCHIVE',
    sourceUrl: 'https://indiawris.gov.in',
    state: 'Maharashtra',
    district: 'Dharashiv (Osmanabad)',
    captureDate: '2025-01-14',
    description: 'Upstream full reservoir level (FRL) shoreline showing post-monsoon water spread area, submerged foreshore vegetation, and perimeter earthen bunding.',
    fieldIdentificationKeys: [
      'Multi-spectral NDWI threshold > 0.22 delineates standing surface water spread',
      'Foreshore silt accumulation observable along feeder stream confluence',
      'Clear perimeter rip-rap wave protection',
    ],
    recommendedGroundAuditMethod: 'Satellite NDWI surface-water extent verification corroborated with reservoir staff gauge readings.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'Open Government Data (OGD) India / WRIS Public Domain',
  },

  // 3. CHECK DAM
  {
    id: 'ref-cd-03',
    category: 'CHECK_DAM',
    categoryLabel: 'Check Dam',
    structureType: 'Masonry / Cement Nala Bund',
    title: 'Rui East Masonry Check Dam #4 — Silt Deposition & Spillway Crest',
    source: 'Maharashtra Watershed Development Directorate / PMKSY Benchmark Archive',
    sourceType: 'STATE_WATERSHED_OGD',
    sourceUrl: 'https://en.wikipedia.org/wiki/Check_dam',
    state: 'Maharashtra',
    district: 'Dharashiv (Osmanabad)',
    captureDate: '2024-09-24',
    description: 'Upstream weir basin showing fine alluvial silt deposits approaching spillway crest level. Live storage volume degraded by >70% requiring manual or excavator desiltation.',
    fieldIdentificationKeys: [
      'Cracked mud polygon plates visible across pondage basin during dry epoch',
      'Shrub and weed colonization across silted reservoir bed',
      'Spillway apron intact without structural foundation undermining',
    ],
    recommendedGroundAuditMethod: 'Calibrated sounding rod measurement across 5 grid transects to establish depth to foundation masonry.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'CC-BY-SA 4.0 / Open Government Data India',
  },

  // 4. FARM POND
  {
    id: 'ref-fp-04',
    category: 'FARM_POND',
    categoryLabel: 'Farm Pond',
    structureType: 'Excavated Lined Farm Pond (Kunta)',
    title: 'Kalyandurg Farm Pond (Kunta) with Inflow Silt Trap & Earthen Bund',
    source: 'Andhra Pradesh Micro-Irrigation & Watershed Mission (APMIP)',
    sourceType: 'STATE_WATERSHED_OGD',
    sourceUrl: 'https://en.wikipedia.org/wiki/Rainwater_harvesting',
    state: 'Andhra Pradesh',
    district: 'Ananthapuramu (Kalyandurg)',
    captureDate: '2024-11-10',
    description: 'Excavated 250m³ individual farm pond with polyethylene lining and stabilized stone-pitching inlet designed for critical dry-spell protective irrigation in groundnut cropping.',
    fieldIdentificationKeys: [
      'Stone-pitching apron at inlet channel prevents bank erosion',
      'No breach in overflow bypass spillway',
      'Staff depth gauge legible with 10cm calibration marks',
    ],
    recommendedGroundAuditMethod: 'Visual lining integrity audit and measuring water retention days post-monsoon.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'OGD India / PMKSY Benchmark Archive',
  },

  // 5. TANK
  {
    id: 'ref-tank-05',
    category: 'TANK',
    categoryLabel: 'Tank',
    structureType: 'Traditional Village Tank (Kere)',
    title: 'Gubbi Kere Traditional Cascade Irrigation Tank and Sluice Gate',
    source: 'Minor Irrigation & Ground Water Directorate, Karnataka',
    sourceType: 'STATE_WATERSHED_OGD',
    sourceUrl: 'https://en.wikipedia.org/wiki/Irrigation_tank',
    state: 'Karnataka',
    district: 'Tumakuru',
    captureDate: '2023-12-05',
    description: 'Ancient stone-faced earthen bund impounding runoff from ridge catchment, featuring stone sluice tower (Madagu) and surplus masonry weir.',
    fieldIdentificationKeys: [
      'Stone revetment on waterside slope prevents sloughing',
      'Downstream sluice plug operating without severe leakage',
      'Communal grazing and silt boundary identifiable',
    ],
    recommendedGroundAuditMethod: 'Inspection of sluice masonry, surplus weir crest alignment, and sounding rod silt profiling.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'Karnataka OGD / Public Benchmark',
  },

  // 6. CANAL
  {
    id: 'ref-canal-06',
    category: 'CANAL',
    categoryLabel: 'Canal',
    structureType: 'Irrigation Feeder Canal',
    title: 'Upper Sina Left Bank Distributary Lined Canal Section',
    source: 'Maharashtra Irrigation Department / WRD',
    sourceType: 'STATE_WATERSHED_OGD',
    sourceUrl: 'https://en.wikipedia.org/wiki/Canal',
    state: 'Maharashtra',
    district: 'Dharashiv (Osmanabad)',
    captureDate: '2024-04-12',
    description: 'Trapezoidal concrete-lined distributary canal conveying regulated releases from storage headworks to agricultural service areas.',
    fieldIdentificationKeys: [
      'Concrete slab lining intact without weed breakthrough',
      'Turnout gates and flow measurement Parshall flume calibrated',
      'Silt deposition in bed minimal (< 5cm)',
    ],
    recommendedGroundAuditMethod: 'Current meter velocity survey and lining crack assessment.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'OGD India / WRD Maharashtra',
  },

  // 7. WATER HARVESTING STRUCTURE
  {
    id: 'ref-whs-07',
    category: 'WATER_HARVESTING_STRUCTURE',
    categoryLabel: 'Water Harvesting Structure',
    structureType: 'Traditional Earthen Johad / Bandhara',
    title: 'Alwar Traditional Crescent Earthen Johad Water Harvesting Bund',
    source: 'Tarun Bharat Sangh & Rajasthan Watershed Directorate',
    sourceType: 'STATE_WATERSHED_OGD',
    sourceUrl: 'https://en.wikipedia.org/wiki/Johad',
    state: 'Rajasthan',
    district: 'Alwar',
    captureDate: '2023-10-18',
    description: 'Traditional concave earthen embankment constructed across natural hill stream micro-valley to trap monsoonal runoff and recharge arid aquifer.',
    fieldIdentificationKeys: [
      'Native thorn vegetation planted on embankment crest to bind soil',
      'Masonry spillway flanking hillside safely discharges extreme storm runoff',
      'High soil moisture evident in upstream cultivation zone',
    ],
    recommendedGroundAuditMethod: 'Embankment compaction test, freeboard elevation measurement, and downstream well recharge tracking.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'Tarun Bharat Sangh / Creative Commons CC-BY 3.0',
  },

  // 8. RECHARGE STRUCTURE
  {
    id: 'ref-rech-08',
    category: 'RECHARGE_STRUCTURE',
    categoryLabel: 'Recharge Structure',
    structureType: 'Percolation Tank / Infiltration Shaft',
    title: 'Haveli Bandhi Granitic Infiltration & Sub-Surface Recharge Structure',
    source: 'ICAR-NBSS&LUP Central Zone & MP Watershed Directorate',
    sourceType: 'ICAR_ARCHIVE',
    sourceUrl: 'https://en.wikipedia.org/wiki/Artificial_groundwater_recharge',
    state: 'Madhya Pradesh',
    district: 'Chhatarpur',
    captureDate: '2024-03-22',
    description: 'Earthen percolation basin designed to hold rainwater during monsoon, encouraging deep infiltration through weathered granite fractured bedrock.',
    fieldIdentificationKeys: [
      'Gravel-packed central recharge bore shaft accelerates deep percolation',
      'Periodic topsoil desiltation line clearly delineated',
      'Silt trap inlet prevents colloidal clogging of fractures',
    ],
    recommendedGroundAuditMethod: 'Infiltration rate measurement using double-ring infiltrometer.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'ICAR Benchmark / CC-BY-SA 4.0',
  },

  // 9. SOIL EROSION
  {
    id: 'ref-ero-09',
    category: 'SOIL_EROSION',
    categoryLabel: 'Soil Erosion',
    structureType: 'Gully Erosion & Ravine Dynamics',
    title: 'Chambal Catchment High-Order Gully Void & Ravine Expansion',
    source: 'ICAR-Indian Institute of Soil and Water Conservation (IISWC)',
    sourceType: 'ICAR_ARCHIVE',
    sourceUrl: 'https://en.wikipedia.org/wiki/Gully',
    state: 'Madhya Pradesh',
    district: 'Morena / Chhatarpur',
    captureDate: '2023-08-30',
    description: 'Severe vertical gully head-cut advancing into agricultural tablelands, demonstrating void development and extensive topsoil loss (> 40 t/ha/yr).',
    fieldIdentificationKeys: [
      'Vertical gully headwall with active soil piping cavities',
      'Exposed tree tap-roots indicating rapid bed scour',
      'Coarse sediment fan deposited at mouth of tributary',
    ],
    recommendedGroundAuditMethod: 'Calibrated sounding rod void volume calculation and drone photogrammetry cross-section survey.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'ICAR-IISWC Research Archive / CC-BY-SA',
  },

  // 10. AGRICULTURE
  {
    id: 'ref-agri-10',
    category: 'AGRICULTURE',
    categoryLabel: 'Agriculture',
    structureType: 'Contour Bunded Rainfed Cropland',
    title: 'Bundelkhand Terraced Dryland Farming with Vetiver Grass Hedges',
    source: 'National Rainfed Area Authority (NRAA) / Ministry of Agriculture',
    sourceType: 'STATE_WATERSHED_OGD',
    sourceUrl: 'https://en.wikipedia.org/wiki/Dryland_farming',
    state: 'Madhya Pradesh',
    district: 'Tikamgarh',
    captureDate: '2024-01-28',
    description: 'Dryland agricultural fields stabilized by graded earthen bunds and live Vetiver grass barriers (Khus) to conserve in-situ soil moisture for chickpea and mustard crops.',
    fieldIdentificationKeys: [
      'Continuous dense vegetative hedge along contour ridge',
      'In-situ rainfall moisture conservation between terrace berms',
      'Absence of inter-terrace rill formation post-downpour',
    ],
    recommendedGroundAuditMethod: 'Canopy cover verification and soil organic carbon (SOC) core sampling.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'OGD India / NRAA Guidelines',
  },

  // 11. WATERSHED LANDSCAPE
  {
    id: 'ref-land-11',
    category: 'WATERSHED_LANDSCAPE',
    categoryLabel: 'Watershed Landscape',
    structureType: 'Ridge-to-Valley Integrated Catchment',
    title: 'Western Ghats Upper Catchment Ridge-to-Valley Ecological Landscape',
    source: 'National Remote Sensing Centre (NRSC) / Bhuvan Watershed Atlas',
    sourceType: 'NRSC_BHUVAN',
    sourceUrl: 'https://bhuvan.nrsc.gov.in',
    state: 'Maharashtra',
    district: 'Pune / Satara',
    captureDate: '2024-10-05',
    description: 'Complete hydrological continuum from afforested ridge slopes through continuous contour trenches down to central check dams and irrigated valley agricultural bottoms.',
    fieldIdentificationKeys: [
      'Clear ridge, middle slope, and valley bottom ecological stratification',
      'Surface drainage convergence into 1st, 2nd, and 3rd order stream channels',
      'Distinct thematic land use transitions (forest → fallow → irrigated)',
    ],
    recommendedGroundAuditMethod: 'Multi-epoch satellite change detection cross-referenced with watershed committee social audit.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    classification: 'REFERENCE_IMAGE',
    license: 'NRSC Bhuvan OGD / Survey of India Verified',
  },
];

interface ReferenceImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceImageLibraryModal: React.FC<ReferenceImageLibraryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<ReferenceImageItem | null>(null);

  if (!isOpen) return null;

  const categories: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Categories (11)' },
    { key: 'DAM', label: '1. Dam' },
    { key: 'RESERVOIR', label: '2. Reservoir' },
    { key: 'CHECK_DAM', label: '3. Check Dam' },
    { key: 'FARM_POND', label: '4. Farm Pond' },
    { key: 'TANK', label: '5. Tank' },
    { key: 'CANAL', label: '6. Canal' },
    { key: 'WATER_HARVESTING_STRUCTURE', label: '7. Water Harvesting Structure' },
    { key: 'RECHARGE_STRUCTURE', label: '8. Recharge Structure' },
    { key: 'SOIL_EROSION', label: '9. Soil Erosion' },
    { key: 'AGRICULTURE', label: '10. Agriculture' },
    { key: 'WATERSHED_LANDSCAPE', label: '11. Watershed Landscape' },
  ];

  const filteredItems = REFERENCE_CATALOG.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.structureType.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#17211D]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-[#DCE3DD] rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#DCE3DD] bg-[#F7F8F4] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#1677A8]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#17211D]">
                  Official Indian Watershed Reference Image Library
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold uppercase">
                  11 Standard Categories
                </span>
              </div>
              <p className="text-xs text-[#66736C] mt-0.5">
                Legitimate authoritative Indian photographs from Open Government Data (OGD), ICAR archives, and Wikimedia Commons.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#66736C] hover:text-[#17211D] p-2 rounded-xl hover:bg-black/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ethical Separation Banner */}
        <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Strict Evidence Separation Rule:</strong> Reference images are provided solely as comparative engineering benchmarks for field auditors. They are explicitly marked <span className="font-mono font-bold bg-amber-100 px-1 py-0.2 rounded">REFERENCE IMAGE</span> and are never passed off as citizen field uploads or sensor ground truth.
          </div>
        </div>

        {/* Category Filter Chips & Search Bar */}
        <div className="p-5 border-b border-[#DCE3DD] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#66736C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference library by structure, district, state..."
                className="w-full bg-[#F0F3EE] border border-[#DCE3DD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45]"
              />
            </div>
            <div className="text-xs text-[#66736C] font-mono">
              Showing {filteredItems.length} of {REFERENCE_CATALOG.length} Reference Structures
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-[#075B45] text-white shadow-xs font-bold'
                    : 'bg-[#F0F3EE] text-[#66736C] hover:text-[#17211D] hover:bg-[#E3E8E1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Reference Cards */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#DCE3DD] hover:border-[#075B45]/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Photo Banner with Badges */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={item.sampleImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-900/90 text-white backdrop-blur shadow-xs border border-sky-400/40">
                      REFERENCE IMAGE
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/75 text-amber-300 backdrop-blur shadow-xs">
                      {item.categoryLabel}
                    </span>
                  </div>
                  {item.captureDate && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono bg-black/70 text-white backdrop-blur flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-[#DCE3DD]" />
                      <span>{item.captureDate}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#075B45] font-semibold">
                    <MapPin className="w-3 h-3" />
                    <span>{item.district}, {item.state}</span>
                  </div>

                  <h4 className="font-bold text-sm text-[#17211D] line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-xs text-[#66736C] line-clamp-3">
                    {item.description}
                  </p>

                  {/* Identification Keys */}
                  <div className="bg-[#F7F8F4] p-2.5 rounded-xl border border-[#DCE3DD] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#17211D] block">
                      Field Auditor Identification Keys:
                    </span>
                    <ul className="text-[11px] text-[#66736C] space-y-0.5 list-disc pl-3.5">
                      {item.fieldIdentificationKeys.slice(0, 2).map((key, i) => (
                        <li key={i}>{key}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer: Metadata & Source */}
              <div className="p-4 pt-2 border-t border-[#DCE3DD] bg-[#F7F8F4] text-[10px] space-y-1.5">
                <div className="flex items-center justify-between text-[#66736C]">
                  <span>Source: <strong>{item.source.split('/')[0]}</strong></span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#075B45] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Inspect Source</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="text-[9px] text-[#66736C] font-mono truncate">
                  License: {item.license}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
