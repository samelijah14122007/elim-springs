// ==============================================================================
// ELIM SPRINGS — SUPABASE DATA FOUNDATION ADAPTER
// SIH 2026 PS 26015 | Architecture Encapsulation Layer
// ==============================================================================
// Decouples UI components from Supabase PostgreSQL, Storage, and Realtime services.
// Provides resilient data access with automatic local fallback when offline or in demo mode.
// ==============================================================================

import { supabaseService, getSupabaseConfig, SupabaseConfig } from '../services/supabaseService';
import {
  WatershedCase,
  IvrVoiceReport,
  EvidenceAuditEntry,
} from '../types';

export class SupabaseAdapter {
  private static instance: SupabaseAdapter;

  private constructor() {}

  public static getInstance(): SupabaseAdapter {
    if (!SupabaseAdapter.instance) {
      SupabaseAdapter.instance = new SupabaseAdapter();
    }
    return SupabaseAdapter.instance;
  }

  /**
   * Retrieves configuration state (configured vs prototype fallback)
   */
  getConfig(): SupabaseConfig {
    return getSupabaseConfig();
  }

  /**
   * Check connection status to Supabase PostgreSQL
   */
  async checkConnection(): Promise<{
    success: boolean;
    mode: 'LIVE' | 'FALLBACK';
    message: string;
    tableCount: number;
    tablesVerified: string[];
    tablesMissing: string[];
  }> {
    return supabaseService.testConnection();
  }

  /**
   * Whether live database connection is operational
   */
  isLive(): boolean {
    return supabaseService.isLive();
  }

  /**
   * Watershed Assets / Structures
   */
  async getAssets(filter?: { watershedId?: string; microWatershedId?: string; assetType?: string }) {
    const res = await supabaseService.getAssets(filter);
    return res.data || [];
  }

  /**
   * Evidence Records
   */
  async getEvidence(filter?: { assetId?: string; watershedId?: string; evidenceType?: string }) {
    const res = await supabaseService.getEvidence(filter);
    return res.data || [];
  }

  /**
   * Save Geo Photo Evidence
   */
  async uploadGeoPhotoEvidence(params: {
    file: File | Blob;
    filename?: string;
    caption: string;
    reporterName: string;
    reporterRole?: string;
    village?: string;
    watershedId: string;
    assetId?: string;
    lat?: number;
    lng?: number;
    ocrResult?: any;
    tags?: string[];
  }) {
    return supabaseService.uploadGeoPhotoEvidence(params);
  }

  /**
   * Voice Grievance Reports
   */
  async saveVoiceReport(report: Record<string, any>) {
    return supabaseService.createVoiceReport(report);
  }

  /**
   * Cases & Verification Chain
   */
  async getCases(filter?: { watershedId?: string; status?: string; priority?: string }): Promise<WatershedCase[]> {
    const res = await supabaseService.getCases(filter);
    return (res.data || []) as WatershedCase[];
  }

  async saveCase(caseData: Record<string, any>) {
    return supabaseService.createCase(caseData);
  }

  async updateCaseStatus(caseId: string, status: string) {
    return supabaseService.updateCaseStatus(caseId, status);
  }

  /**
   * Status badge for UI
   */
  getStatusBadge(): { label: string; isLive: boolean; color: string } {
    const live = supabaseService.isLive();
    return {
      label: live ? 'LIVE SUPABASE PG' : 'LOCAL PROTOTYPE DB',
      isLive: live,
      color: live
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }
}

export const supabaseAdapter = SupabaseAdapter.getInstance();
