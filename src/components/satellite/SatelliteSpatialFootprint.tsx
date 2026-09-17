import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { WatershedCatchment, GisAlert, WatershedStructure } from '../../types';
import { Globe, MapPin, AlertTriangle, ExternalLink, Maximize2 } from 'lucide-react';

interface SatelliteSpatialFootprintProps {
  catchment: WatershedCatchment;
  alerts: GisAlert[];
  structures: WatershedStructure[];
  onNavigateToGis?: (structureId?: string) => void;
  onInspectAnomaly?: (lat: number, lng: number, title: string) => void;
}

export const SatelliteSpatialFootprint: React.FC<SatelliteSpatialFootprintProps> = ({
  catchment,
  alerts,
  structures,
  onNavigateToGis,
  onInspectAnomaly,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: catchment.center,
        zoom: catchment.zoom - 1,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      ).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(catchment.center, catchment.zoom - 1);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers other than the tile layer
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // 1. Add Catchment Boundary Polygon
    const boundary = L.geoJSON(catchment.boundaryGeoJson as any, {
      style: {
        color: '#10b981',
        weight: 2,
        opacity: 0.9,
        dashArray: '4, 4',
        fillColor: '#059669',
        fillOpacity: 0.12,
      },
    }).addTo(map);

    // 2. Add Sentinel-2 Swath Footprint Rectangle
    const bounds = boundary.getBounds();
    const swathBounds = bounds.pad(0.35);
    const swath = L.rectangle(swathBounds, {
      color: '#38bdf8',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: '#0284c7',
      fillOpacity: 0.08,
    }).addTo(map);

    swath.bindTooltip('Sentinel-2 MSI Tile Footprint (100km Granule)', {
      sticky: true,
      className: 'bg-slate-900 text-sky-300 text-xs px-2 py-1 rounded border border-slate-700',
    });

    // 3. Add Conservation Structure Points
    const catchmentStructures = structures.filter((s) => s.watershedId === catchment.id);
    catchmentStructures.forEach((s) => {
      const icon = L.divIcon({
        className: 'footprint-struct-pin',
        html: `
          <div style="
            background: #10b981;
            width: 14px;
            height: 14px;
            border-radius: 3px;
            border: 1.5px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.6);
          " title="${s.name}"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([s.lat, s.lng], { icon }).addTo(map);
    });

    // 4. Add Anomaly Alert Points
    const catchmentAlerts = alerts.filter((a) => a.watershedId === catchment.id);
    catchmentAlerts.forEach((a) => {
      const icon = L.divIcon({
        className: 'footprint-alert-pin',
        html: `
          <div style="
            background: #ef4444;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 8px #ef4444;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
          ">!</div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([a.lat, a.lng], { icon }).addTo(map);
      marker.on('click', () => {
        onInspectAnomaly?.(a.lat, a.lng, a.title);
      });
    });

    map.fitBounds(swathBounds, { padding: [15, 15] });

    return () => {
      // Map cleanup happens if component fully unmounts
    };
  }, [catchment.id, alerts, structures]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-white">Spatial Footprint & Anomaly Context</h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Orbit R043 Footprint
        </span>
      </div>

      {/* Mini Leaflet Map Container */}
      <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Overlay on Footprint Map */}
        <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] space-y-1 text-slate-300 z-[1000]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border border-emerald-400 border-dashed"></span>
            <span>Catchment Boundary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border border-sky-400 border-dashed"></span>
            <span>Sentinel Swath Footprint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Spectral Anomaly Point</span>
          </div>
        </div>
      </div>

      {/* Link to GIS Workspace */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400">
          {catchment.name} ({catchment.code})
        </span>
        {onNavigateToGis && (
          <button
            onClick={() => onNavigateToGis()}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 transition-colors"
          >
            <span>Inspect in Watershed GIS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
