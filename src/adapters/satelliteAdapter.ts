// ==============================================================================
// ELIM SPRINGS — SATELLITE & EARTH OBSERVATION ADAPTER
// SIH 2026 PS 26015 | Architecture Encapsulation Layer
// ==============================================================================
// Decouples UI components from Sentinel-2 MSI, Landsat-9, and NASA SMAP providers.
// Enforces honest labeling ("PROTOTYPE / DEMO EO OBSERVATION") and prevents false claims.
// ==============================================================================

import { satelliteService, RasterVisualizationResult, AgentSatelliteTelemetry } from '../services/satelliteService';
import { nasaService } from '../services/nasaService';
import {
  SatelliteObservationMetadata,
  SpectralIndexResult,
  LulcBreakdownRecord,
  ChangeDetectionRecord,
} from '../types';

export class SatelliteAdapter {
  private static instance: SatelliteAdapter;

  private constructor() {}

  public static getInstance(): SatelliteAdapter {
    if (!SatelliteAdapter.instance) {
      SatelliteAdapter.instance = new SatelliteAdapter();
    }
    return SatelliteAdapter.instance;
  }

  /**
   * Reports whether a live Copernicus / NASA satellite connection is active
   */
  isLiveConnection(): boolean {
    return satelliteService.isExternalConnected();
  }

  /**
   * Get metadata for Sentinel-2 MSI tile observation
   */
  async getObservationMetadata(watershedId: string): Promise<SatelliteObservationMetadata> {
    return satelliteService.getObservationMetadata(watershedId);
  }

  /**
   * Retrieve NDVI, NDWI, and NDBI spectral analysis
   */
  async getSpectralIndices(watershedId: string): Promise<SpectralIndexResult> {
    return satelliteService.getSpectralIndices(watershedId);
  }

  /**
   * Retrieve Land Use Land Cover (LULC) breakdown
   */
  async getLulcBreakdown(watershedId: string): Promise<LulcBreakdownRecord> {
    return satelliteService.getLulcSummary(watershedId);
  }

  /**
   * Compute multi-temporal change detection (e.g. 2024 vs 2026)
   */
  async getChangeDetection(
    watershedId: string,
    yearA = 2024,
    yearB = 2026
  ): Promise<ChangeDetectionRecord> {
    return satelliteService.getChangeDetection(watershedId, yearA, yearB);
  }

  /**
   * Get raster composite for false-color, NDVI, NDWI, or true-color
   */
  async getRasterVisualization(
    watershedId: string,
    mode: 'trueColor' | 'falseColor' | 'ndvi' | 'ndwi'
  ): Promise<RasterVisualizationResult> {
    return satelliteService.getRasterVisualization(watershedId, mode);
  }

  /**
   * Query NASA SMAP surface and root-zone soil moisture telemetry
   */
  async getNasaSmapData(lat: number, lon: number) {
    return nasaService.getTelemetrySummary(lat, lon);
  }

  /**
   * Standardized disclaimer badge for UI display
   */
  getStatusLabel(): { badge: string; isPrototype: boolean; note: string } {
    return {
      badge: 'PROTOTYPE / DEMO EO OBSERVATION',
      isPrototype: true,
      note: 'Surface-water extent derived from Sentinel-2 MSI 10m NDWI. Volumetric estimates require physical bathymetric surveys.',
    };
  }
}

export const satelliteAdapter = SatelliteAdapter.getInstance();
