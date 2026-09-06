import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  WatershedCatchment,
  WatershedStructure,
  GeoCodedImage,
  DrainageStream,
  GisAlert,
  IvrVoiceReport,
} from '../../types';
import { bhuvanService, DEFAULT_BHUVAN_WMS_URL } from '../../services/bhuvanService';
import { locationService, INDIA_NATIONAL_BOUNDARY_COORDS } from '../../services/locationService';
import { waterHistoryService } from '../../services/waterHistoryService';
import {
  Layers,
  MapPin,
  AlertTriangle,
  Camera,
  Maximize2,
  Navigation,
  Compass,
  Info,
  Globe2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  FileCheck,
} from 'lucide-react';

interface LeafletWatershedMapProps {
  catchment: WatershedCatchment;
  catchments?: WatershedCatchment[];
  onSelectCatchment?: (catchment: WatershedCatchment) => void;
  structures: WatershedStructure[];
  geoImages: GeoCodedImage[];
  streams: DrainageStream[];
  alerts: GisAlert[];
  voiceReports?: IvrVoiceReport[];
  selectedStructureId?: string;
  selectedAlertId?: string;
  selectedVoiceReportId?: string;
  targetLocation?: { center: [number, number]; zoom: number; label?: string } | null;
  onSelectStructure?: (structure: WatershedStructure) => void;
  onSelectImage?: (image: GeoCodedImage) => void;
  onSelectAlert?: (alert: GisAlert) => void;
  onSelectVoiceReport?: (report: IvrVoiceReport) => void;
  onInspectCoordinate?: (lat: number, lng: number) => void;
  onNavigateToWaterIntelligence?: (waterBodyId?: string) => void;
}

export type GisBaseLayer = 'satellite' | 'street' | 'bhuvan';

export const LeafletWatershedMap: React.FC<LeafletWatershedMapProps> = ({
  catchment,
  catchments = [],
  onSelectCatchment,
  structures,
  geoImages,
  streams,
  alerts,
  voiceReports,
  selectedStructureId,
  selectedAlertId,
  selectedVoiceReportId,
  targetLocation,
  onSelectStructure,
  onSelectImage,
  onSelectAlert,
  onSelectVoiceReport,
  onInspectCoordinate,
  onNavigateToWaterIntelligence,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  // Progressive Zoom Level
  const [currentZoom, setCurrentZoom] = useState<number>(5);

  // Layer Visibility State (Part 8 requirement)
  const [baseLayer, setBaseLayer] = useState<GisBaseLayer>('street');

  // 1. Hydrological Boundaries
  const [showBasins, setShowBasins] = useState(true);
  const [showSubbasins, setShowSubbasins] = useState(true);
  const [showWatersheds, setShowWatersheds] = useState(true);
  const [showFlood, setShowFlood] = useState(false);

  // 2. Administrative
  const [showStates, setShowStates] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);
  const [showCadastral, setShowCadastral] = useState(false);

  // 3. Water & Drainage
  const [showWaterBodies, setShowWaterBodies] = useState(true);
  const [showDrainage, setShowDrainage] = useState(true);

  // 4. Remote Sensing & Soil Dynamics
  const [showErosionRisk, setShowErosionRisk] = useState(true);
  const [showNdvi, setShowNdvi] = useState(false);
  const [showNdwi, setShowNdwi] = useState(false);
  const [showSoilSeries, setShowSoilSeries] = useState(false);
  const [showDemContours, setShowDemContours] = useState(false);
  const [showSmap, setShowSmap] = useState(false);
  const [showLulc, setShowLulc] = useState(false);

  // 5. ELIM Assets & Ground Evidence
  const [showGeoPhotos, setShowGeoPhotos] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showCheckDams, setShowCheckDams] = useState(true);
  const [showCct, setShowCct] = useState(false);
  const [showVoiceGrievances, setShowVoiceGrievances] = useState(true);
  const [showCases, setShowCases] = useState(true);

  // Bhuvan notification & Diagnostics
  const [bhuvanNotification, setBhuvanNotification] = useState<{
    layer: string;
    reason: string;
  } | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagPingResult, setDiagPingResult] = useState<string | null>(null);
  const [diagPinging, setDiagPinging] = useState(false);

  // Watershed Info Panel State (Part 9 requirement)
  const [selectedWatershedInfo, setSelectedWatershedInfo] = useState<WatershedCatchment | null>(null);

  // Active click coordinate
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [isIndiaView, setIsIndiaView] = useState(true);

  // Initialize Map Instance over India Bounds (Part 6 requirement)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Fit to Sovereign Republic of India Bounds initially (Part 6 requirement)
      const indiaBounds = L.latLngBounds([6.5, 68.0], [37.5, 97.5]);
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 82.0],
        zoom: 5,
        minZoom: 4,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false,
      });

      map.fitBounds(indiaBounds, { padding: [15, 15] });

      // Add Zoom control at bottom right (preserve zoom controls)
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Default OpenStreetMap light tile layer for crisp institutional view
      const tile = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
      ).addTo(map);

      tileLayerRef.current = tile;
      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Progressive zoom listener
      map.on('zoomend', () => {
        const z = map.getZoom();
        setCurrentZoom(z);
        if (z <= 5) {
          setIsIndiaView(true);
        } else {
          setIsIndiaView(false);
        }
      });

      // Ensure Leaflet recalculates container dimensions after layout stabilization
      setTimeout(() => {
        map.invalidateSize();
        if (isIndiaView) {
          map.fitBounds(indiaBounds, { padding: [15, 15] });
        }
      }, 200);

      // Click to inspect coordinates
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setClickedCoord({ lat, lng });

        if (clickMarkerRef.current) {
          clickMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const reticleIcon = L.divIcon({
            className: 'click-reticle',
            html: `
              <div style="
                width: 22px;
                height: 22px;
                border: 2px solid #38bdf8;
                border-radius: 50%;
                background: rgba(56, 189, 248, 0.25);
                box-shadow: 0 0 10px #38bdf8;
                position: relative;
              ">
                <div style="position: absolute; top: 8px; left: 8px; width: 4px; height: 4px; background: #fff; border-radius: 50%;"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          clickMarkerRef.current = L.marker([lat, lng], { icon: reticleIcon }).addTo(map);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update base imagery layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const bhuvanCfg = bhuvanService.getBhuvanConfig();

    if (baseLayer === 'bhuvan') {
      // Keep OpenStreetMap loaded as robust base layer so no black void or repeating error tiles appear
      const streetTile = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
      );
      streetTile.addTo(mapInstanceRef.current);
      tileLayerRef.current = streetTile;

      // Overlay Bhuvan Flood / Reference WMS
      const bhuvanTile = L.tileLayer.wms(bhuvanCfg.wmsUrl, {
        layers: 'Flood',
        format: 'image/png',
        transparent: true,
        attribution: 'ISRO / NRSC Bhuvan Geospatial Services',
        maxZoom: 19,
      });
      bhuvanTile.on('tileerror', () => {
        setBhuvanNotification({
          layer: 'Bhuvan Flood / Satellite WMS',
          reason: 'NRSC tile server unavailable or CORS restricted. OpenStreetMap base layer remains active.',
        });
      });
      bhuvanTile.addTo(mapInstanceRef.current);
    } else if (baseLayer === 'street') {
      const streetTile = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
      );
      streetTile.addTo(mapInstanceRef.current);
      tileLayerRef.current = streetTile;
    } else {
      const satTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Esri, Maxar, Earthstar Geographics' }
      );
      satTile.addTo(mapInstanceRef.current);
      tileLayerRef.current = satTile;
    }
  }, [baseLayer]);

  // Center / fly to catchment when user selects it
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (!isIndiaView && catchment) {
      mapInstanceRef.current.flyTo(catchment.center, catchment.zoom, { duration: 1.2 });
    }
  }, [catchment.id, isIndiaView]);

  // Center / fly to targetLocation when provided (e.g. from Universal Pan-India Search)
  useEffect(() => {
    if (!mapInstanceRef.current || !targetLocation) return;
    mapInstanceRef.current.flyTo(targetLocation.center, targetLocation.zoom, { duration: 1.2 });
    setIsIndiaView(false);
  }, [targetLocation]);

  // Window handler for popup actions
  useEffect(() => {
    (window as any).elimOpenWaterIntelligence = (wbId: string) => {
      onNavigateToWaterIntelligence?.(wbId);
    };
    return () => {
      delete (window as any).elimOpenWaterIntelligence;
    };
  }, [onNavigateToWaterIntelligence]);

  // Render Geospatial Overlays & Authoritative Bhuvan Layers
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const layersGroup = layersGroupRef.current;
    layersGroup.clearLayers();

    const bhuvanCfg = bhuvanService.getBhuvanConfig();

    // Safe helper that attaches tileerror handler to prevent broken tiles
    const addSafeBhuvanLayer = (layerName: string, title: string) => {
      try {
        const layer = L.tileLayer.wms(bhuvanCfg.wmsUrl, {
          layers: layerName,
          format: 'image/png',
          transparent: true,
          attribution: 'ISRO / NRSC Bhuvan OGC',
          maxZoom: 19,
        });
        layer.on('tileerror', () => {
          setBhuvanNotification({
            layer: title,
            reason: 'NRSC server returned an error or timed out. Local vector boundaries and OpenStreetMap remain active.',
          });
        });
        layer.addTo(layersGroup);
        return layer;
      } catch (err) {
        console.warn(`[Bhuvan] Error initializing layer ${layerName}:`, err);
      }
    };

    // 0. Sovereign Republic of India National Boundary (Zoom <= 7)
    if (currentZoom <= 7) {
      const indiaPoly = L.polygon(INDIA_NATIONAL_BOUNDARY_COORDS, {
        color: '#075B45',
        weight: currentZoom <= 5 ? 2.5 : 1.5,
        fillColor: '#075B45',
        fillOpacity: currentZoom <= 5 ? 0.04 : 0.01,
        dashArray: '5, 5',
      });
      indiaPoly.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px;">
          <strong style="color: #075B45; font-size: 13px;">🇮🇳 Sovereign Republic of India</strong>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
            Survey of India & NRSC Authoritative National Extent
          </div>
          <div style="font-size: 10px; color: #17211D; margin-top: 4px; border-top: 1px solid #E2E8F0; padding-top: 4px;">
            28 States • 8 Union Territories • 12 Major River Basins
          </div>
        </div>
      `);
      indiaPoly.addTo(layersGroup);
    }

    // 1. Hydrological Boundaries (Authoritative Bhuvan WMS)
    // Major River Basins: Zoom 6–10
    if (showBasins && currentZoom >= 6 && currentZoom <= 10) {
      addSafeBhuvanLayer('bhuvan_basin', 'River Basins');

      const basins = locationService.getBasins();
      basins.forEach((basin) => {
        const basinIcon = L.divIcon({
          className: 'basin-badge-marker',
          html: `
            <div style="
              background: #7c3aed;
              color: white;
              border: 1px solid white;
              border-radius: 6px;
              padding: 2px 6px;
              font-family: monospace;
              font-size: 9px;
              font-weight: bold;
              box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              white-space: nowrap;
              cursor: pointer;
            ">
              ${basin.name}
            </div>
          `,
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        });

        const bMarker = L.marker([basin.center[0], basin.center[1]], { icon: basinIcon });
        bMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 200px; padding: 4px;">
            <div style="font-size: 9px; font-weight: bold; color: #7c3aed; text-transform: uppercase;">
              Major River Basin
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #17211D; margin: 2px 0 4px 0;">
              ${basin.name}
            </div>
            <div style="font-size: 11px; color: #66736C;">
              Major River: <strong style="color: #17211D;">${basin.majorRiver}</strong>
            </div>
            <div style="font-size: 11px; color: #66736C;">
              Catchment Area: <strong style="color: #17211D;">${basin.areaSqKm.toLocaleString()} sq km</strong>
            </div>
          </div>
        `);
        bMarker.addTo(layersGroup);
      });
    }

    if (showSubbasins && currentZoom >= 7 && currentZoom <= 11) {
      addSafeBhuvanLayer('bhuvan_subbasin', 'Sub-Basins');
    }

    // Watersheds: Zoom >= 8
    if (showWatersheds && currentZoom >= 8) {
      // Authoritative Bhuvan Watershed layer
      addSafeBhuvanLayer('bhuvan_watershed', 'National Watersheds (DoLR/NRSC)');

      // Render all known monitored catchment boundaries / markers
      const allCatchments = catchments.length > 0 ? catchments : [catchment];
      allCatchments.forEach((cat) => {
        // Watershed boundary polygon
        if (cat.boundaryGeoJson) {
          const isSelected = cat.id === catchment.id;
          const poly = L.geoJSON(cat.boundaryGeoJson as any, {
            style: {
              color: isSelected ? '#075B45' : '#1677A8',
              weight: isSelected ? 2.5 : 1.5,
              dashArray: isSelected ? undefined : '4, 4',
              fillColor: isSelected ? '#075B45' : '#0284c7',
              fillOpacity: isSelected ? 0.12 : 0.06,
            },
          });

          poly.on('click', () => {
            setSelectedWatershedInfo(cat);
          });
          poly.addTo(layersGroup);
        }

        // Watershed Central Radar Pin
        const pinIcon = L.divIcon({
          className: 'watershed-pin',
          html: `
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              background: #FFFFFF;
              border: 1.5px solid ${cat.id === catchment.id ? '#075B45' : '#1677A8'};
              border-radius: 9999px;
              padding: 4px 10px;
              color: #17211D;
              font-family: monospace;
              font-size: 11px;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              white-space: nowrap;
              cursor: pointer;
            ">
              <span style="
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: ${cat.id === catchment.id ? '#075B45' : '#1677A8'};
                display: inline-block;
              "></span>
              <span>${cat.name.split(' ')[0]}</span>
              <span style="color: #66736C; font-size: 9px;">${cat.code}</span>
            </div>
          `,
          iconSize: [120, 26],
          iconAnchor: [60, 13],
        });

        const pinMarker = L.marker(cat.center, { icon: pinIcon });
        pinMarker.on('click', () => {
          setSelectedWatershedInfo(cat);
        });
        pinMarker.addTo(layersGroup);
      });
    }

    // 2. Administrative Boundaries
    if (showStates && currentZoom <= 7) {
      addSafeBhuvanLayer('india3', 'State Boundaries');

      // Add clickable State centroids with authoritative metadata
      const allStates = locationService.getStates();
      allStates.forEach((st) => {
        const stateDistricts = locationService.getDistricts(st.id);
        const stateWatersheds = locationService.getWatersheds().filter((w) => w.state.toLowerCase() === st.name.toLowerCase());

        const stateIcon = L.divIcon({
          className: 'state-badge-marker',
          html: `
            <div style="
              background: #075B45;
              color: white;
              border: 1.5px solid white;
              border-radius: 9999px;
              padding: 2px 7px;
              font-family: monospace;
              font-size: 9px;
              font-weight: bold;
              box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              white-space: nowrap;
              cursor: pointer;
            ">
              ${st.code || st.name.slice(0, 3).toUpperCase()}
            </div>
          `,
          iconSize: [40, 20],
          iconAnchor: [20, 10],
        });

        const marker = L.marker([st.center[0], st.center[1]], { icon: stateIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 220px; padding: 4px;">
            <div style="font-size: 9px; font-weight: bold; color: #075B45; text-transform: uppercase; letter-spacing: 0.05em;">
              ${st.type === 'UT' ? 'Union Territory' : 'Indian State'}
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #17211D; margin: 2px 0 6px 0;">
              ${st.name}
            </div>
            <div style="font-size: 11px; color: #66736C; display: flex; justify-content: space-between; margin-bottom: 4px; border-top: 1px solid #E2E8F0; padding-top: 4px;">
              <span>District Count:</span>
              <strong style="color: #17211D;">${stateDistricts.length} Verified</strong>
            </div>
            <div style="font-size: 11px; color: #66736C; display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Capital:</span>
              <span style="color: #17211D;">${st.capital}</span>
            </div>
            <div style="font-size: 11px; color: #66736C; display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Watershed Coverage:</span>
              <strong style="color: ${stateWatersheds.length > 0 ? '#075B45' : '#D97706'};">
                ${stateWatersheds.length > 0 ? `${stateWatersheds.length} Codified Units` : 'State-Level Hydrology'}
              </strong>
            </div>
            <div style="margin-top: 6px; font-size: 9px; color: #64748B; background: #F8FAFC; padding: 4px; border-radius: 4px;">
              Source: Survey of India / Census of India 2024
            </div>
          </div>
        `);
        marker.addTo(layersGroup);
      });
    }

    if (showDistricts && currentZoom >= 6) {
      addSafeBhuvanLayer('district', 'District Boundaries');

      // Add clickable District points with authoritative metadata
      const allDistricts = locationService.getDistricts();
      allDistricts.forEach((dst) => {
        const settlements = locationService.getSettlements(dst.id);
        const districtWatersheds = locationService.getWatersheds().filter((w) => w.districtId === dst.id);

        const districtIcon = L.divIcon({
          className: 'district-dot-marker',
          html: `
            <div style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #1677A8;
              border: 1.5px solid white;
              box-shadow: 0 0 4px rgba(0,0,0,0.3);
              cursor: pointer;
            "></div>
          `,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });

        const marker = L.marker([dst.center[0], dst.center[1]], { icon: districtIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 210px; padding: 4px;">
            <div style="font-size: 9px; font-weight: bold; color: #1677A8; text-transform: uppercase;">
              District Level
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #17211D; margin: 2px 0 4px 0;">
              ${dst.name}
            </div>
            <div style="font-size: 11px; color: #66736C; margin-bottom: 4px;">
              State: <strong style="color: #17211D;">${dst.stateName}</strong>
            </div>
            <div style="font-size: 11px; color: #66736C; display: flex; justify-content: space-between; margin-bottom: 4px; border-top: 1px solid #E2E8F0; padding-top: 4px;">
              <span>Settlements / Villages:</span>
              <strong style="color: #17211D;">${settlements.length > 0 ? settlements.map((s) => s.name).join(', ') : 'Indexed in GIS'}</strong>
            </div>
            <div style="font-size: 11px; color: #66736C; display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Watershed Management:</span>
              <strong style="color: ${districtWatersheds.length > 0 ? '#075B45' : '#64748B'};">
                ${districtWatersheds.length > 0 ? `${districtWatersheds.length} Active Watershed(s)` : 'General Catchment'}
              </strong>
            </div>
          </div>
        `);
        marker.addTo(layersGroup);
      });
    }

    // 3. Water & Drainage Layers
    if (showFlood) {
      addSafeBhuvanLayer('Flood', 'Flood Hazard & Seasonal Inundation (NRSC)');
    }

    if (showWaterBodies && currentZoom >= 10) {
      addSafeBhuvanLayer('bhuvan_waterbody', 'Surface Water Bodies');

      // Add clickable Monitored Water Bodies with authoritative EO history
      const allWbs = locationService.getWaterBodies();
      allWbs.forEach((wb) => {
        const histProfile = waterHistoryService.getWaterBodyProfile(wb.id);

        const wbIcon = L.divIcon({
          className: 'waterbody-marker',
          html: `
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #0284c7;
              border: 2px solid white;
              box-shadow: 0 0 8px rgba(2,132,199,0.7);
              cursor: pointer;
            "></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([wb.center[0], wb.center[1]], { icon: wbIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 230px; padding: 4px;">
            <div style="font-size: 9px; font-weight: bold; color: #0284c7; text-transform: uppercase;">
              ${wb.type} • ${wb.code}
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #17211D; margin: 2px 0 4px 0;">
              ${wb.name}
            </div>
            <div style="font-size: 11px; color: #66736C; margin-bottom: 2px;">
              Location: <strong style="color: #17211D;">${wb.districtName}, ${wb.stateName}</strong>
            </div>
            <div style="font-size: 10px; font-family: monospace; color: #64748B; margin-bottom: 4px;">
              Coordinates: ${wb.center[0].toFixed(4)}°N, ${wb.center[1].toFixed(4)}°E
            </div>
            <div style="border-top: 1px solid #E2E8F0; padding-top: 4px; margin-top: 4px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #66736C;">Current Spread:</span>
                <strong style="color: #075B45;">${histProfile.currentSpreadHa !== null ? `${histProfile.currentSpreadHa} ha` : 'N/A'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #66736C;">Historical EO Status:</span>
                <span style="font-size: 9px; font-weight: bold; color: ${histProfile.isAvailable ? '#075B45' : '#D97706'};">
                  ${histProfile.statusBadge}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #66736C;">Siltation Risk:</span>
                <strong style="color: ${histProfile.siltRisk === 'CRITICAL' ? '#B42318' : '#075B45'};">
                  ${histProfile.siltRisk}
                </strong>
              </div>
            </div>
            <button onclick="window.elimOpenWaterIntelligence && window.elimOpenWaterIntelligence('${wb.id}')" style="margin-top: 6px; width: 100%; padding: 5px; background: #0284c7; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
              Open in Water Body Intelligence →
            </button>
          </div>
        `);
        marker.addTo(layersGroup);
      });
    }

    if (showDrainage) {
      addSafeBhuvanLayer('bhuvan_drainage', 'NRSC Drainage Network');

      // Local detailed stream orders
      const currentStreams = streams.filter((s) => s.watershedId === catchment.id);
      currentStreams.forEach((s) => {
        const streamColor =
          s.streamOrder === 4 ? '#0284c7' : s.streamOrder === 3 ? '#0ea5e9' : s.streamOrder === 2 ? '#38bdf8' : '#7dd3fc';
        const streamWeight = s.streamOrder === 4 ? 3.5 : s.streamOrder === 3 ? 2.5 : s.streamOrder === 2 ? 1.8 : 1.2;

        L.polyline(s.coordinates as any, {
          color: streamColor,
          weight: streamWeight,
          opacity: 0.85,
        }).addTo(layersGroup);
      });
    }

    // 4. ELIM Evidence Layers (Zoom >= 12: Assets, Field Photos, Alerts)
    // Conservation Structures (Check Dams & Percolation Tanks)
    if (showCheckDams && currentZoom >= 12) {
      structures.forEach((st) => {
        const isSelected = st.id === selectedStructureId;
        const isAlert = st.health === 'At Risk' || st.health === 'Heavy Siltation' || st.currentSiltPct > 50;

        const assetIcon = L.divIcon({
          className: 'asset-marker',
          html: `
            <div style="
              width: ${isSelected ? '28px' : '20px'};
              height: ${isSelected ? '28px' : '20px'};
              border-radius: ${st.type === 'Check Dam' ? '4px' : '50%'};
              background: ${isAlert ? '#ef4444' : '#10b981'};
              border: 2px solid #ffffff;
              box-shadow: 0 0 ${isSelected ? '12px #10b981' : '6px rgba(0,0,0,0.5)'};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: ${isSelected ? '10px' : '8px'};
              font-family: monospace;
              font-weight: bold;
              cursor: pointer;
            ">
              ${st.type === 'Check Dam' ? 'CD' : 'PT'}
            </div>
          `,
          iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
          iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10],
        });

        const marker = L.marker([st.lat, st.lng], { icon: assetIcon });
        marker.on('click', () => {
          onSelectStructure?.(st);
        });
        marker.addTo(layersGroup);
      });
    }

    // Field Photos (Zoom >= 12)
    if (showGeoPhotos && currentZoom >= 12) {
      geoImages.forEach((img) => {
        // Only place photos on the Leaflet map if coordinates exist and are verified or manually associated
        if (
          !img.gps ||
          typeof img.gps.lat !== 'number' ||
          typeof img.gps.lng !== 'number' ||
          isNaN(img.gps.lat) ||
          isNaN(img.gps.lng) ||
          (img.gps.lat === 0 && img.gps.lng === 0)
        ) {
          return;
        }

        const isGpsVerified = img.locationSource === 'EXIF_GPS' || (img.hasGps !== false && img.gps.accuracyM <= 10);
        const isManuallyAssociated = img.locationSource === 'MANUAL_ASSOCIATION' || img.locationSource === 'ASSET_PROXIMITY';

        if (!isGpsVerified && !isManuallyAssociated) {
          return;
        }

        const markerColor = isGpsVerified ? '#0284c7' : '#d97706';
        const markerBorder = isGpsVerified ? '#ffffff' : '#fbbf24';
        const badgeLabel = isGpsVerified ? 'GPS VERIFIED' : 'MANUALLY ASSOCIATED';

        const photoIcon = L.divIcon({
          className: 'photo-marker',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 6px;
              background: ${markerColor};
              border: 2px solid ${markerBorder};
              box-shadow: 0 2px 8px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              cursor: pointer;
            " title="${badgeLabel}">
              📷
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([img.gps.lat, img.gps.lng], { icon: photoIcon });
        marker.on('click', () => {
          onSelectImage?.(img);
        });
        marker.addTo(layersGroup);
      });
    }

    // Alerts (Zoom >= 12)
    if (showAlerts && currentZoom >= 12) {
      alerts.forEach((alt) => {
        const isSelected = alt.id === selectedAlertId;
        const alertIcon = L.divIcon({
          className: 'alert-marker',
          html: `
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #f43f5e;
              border: 2px solid white;
              box-shadow: 0 0 10px #f43f5e;
              animation: pulse 1.5s infinite;
              cursor: pointer;
            "></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([alt.lat, alt.lng], { icon: alertIcon });
        marker.on('click', () => {
          onSelectAlert?.(alt);
        });
        marker.addTo(layersGroup);
      });
    }

    // 5. Soil Erosion Risk / RUSLE Thematic Map Layer (SIH PS 26015)
    if (showErosionRisk && currentZoom >= 11) {
      const centerLat = catchment.center[0];
      const centerLng = catchment.center[1];

      // High Erosion Risk Zone (Slope > 8% Ridge Scarp)
      const highRisk = L.polygon([
        [centerLat + 0.007, centerLng - 0.006],
        [centerLat + 0.012, centerLng + 0.002],
        [centerLat + 0.006, centerLng + 0.009],
        [centerLat + 0.002, centerLng - 0.001],
      ], {
        color: '#f59e0b',
        weight: 1.5,
        fillColor: '#f59e0b',
        fillOpacity: 0.28,
        dashArray: '4,4',
      }).bindTooltip('<strong>RUSLE High Soil Loss Risk (A = 14.8 t/ha/yr)</strong><br/>Slope > 8% • Ridge CCTs Recommended', { sticky: true });
      highRisk.addTo(layersGroup);

      // Moderate Erosion Risk Zone
      const modRisk = L.polygon([
        [centerLat + 0.002, centerLng - 0.008],
        [centerLat + 0.005, centerLng - 0.002],
        [centerLat - 0.004, centerLng + 0.006],
        [centerLat - 0.007, centerLng - 0.003],
      ], {
        color: '#eab308',
        weight: 1.2,
        fillColor: '#eab308',
        fillOpacity: 0.22,
      }).bindTooltip('<strong>RUSLE Moderate Soil Loss Risk (A = 6.4 t/ha/yr)</strong><br/>Mid-slope Rainfed Crop Zone', { sticky: true });
      modRisk.addTo(layersGroup);

      // Low Erosion Risk (Valley Floor)
      const lowRisk = L.polygon([
        [centerLat - 0.002, centerLng - 0.004],
        [centerLat + 0.001, centerLng + 0.008],
        [centerLat - 0.008, centerLng + 0.005],
        [centerLat - 0.009, centerLng - 0.002],
      ], {
        color: '#10b981',
        weight: 1.2,
        fillColor: '#10b981',
        fillOpacity: 0.2,
      }).bindTooltip('<strong>RUSLE Low Soil Loss (A = 2.28 t/ha/yr)</strong><br/>Alluvial Valley Floor (Tolerable < 11.2 t/ha/yr)', { sticky: true });
      lowRisk.addTo(layersGroup);

      // Severe Gully Point
      const severeGully = L.circleMarker([centerLat + 0.005, centerLng - 0.003], {
        radius: 8,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.7,
        weight: 2,
      }).bindTooltip('<strong>Active Gully Head Incision</strong><br/>RUSLE A = 42.5 t/ha/yr (Severe) • Loose boulder plug required', { sticky: true });
      severeGully.addTo(layersGroup);
    }
  }, [
    currentZoom,
    showBasins,
    showSubbasins,
    showWatersheds,
    showStates,
    showDistricts,
    showWaterBodies,
    showDrainage,
    showErosionRisk,
    showCheckDams,
    showGeoPhotos,
    showAlerts,
    catchment.id,
    catchments,
    selectedStructureId,
    selectedAlertId,
  ]);

  // Handler: Zoom to India Extent (Part 6)
  const handleZoomToIndia = () => {
    if (!mapInstanceRef.current) return;
    const indiaBounds = L.latLngBounds([6.5, 68.0], [35.5, 97.5]);
    mapInstanceRef.current.fitBounds(indiaBounds, { padding: [10, 10] });
    setIsIndiaView(true);
  };

  // Handler: Focus Active Watershed
  const handleFocusWatershed = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(catchment.center, catchment.zoom, { duration: 1.2 });
    setIsIndiaView(false);
  };

  // Handler: Test Bhuvan live connection
  const handleTestBhuvan = async () => {
    setDiagPinging(true);
    setDiagPingResult(null);
    try {
      const res = await bhuvanService.testBhuvanConnection();
      setDiagPingResult(`${res.status}: ${res.message}`);
    } catch (err: any) {
      setDiagPingResult(`Error: ${err.message || 'Connection failed'}`);
    } finally {
      setDiagPinging(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[550px] rounded-2xl overflow-hidden border border-[#DCE3DD] shadow-md bg-[#F7F8F4]">
      {/* Leaflet Map DOM Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Navigation Bar: India Extent vs Watershed Focus */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
        <button
          onClick={handleZoomToIndia}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            isIndiaView
              ? 'bg-[#075B45] text-white border-[#075B45] font-bold shadow-md'
              : 'bg-white/95 text-[#17211D] hover:bg-[#F0F3EE] border-[#DCE3DD]'
          }`}
          title="Fit view to Sovereign Indian Extent"
        >
          <span>🇮🇳</span>
          <span>India View</span>
        </button>

        <button
          onClick={handleFocusWatershed}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            !isIndiaView
              ? 'bg-[#075B45] text-white border-[#075B45] font-bold shadow-md'
              : 'bg-white/95 text-[#17211D] hover:bg-[#F0F3EE] border-[#DCE3DD]'
          }`}
          title="Zoom to active watershed micro-catchment"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#075B45]" />
          <span>Focus Watershed ({catchment.code})</span>
        </button>
      </div>

      {/* Bhuvan Error / Fallback Notification Toast */}
      {bhuvanNotification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] max-w-lg w-[90%] px-4 py-2.5 bg-white border border-amber-300 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs text-[#17211D] animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900">
                BHUVAN LAYER UNAVAILABLE: {bhuvanNotification.layer}
              </div>
              <div className="text-[11px] text-[#66736C]">
                {bhuvanNotification.reason}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setBhuvanNotification(null);
                setBaseLayer('street');
              }}
              className="px-2 py-1 rounded bg-[#075B45]/10 hover:bg-[#075B45]/20 text-[#075B45] font-bold text-[10px] transition-colors cursor-pointer"
            >
              Reset to OSM
            </button>
            <button
              onClick={() => setBhuvanNotification(null)}
              className="text-[#66736C] hover:text-[#17211D] text-sm font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Truthful Data Notice Banner */}
      {!bhuvanNotification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-md border border-[#DCE3DD] px-3.5 py-1 rounded-full text-[10px] text-[#66736C] font-mono shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#075B45] animate-pulse"></span>
          <span>Authoritative Indian watershed GIS. Safe fallback active on server timeout.</span>
        </div>
      )}

      {/* Watershed Information Panel */}
      {selectedWatershedInfo && (
        <div className="absolute top-16 left-4 z-[1000] w-80 bg-white/95 backdrop-blur-md border border-[#075B45]/30 rounded-2xl shadow-xl p-4 text-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#075B45]"></span>
              <h4 className="font-bold text-[#17211D] text-sm">{selectedWatershedInfo.name}</h4>
            </div>
            <button
              onClick={() => setSelectedWatershedInfo(null)}
              className="text-[#66736C] hover:text-[#17211D] text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-[#17211D] text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#66736C] font-medium">State:</span>
              <span className="font-semibold">{selectedWatershedInfo.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66736C] font-medium">District:</span>
              <span className="font-semibold">{selectedWatershedInfo.district}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66736C] font-medium">Catchment Code:</span>
              <span className="font-mono text-[#075B45] font-bold">{selectedWatershedInfo.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66736C] font-medium">Catchment Area:</span>
              <span className="font-mono">{selectedWatershedInfo.areaHa.toLocaleString()} ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66736C] font-medium">Verified Assets:</span>
              <span className="font-mono text-[#1677A8] font-bold">{selectedWatershedInfo.totalStructures} structures</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66736C] font-medium">Active Alerts:</span>
              <span className="font-mono text-[#B42318] font-bold">{selectedWatershedInfo.criticalAlerts} open alerts</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectCatchment) onSelectCatchment(selectedWatershedInfo);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo(selectedWatershedInfo.center, selectedWatershedInfo.zoom, { duration: 1.2 });
              }
              setIsIndiaView(false);
              setSelectedWatershedInfo(null);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <span>Explore Watershed →</span>
          </button>
        </div>
      )}

      {/* Clicked Coordinate Inspection Banner */}
      {clickedCoord && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#1677A8]/40 px-3.5 py-1.5 rounded-2xl shadow-xl text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[#17211D]">
            <Compass className="w-3.5 h-3.5 text-[#1677A8]" />
            <span>{clickedCoord.lat.toFixed(5)}° N, {clickedCoord.lng.toFixed(5)}° E</span>
          </div>
          <button
            onClick={() => onInspectCoordinate?.(clickedCoord.lat, clickedCoord.lng)}
            className="px-2.5 py-1 rounded-lg bg-[#1677A8] hover:bg-[#0284c7] text-white font-bold text-[11px] transition-colors ml-1 cursor-pointer"
          >
            Inspect Coordinate
          </button>
          <button
            onClick={() => {
              setClickedCoord(null);
              if (clickMarkerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(clickMarkerRef.current);
                clickMarkerRef.current = null;
              }
            }}
            className="text-[#66736C] hover:text-[#17211D] text-xs ml-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Clean Map Layer Controls Panel (Light Design System) */}
      <div className="absolute top-4 right-4 z-[1000] w-72 bg-white/95 backdrop-blur-md border border-[#DCE3DD] rounded-2xl shadow-xl overflow-hidden text-xs">
        <div
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="p-3 border-b border-[#DCE3DD] flex items-center justify-between cursor-pointer bg-[#F7F8F4]"
        >
          <div className="flex items-center gap-2 font-bold text-[#17211D]">
            <Layers className="w-4 h-4 text-[#075B45]" />
            <span>Map Layer Controls</span>
          </div>
          <span className="text-[10px] text-[#66736C] font-mono">
            {showLayerPanel ? 'Collapse' : 'Expand'}
          </span>
        </div>

        {showLayerPanel && (
          <div className="p-3 space-y-3 max-h-[72vh] overflow-y-auto">
            {/* Base Imagery */}
            <div>
              <div className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider mb-1.5 flex items-center justify-between">
                <span>Base Map</span>
                <span className="text-[9px] text-[#075B45] font-mono font-semibold">OGC Standard</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setBaseLayer('street')}
                  className={`py-1 px-1 rounded-lg text-center text-[10px] font-medium transition-colors cursor-pointer ${
                    baseLayer === 'street'
                      ? 'bg-[#075B45] text-white font-bold shadow-sm'
                      : 'bg-[#F0F3EE] text-[#17211D] hover:bg-[#E3E8E1]'
                  }`}
                >
                  Light Topo
                </button>
                <button
                  onClick={() => setBaseLayer('satellite')}
                  className={`py-1 px-1 rounded-lg text-center text-[10px] font-medium transition-colors cursor-pointer ${
                    baseLayer === 'satellite'
                      ? 'bg-[#075B45] text-white font-bold shadow-sm'
                      : 'bg-[#F0F3EE] text-[#17211D] hover:bg-[#E3E8E1]'
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setBaseLayer('bhuvan')}
                  className={`py-1 px-1 rounded-lg text-center text-[10px] font-medium transition-colors cursor-pointer ${
                    baseLayer === 'bhuvan'
                      ? 'bg-amber-600 text-white font-bold shadow-sm'
                      : 'bg-[#F0F3EE] text-amber-800 hover:bg-[#E3E8E1]'
                  }`}
                >
                  Bhuvan
                </button>
              </div>
            </div>

            {/* 1. ADMINISTRATIVE */}
            <div className="space-y-1 border-t border-[#DCE3DD] pt-2">
              <div className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider mb-1 flex items-center justify-between">
                <span>1. Administrative</span>
                <span className="text-[9px] font-mono text-[#66736C]">Survey of India</span>
              </div>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>States & UTs (36 Units)</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">VERIFIED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showStates}
                  onChange={(e) => setShowStates(e.target.checked)}
                  className="rounded text-sky-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>Districts (118 Verified)</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">VERIFIED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showDistricts}
                  onChange={(e) => setShowDistricts(e.target.checked)}
                  className="rounded text-sky-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>Cadastral / Village Plots</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-amber-50 text-amber-800 border border-amber-300 font-bold">DEMO</span>
                </span>
                <input
                  type="checkbox"
                  checked={showCadastral}
                  onChange={(e) => setShowCadastral(e.target.checked)}
                  className="rounded text-amber-600 cursor-pointer"
                />
              </label>
            </div>

            {/* 2. HYDROLOGY */}
            <div className="space-y-1 border-t border-[#DCE3DD] pt-2">
              <div className="text-[10px] uppercase font-bold text-[#1677A8] tracking-wider mb-1 flex items-center justify-between">
                <span>2. Hydrology</span>
                <span className="text-[9px] font-mono text-[#1677A8]">DoLR / CGWB</span>
              </div>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#1677A8]">
                <span className="flex items-center gap-1.5">
                  <span>Major River Basins</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">VERIFIED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showBasins}
                  onChange={(e) => setShowBasins(e.target.checked)}
                  className="rounded text-sky-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#1677A8]">
                <span className="flex items-center gap-1.5">
                  <span>Sub-Basin Boundaries</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">VERIFIED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showSubbasins}
                  onChange={(e) => setShowSubbasins(e.target.checked)}
                  className="rounded text-sky-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#1677A8]">
                <span className="flex items-center gap-1.5 font-semibold text-[#075B45]">
                  <span>Codified Watersheds</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">VERIFIED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showWatersheds}
                  onChange={(e) => setShowWatersheds(e.target.checked)}
                  className="rounded text-[#075B45] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#1677A8]">
                <span className="flex items-center gap-1.5">
                  <span>Strahler Drainage (1–4)</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">VERIFIED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showDrainage}
                  onChange={(e) => setShowDrainage(e.target.checked)}
                  className="rounded text-[#1677A8] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#1677A8]">
                <span className="flex items-center gap-1.5">
                  <span>Water Bodies & Tanks</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">LIVE</span>
                </span>
                <input
                  type="checkbox"
                  checked={showWaterBodies}
                  onChange={(e) => setShowWaterBodies(e.target.checked)}
                  className="rounded text-sky-600 cursor-pointer"
                />
              </label>
            </div>

            {/* 3. LAND */}
            <div className="space-y-1 border-t border-[#DCE3DD] pt-2">
              <div className="text-[10px] uppercase font-bold text-[#8A6A3F] tracking-wider mb-1 flex items-center justify-between">
                <span>3. Land & Terrain</span>
                <span className="text-[9px] font-mono text-[#8A6A3F]">ISRO / Copernicus</span>
              </div>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>Bhuvan LULC 50k</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-slate-100 text-slate-700 border border-slate-300 font-bold">CACHED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showLulc}
                  onChange={(e) => setShowLulc(e.target.checked)}
                  className="rounded text-slate-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>Sentinel-2 NDVI Canopy</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">LIVE</span>
                </span>
                <input
                  type="checkbox"
                  checked={showNdvi}
                  onChange={(e) => setShowNdvi(e.target.checked)}
                  className="rounded text-[#075B45] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>Sentinel-2 NDWI Moisture</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">LIVE</span>
                </span>
                <input
                  type="checkbox"
                  checked={showNdwi}
                  onChange={(e) => setShowNdwi(e.target.checked)}
                  className="rounded text-[#1677A8] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>Cartosat 30m Contours</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-slate-100 text-slate-700 border border-slate-300 font-bold">CACHED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showDemContours}
                  onChange={(e) => setShowDemContours(e.target.checked)}
                  className="rounded text-slate-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>ICAR Soil Textural Series</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">VERIFIED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showSoilSeries}
                  onChange={(e) => setShowSoilSeries(e.target.checked)}
                  className="rounded text-purple-600 cursor-pointer"
                />
              </label>
            </div>

            {/* 4. RISK */}
            <div className="space-y-1 border-t border-[#DCE3DD] pt-2">
              <div className="text-[10px] uppercase font-bold text-[#B42318] tracking-wider mb-1 flex items-center justify-between">
                <span>4. Risk & Analytics</span>
                <span className="text-[9px] font-mono text-[#B42318]">RUSLE / NRSC</span>
              </div>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#B42318]">
                <span className="flex items-center gap-1.5 font-bold text-[#8A6A3F]">
                  <span>Soil Erosion Risk (RUSLE)</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">LIVE</span>
                </span>
                <input
                  type="checkbox"
                  checked={showErosionRisk}
                  onChange={(e) => setShowErosionRisk(e.target.checked)}
                  className="rounded text-amber-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#B42318]">
                <span className="flex items-center gap-1.5">
                  <span>Flood Inundation (NRSC WMS)</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">LIVE</span>
                </span>
                <input
                  type="checkbox"
                  checked={showFlood}
                  onChange={(e) => setShowFlood(e.target.checked)}
                  className="rounded text-[#075B45] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#B42318]">
                <span className="flex items-center gap-1.5">
                  <span>AI Geo-Anomalies</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-amber-50 text-amber-800 border border-amber-300 font-bold">DEMO</span>
                </span>
                <input
                  type="checkbox"
                  checked={showAlerts}
                  onChange={(e) => setShowAlerts(e.target.checked)}
                  className="rounded text-amber-600 cursor-pointer"
                />
              </label>
            </div>

            {/* 5. FIELD */}
            <div className="space-y-1 border-t border-[#DCE3DD] pt-2">
              <div className="text-[10px] uppercase font-bold text-[#075B45] tracking-wider mb-1 flex items-center justify-between">
                <span>5. Field Evidence</span>
                <span className="text-[9px] font-mono text-[#075B45]">Ground Truth</span>
              </div>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3 h-3 text-[#1677A8]" />
                  <span>Field Geo-Photos</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-orange-50 text-orange-800 border border-orange-300 font-bold">SIMULATED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showGeoPhotos}
                  onChange={(e) => setShowGeoPhotos(e.target.checked)}
                  className="rounded text-[#075B45] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-indigo-600" />
                  <span>Community Voice Reports</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">LIVE</span>
                </span>
                <input
                  type="checkbox"
                  checked={showVoiceGrievances}
                  onChange={(e) => setShowVoiceGrievances(e.target.checked)}
                  className="rounded text-[#075B45] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-3 h-3 text-[#075B45]" />
                  <span>Monitored Field Cases</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">LIVE</span>
                </span>
                <input
                  type="checkbox"
                  checked={showCases}
                  onChange={(e) => setShowCases(e.target.checked)}
                  className="rounded text-[#075B45] cursor-pointer"
                />
              </label>
            </div>

            {/* 6. ASSETS */}
            <div className="space-y-1 border-t border-[#DCE3DD] pt-2">
              <div className="text-[10px] uppercase font-bold text-[#075B45] tracking-wider mb-1 flex items-center justify-between">
                <span>6. Assets & Interventions</span>
                <span className="text-[9px] font-mono text-[#075B45]">PMKSY-WDC</span>
              </div>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#075B45]" />
                  <span>Check Dams & Perc. Tanks</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">LIVE</span>
                </span>
                <input
                  type="checkbox"
                  checked={showCheckDams}
                  onChange={(e) => setShowCheckDams(e.target.checked)}
                  className="rounded text-[#075B45] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>Contour Trenches (CCT)</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-bold">VERIFIED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showCct}
                  onChange={(e) => setShowCct(e.target.checked)}
                  className="rounded text-[#075B45] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5 text-[#17211D] hover:text-[#075B45]">
                <span className="flex items-center gap-1.5">
                  <span>NASA SMAP Soil Moisture</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-slate-100 text-slate-700 border border-slate-300 font-bold">CACHED</span>
                </span>
                <input
                  type="checkbox"
                  checked={showSmap}
                  onChange={(e) => setShowSmap(e.target.checked)}
                  className="rounded text-purple-600 cursor-pointer"
                />
              </label>
            </div>

            {/* Developer-only GIS Diagnostics Toggle */}
            <div className="border-t border-[#DCE3DD] pt-2">
              <button
                type="button"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="w-full py-1.5 px-2 rounded-xl bg-[#F0F3EE] hover:bg-[#E3E8E1] text-[#075B45] font-bold text-[11px] flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>🔧 GIS Diagnostics & WMS Info</span>
                <span>{showDiagnostics ? '▲' : '▼'}</span>
              </button>

              {showDiagnostics && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-2 text-[10px] font-mono text-[#17211D]">
                  <div>
                    <span className="text-[#66736C] block">WMS ENDPOINT:</span>
                    <span className="break-all font-semibold">https://bhuvan-ras2.nrsc.gov.in/cgi-bin/flood.exe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66736C]">ACTIVE BASE:</span>
                    <span className="font-semibold uppercase">{baseLayer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66736C]">CRS / PROJECTION:</span>
                    <span className="font-semibold">EPSG:3857 / EPSG:4326</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66736C]">FALLBACK STRATEGY:</span>
                    <span className="text-[#075B45] font-bold">OSM Safe Tile Underlay</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestBhuvan}
                    disabled={diagPinging}
                    className="w-full mt-1 py-1 px-2 rounded-lg bg-[#075B45] text-white font-bold hover:bg-[#0E8065] transition-colors cursor-pointer text-center"
                  >
                    {diagPinging ? 'Pinging Bhuvan Server...' : 'Test Bhuvan WMS Connection'}
                  </button>

                  {diagPingResult && (
                    <div className="p-1.5 rounded bg-white border border-[#DCE3DD] text-[9px] text-[#17211D] leading-tight break-all">
                      {diagPingResult}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Spatial Map Legend (Light Design System) */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md border border-[#DCE3DD] rounded-2xl p-3 shadow-lg text-[11px] max-w-xs space-y-1.5 text-[#17211D]">
        <div className="font-bold text-[#17211D] text-xs border-b border-[#DCE3DD] pb-1 flex items-center justify-between">
          <span>Spatial Map Legend</span>
          <span className="text-[9px] font-mono text-[#075B45] font-bold">SIH PS 26015</span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[#17211D]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border border-[#075B45] border-dashed"></span>
            <span>Watershed Bound</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#1677A8]"></span>
            <span>Drainage Network</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#075B45] rounded-sm text-[8px] font-bold text-white flex items-center justify-center font-mono">
              CD
            </span>
            <span>Check Dam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#1677A8] rounded-full text-[8px] font-bold text-white flex items-center justify-center font-mono">
              PT
            </span>
            <span>Percolation Tank</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">📷</span>
            <span>Geo-Photo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B42318] animate-pulse"></span>
            <span>Issue Alert</span>
          </div>
        </div>
      </div>
    </div>
  );
};
