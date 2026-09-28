// ==============================================================================
// ELIM SPRINGS — BHUVAN ADAPTER
// SIH 2026 PS 26015 | Architecture Encapsulation Layer
// ==============================================================================
// Decouples UI components from ISRO / NRSC Bhuvan OGC WMS/WMTS endpoints.
// Implements transparent fallback, error resilience, and standardized metadata.
// ==============================================================================

import { bhuvanService } from '../services/bhuvanService';
import { BhuvanLayerMetadata, BhuvanConnectionResult, BhuvanConnectionStatus } from '../types';

export interface BhuvanTileRequest {
  layerName: string;
  bbox?: string;
  width?: number;
  height?: number;
  format?: string;
}

export class BhuvanAdapter {
  private static instance: BhuvanAdapter;

  private constructor() {}

  public static getInstance(): BhuvanAdapter {
    if (!BhuvanAdapter.instance) {
      BhuvanAdapter.instance = new BhuvanAdapter();
    }
    return BhuvanAdapter.instance;
  }

  /**
   * Tests connection to NRSC Bhuvan servers with health and CORS assessment
   */
  async checkHealth(): Promise<BhuvanConnectionResult> {
    return bhuvanService.testBhuvanConnection();
  }

  /**
   * Retrieves verified Bhuvan thematic layers for hydrology, LULC, and administration
   */
  getAvailableLayers(): BhuvanLayerMetadata[] {
    return bhuvanService.getAvailableLayers();
  }

  /**
   * Retrieves prioritized layers for watershed planning
   */
  getWatershedLayers(): BhuvanLayerMetadata[] {
    return bhuvanService.getRecommendedWatershedLayers();
  }

  /**
   * Generates a standards-compliant WMS tile request URL
   */
  getWmsUrl(layerName: string, options?: Record<string, unknown>): string {
    return bhuvanService.getWmsLayerUrl(layerName, options);
  }

  /**
   * Generates a WMTS tile request URL
   */
  getWmtsUrl(layerName: string, options?: Record<string, unknown>): string {
    return bhuvanService.getWmtsLayerUrl(layerName, options);
  }

  /**
   * Checks whether Bhuvan credentials/endpoint is set in environment
   */
  isConfigured(): boolean {
    return bhuvanService.isBhuvanConfigured();
  }

  /**
   * Returns current status badge representation
   */
  getStatusBadge(status: BhuvanConnectionStatus): { text: string; color: string } {
    switch (status) {
      case 'BHUVAN_CONNECTED':
        return { text: 'LIVE BHUVAN', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'BHUVAN_CORS_OR_NETWORK_BLOCKED':
        return { text: 'CORS RESTRICTED (LEAFLET DIRECT)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'BHUVAN_LAYER_DISCOVERY_FAILED':
        return { text: 'OFFLINE / CACHED', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { text: 'STANDALONE GIS', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  }
}

export const bhuvanAdapter = BhuvanAdapter.getInstance();
