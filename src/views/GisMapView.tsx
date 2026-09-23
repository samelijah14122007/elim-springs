import React, { useState, useEffect } from 'react';
import {
  WatershedCatchment,
  WatershedStructure,
  GeoCodedImage,
  DrainageStream,
  GisAlert,
  WatershedSpatialSummary,
  LocationInspectionResult,
  IvrVoiceReport,
} from '../types';
import { LeafletWatershedMap } from '../components/gis/LeafletWatershedMap';
import { gisService } from '../services/gisService';
import { nationalGeoService, SearchResultItem } from '../services/nationalGeoService';
import { PageHeader } from '../components/common/PageHeader';
import { PanIndiaHierarchyBar } from '../components/common/PanIndiaHierarchyBar';
import { useTranslation } from '../i18n';
import {
  mockStreams,
  mockAlerts,
  mockSpatialSummaries,
} from '../data/mockData';
import {
  Layers,
  MapPin,
  Bot,
  Camera,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Compass,
  ShieldCheck,
  Droplets,
  ArrowUpRight,
  Info,
  Calendar,
  User,
  Activity,
  X,
  FileCheck,
  Maximize2,
} from 'lucide-react';

interface GisMapViewProps {
  catchment: WatershedCatchment;
  catchments?: WatershedCatchment[];
  onSelectCatchment?: (catchment: WatershedCatchment) => void;
  structures: WatershedStructure[];
  geoImages: GeoCodedImage[];
  streams?: DrainageStream[];
  alerts?: GisAlert[];
  voiceReports?: IvrVoiceReport[];
  onOpenInAgent: (structure: WatershedStructure) => void;
  onOpenImage: (image: GeoCodedImage) => void;
  onSelectTab?: (tab: string) => void;
}

type InspectorTab = 'asset' | 'photo' | 'alert' | 'location' | 'directory';

export const GisMapView: React.FC<GisMapViewProps> = ({
  catchment,
  catchments = [],
  onSelectCatchment,
  structures,
  geoImages,
  streams = mockStreams,
  alerts = mockAlerts,
  voiceReports,
  onOpenInAgent,
  onOpenImage,
  onSelectTab,
}) => {
  const { t } = useTranslation();

  // Active selection states
  const [selectedStructure, setSelectedStructure] = useState<WatershedStructure | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GeoCodedImage | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<GisAlert | null>(null);
  const [locationResult, setLocationResult] = useState<LocationInspectionResult | null>(null);
  const [activeTab, setActiveTab] = useState<InspectorTab>('directory');

  // Prominent National Search ("Search India")
  const [searchIndiaQuery, setSearchIndiaQuery] = useState('');
  const [searchIndiaResults, setSearchIndiaResults] = useState<SearchResultItem[]>([]);
  const [isSearchIndiaOpen, setIsSearchIndiaOpen] = useState(false);
  const [mapTargetLocation, setMapTargetLocation] = useState<{ center: [number, number]; zoom: number; label?: string } | null>(null);

  // Search & Filter in Directory
  const [filterHealth, setFilterHealth] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Spatial summary data
  const [spatialSummary, setSpatialSummary] = useState<WatershedSpatialSummary | null>(
    mockSpatialSummaries[catchment.id] || null
  );

  const handleSearchIndiaChange = (q: string) => {
    setSearchIndiaQuery(q);
    if (q.trim().length > 1) {
      const res = nationalGeoService.searchIndia(q);
      setSearchIndiaResults(res);
      setIsSearchIndiaOpen(true);
    } else {
      setSearchIndiaResults([]);
      setIsSearchIndiaOpen(false);
    }
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    setIsSearchIndiaOpen(false);
    setSearchIndiaQuery(item.title);

    // Zoom the Leaflet Map directly to the searched location!
    setMapTargetLocation({
      center: item.center,
      zoom: item.zoom,
      label: item.title,
    });

    // If result corresponds to a watershed in our catalog, switch active catchment
    if (item.watershedId && catchments.length > 0 && onSelectCatchment) {
      const found = catchments.find((c) => c.id === item.watershedId);
      if (found) onSelectCatchment(found);
    }

    // Inspect the coordinate
    handleInspectCoordinate(item.center[0], item.center[1]);
  };

  // Fetch / update spatial summary whenever catchment changes
  useEffect(() => {
    gisService.getSpatialSummary(catchment.id).then((summary) => {
      setSpatialSummary(summary);
    });

    // Reset selected items when catchment changes or set default to first structure in catchment
    const catchmentStructures = structures.filter((s) => s.watershedId === catchment.id);
    if (catchmentStructures.length > 0) {
      setSelectedStructure(catchmentStructures[0]);
      setActiveTab('asset');
    } else {
      setSelectedStructure(null);
      setActiveTab('directory');
    }
    setSelectedPhoto(null);
    setSelectedAlert(null);
    setLocationResult(null);
  }, [catchment.id]);

  // Handle map interactions
  const handleSelectStructure = (structure: WatershedStructure) => {
    setSelectedStructure(structure);
    setSelectedPhoto(null);
    setSelectedAlert(null);
    setLocationResult(null);
    setActiveTab('asset');
  };

  const handleSelectImage = (img: GeoCodedImage) => {
    setSelectedPhoto(img);
    setSelectedStructure(null);
    setSelectedAlert(null);
    setLocationResult(null);
    setActiveTab('photo');
  };

  const handleSelectAlert = (alert: GisAlert) => {
    setSelectedAlert(alert);
    setSelectedStructure(null);
    setSelectedPhoto(null);
    setLocationResult(null);
    setActiveTab('alert');
  };

  const handleInspectCoordinate = async (lat: number, lng: number) => {
    const result = await gisService.inspectLocation(lat, lng, catchment.id);
    setLocationResult(result);
    setSelectedStructure(null);
    setSelectedPhoto(null);
    setSelectedAlert(null);
    setActiveTab('location');
  };

  // Filtered structures for the current catchment
  const currentStructures = structures.filter((s) => s.watershedId === catchment.id);
  const filteredStructures = currentStructures
    .filter((s) => {
      if (filterHealth === 'ALL') return true;
      if (filterHealth === 'CRITICAL')
        return (
          s.health === 'Breach Risk' ||
          s.health === 'Heavy Siltation' ||
          s.health === 'At Risk' ||
          s.currentSiltPct > 50
        );
      if (filterHealth === 'OPTIMAL')
        return s.health === 'Optimal' || s.health === 'Healthy';
      if (filterHealth === 'VERIFICATION')
        return s.health === 'Under Verification' || s.health === 'Needs Inspection';
      return true;
    })
    .filter((s) => {
      if (filterType === 'ALL') return true;
      return s.type === filterType;
    })
    .filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Geo photos in this catchment
  const currentPhotos = geoImages.filter((p) => p.watershedId === catchment.id);

  // Alerts in this catchment
  const currentAlerts = alerts.filter((a) => a.watershedId === catchment.id);

  return (
    <div className="flex flex-col space-y-4 pb-6">
      {/* 1. TOP HEADER & WATERSHED SELECTOR BAR */}
      <PageHeader
        icon={Layers}
        iconColor="text-[#075B45]"
        iconBg="bg-[#075B45]/10 border-[#075B45]/20"
        moduleNumber="01"
        title={t('gis.title', 'Watershed GIS & Hydrological Drainage Explorer')}
        tagline={t('gis.subtitle', 'Spatial visualization of drainage networks, micro-catchment bounds, conservation structures, and geo-tagged ground evidence')}
        breadcrumbs={[
          { label: t('common.india', 'India') },
          { label: catchment.state },
          { label: catchment.district },
          { label: `${catchment.name} (${catchment.code})` },
        ]}
        statusBadge={
          <span className="text-[10px] font-mono uppercase bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20 px-2.5 py-0.5 rounded-full font-bold">
            SIH PS 26015
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            {catchments.length > 0 && onSelectCatchment && (
              <div className="flex items-center gap-2 bg-white border border-[#DCE3DD] rounded-xl px-3 py-1.5 shadow-xs">
                <MapPin className="w-4 h-4 text-[#075B45] shrink-0" />
                <span className="text-xs text-[#66736C] shrink-0 font-mono">Basin:</span>
                <select
                  value={catchment.id}
                  onChange={(e) => {
                    const found = catchments.find((c) => c.id === e.target.value);
                    if (found) onSelectCatchment(found);
                  }}
                  className="bg-transparent text-xs font-bold text-[#075B45] focus:outline-none cursor-pointer pr-1"
                >
                  {catchments.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white text-[#17211D]">
                      {c.name} ({c.district}) [{c.code}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl font-medium font-mono">
              <Info className="w-3.5 h-3.5" />
              <span>Local Prototype Records</span>
            </div>
          </div>
        }
      />

      {/* Prominent Pan-India National Geospatial Search Box ("Search India") */}
      <div className="relative z-30">
        <div className="bg-white border border-[#DCE3DD] rounded-2xl p-2.5 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#075B45]/10 text-[#075B45] shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#66736C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchIndiaQuery}
              onChange={(e) => handleSearchIndiaChange(e.target.value)}
              onFocus={() => {
                if (searchIndiaQuery.trim().length > 1) setIsSearchIndiaOpen(true);
              }}
              placeholder="Search India — State, District, River Basin (Godavari, Krishna, Ken-Betwa), Watershed code, or Asset ID..."
              className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl pl-9 pr-9 py-2 text-xs text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45] font-medium"
            />
            {searchIndiaQuery && (
              <button
                onClick={() => {
                  setSearchIndiaQuery('');
                  setSearchIndiaResults([]);
                  setIsSearchIndiaOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66736C] hover:text-[#17211D] p-1 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#66736C] shrink-0 font-mono pr-2">
            <span>Quick:</span>
            {['Dharashiv', 'Ken-Betwa', 'Kalyandurg', 'CD-04'].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSearchIndiaChange(chip)}
                className="px-2 py-0.5 rounded-lg bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#17211D] border border-[#DCE3DD] transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchIndiaOpen && searchIndiaResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#DCE3DD] rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto z-40 animate-fade-in">
            <div className="p-2 bg-[#F7F8F4] border-b border-[#DCE3DD] flex items-center justify-between text-[11px] text-[#66736C]">
              <span className="font-bold text-[#17211D]">National Geospatial Search Results</span>
              <span>{searchIndiaResults.length} matches found</span>
            </div>
            <div className="divide-y divide-[#DCE3DD]">
              {searchIndiaResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchResult(item)}
                  className="p-3 hover:bg-[#F7F8F4] cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase shrink-0 mt-0.5 ${
                        item.category === 'STATE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.category === 'DISTRICT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : item.category === 'BASIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : item.category === 'WATERSHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {item.category}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-[#17211D] truncate">{item.title}</div>
                      <div className="text-[11px] text-[#66736C] truncate">{item.subtitle}</div>
                      <div className="text-[10px] font-mono text-[#075B45] mt-0.5 truncate">{item.hierarchy}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-[#66736C] block">
                      {item.center[0].toFixed(3)}°N, {item.center[1].toFixed(3)}°E
                    </span>
                    <span className="text-[11px] text-[#075B45] font-semibold flex items-center justify-end gap-1 mt-0.5">
                      <span>Zoom & Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pan-India 7-Tier Geographic Extent Bar */}
      <PanIndiaHierarchyBar
        currentCatchment={catchment}
        catchments={catchments.length > 0 ? catchments : [catchment]}
        onSelectCatchment={(c) => onSelectCatchment && onSelectCatchment(c)}
        currentStructure={selectedStructure}
      />

      <div className="bg-white border border-[#DCE3DD] rounded-2xl p-4 shadow-sm space-y-4">

        {/* 2. SPATIAL SUMMARY METRICS BAR */}
        {spatialSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-[#DCE3DD]">
            <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl p-2.5">
              <div className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider">
                Catchment Area
              </div>
              <div className="text-sm font-extrabold text-[#17211D] font-mono mt-0.5">
                {spatialSummary.catchmentAreaHa.toLocaleString()}{' '}
                <span className="text-[10px] text-[#66736C] font-normal">ha</span>
              </div>
              <div className="text-[10px] text-[#66736C] truncate">
                {catchment.soilType.split(' ')[0]} soil
              </div>
            </div>

            <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl p-2.5">
              <div className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider">
                Drainage Length
              </div>
              <div className="text-sm font-extrabold text-sky-700 font-mono mt-0.5">
                {spatialSummary.drainageLengthKm}{' '}
                <span className="text-[10px] text-[#66736C] font-normal">km</span>
              </div>
              <div className="text-[10px] text-[#66736C]">Orders 1–4 streams</div>
            </div>

            <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl p-2.5">
              <div className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider">
                Check Dams
              </div>
              <div className="text-sm font-extrabold text-[#075B45] font-mono mt-0.5">
                {spatialSummary.checkDamsCount}
              </div>
              <div className="text-[10px] text-[#66736C]">Active weirs & bunds</div>
            </div>

            <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl p-2.5">
              <div className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider">
                Percolation Tanks
              </div>
              <div className="text-sm font-extrabold text-cyan-700 font-mono mt-0.5">
                {spatialSummary.percolationTanksCount}
              </div>
              <div className="text-[10px] text-[#66736C]">Recharge waterbodies</div>
            </div>

            <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl p-2.5">
              <div className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider">
                Geo-Photos
              </div>
              <div className="text-sm font-extrabold text-purple-700 font-mono mt-0.5">
                {spatialSummary.geoPhotosCount}
              </div>
              <div className="text-[10px] text-[#66736C]">Field evidence pins</div>
            </div>

            <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl p-2.5">
              <div className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider">
                Open Alerts
              </div>
              <div className="text-sm font-extrabold text-red-600 font-mono mt-0.5 flex items-center gap-1.5">
                <span>{spatialSummary.openAlertsCount}</span>
                {spatialSummary.openAlertsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </div>
              <div className="text-[10px] text-[#66736C]">Requires verification</div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN WORKSPACE (MAP + DYNAMIC INSPECTOR DRAWER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-14rem)] min-h-[580px]">
        {/* Left Column: Fullscreen Leaflet Map Workspace (8 Cols) */}
        <div className="lg:col-span-8 h-full rounded-2xl overflow-hidden border border-[#DCE3DD] relative shadow-md">
          <LeafletWatershedMap
            catchment={catchment}
            catchments={catchments}
            onSelectCatchment={onSelectCatchment}
            structures={structures}
            geoImages={geoImages}
            streams={streams}
            alerts={alerts}
            voiceReports={voiceReports}
            selectedStructureId={selectedStructure?.id}
            selectedAlertId={selectedAlert?.id}
            onSelectStructure={handleSelectStructure}
            onSelectImage={handleSelectImage}
            onSelectAlert={handleSelectAlert}
            onInspectCoordinate={handleInspectCoordinate}
            targetLocation={mapTargetLocation}
            onNavigateToWaterIntelligence={() => {
              if (onSelectTab) onSelectTab('water');
            }}
          />
        </div>

        {/* Right Column: Multi-tab Contextual Inspector Drawer (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#DCE3DD] rounded-2xl shadow-md flex flex-col min-h-0 overflow-hidden">
          {/* Inspector Header & Navigation Tabs */}
          <div className="p-3 bg-[#F0F3EE] border-b border-[#DCE3DD] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'directory'
                    ? 'bg-white text-[#17211D] shadow-xs border border-[#DCE3DD]'
                    : 'text-[#66736C] hover:text-[#17211D]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#075B45]" />
                <span>Directory</span>
              </button>

              {selectedStructure && (
                <button
                  onClick={() => setActiveTab('asset')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'asset'
                      ? 'bg-white text-[#075B45] shadow-xs border border-[#075B45]/30'
                      : 'text-[#66736C] hover:text-[#17211D]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
                  <span>Asset</span>
                </button>
              )}

              {selectedPhoto && (
                <button
                  onClick={() => setActiveTab('photo')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'photo'
                      ? 'bg-white text-purple-800 shadow-xs border border-purple-300'
                      : 'text-[#66736C] hover:text-[#17211D]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-purple-600" />
                  <span>Photo</span>
                </button>
              )}

              {selectedAlert && (
                <button
                  onClick={() => setActiveTab('alert')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'alert'
                      ? 'bg-white text-rose-800 shadow-xs border border-rose-300'
                      : 'text-[#66736C] hover:text-[#17211D]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Alert</span>
                </button>
              )}

              {locationResult && (
                <button
                  onClick={() => setActiveTab('location')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'location'
                      ? 'bg-white text-sky-800 shadow-xs border border-sky-300'
                      : 'text-[#66736C] hover:text-[#17211D]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-sky-600" />
                  <span>Location</span>
                </button>
              )}
            </div>

            {(selectedStructure || selectedPhoto || selectedAlert || locationResult) && (
              <button
                onClick={() => {
                  setSelectedStructure(null);
                  setSelectedPhoto(null);
                  setSelectedAlert(null);
                  setLocationResult(null);
                  setActiveTab('directory');
                }}
                className="text-[#66736C] hover:text-[#17211D] p-1 rounded-lg hover:bg-black/5"
                title="Clear selection and return to Directory"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Drawer Body Container */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-4">
            {/* ---------------- TAB 1: ASSET INSPECTOR DRAWER ---------------- */}
            {activeTab === 'asset' && selectedStructure && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                {/* Structure Header */}
                <div className="bg-[#F7F8F4] rounded-2xl p-4 border border-[#DCE3DD] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#075B45] bg-[#075B45]/10 px-2 py-0.5 rounded border border-[#075B45]/20 inline-block mb-1 font-bold">
                        {selectedStructure.code}
                      </span>
                      <h3 className="font-bold text-sm text-[#17211D]">{selectedStructure.name}</h3>
                      <div className="text-[11px] text-[#66736C] mt-0.5">
                        {selectedStructure.type} • Stream Order {selectedStructure.streamOrder}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                        selectedStructure.health === 'Optimal' || selectedStructure.health === 'Healthy'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : selectedStructure.health === 'Needs Inspection' || selectedStructure.health === 'Minor Leakage'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : selectedStructure.health === 'Under Verification'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {selectedStructure.health}
                    </span>
                  </div>

                  {/* Siltation Gauge / Progress */}
                  <div className="bg-white p-3 rounded-xl border border-[#DCE3DD] space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#66736C]">Current Siltation Level</span>
                      <span
                        className={`font-mono font-bold ${
                          selectedStructure.currentSiltPct > 50 ? 'text-rose-600' : 'text-[#075B45]'
                        }`}
                      >
                        {selectedStructure.currentSiltPct}%
                      </span>
                    </div>
                    <div className="w-full bg-[#E5EAE4] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selectedStructure.currentSiltPct > 50
                            ? 'bg-rose-600'
                            : selectedStructure.currentSiltPct > 30
                            ? 'bg-amber-500'
                            : 'bg-[#075B45]'
                        }`}
                        style={{ width: `${selectedStructure.currentSiltPct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-[#66736C] font-mono">
                      <span>0% (Clean)</span>
                      <span>50% (De-silt threshold)</span>
                      <span>100% (Choked)</span>
                    </div>
                  </div>

                  {/* Key Hydraulic & Administrative Attributes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-[#DCE3DD] shadow-xs">
                      <span className="text-[10px] text-[#66736C] block font-medium">Pondage Capacity</span>
                      <strong className="text-[#17211D] font-mono text-xs">
                        {selectedStructure.capacityCuM.toLocaleString()} m³
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#DCE3DD] shadow-xs">
                      <span className="text-[10px] text-[#66736C] block font-medium">Sanction Scheme</span>
                      <strong className="text-[#17211D] text-xs">
                        {selectedStructure.scheme} ({selectedStructure.sanctionYear})
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#DCE3DD] shadow-xs">
                      <span className="text-[10px] text-[#66736C] block font-medium">Sanction Cost</span>
                      <strong className="text-[#075B45] font-mono text-xs">
                        ₹ {selectedStructure.estimatedCostInr.toLocaleString()}
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#DCE3DD] shadow-xs">
                      <span className="text-[10px] text-[#66736C] block font-medium">Last Inspection</span>
                      <strong className="text-[#17211D] font-mono text-xs">
                        {selectedStructure.lastInspected}
                      </strong>
                    </div>
                  </div>

                  {/* Geographic Coordinates & Engineer */}
                  <div className="text-[11px] text-[#66736C] space-y-1 bg-white p-2.5 rounded-xl border border-[#DCE3DD] font-mono shadow-xs">
                    <div className="flex items-center justify-between">
                      <span>Coordinates:</span>
                      <span className="text-[#17211D] font-bold">
                        {selectedStructure.lat.toFixed(5)}° N, {selectedStructure.lng.toFixed(5)}° E
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Assigned WDT:</span>
                      <span className="text-[#17211D]">{selectedStructure.assignedEngineer}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Watershed:</span>
                      <span className="text-[#075B45] font-bold">{catchment.name}</span>
                    </div>
                  </div>

                  {/* Linked Evidence Count & Photos Preview */}
                  {currentPhotos.filter((p) => p.structureId === selectedStructure.id).length > 0 && (
                    <div className="border-t border-[#DCE3DD] pt-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#17211D] flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-purple-700" />
                          <span>Linked Ground Photos</span>
                        </span>
                        <span className="text-purple-700 font-mono text-[10px]">
                          {currentPhotos.filter((p) => p.structureId === selectedStructure.id).length} Available
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {currentPhotos
                          .filter((p) => p.structureId === selectedStructure.id)
                          .map((img) => (
                            <div
                              key={img.id}
                              onClick={() => handleSelectImage(img)}
                              className="group relative rounded-xl overflow-hidden border border-[#DCE3DD] cursor-pointer aspect-video bg-black shadow-xs"
                            >
                              <img
                                src={img.thumbnailUrl}
                                alt={img.caption}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                                <span className="text-[9px] text-white truncate font-medium">
                                  {img.uploadedBy.name}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Prototype Disclaimer Notice */}
                  <div className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] text-[10px] text-[#66736C] flex items-start gap-2 shadow-xs">
                    <Info className="w-3.5 h-3.5 text-[#66736C] shrink-0 mt-0.5" />
                    <span>
                      Prototype demonstration record for SIH PS 26015. Data is synthesized for field validation testing and not connected to live MIS.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => onOpenInAgent(selectedStructure)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Interrogate with AI Geo Agent</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 2: GEO-PHOTO DETAILS DRAWER ---------------- */}
            {activeTab === 'photo' && selectedPhoto && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="bg-[#F7F8F4] rounded-2xl p-4 border border-[#DCE3DD] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
                    <div>
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mb-1 font-bold">
                        Geo-Photo Evidence
                      </span>
                      <h4 className="font-bold text-sm text-[#17211D]">Field Image Inspection</h4>
                    </div>
                    <span className="text-[10px] font-mono text-[#66736C]">
                      {selectedPhoto.timestamp.split('T')[0]}
                    </span>
                  </div>

                  {/* Photo Display Preview */}
                  <div className="relative rounded-xl overflow-hidden border border-[#DCE3DD] aspect-video bg-black shadow-inner">
                    <img
                      src={selectedPhoto.imageUrl}
                      alt={selectedPhoto.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-[#DCE3DD] text-[10px] font-mono flex items-center gap-1 shadow-xs">
                      {selectedPhoto.locationSource === 'EXIF_GPS' || (selectedPhoto.hasGps !== false && selectedPhoto.gps && selectedPhoto.gps.lat) ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-[#075B45]" />
                          <span className="text-[#075B45] font-bold">GPS VERIFIED</span>
                        </>
                      ) : selectedPhoto.locationSource === 'MANUAL_ASSOCIATION' ? (
                        <>
                          <MapPin className="w-3 h-3 text-amber-700" />
                          <span className="text-amber-700 font-bold">MANUALLY ASSOCIATED</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span className="text-rose-600 font-bold">GPS NOT AVAILABLE</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Caption & Metadata */}
                  <p className="text-[#17211D] text-xs italic bg-white p-2.5 rounded-xl border border-[#DCE3DD]">
                    "{selectedPhoto.caption}"
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-xl border border-[#DCE3DD] shadow-xs">
                      <span className="text-[10px] text-[#66736C] block">Photographer</span>
                      <strong className="text-[#17211D]">{selectedPhoto.uploadedBy.name}</strong>
                      <span className="text-[9px] text-[#66736C] block">{selectedPhoto.uploadedBy.role}</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-[#DCE3DD] shadow-xs">
                      <span className="text-[10px] text-[#66736C] block">GPS Coordinates</span>
                      <strong className="text-sky-700 font-mono text-[11px] block truncate">
                        {selectedPhoto.gps.lat.toFixed(5)}°, {selectedPhoto.gps.lng.toFixed(5)}°
                      </strong>
                      <span className="text-[9px] text-[#66736C]">
                        Accuracy: ±{selectedPhoto.gps.accuracyM}m • Alt: {selectedPhoto.gps.altitudeM}m
                      </span>
                    </div>
                  </div>

                  {/* AI Visual Tags / Assessment */}
                  {selectedPhoto.aiDamageAssessment && (
                    <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5" />
                          <span>AI Visual Feature Analysis (Advisory Only)</span>
                        </span>
                        <span className="text-[10px] font-mono text-purple-800">
                          {Math.round(selectedPhoto.aiDamageAssessment.confidence * 100)}% Confidence
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedPhoto.aiDamageAssessment.detectedDefects.map((defect, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-purple-300 text-purple-800 px-2 py-0.5 rounded-md text-[10px] font-medium"
                          >
                            {defect}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-[#17211D] pt-1 border-t border-purple-200">
                        <span className="text-[#66736C]">Action: </span>
                        {selectedPhoto.aiDamageAssessment.recommendedAction}
                      </div>
                    </div>
                  )}

                  {/* Action: Open Evidence Modal */}
                  <button
                    onClick={() => onOpenImage(selectedPhoto)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Evidence Chain Details</span>
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- TAB 3: ALERT INSPECTOR DRAWER ---------------- */}
            {activeTab === 'alert' && selectedAlert && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="bg-[#F7F8F4] rounded-2xl p-4 border border-[#DCE3DD] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block mb-1 font-bold">
                        {selectedAlert.category}
                      </span>
                      <h4 className="font-bold text-sm text-[#17211D]">{selectedAlert.title}</h4>
                      <span className="text-[10px] text-[#66736C] font-mono">
                        Detected: {selectedAlert.detectedDate}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        selectedAlert.severity === 'Critical'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : selectedAlert.severity === 'Warning'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}
                    >
                      {selectedAlert.severity}
                    </span>
                  </div>

                  {/* Coordinates & Status */}
                  <div className="bg-white p-2.5 rounded-xl border border-[#DCE3DD] space-y-1 font-mono text-[11px] shadow-xs">
                    <div className="flex justify-between">
                      <span className="text-[#66736C]">Coordinates:</span>
                      <span className="text-[#17211D] font-bold">
                        {selectedAlert.lat.toFixed(5)}° N, {selectedAlert.lng.toFixed(5)}° E
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66736C]">Verification Status:</span>
                      <span className="text-amber-700 font-bold">{selectedAlert.evidenceStatus}</span>
                    </div>
                  </div>

                  {/* Observation Notes */}
                  <div className="bg-white p-3 rounded-xl border border-[#DCE3DD] text-[#17211D] text-xs shadow-xs">
                    <span className="text-[#66736C] block font-semibold mb-1 text-[11px]">
                      Observation Summary:
                    </span>
                    <p>{selectedAlert.observationNotes}</p>
                  </div>

                  {/* Honest Transparency Disclaimer */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Earth Observation Advisory</span>
                    </div>
                    <p className="text-[10px] text-amber-800/90 leading-relaxed">
                      Satellite observation indicates a potential spatial anomaly in recent multi-spectral passes. Ground verification with geo-coded imagery is required before administrative sanctioning.
                    </p>
                  </div>

                  {/* Associated Structure Link (if any) */}
                  {selectedAlert.associatedStructureId && (
                    <button
                      onClick={() => {
                        const target = structures.find((s) => s.id === selectedAlert.associatedStructureId);
                        if (target) handleSelectStructure(target);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#DCE3DD] hover:border-[#075B45]/60 transition-colors text-left shadow-xs cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] text-[#66736C] block">Associated Asset</span>
                        <strong className="text-[#17211D] text-xs">
                          {structures.find((s) => s.id === selectedAlert.associatedStructureId)?.name ||
                            selectedAlert.associatedStructureId}
                        </strong>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#075B45]" />
                    </button>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        const struct = structures.find((s) => s.id === selectedAlert.associatedStructureId);
                        if (struct) onOpenInAgent(struct);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Investigate Anomaly with AI Agent</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 4: LOCATION INSPECTOR DRAWER (CRITICAL REQUIREMENT: 4 SECTIONS) ---------------- */}
            {activeTab === 'location' && locationResult && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="bg-[#F7F8F4] rounded-2xl p-4 border border-[#DCE3DD] space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
                    <div>
                      <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block mb-1 font-bold">
                        Spatial Inspection
                      </span>
                      <h4 className="font-bold text-sm text-[#17211D]">Point Intelligence Inspection</h4>
                    </div>
                    <Compass className="w-4 h-4 text-sky-700" />
                  </div>

                  {/* ================= SECTION 1: LOCATION ================= */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17211D] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
                        <span>1. Location</span>
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          locationResult.locationReport?.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {locationResult.locationReport?.isAvailable ? 'Indexed Bounds' : 'External Extent'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-[#DCE3DD] space-y-2 shadow-xs">
                      {/* Coordinates */}
                      <div className="font-mono text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#66736C]">Lat / Long (DMS):</span>
                          <span className="text-[#17211D] font-bold">
                            {locationResult.locationReport?.latDms || `${locationResult.lat.toFixed(5)}°N`},{' '}
                            {locationResult.locationReport?.lngDms || `${locationResult.lng.toFixed(5)}°E`}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-[#66736C]">
                          <span>Decimal:</span>
                          <span className="font-mono">{locationResult.lat.toFixed(6)}°, {locationResult.lng.toFixed(6)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#66736C]">Elevation (SRTM):</span>
                          <span className="text-[#17211D]">
                            {locationResult.locationReport?.elevationM
                              ? `${locationResult.locationReport.elevationM}m MSL`
                              : 'Data unavailable for this location'}
                          </span>
                        </div>
                      </div>

                      {/* Administrative details */}
                      <div className="pt-2 border-t border-[#DCE3DD] text-[11px] space-y-1">
                        {locationResult.locationReport?.isAvailable ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">State / UT:</span>
                              <span className="text-[#17211D] font-medium">{locationResult.locationReport.state}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">District:</span>
                              <span className="text-[#17211D] font-medium">{locationResult.locationReport.district}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">Taluka / Block:</span>
                              <span className="text-[#17211D] font-medium">{locationResult.locationReport.taluka}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">Village / GP:</span>
                              <span className="text-[#17211D] font-medium">{locationResult.locationReport.village}</span>
                            </div>
                            {locationResult.locationReport.cadastralSurveyNo && (
                              <div className="flex justify-between text-[10px]">
                                <span className="text-[#66736C]">Cadastral Survey:</span>
                                <span className="text-[#075B45] font-mono font-medium">
                                  {locationResult.locationReport.cadastralSurveyNo}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-[#66736C] text-[11px] italic bg-[#F7F8F4] p-2 rounded-lg border border-[#DCE3DD]">
                            {locationResult.locationReport?.statusNote || 'Data unavailable for this location'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ================= SECTION 2: HYDROLOGY ================= */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17211D] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        <Droplets className="w-3.5 h-3.5 text-[#1677A8]" />
                        <span>2. Hydrology</span>
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          locationResult.hydrologyReport?.isAvailable
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {locationResult.hydrologyReport?.isAvailable ? 'Hydrological Model' : 'No Stream Vector'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-[#DCE3DD] space-y-2 shadow-xs text-[11px]">
                      {locationResult.hydrologyReport?.isAvailable ? (
                        <>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">River Basin:</span>
                              <span className="text-[#17211D] font-bold">{locationResult.hydrologyReport.basinName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">Sub-Basin:</span>
                              <span className="text-[#17211D]">{locationResult.hydrologyReport.subBasin}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">Watershed Code:</span>
                              <span className="font-mono text-[#075B45] font-bold">{locationResult.hydrologyReport.watershedCode}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#DCE3DD] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">Strahler Stream Order:</span>
                              <span className="text-sky-700 font-mono font-bold">
                                Order {locationResult.hydrologyReport.streamOrder}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">Distance to Nearest Stream:</span>
                              <span className="font-mono">~{locationResult.hydrologyReport.distanceToStreamM}m</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">Catchment Drainage Density:</span>
                              <span className="font-mono">{locationResult.hydrologyReport.drainageDensityKmPerSqKm} km/km²</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#66736C]">Upstream Catchment Area:</span>
                              <span className="font-mono">{locationResult.hydrologyReport.upstreamCatchmentHa} ha</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-[#66736C] text-[11px] italic bg-[#F7F8F4] p-2 rounded-lg border border-[#DCE3DD]">
                          {locationResult.hydrologyReport?.statusNote || 'Data unavailable for this location'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= SECTION 3: ASSET ================= */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17211D] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        <Layers className="w-3.5 h-3.5 text-amber-700" />
                        <span>3. Asset</span>
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          locationResult.assetReport?.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {locationResult.assetReport?.isAvailable ? 'Structure In Vicinity' : 'No Assets'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-[#DCE3DD] space-y-2 shadow-xs text-[11px]">
                      {locationResult.assetReport?.nearestAsset ? (
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[9px] font-mono text-[#075B45] bg-[#075B45]/10 px-2 py-0.5 rounded border border-[#075B45]/20 font-bold">
                                {locationResult.assetReport.nearestAsset.code}
                              </span>
                              <h5 className="font-bold text-xs text-[#17211D] mt-1">
                                {locationResult.assetReport.nearestAsset.name}
                              </h5>
                              <div className="text-[10px] text-[#66736C]">
                                {locationResult.assetReport.nearestAsset.type} • Order {locationResult.assetReport.nearestAsset.streamOrder}
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                locationResult.assetReport.nearestAsset.health === 'Optimal' ||
                                locationResult.assetReport.nearestAsset.health === 'Healthy'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {locationResult.assetReport.nearestAsset.health}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#DCE3DD] text-[10px]">
                            <div>
                              <span className="text-[#66736C] block">Proximity:</span>
                              <strong className="text-[#17211D] font-mono">
                                ~{locationResult.assetReport.distanceM}m away
                              </strong>
                            </div>
                            <div>
                              <span className="text-[#66736C] block">Current Siltation:</span>
                              <strong className="text-amber-800 font-mono">
                                {locationResult.assetReport.nearestAsset.currentSiltPct}%
                              </strong>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectStructure(locationResult.assetReport!.nearestAsset!)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#075B45] font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            <span>Inspect Full Asset Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[#66736C] text-[11px] italic bg-[#F7F8F4] p-2 rounded-lg border border-[#DCE3DD]">
                          {locationResult.assetReport?.statusNote || 'No structures within 2 km radius.'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= SECTION 4: EVIDENCE ================= */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17211D] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        <Camera className="w-3.5 h-3.5 text-purple-700" />
                        <span>4. Evidence</span>
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          locationResult.evidenceReport?.isAvailable
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {locationResult.evidenceReport?.isAvailable ? 'Evidence Logged' : 'No Records'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-[#DCE3DD] space-y-2.5 shadow-xs text-[11px]">
                      {locationResult.evidenceReport?.isAvailable ? (
                        <>
                          {/* Evidence status summary */}
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="bg-[#F7F8F4] p-2 rounded-lg border border-[#DCE3DD]">
                              <span className="text-[#66736C] block">Ground Photos:</span>
                              <strong className="text-[#17211D] font-mono text-xs">
                                {locationResult.evidenceReport.photos.length} logged
                              </strong>
                            </div>
                            <div className="bg-[#F7F8F4] p-2 rounded-lg border border-[#DCE3DD]">
                              <span className="text-[#66736C] block">Voice Reports:</span>
                              <strong className="text-[#17211D] font-mono text-xs">
                                {locationResult.evidenceReport.voiceReportsCount} IVR calls
                              </strong>
                            </div>
                          </div>

                          {/* Photos Grid */}
                          {locationResult.evidenceReport.photos.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-[#66736C] font-semibold block">
                                Field Photos in Vicinity:
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                {locationResult.evidenceReport.photos.slice(0, 4).map((photo) => (
                                  <div
                                    key={photo.id}
                                    onClick={() => handleSelectImage(photo)}
                                    className="rounded-xl overflow-hidden border border-[#DCE3DD] hover:border-[#075B45] cursor-pointer aspect-video bg-black relative group"
                                  >
                                    <img
                                      src={photo.thumbnailUrl}
                                      alt={photo.caption}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs p-1 text-[9px] text-white truncate font-mono">
                                      {photo.caption}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* SHA-256 Hash */}
                          {locationResult.evidenceReport.latestSha256 && (
                            <div className="bg-[#F7F8F4] p-2 rounded-lg border border-[#DCE3DD] font-mono text-[9px] break-all">
                              <span className="text-[#66736C] block mb-0.5 font-sans font-bold">
                                SHA-256 Evidence Integrity Hash:
                              </span>
                              <span className="text-[#075B45]">{locationResult.evidenceReport.latestSha256}</span>
                            </div>
                          )}

                          {/* Soil Erosion Risk */}
                          {locationResult.evidenceReport.erosionRiskLevel && (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px]">
                              <span className="font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>RUSLE Soil Erosion Risk: {locationResult.evidenceReport.erosionRiskLevel}</span>
                              </span>
                              <button
                                onClick={() => {
                                  // Open cases tab or trigger case creation
                                  setActiveTab('directory');
                                }}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition cursor-pointer"
                              >
                                Create Case
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[#66736C] text-[11px] italic bg-[#F7F8F4] p-2 rounded-lg border border-[#DCE3DD]">
                          {locationResult.evidenceReport?.statusNote || 'No field evidence recorded for this location.'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scientific Methodology Note */}
                  <div className="text-[10px] text-[#66736C] italic pt-1 border-t border-[#DCE3DD] leading-relaxed">
                    Point inspection synthesized from official DoLR watershed boundary maps, SRTM elevation vectors, and field cryptographically-hashed observations.
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 5: ASSET DIRECTORY / INVENTORY ---------------- */}
            {activeTab === 'directory' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                {/* Search & Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736C]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search check dams, codes, types..."
                      className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      onClick={() => setFilterHealth('ALL')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        filterHealth === 'ALL'
                          ? 'bg-[#075B45] text-white font-bold'
                          : 'bg-white text-[#66736C] border border-[#DCE3DD] hover:text-[#17211D]'
                      }`}
                    >
                      All ({currentStructures.length})
                    </button>
                    <button
                      onClick={() => setFilterHealth('CRITICAL')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        filterHealth === 'CRITICAL'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      Critical Silt
                    </button>
                    <button
                      onClick={() => setFilterHealth('VERIFICATION')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        filterHealth === 'VERIFICATION'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      Needs Insp.
                    </button>
                    <button
                      onClick={() => setFilterHealth('OPTIMAL')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        filterHealth === 'OPTIMAL'
                          ? 'bg-[#075B45] text-white font-bold'
                          : 'bg-white text-[#075B45] border border-[#075B45]/30 hover:bg-[#075B45]/5'
                      }`}
                    >
                      Optimal
                    </button>
                  </div>
                </div>

                {/* Structure List Items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#66736C] px-1">
                    <span>Listed Structures</span>
                    <span className="font-mono">{filteredStructures.length}</span>
                  </div>

                  {filteredStructures.length > 0 ? (
                    filteredStructures.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectStructure(s)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          selectedStructure?.id === s.id
                            ? 'bg-[#075B45]/10 border-[#075B45]/50 shadow-xs text-[#17211D]'
                            : 'bg-[#F7F8F4] border-[#DCE3DD] hover:border-[#075B45]/40 text-[#17211D]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold truncate">{s.name}</div>
                          <div className="text-[10px] text-[#66736C] font-mono mt-0.5 flex items-center gap-2">
                            <span>{s.type}</span>
                            <span>•</span>
                            <span>Order {s.streamOrder}</span>
                            <span>•</span>
                            <span
                              className={
                                s.currentSiltPct > 50 ? 'text-rose-600 font-bold' : 'text-[#66736C]'
                              }
                            >
                              {s.currentSiltPct}% silt
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              s.health === 'Optimal' || s.health === 'Healthy'
                                ? 'bg-emerald-500'
                                : s.health === 'Needs Inspection' || s.health === 'Minor Leakage'
                                ? 'bg-amber-500'
                                : s.health === 'Under Verification'
                                ? 'bg-purple-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <ChevronRight className="w-3.5 h-3.5 text-[#66736C]" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-[#66736C] bg-[#F7F8F4] rounded-xl border border-[#DCE3DD]">
                      No structures matching current filter criteria.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
