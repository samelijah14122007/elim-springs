// Watershed GIS Service Module
// Architecture ready for ISRO Bhuvan WMS/WMTS, SRISHTI-DRISHTI, and GeoJSON endpoints
// Notice: Currently operating in local prototype mode with synthetic Indian watershed geometry.

import {
  WatershedCatchment,
  WatershedStructure,
  GeoCodedImage,
  DrainageStream,
  GisAlert,
  WatershedSpatialSummary,
  LocationInspectionResult,
  StructureType,
  StructureHealthStatus,
} from '../types';
import {
  mockCatchments,
  mockStructures,
  mockGeoImages,
  mockStreams,
  mockAlerts,
  mockSpatialSummaries,
} from '../data/mockData';

import { bhuvanService } from './bhuvanService';
import { nationalGeoService } from './nationalGeoService';

export function toDms(val: number, isLat: boolean): string {
  const abs = Math.abs(val);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(1);
  const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
  return `${deg}°${min}'${sec}"${dir}`;
}

export interface GisTileLayerInfo {
  id: string;
  name: string;
  type: 'base' | 'wms' | 'vector' | 'geojson';
  url: string;
  attribution: string;
  isExternalConnected: boolean;
}

export interface IGisService {
  isExternalConnected(): boolean;
  getWatersheds(): Promise<WatershedCatchment[]>;
  getWatershedById(id: string): Promise<WatershedCatchment | undefined>;
  getDrainageStreams(watershedId: string, orders?: number[]): Promise<DrainageStream[]>;
  getAssets(
    watershedId: string,
    filter?: { type?: StructureType; status?: StructureHealthStatus }
  ): Promise<WatershedStructure[]>;
  getGeoPhotos(watershedId: string): Promise<GeoCodedImage[]>;
  getAlerts(watershedId: string): Promise<GisAlert[]>;
  getSpatialSummary(watershedId: string): Promise<WatershedSpatialSummary>;
  inspectLocation(lat: number, lng: number, watershedId: string): Promise<LocationInspectionResult>;
  getAvailableTileLayers(): GisTileLayerInfo[];
}

// Distance helper in meters between two lat/lng points (Haversine)
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

class MockGisService implements IGisService {
  isExternalConnected(): boolean {
    return bhuvanService.isBhuvanConfigured();
  }

  async getWatersheds(): Promise<WatershedCatchment[]> {
    await new Promise((res) => setTimeout(res, 50));
    return mockCatchments;
  }

  async getWatershedById(id: string): Promise<WatershedCatchment | undefined> {
    await new Promise((res) => setTimeout(res, 50));
    return mockCatchments.find((w) => w.id === id);
  }

  async getDrainageStreams(watershedId: string, orders?: number[]): Promise<DrainageStream[]> {
    await new Promise((res) => setTimeout(res, 60));
    let streams = mockStreams.filter((s) => s.watershedId === watershedId);
    if (orders && orders.length > 0) {
      streams = streams.filter((s) => orders.includes(s.streamOrder));
    }
    return streams;
  }

  async getAssets(
    watershedId: string,
    filter?: { type?: StructureType; status?: StructureHealthStatus }
  ): Promise<WatershedStructure[]> {
    await new Promise((res) => setTimeout(res, 60));
    let items = mockStructures.filter((s) => s.watershedId === watershedId);
    if (filter?.type) {
      items = items.filter((s) => s.type === filter.type);
    }
    if (filter?.status) {
      items = items.filter((s) => s.health === filter.status);
    }
    return items;
  }

  async getGeoPhotos(watershedId: string): Promise<GeoCodedImage[]> {
    await new Promise((res) => setTimeout(res, 50));
    return mockGeoImages.filter((img) => img.watershedId === watershedId);
  }

  async getAlerts(watershedId: string): Promise<GisAlert[]> {
    await new Promise((res) => setTimeout(res, 50));
    return mockAlerts.filter((a) => a.watershedId === watershedId);
  }

  async getSpatialSummary(watershedId: string): Promise<WatershedSpatialSummary> {
    await new Promise((res) => setTimeout(res, 50));
    const summary = mockSpatialSummaries[watershedId];
    if (summary) return summary;

    // Fallback computed summary
    const catchment = mockCatchments.find((w) => w.id === watershedId) || mockCatchments[0];
    const watershedAssets = mockStructures.filter((s) => s.watershedId === watershedId);
    const watershedPhotos = mockGeoImages.filter((p) => p.watershedId === watershedId);
    const watershedAlerts = mockAlerts.filter((a) => a.watershedId === watershedId);
    const watershedStreams = mockStreams.filter((s) => s.watershedId === watershedId);

    const totalDrainage = watershedStreams.reduce((acc, s) => acc + s.lengthKm, 0);

    return {
      watershedId,
      watershedCode: catchment.code,
      watershedName: catchment.name,
      catchmentAreaHa: catchment.areaHa,
      drainageLengthKm: Number(totalDrainage.toFixed(1)) || 18.6,
      checkDamsCount: watershedAssets.filter((a) => a.type === 'Check Dam').length,
      percolationTanksCount: watershedAssets.filter((a) => a.type === 'Percolation Tank').length,
      geoPhotosCount: watershedPhotos.length,
      openAlertsCount: watershedAlerts.length,
      openVerificationCasesCount: watershedAlerts.filter((a) => a.severity === 'Critical').length,
    };
  }

  async inspectLocation(lat: number, lng: number, watershedId: string): Promise<LocationInspectionResult> {
    await new Promise((res) => setTimeout(res, 80));
    const catchment = mockCatchments.find((w) => w.id === watershedId) || mockCatchments[0];

    // Spatial hierarchy resolution
    const spatial = nationalGeoService.resolveSpatialLocation(lat, lng);

    // Find assets within 1,200m
    const assetsWithDist = mockStructures
      .filter((s) => s.watershedId === watershedId)
      .map((s) => ({ asset: s, dist: calculateDistanceMeters(lat, lng, s.lat, s.lng) }))
      .sort((a, b) => a.dist - b.dist);

    const assetsWithin1200 = assetsWithDist.filter((item) => item.dist <= 1200).map((item) => item.asset);
    const closestAssetItem = assetsWithDist.length > 0 ? assetsWithDist[0] : null;

    // Find geo photos within 1,200m
    const photos = mockGeoImages
      .filter((p) => p.watershedId === watershedId)
      .filter((p) => calculateDistanceMeters(lat, lng, p.gps.lat, p.gps.lng) <= 1200);

    // Find alerts within 1,500m
    const alerts = mockAlerts
      .filter((a) => a.watershedId === watershedId)
      .filter((a) => calculateDistanceMeters(lat, lng, a.lat, a.lng) <= 1500);

    // Find closest stream line
    const watershedStreams = mockStreams.filter((s) => s.watershedId === watershedId);
    let closestOrder: number | undefined = undefined;
    let minStreamDist = Infinity;

    for (const stream of watershedStreams) {
      for (const pt of stream.coordinates) {
        const d = calculateDistanceMeters(lat, lng, pt[0], pt[1]);
        if (d < minStreamDist) {
          minStreamDist = d;
          closestOrder = stream.streamOrder;
        }
      }
    }

    const isInsideMonitored = spatial.location.isWithinMonitoredWatershed;

    return {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      watershedId,
      watershedName: isInsideMonitored ? catchment.name : 'Unmonitored Regional Extent',
      watershedCode: isInsideMonitored ? catchment.code : 'N/A',
      nearbyAssets: assetsWithin1200,
      nearbyPhotos: photos,
      nearbyAlerts: alerts,
      closestStreamOrder: minStreamDist < 800 ? closestOrder : undefined,
      distanceToNearestStreamM: minStreamDist < 5000 ? Math.round(minStreamDist) : undefined,

      // 1. LOCATION SECTION (Coordinates, Elevation, Admin)
      locationReport: {
        lat: Number(lat.toFixed(5)),
        lng: Number(lng.toFixed(5)),
        latDms: toDms(lat, true),
        lngDms: toDms(lng, false),
        elevationM: isInsideMonitored ? 618 : null,
        state: isInsideMonitored ? catchment.state : null,
        district: isInsideMonitored ? catchment.district : null,
        taluka: isInsideMonitored ? (catchment.district.includes('Dharashiv') ? 'Dharashiv Taluka' : 'Block Development Office') : null,
        village: isInsideMonitored ? (watershedId === 'ws-dharashiv-ter' ? 'Rui East' : 'Catchment Sector 2') : null,
        cadastralSurveyNo: isInsideMonitored ? 'Survey Gut No. 142/B' : null,
        isAvailable: isInsideMonitored,
        statusNote: isInsideMonitored
          ? `Verified coordinates within ${catchment.name} (${catchment.code})`
          : 'Data unavailable for this location. Coordinate lies outside currently digitized PMKSY watershed boundaries.',
      },

      // 2. HYDROLOGY SECTION (Basin, Sub-basin, Stream Order, Proximity, Drainage Density)
      hydrologyReport: {
        basinName: isInsideMonitored ? spatial.hydrology.basinName : null,
        subBasin: isInsideMonitored ? spatial.hydrology.subBasin : null,
        watershedName: isInsideMonitored ? catchment.name : null,
        watershedCode: isInsideMonitored ? catchment.code : null,
        streamOrder: isInsideMonitored ? (closestOrder || 3) : null,
        distanceToStreamM: isInsideMonitored && minStreamDist < 5000 ? Math.round(minStreamDist) : null,
        drainageDensityKmPerSqKm: isInsideMonitored ? 2.14 : null,
        upstreamCatchmentHa: isInsideMonitored ? 840 : null,
        isAvailable: isInsideMonitored,
        statusNote: isInsideMonitored
          ? `Drainage line Order ${closestOrder || 3} identified ~${Math.round(minStreamDist)}m away. Upstream catchment contributing area ~840 ha.`
          : 'Data unavailable for this location. No digitized drainage stream network on record.',
      },

      // 3. ASSET SECTION (Nearest structure, distance, type, health)
      assetReport: {
        nearestAsset: closestAssetItem && closestAssetItem.dist <= 2000 ? closestAssetItem.asset : null,
        distanceM: closestAssetItem && closestAssetItem.dist <= 2000 ? closestAssetItem.dist : null,
        totalNearbyCount: assetsWithin1200.length,
        isAvailable: Boolean(closestAssetItem && closestAssetItem.dist <= 2000),
        statusNote: closestAssetItem && closestAssetItem.dist <= 2000
          ? `${closestAssetItem.asset.name} (${closestAssetItem.asset.code}) located ${closestAssetItem.dist}m away. Current siltation: ${closestAssetItem.asset.currentSiltPct}%.`
          : 'No structures within 2 km radius. No civil or biological conservation assets registered.',
      },

      // 4. EVIDENCE SECTION (Field photos, voice reports, SHA-256 hash, erosion status)
      evidenceReport: {
        photos,
        voiceReportsCount: isInsideMonitored ? 2 : 0,
        satelliteAnomaly: alerts.length > 0 ? alerts[0].title : null,
        erosionRiskLevel: isInsideMonitored ? 'HIGH' : null,
        latestSha256: photos.length > 0 ? photos[0].evidenceHash : null,
        verificationStatus: photos.length > 0 ? photos[0].evidenceStatus || 'Pending Review' : null,
        isAvailable: photos.length > 0 || alerts.length > 0,
        statusNote: photos.length > 0
          ? `${photos.length} field ground truth photographs verified with SHA-256 integrity hash on record.`
          : 'No field evidence recorded for this location.',
      },
    };
  }

  getAvailableTileLayers(): GisTileLayerInfo[] {
    const bhuvanCfg = bhuvanService.getBhuvanConfig();
    return [
      {
        id: 'satellite-rgb',
        name: 'Satellite World Imagery',
        type: 'base',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Esri, Maxar, Earthstar Geographics',
        isExternalConnected: true,
      },
      {
        id: 'topo-carto',
        name: 'Topographic / Carto',
        type: 'base',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: 'CartoDB, OpenStreetMap contributors',
        isExternalConnected: true,
      },
      {
        id: 'bhuvan-wms',
        name: 'ISRO / NRSC Bhuvan WMS (Indian Geospatial)',
        type: 'wms',
        url: bhuvanCfg.wmsUrl,
        attribution: 'ISRO / NRSC Bhuvan OGC Services',
        isExternalConnected: bhuvanCfg.isConfigured,
      },
    ];
  }
}

export const gisService = new MockGisService();
