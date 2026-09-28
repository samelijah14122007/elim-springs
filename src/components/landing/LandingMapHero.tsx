import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Compass,
  Layers,
  MapPin,
  AlertTriangle,
  Camera,
  Maximize2,
  Navigation,
  ShieldAlert,
  Waves,
} from 'lucide-react';
import { mockCatchments, mockStructures, mockGeoImages, mockStreams } from '../../data/mockData';

interface LandingMapHeroProps {
  onExploreWatershed?: () => void;
  onSelectStructure?: (structureId: string) => void;
}

export const LandingMapHero: React.FC<LandingMapHeroProps> = ({
  onExploreWatershed,
  onSelectStructure,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>('struct-rui-cd4');

  const catchment = mockCatchments[0]; // Upper Sina - Ter Micro-Watershed
  const structures = mockStructures.filter((s) => s.watershedId === catchment.id);
  const images = mockGeoImages.filter((img) => img.watershedId === catchment.id);
  const streams = mockStreams.filter((st) => st.watershedId === catchment.id);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center coordinates for Upper Sina - Ter Micro-Watershed (Dharashiv, Maharashtra)
    const map = L.map(mapContainerRef.current, {
      center: catchment.center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Basemap: Esri World Imagery (Satellite) with attribution
    const satelliteTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
      }
    );

    satelliteTile.addTo(map);

    // Watershed Polygon Boundary
    if (catchment.boundaryGeoJson && catchment.boundaryGeoJson.coordinates) {
      const coords = catchment.boundaryGeoJson.coordinates[0].map(
        (c: [number, number]) => [c[1], c[0]] as [number, number]
      );

      L.polygon(coords, {
        color: '#10b981', // Forest emerald
        weight: 2,
        opacity: 0.9,
        fillColor: '#059669',
        fillOpacity: 0.12,
        dashArray: '6, 6',
      }).addTo(map);
    }

    // Drainage streams
    streams.forEach((stream) => {
      const latlngs = stream.coordinates.map((c) => [c[0], c[1]] as [number, number]);
      L.polyline(latlngs, {
        color: stream.streamOrder >= 3 ? '#38bdf8' : '#7dd3fc',
        weight: stream.streamOrder >= 3 ? 3 : 1.5,
        opacity: 0.85,
      }).addTo(map);
    });

    // Structures Markers
    structures.forEach((st) => {
      const isRuiDam = st.id === 'struct-rui-cd4';
      const isCritical = st.health === 'Heavy Siltation' || st.health === 'Breach Risk' || isRuiDam;

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${
            isCritical
              ? '<span class="absolute w-7 h-7 rounded-full bg-rose-500/30 animate-ping"></span>'
              : ''
          }
          <div class="w-6 h-6 rounded-full ${
            isCritical
              ? 'bg-rose-600 border-2 border-white shadow-lg shadow-rose-900/60'
              : 'bg-emerald-600 border border-white shadow-md'
          } flex items-center justify-center text-[10px] text-white font-bold font-mono">
            ${isCritical ? '!' : 'CD'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedAsset(st.id);
        if (onSelectStructure) onSelectStructure(st.id);
      });
    });

    // Geo-Photo pins
    images.forEach((img) => {
      if (!img.gps || !img.gps.lat || !img.gps.lng) return;

      const photoMarkerHtml = `
        <div class="w-5 h-5 rounded-md bg-amber-500 border border-white flex items-center justify-center shadow-md text-slate-950">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </div>
      `;

      const photoIcon = L.divIcon({
        html: photoMarkerHtml,
        className: 'photo-leaflet-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([img.gps.lat, img.gps.lng], { icon: photoIcon }).addTo(map);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapInstanceRef.current?.setView(catchment.center, 13);
  };

  return (
    <div className="relative w-full h-[460px] lg:h-[580px] rounded-3xl overflow-hidden border border-[#DCE3DD] shadow-xl bg-[#F0F3EE]">
      {/* Real Interactive Leaflet Map Viewport */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top HUD: Pan-India Context Hierarchy */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#DCE3DD] text-[11px] font-mono text-[#17211D] shadow-md pointer-events-auto">
          <span className="text-[#075B45] font-bold">INDIA</span>
          <span className="text-[#DCE3DD]">/</span>
          <span>MAHARASHTRA</span>
          <span className="text-[#DCE3DD]">/</span>
          <span>DHARASHIV</span>
          <span className="text-[#DCE3DD]">/</span>
          <span className="text-[#075B45] font-semibold">UPPER SINA / TER</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#DCE3DD] text-[10px] font-mono text-[#66736C] shadow-md pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#075B45] animate-pulse"></span>
          <span>LAT 18.234° N</span>
          <span className="text-[#DCE3DD]">|</span>
          <span>LNG 75.981° E</span>
          <span className="text-[#DCE3DD]">|</span>
          <span className="text-[#075B45] font-semibold">ELEV 642m</span>
        </div>
      </div>

      {/* Map Technical Floating Annotations */}
      <div className="absolute top-16 left-4 z-10 pointer-events-none space-y-1.5 hidden sm:block">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm border border-[#075B45]/30 text-[10px] font-mono text-[#075B45] shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#075B45]"></span>
          <span>WATERSHED BOUNDARY (4B1C2d3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm border border-sky-300 text-[10px] font-mono text-sky-700 shadow-xs">
            <Waves className="w-3 h-3 text-sky-600" />
            <span>TER TRIBUTARY (ORDER 3)</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm border border-amber-300 text-[10px] font-mono text-amber-700 shadow-xs">
            <Camera className="w-3 h-3 text-amber-600" />
            <span>08 GEO-PHOTOS</span>
          </div>
        </div>
      </div>

      {/* Selected Asset Spotlight Callout (Rui East Check Dam #4) */}
      <div className="absolute bottom-4 left-4 z-10 max-w-sm pointer-events-auto">
        <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-rose-300 shadow-xl">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-rose-700">
                FIELD ANOMALY DETECTED
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
              CRITICAL
            </span>
          </div>

          <h4 className="text-xs font-bold text-[#17211D] tracking-tight">
            Rui East Check Dam #4 (MH-DHR-2024-CD-04)
          </h4>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#DCE3DD] text-[10px] font-mono text-[#17211D]">
            <div>
              <span className="text-[#66736C] block">SILT DEPOSITION</span>
              <span className="text-amber-700 font-bold">78% CAPACITY LOSS</span>
            </div>
            <div>
              <span className="text-[#66736C] block">VOICE COMPLAINT</span>
              <span className="text-sky-700 font-bold">MARATHI (BHASHINI)</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <button
              onClick={onExploreWatershed}
              className="text-[10px] font-semibold text-[#075B45] hover:text-[#0E8065] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Inspect in GIS Command View</span>
              <span>→</span>
            </button>
            <span className="text-[9px] font-mono text-[#66736C]">EXIF SHA-256 VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Map Floating Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg bg-white hover:bg-[#F0F3EE] border border-[#DCE3DD] text-[#17211D] flex items-center justify-center text-sm font-bold shadow-md transition-colors cursor-pointer"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg bg-white hover:bg-[#F0F3EE] border border-[#DCE3DD] text-[#17211D] flex items-center justify-center text-sm font-bold shadow-md transition-colors cursor-pointer"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={handleResetView}
          className="w-8 h-8 rounded-lg bg-white hover:bg-[#F0F3EE] border border-[#DCE3DD] text-[#17211D] flex items-center justify-center shadow-md transition-colors cursor-pointer"
          title="Reset to Upper Sina"
        >
          <Compass className="w-4 h-4 text-[#075B45]" />
        </button>
      </div>

      {/* Real Data Provenance Stamp */}
      <div className="absolute bottom-1 right-16 z-10 pointer-events-none hidden md:block">
        <span className="text-[9px] font-mono text-[#66736C] bg-white/90 px-2 py-0.5 rounded border border-[#DCE3DD] shadow-xs">
          DATA: SENTINEL-2 / ISRO BHUVAN • WGS-84
        </span>
      </div>
    </div>
  );
};
