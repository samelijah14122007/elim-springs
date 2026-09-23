import React from 'react';
import { WatershedCatchment, WatershedStructure, GeoCodedImage } from '../../types';
import { MapPin, ChevronRight, ShieldCheck, Database, Navigation, Layers, Camera, Home } from 'lucide-react';

interface PanIndiaHierarchyBarProps {
  currentCatchment: WatershedCatchment;
  catchments: WatershedCatchment[];
  onSelectCatchment: (catchment: WatershedCatchment) => void;
  currentStructure?: WatershedStructure | null;
  currentPhoto?: GeoCodedImage | null;
  className?: string;
}

export const PanIndiaHierarchyBar: React.FC<PanIndiaHierarchyBarProps> = ({
  currentCatchment,
  catchments,
  onSelectCatchment,
  currentStructure,
  currentPhoto,
  className = '',
}) => {
  // Map known basins for our catchments
  const basinMap: Record<
    string,
    {
      basin: string;
      subBasin: string;
      watershedCode: string;
      microCode: string;
      village: string;
      defaultAsset: string;
      defaultPhoto: string;
    }
  > = {
    'ws-dharashiv-ter': {
      basin: 'Krishna - Bhima Basin',
      subBasin: 'Upper Sina Sub-Basin',
      watershedCode: '4B1C2 (Sina Catchment)',
      microCode: '4B1C2d3 (Rui Micro-Watershed)',
      village: 'Rui Gram Panchayat',
      defaultAsset: 'Rui Check Dam #4 (CD-04)',
      defaultPhoto: 'IMG-RUI-001 (Silt Inflow)',
    },
    'ws-bundelkhand-ken': {
      basin: 'Ganga - Yamuna Basin',
      subBasin: 'Ken-Betwa Sub-Basin',
      watershedCode: '2C2B5 (Ken Catchment)',
      microCode: '2C2B5a (Alipura Micro-Watershed)',
      village: 'Alipura Gram Panchayat',
      defaultAsset: 'Alipura Masonry Dam #1 (CD-01)',
      defaultPhoto: 'IMG-BND-001 (Plunge Pool)',
    },
    'ws-rayalaseema-penna': {
      basin: 'Penna Basin',
      subBasin: 'Upper Penna Sub-Basin',
      watershedCode: '4D3A1 (Penna Catchment)',
      microCode: '4D3A1b (Kalyandurg Micro-Watershed)',
      village: 'Kalyandurg GP',
      defaultAsset: 'Kalyandurg Stream Dam (CD-01)',
      defaultPhoto: 'IMG-PEN-001 (Basin Silt)',
    },
  };

  const currentInfo = basinMap[currentCatchment.id] || {
    basin: 'National River Basin',
    subBasin: `${currentCatchment.name} Sub-Basin`,
    watershedCode: currentCatchment.code,
    microCode: `${currentCatchment.code}-Micro`,
    village: `${currentCatchment.district} GP`,
    defaultAsset: currentStructure ? `${currentStructure.name} (${currentStructure.code})` : 'Primary Catchment Asset',
    defaultPhoto: 'Field Evidence Photo',
  };

  const assetLabel = currentStructure
    ? `${currentStructure.name} (${currentStructure.code})`
    : currentInfo.defaultAsset;

  const photoLabel = currentPhoto ? `${currentPhoto.id}` : currentInfo.defaultPhoto;

  return (
    <div
      dir="ltr"
      className={`rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl backdrop-blur-md p-3.5 text-left ${className}`}
    >
      {/* Top Meta Line: Command Bar Title & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800/80 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-white tracking-wide uppercase">
            Pan-India 10-Level Geospatial Hierarchy
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">DoLR National Watershed Atlas & CGWB Coding Standard</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>BHUVAN WMS COMPLIANT</span>
          </span>
          <span className="text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
            10/10 TIERS LINKED
          </span>
        </div>
      </div>

      {/* 10-Tier Cascading Flow */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {/* Tier 1: Nation */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <span className="text-sm">🇮🇳</span>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold leading-none">
              1 • Nation
            </span>
            <span className="font-bold text-white text-[11px] leading-tight">India</span>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

        {/* Tier 2: State */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold leading-none">
              2 • State
            </span>
            <span className="font-bold text-emerald-400 text-[11px] leading-tight">
              {currentCatchment.state}
            </span>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

        {/* Tier 3: District */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold leading-none">
              3 • District
            </span>
            <span className="font-bold text-slate-200 text-[11px] leading-tight">
              {currentCatchment.district}
            </span>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

        {/* Tier 4: Basin */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold leading-none">
              4 • Basin
            </span>
            <span className="font-bold text-sky-300 text-[11px] leading-tight truncate max-w-[120px]">
              {currentInfo.basin}
            </span>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

        {/* Tier 5: Sub-Basin */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold leading-none">
              5 • Sub-Basin
            </span>
            <span className="font-bold text-cyan-300 text-[11px] leading-tight truncate max-w-[120px]">
              {currentInfo.subBasin}
            </span>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

        {/* Tier 6: Watershed */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
          <Layers className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-mono font-bold leading-none">
              6 • Watershed
            </span>
            <select
              value={currentCatchment.id}
              onChange={(e) => {
                const found = catchments.find((c) => c.id === e.target.value);
                if (found) onSelectCatchment(found);
              }}
              className="bg-transparent text-[11px] font-bold text-white focus:outline-none cursor-pointer pr-1"
            >
              {catchments.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

        {/* Tier 7: Micro-Watershed */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold leading-none">
              7 • Micro-Watershed
            </span>
            <span className="font-mono font-bold text-amber-400 text-[11px] leading-tight">
              {currentInfo.microCode}
            </span>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

        {/* Tier 8: Village / Gram Panchayat */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold leading-none">
              8 • Village / GP
            </span>
            <span className="font-bold text-slate-200 text-[11px] leading-tight truncate max-w-[120px]">
              {currentInfo.village}
            </span>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

        {/* Tier 9: Conservation Asset */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-purple-400 font-mono font-bold leading-none">
              9 • Asset
            </span>
            <span className="font-bold text-purple-200 text-[11px] leading-tight truncate max-w-[140px]" title={assetLabel}>
              {assetLabel}
            </span>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

        {/* Tier 10: Geo-Coded Evidence */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200">
          <Camera className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-sky-400 font-mono font-bold leading-none">
              10 • Geo-Evidence
            </span>
            <span className="font-mono font-bold text-sky-300 text-[11px] leading-tight truncate max-w-[140px]" title={photoLabel}>
              {photoLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
