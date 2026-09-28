// ==============================================================================
// ELIM SPRINGS — BHASHINI MULTILINGUAL PIPELINE ADAPTER
// SIH 2026 PS 26015 | Architecture Encapsulation Layer
// ==============================================================================
// Decouples UI components from MeitY Bhashini Dhruva ASR / NMT / TTS APIs.
// Handles multi-language Indian dialect translation, speech recognition, and intent extraction.
// ==============================================================================

import {
  bhashiniService,
  BhashiniTranslationResult,
  BhashiniAsrResult,
  BhashiniIntentResult,
  SUPPORTED_BHASHINI_LANGUAGES,
} from '../services/bhashiniService';
import {
  LanguageCode,
  BhashiniConnectionResult,
  BhashiniConnectionStatus,
} from '../types';

export class BhashiniAdapter {
  private static instance: BhashiniAdapter;

  private constructor() {}

  public static getInstance(): BhashiniAdapter {
    if (!BhashiniAdapter.instance) {
      BhashiniAdapter.instance = new BhashiniAdapter();
    }
    return BhashiniAdapter.instance;
  }

  /**
   * Health check and diagnostics for MeitY Bhashini endpoint
   */
  async checkHealth(): Promise<BhashiniConnectionResult> {
    return bhashiniService.testBhashiniConnection();
  }

  /**
   * Translates text between any of the supported Indian languages
   */
  async translateText(
    text: string,
    sourceLang: LanguageCode,
    targetLang: LanguageCode
  ): Promise<BhashiniTranslationResult> {
    return bhashiniService.translate(text, sourceLang, targetLang);
  }

  /**
   * Transcribes voice audio in Indian regional languages (Marathi, Kannada, Telugu, Hindi, etc.)
   */
  async transcribeAudio(
    audioFileUrlOrBlob: string,
    language: LanguageCode = 'mr'
  ): Promise<BhashiniAsrResult> {
    return bhashiniService.transcribeAudio(audioFileUrlOrBlob, language);
  }

  /**
   * Extracts watershed grievance intent, structure mention, and urgency
   */
  async extractIntent(
    transcript: string,
    translation = '',
    language: LanguageCode = 'mr'
  ): Promise<BhashiniIntentResult> {
    return bhashiniService.extractFieldIntent(transcript, translation, language);
  }

  /**
   * Returns list of officially supported Indian watershed languages
   */
  getSupportedLanguages() {
    return SUPPORTED_BHASHINI_LANGUAGES;
  }

  /**
   * Checks whether live credentials are configured
   */
  isConfigured(): boolean {
    return bhashiniService.isBhashiniConfigured();
  }

  /**
   * Format status badge with truthful indicators
   */
  getStatusBadge(status: BhashiniConnectionStatus): { text: string; color: string } {
    switch (status) {
      case 'BHASHINI_LIVE':
        return { text: 'LIVE BHASHINI', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'BHASHINI_AUTH_FAILED':
        return { text: 'OFFLINE / LOCAL NMT', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'BHASHINI_NETWORK_ERROR':
        return { text: 'GATEWAY TIMEOUT / LOCAL', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'BHASHINI_UNSUPPORTED_LANGUAGE':
        return { text: 'UNSUPPORTED DIALECT', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'BHASHINI_SIMULATED':
      default:
        return { text: 'LOCAL INDIC ENGINE', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  }
}

export const bhashiniAdapter = BhashiniAdapter.getInstance();
