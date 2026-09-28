/**
 * ELIM SPRINGS — Python Geo-AI Service client.
 *
 * Communicates with the FastAPI Python backend at VITE_PYTHON_API_URL (default: http://localhost:8000).
 * The TypeScript frontend remains the primary data layer (Supabase, Bhuvan, Bhashini).
 * This service sends numerical band arrays for Python-side geospatial computation.
 *
 * All other modules (supabaseService, bhuvanService, bhashiniService, etc.) are UNCHANGED.
 */

const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL ?? 'http://localhost:8000';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface BandStatistics {
  min: number;
  max: number;
  mean: number;
  std: number;
}

export interface NDVIResult {
  ndvi: number[][];
  statistics: BandStatistics;
  pixel_count: number;
  valid_pixel_count: number;
  interpretation: string;
}

export interface NDWIResult {
  ndwi: number[][];
  statistics: BandStatistics;
  pixel_count: number;
  valid_pixel_count: number;
  water_pixel_count: number;
  water_coverage_pct: number;
  interpretation: string;
}

export interface ChangeDetectionResult {
  difference: number[][];
  statistics: BandStatistics;
  total_pixels: number;
  changed_pixels: number;
  unchanged_pixels: number;
  changed_area_pct: number;
  mean_change: number;
  direction: 'increase' | 'decrease' | 'mixed' | 'stable';
  interpretation: string;
}

export interface SatelliteObservation {
  ndvi_value?: number;
  ndwi_value?: number;
  lulc_class?: string;
  observation_date?: string;
  source?: string;
}

export interface EvidenceAnalysisRequest {
  latitude: number;
  longitude: number;
  asset_type: string;
  issue_category: string;
  ocr_text?: string;
  field_observations?: string[];
  satellite_observations?: SatelliteObservation;
  reporter_role?: string;
}

export interface EvidenceAnalysisResult {
  priority_score: number;
  priority_label: 'Critical' | 'High' | 'Medium' | 'Low';
  recommended_action: string;
  analysis_notes: string[];
  geo_context: Record<string, unknown>;
  data_sources_used: string[];
  disclaimer: string;
}

export interface PythonServiceHealth {
  status: string;
  service: string;
  version: string;
  python_backend: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${PYTHON_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`[Python Geo-AI] ${path} failed (${res.status}): ${detail}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export const pythonGeoService = {
  /**
   * Check if the Python Geo-AI backend is reachable.
   * Returns null if the service is offline (does not throw).
   */
  async checkHealth(): Promise<PythonServiceHealth | null> {
    try {
      const res = await fetch(`${PYTHON_API_URL}/health`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      return res.json() as Promise<PythonServiceHealth>;
    } catch {
      return null;
    }
  },

  /**
   * Calculate NDVI from Red and NIR band 2-D arrays.
   * NDVI = (NIR − RED) / (NIR + RED)
   */
  async calculateNDVI(red: number[][], nir: number[][]): Promise<NDVIResult> {
    return post<NDVIResult>('/api/ndvi', { red, nir });
  },

  /**
   * Calculate NDWI from Green and NIR band 2-D arrays.
   * NDWI = (GREEN − NIR) / (GREEN + NIR)  [McFeeters 1996]
   */
  async calculateNDWI(green: number[][], nir: number[][]): Promise<NDWIResult> {
    return post<NDWIResult>('/api/ndwi', { green, nir });
  },

  /**
   * Detect change between two raster states (T1 → T2).
   * Supply NDVI, NDWI, or raw band arrays at two dates.
   */
  async detectChange(
    t1: number[][],
    t2: number[][],
    threshold: number = 0.05
  ): Promise<ChangeDetectionResult> {
    return post<ChangeDetectionResult>('/api/change-detection', { t1, t2, threshold });
  },

  /**
   * Analyse structured field evidence and return a priority assessment.
   * Only analyses data you supply — does NOT fabricate satellite observations.
   */
  async analyseEvidence(request: EvidenceAnalysisRequest): Promise<EvidenceAnalysisResult> {
    return post<EvidenceAnalysisResult>('/api/evidence-analysis', request);
  },
};
