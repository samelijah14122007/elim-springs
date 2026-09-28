// ============================================================================
// SATELLITE & EARTH OBSERVATION SERVICE (SIH PS 26015)
// Architecture ready for Sentinel Hub, Google Earth Engine, and ISRO Bhuvan WMS
// Note: Operating in prototype mode with synthetic Sentinel-2 Level-2A BOA telemetry.
// ============================================================================

import {
  ChangeDetectionRecord,
  SatelliteObservationMetadata,
  SpectralIndexResult,
  LulcBreakdownRecord,
} from '../types';
import {
  mockSatelliteMetadata,
  mockSpectralIndexResults,
  mockLulcBreakdowns,
  mockChangeDetections,
} from '../data/mockData';

export interface RasterVisualizationResult {
  mode: 'trueColor' | 'falseColor' | 'ndvi' | 'ndwi';
  title: string;
  bandsUsed: string;
  description: string;
  paletteLegend: { label: string; color: string }[];
  previewUrl: string;
  isSimulated: boolean;
}

export interface AgentSatelliteTelemetry {
  watershed: string;
  watershedCode: string;
  observationDate: string;
  ndviMean: number;
  ndviChangePct: number;
  ndwiMean: number;
  surfaceWaterSpreadHa: number;
  anomalyLevel: 'High' | 'Medium' | 'Low';
  anomaliesDetectedCount: number;
  isSimulated: boolean;
}

export interface ISatelliteService {
  isExternalConnected(): boolean;
  getObservationMetadata(watershedId: string): Promise<SatelliteObservationMetadata>;
  getSpectralIndices(watershedId: string): Promise<SpectralIndexResult>;
  getLulcSummary(watershedId: string): Promise<LulcBreakdownRecord>;
  getChangeDetection(watershedId: string, yearA?: number, yearB?: number): Promise<ChangeDetectionRecord>;
  getRasterVisualization(
    watershedId: string,
    mode: 'trueColor' | 'falseColor' | 'ndvi' | 'ndwi'
  ): Promise<RasterVisualizationResult>;
  queryAgentSatelliteMetrics(watershedId: string): Promise<AgentSatelliteTelemetry>;
  getTileUrl(layer: 'rgb' | 'ndvi' | 'ndwi' | 'falseColor' | 'lulc'): string;
}

class MockSatelliteService implements ISatelliteService {
  isExternalConnected(): boolean {
    // Explicitly false for prototype - no fake live connection claimed
    return false;
  }

  async getObservationMetadata(watershedId: string): Promise<SatelliteObservationMetadata> {
    await new Promise((res) => setTimeout(res, 50));
    return (
      mockSatelliteMetadata[watershedId] ||
      mockSatelliteMetadata['ws-dharashiv-ter']
    );
  }

  async getSpectralIndices(watershedId: string): Promise<SpectralIndexResult> {
    await new Promise((res) => setTimeout(res, 60));
    return (
      mockSpectralIndexResults[watershedId] ||
      mockSpectralIndexResults['ws-dharashiv-ter']
    );
  }

  async getLulcSummary(watershedId: string): Promise<LulcBreakdownRecord> {
    await new Promise((res) => setTimeout(res, 50));
    return (
      mockLulcBreakdowns[watershedId] ||
      mockLulcBreakdowns['ws-dharashiv-ter']
    );
  }

  async getChangeDetection(
    watershedId: string,
    _yearA: number = 2023,
    _yearB: number = 2025
  ): Promise<ChangeDetectionRecord> {
    await new Promise((res) => setTimeout(res, 60));
    return (
      mockChangeDetections[watershedId] ||
      mockChangeDetections['ws-dharashiv-ter']
    );
  }

  async getRasterVisualization(
    watershedId: string,
    mode: 'trueColor' | 'falseColor' | 'ndvi' | 'ndwi'
  ): Promise<RasterVisualizationResult> {
    await new Promise((res) => setTimeout(res, 40));

    switch (mode) {
      case 'trueColor':
        return {
          mode: 'trueColor',
          title: 'True Color Natural Composite (RGB: B4, B3, B2)',
          bandsUsed: 'Band 4 (Red 665nm), Band 3 (Green 560nm), Band 2 (Blue 490nm)',
          description:
            'Natural human visual representation. Useful for baseline visual inspection, cloud masking, and settlement delineation.',
          paletteLegend: [
            { label: 'Deep Water', color: '#1e3a8a' },
            { label: 'Vegetation Canopy', color: '#15803d' },
            { label: 'Cultivated Soil', color: '#854d0e' },
            { label: 'Barren Basalt / Rock', color: '#475569' },
          ],
          previewUrl:
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          isSimulated: true,
        };

      case 'falseColor':
        return {
          mode: 'falseColor',
          title: 'Color Infrared (CIR) Vegetation Composite (NIR: B8, B4, B3)',
          bandsUsed: 'Band 8 (NIR 842nm), Band 4 (Red 665nm), Band 3 (Green 560nm)',
          description:
            'Chlorophyll cellular structure strongly reflects NIR. Healthy, vigorous crops appear bright crimson/red, bare soil appears cyan/grey, and clean waterbodies appear dark blue or black.',
          paletteLegend: [
            { label: 'Dense Healthy Crops (High NIR)', color: '#dc2626' },
            { label: 'Moderate Canopy / Scrub', color: '#f87171' },
            { label: 'Fallow / Bare Soil', color: '#94a3b8' },
            { label: 'Turbid / Silted Waterbody', color: '#0284c7' },
          ],
          previewUrl:
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
          isSimulated: true,
        };

      case 'ndvi':
        return {
          mode: 'ndvi',
          title: 'NDVI Continuous Spectral Raster Map (B8 - B4) / (B8 + B4)',
          bandsUsed: 'Sentinel-2 Band 8 (NIR 10m) & Band 4 (Red 10m)',
          description:
            'Normalized index highlighting vegetative biomass and chlorophyll vitality. Values range from -1.0 to +1.0.',
          paletteLegend: [
            { label: 'Very Low (< 0.10: Barren / Water)', color: '#ef4444' },
            { label: 'Low (0.10 - 0.25: Sparse Scrub)', color: '#f59e0b' },
            { label: 'Moderate (0.25 - 0.40: Rainfed Crops)', color: '#84cc16' },
            { label: 'Healthy (0.40 - 0.55: Irrigated Double Crop)', color: '#10b981' },
            { label: 'Very Healthy (> 0.55: Dense Canopy)', color: '#047857' },
          ],
          previewUrl:
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
          isSimulated: true,
        };

      case 'ndwi':
        return {
          mode: 'ndwi',
          title: 'NDWI Moisture & Surface Water Spread Map (B3 - B8) / (B3 + B8)',
          bandsUsed: 'Sentinel-2 Band 3 (Green 10m) & Band 8 (NIR 10m)',
          description:
            'Normalized index delineating open water surfaces and saturated soils. Positive values (> 0.0) indicate waterbodies and flooded fields.',
          paletteLegend: [
            { label: 'Deep Open Water (> 0.20)', color: '#0284c7' },
            { label: 'Shallow / Turbid Water (0.00 - 0.20)', color: '#06b6d4' },
            { label: 'High Moisture Saturated Soil (-0.15 - 0.00)', color: '#10b981' },
            { label: 'Dry Soil / Terrestrial (< -0.15)', color: '#64748b' },
          ],
          previewUrl:
            'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
          isSimulated: true,
        };
    }
  }

  // Structured query result prepared for the future AI Geo Agent tool calls
  async queryAgentSatelliteMetrics(watershedId: string): Promise<AgentSatelliteTelemetry> {
    const meta = await this.getObservationMetadata(watershedId);
    const indices = await this.getSpectralIndices(watershedId);
    const cd = await this.getChangeDetection(watershedId);

    return {
      watershed: meta.watershedName,
      watershedCode: meta.watershedCode,
      observationDate: meta.observationDate,
      ndviMean: indices.ndvi.mean,
      ndviChangePct: indices.ndvi.changePct,
      ndwiMean: indices.ndwi.mean,
      surfaceWaterSpreadHa: indices.ndwi.surfaceWaterAreaHa,
      anomalyLevel: indices.ndvi.anomalies.length > 1 ? 'High' : 'Medium',
      anomaliesDetectedCount: indices.ndvi.anomalies.length,
      isSimulated: true,
    };
  }

  getTileUrl(layer: 'rgb' | 'ndvi' | 'ndwi' | 'falseColor' | 'lulc'): string {
    switch (layer) {
      case 'rgb':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'ndvi':
      case 'ndwi':
      case 'falseColor':
      case 'lulc':
      default:
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
  }
}

export const satelliteService = new MockSatelliteService();
