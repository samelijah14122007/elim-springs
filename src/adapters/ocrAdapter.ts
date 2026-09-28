// ==============================================================================
// ELIM SPRINGS — OCR & SIGNBOARD AUDIT ADAPTER
// SIH 2026 PS 26015 | Architecture Encapsulation Layer
// ==============================================================================
// Decouples UI components from Tesseract.js optical character recognition engine.
// Handles government plaque parsing, structure code extraction, and registry reconciliation.
// ==============================================================================

import { ocrService } from '../services/ocrService';
import {
  OcrExtraction,
  WatershedStructure,
  GeoCodedImage,
  OcrRegistryComparisonResult,
} from '../types';

export class OcrAdapter {
  private static instance: OcrAdapter;

  private constructor() {}

  public static getInstance(): OcrAdapter {
    if (!OcrAdapter.instance) {
      OcrAdapter.instance = new OcrAdapter();
    }
    return OcrAdapter.instance;
  }

  /**
   * Extract raw text from image using client-side Tesseract.js OCR
   */
  async extractRawText(imageSource: string | File | Blob): Promise<{ rawText: string; confidence: number; hasText: boolean }> {
    return ocrService.extractRawText(imageSource);
  }

  /**
   * Parse structured signboard fields (Scheme, Year, Sanction Cost, Implementing Agency)
   */
  async extractProjectRecord(
    image: GeoCodedImage | { imageUrl: string; ocr?: OcrExtraction },
    associatedStructure?: WatershedStructure
  ): Promise<OcrExtraction> {
    return ocrService.extractProjectRecord(image, associatedStructure);
  }

  /**
   * Compare extracted plaque data against authoritative DPR / GIS registry records
   */
  async compareWithRegistry(
    ocrExtraction: OcrExtraction,
    expectedStructure?: WatershedStructure
  ): Promise<OcrRegistryComparisonResult> {
    return ocrService.compareWithRegistry(ocrExtraction, expectedStructure);
  }

  /**
   * Check status badge for OCR engine
   */
  getStatusLabel(): { engine: string; mode: string } {
    return {
      engine: 'Tesseract.js WASM',
      mode: 'ON-DEVICE / PRIVACY-SAFE',
    };
  }
}

export const ocrAdapter = OcrAdapter.getInstance();
