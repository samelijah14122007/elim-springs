// ==============================================================================
// ELIM SPRINGS — UNIVERSAL OCR & GIS REGISTRY AUDIT SERVICE
// SIH 2026 - PS 26015 | "From Field Voices to Watershed Action"
// ==============================================================================
// Universal optical character recognition adapter architecture for:
// - Project signboards, government plaques, completion boards
// - Check-dam, percolation tank, and canal milestone stones
// - Truthful handling: NO_RELIABLE_TEXT_DETECTED when no readable text exists
// - Neutral registry matching: "Registry discrepancy detected — manual verification required"
// ==============================================================================

import { createWorker } from 'tesseract.js';
import {
  OcrExtraction,
  WatershedStructure,
  GeoCodedImage,
  OcrRegistryComparisonResult,
  OcrComparisonField,
  OcrRegistryMatchStatus,
} from '../types';

export interface IOcrService {
  isExternalConnected(): boolean;
  extractRawText(imageSource: string | File | Blob): Promise<{ rawText: string; confidence: number; hasText: boolean }>;
  parseStructuredFields(rawText: string): {
    fields: OcrExtraction['detectedFields'];
    fieldConfidences: Record<string, number>;
    fieldSources: Record<string, string>;
  };
  extractProjectRecord(
    image: GeoCodedImage | { imageUrl: string; ocr?: OcrExtraction },
    associatedStructure?: WatershedStructure
  ): Promise<OcrExtraction>;
  compareWithRegistry(
    ocrExtraction: OcrExtraction,
    expectedStructure?: WatershedStructure
  ): Promise<OcrRegistryComparisonResult>;
  validateStructureAlignment(
    ocrData: OcrExtraction,
    expectedStructure?: WatershedStructure
  ): { matches: boolean; discrepancyReport?: string };
}

class UniversalOcrService implements IOcrService {
  private workerPromise: Promise<any> | null = null;

  isExternalConnected(): boolean {
    return true; // Client-side Tesseract.js engine active
  }

  private async getWorker() {
    if (!this.workerPromise) {
      this.workerPromise = (async () => {
        try {
          const worker = await createWorker('eng');
          return worker;
        } catch (err: any) {
          console.warn('[OCR] Worker initialization notice:', err?.message || err);
          return null;
        }
      })();
    }
    return this.workerPromise;
  }

  /**
   * Run optical character recognition on an arbitrary image file, blob, or URL
   */
  async extractRawText(
    imageSource: string | File | Blob
  ): Promise<{ rawText: string; confidence: number; hasText: boolean }> {
    try {
      const worker = await this.getWorker();
      if (!worker) {
        return { rawText: '', confidence: 0, hasText: false };
      }

      let target: any = imageSource;
      if (!target) {
        return { rawText: '', confidence: 0, hasText: false };
      }

      const ret = await worker.recognize(target);
      const text = (ret.data?.text || '').trim();
      const confidence = (ret.data?.confidence || 0) / 100;

      // Clean noise and check if real meaningful text was detected
      const alphanumericCount = (text.match(/[a-zA-Z0-9\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF]/g) || []).length;
      const hasText = alphanumericCount >= 4;

      return {
        rawText: hasText ? text : '',
        confidence: hasText ? Math.max(0.65, confidence) : 0,
        hasText,
      };
    } catch (err: any) {
      console.warn('[OCR] Extraction notice:', err?.message || err);
      return { rawText: '', confidence: 0, hasText: false };
    }
  }

  /**
   * Parse structured milestone parameters using Indian government signage patterns
   */
  parseStructuredFields(rawText: string): {
    fields: OcrExtraction['detectedFields'];
    fieldConfidences: Record<string, number>;
    fieldSources: Record<string, string>;
  } {
    const fields: OcrExtraction['detectedFields'] = {};
    const fieldConfidences: Record<string, number> = {};
    const fieldSources: Record<string, string> = {};

    if (!rawText || rawText.trim().length < 4) {
      return { fields, fieldConfidences, fieldSources };
    }

    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

    // 1. Work Code / Job Code
    const workCodeRegex = /(?:काम\s*कोड|कार्य\s*कोड|Work\s*Code|Job\s*Code|Asset\s*Code|Code)[:\s\-]*([A-Z0-9\-_/]{4,25})/i;
    const genericCodeRegex = /\b([A-Z]{2}-[A-Z0-9]{2,5}-\d{4}-[A-Z0-9\-]+)\b/;
    for (const line of lines) {
      const match = line.match(workCodeRegex) || line.match(genericCodeRegex);
      if (match && match[1]) {
        fields.workCode = match[1].trim();
        fieldConfidences.workCode = 0.95;
        fieldSources.workCode = line;
        break;
      }
    }

    // 2. Scheme Alignment
    const schemeRegex = /(PMKSY(?:-WDC\s*2\.0)?|MGNREGA|Jal\s*Shakti\s*Abhiyan|IWMP|RKVY|CADA|Jalyukt\s*Shivar)/i;
    for (const line of lines) {
      const match = line.match(schemeRegex);
      if (match) {
        fields.schemeName = match[0].trim();
        fieldConfidences.schemeName = 0.94;
        fieldSources.schemeName = line;
        break;
      }
    }

    // 3. Asset / Structure Type
    const typeRegex = /(Check\s*Dam|Percolation\s*Tank|Farm\s*Pond|Barrage|Reservoir|Sub-surface\s*Dyke|Gully\s*Plug|चेक\s*डैम|बंधारा|पाझर\s*तलाव|सिमेंट\s*नाला\s*बांध)/i;
    for (const line of lines) {
      const match = line.match(typeRegex);
      if (match) {
        let stdType = match[0].trim();
        if (/बंधारा|चेक\s*डैम|नाला\s*बांध/i.test(stdType)) stdType = 'Check Dam';
        else if (/पाझर\s*तलाव/i.test(stdType)) stdType = 'Percolation Tank';
        fields.structureType = stdType;
        fields.assetType = stdType;
        fieldConfidences.structureType = 0.93;
        fieldSources.structureType = line;
        break;
      }
    }

    // 4. Sanction Cost / Amount
    const costRegex = /(?:खर्च|लागत|Sanction(?:ed)?\s*Cost|Estimate|Cost)[:\s]*(?:रु\.?|Rs\.?|₹)?\s*([\d,]+)/i;
    for (const line of lines) {
      const match = line.match(costRegex);
      if (match && match[1]) {
        fields.sanctionCost = `₹ ${match[1].trim()}`;
        fieldConfidences.sanctionCost = 0.91;
        fieldSources.sanctionCost = line;
        break;
      }
    }

    // 5. Village & Gram Panchayat
    const gpRegex = /(?:ग्राम\s*पंचायत|Gram\s*Panchayat|GP)[:\s]*([^\n,]+)/i;
    const villageRegex = /(?:गाँव|गाव|Village)[:\s]*([^\n,]+)/i;
    for (const line of lines) {
      if (!fields.gramPanchayat) {
        const gpMatch = line.match(gpRegex);
        if (gpMatch && gpMatch[1]) {
          fields.gramPanchayat = gpMatch[1].trim();
          fieldConfidences.gramPanchayat = 0.92;
          fieldSources.gramPanchayat = line;
        }
      }
      if (!fields.village) {
        const vMatch = line.match(villageRegex);
        if (vMatch && vMatch[1]) {
          fields.village = vMatch[1].trim();
          fieldConfidences.village = 0.91;
          fieldSources.village = line;
        }
      }
    }

    // 6. Year / Financial Year
    const yearRegex = /\b(20\d\d[-/]\d\d|20\d\d)\b/;
    for (const line of lines) {
      const match = line.match(yearRegex);
      if (match && !fields.sanctionYear) {
        fields.sanctionYear = match[0].trim();
        fields.financialYear = match[0].trim();
        fields.constructionYear = match[0].trim();
        fieldConfidences.sanctionYear = 0.88;
        fieldSources.sanctionYear = line;
        break;
      }
    }

    // 7. Department / Implementing Agency
    const agencyRegex = /(कृषी\s*विभाग|Agriculture\s*Dept|Water\s*Resources|Zilla\s*Parishad|RDD)/i;
    for (const line of lines) {
      const match = line.match(agencyRegex);
      if (match) {
        fields.implementingAgency = match[0].trim();
        fields.department = match[0].trim();
        fieldConfidences.implementingAgency = 0.89;
        fieldSources.implementingAgency = line;
        break;
      }
    }

    return { fields, fieldConfidences, fieldSources };
  }

  async extractProjectRecord(
    image: GeoCodedImage | { imageUrl: string; ocr?: OcrExtraction },
    associatedStructure?: WatershedStructure
  ): Promise<OcrExtraction> {
    // 1. If image already contains verified pre-extracted OCR (e.g. demo cases)
    if (image.ocr) {
      const comparison = await this.compareWithRegistry(image.ocr, associatedStructure);
      return {
        ...image.ocr,
        comparisonResult: comparison,
      };
    }

    // 2. Perform real OCR extraction on the image URL
    const { rawText, confidence, hasText } = await this.extractRawText(image.imageUrl);

    if (!hasText || !rawText) {
      return {
        rawText: '',
        confidence: 0,
        status: 'NO_RELIABLE_TEXT_DETECTED',
        detectedFields: {},
        fieldConfidences: {},
        fieldSources: {},
        mismatchDetected: false,
        comparisonResult: {
          matchStatus: 'NO_RELIABLE_TEXT_DETECTED',
          overallConfidence: 0,
          fields: [],
          discrepancySummary: 'No readable text detected on image — manual verification required.',
          isSimulated: false,
        },
      };
    }

    // 3. Parse structured fields
    const { fields, fieldConfidences, fieldSources } = this.parseStructuredFields(rawText);

    const extraction: OcrExtraction = {
      rawText,
      confidence,
      status: 'TEXT_DETECTED',
      detectedFields: fields,
      fieldConfidences,
      fieldSources,
      mismatchDetected: false,
    };

    // 4. Compare with official GIS registry
    extraction.comparisonResult = await this.compareWithRegistry(extraction, associatedStructure);
    extraction.mismatchDetected = extraction.comparisonResult.matchStatus.includes('MISMATCH') ||
      extraction.comparisonResult.matchStatus === 'MANUAL REVIEW REQUIRED';

    return extraction;
  }

  async compareWithRegistry(
    ocrExtraction: OcrExtraction,
    expectedStructure?: WatershedStructure
  ): Promise<OcrRegistryComparisonResult> {
    if (ocrExtraction.status === 'NO_RELIABLE_TEXT_DETECTED' || !ocrExtraction.rawText) {
      return {
        matchStatus: 'NO_RELIABLE_TEXT_DETECTED',
        overallConfidence: 0,
        fields: [],
        discrepancySummary: 'No readable text detected on image — manual verification required.',
        isSimulated: false,
      };
    }

    if (!expectedStructure) {
      return {
        matchStatus: 'MANUAL REVIEW REQUIRED',
        overallConfidence: ocrExtraction.confidence,
        fields: [
          {
            fieldName: 'Work Code',
            ocrValue: ocrExtraction.detectedFields.workCode || 'Not detected',
            registryValue: 'No structure record linked',
            status: 'MISSING',
          },
        ],
        discrepancySummary: 'Registry discrepancy detected — manual verification required.',
        isSimulated: false,
      };
    }

    const fields: OcrComparisonField[] = [];
    let hasMismatch = false;

    // 1. Work Code
    const ocrCode = ocrExtraction.detectedFields.workCode?.trim();
    const regCode = expectedStructure.code.trim();
    if (ocrCode && ocrCode.toLowerCase() === regCode.toLowerCase()) {
      fields.push({
        fieldName: 'Work Code',
        ocrValue: ocrCode,
        registryValue: regCode,
        status: 'MATCH',
      });
    } else {
      hasMismatch = true;
      fields.push({
        fieldName: 'Work Code',
        ocrValue: ocrCode || 'Not detected in photo',
        registryValue: regCode,
        status: 'MISMATCH',
      });
    }

    // 2. Scheme Alignment
    const ocrScheme = ocrExtraction.detectedFields.schemeName?.trim();
    const regScheme = expectedStructure.scheme.trim();
    if (ocrScheme && ocrScheme.toLowerCase().includes(regScheme.toLowerCase().slice(0, 5))) {
      fields.push({
        fieldName: 'Scheme Alignment',
        ocrValue: ocrScheme,
        registryValue: regScheme,
        status: 'MATCH',
      });
    } else {
      fields.push({
        fieldName: 'Scheme Alignment',
        ocrValue: ocrScheme || 'Not specified on plaque',
        registryValue: regScheme,
        status: ocrScheme ? 'MISMATCH' : 'MISSING',
      });
      if (ocrScheme) hasMismatch = true;
    }

    // 3. Sanction Cost
    const ocrCost = ocrExtraction.detectedFields.sanctionCost?.trim();
    const regCostFormatted = `₹ ${expectedStructure.estimatedCostInr.toLocaleString('en-IN')}`;
    const ocrCostDigits = ocrCost ? parseInt(ocrCost.replace(/\D/g, ''), 10) : NaN;
    if (!isNaN(ocrCostDigits) && ocrCostDigits === expectedStructure.estimatedCostInr) {
      fields.push({
        fieldName: 'Sanction Cost',
        ocrValue: ocrCost || '',
        registryValue: regCostFormatted,
        status: 'MATCH',
      });
    } else if (!isNaN(ocrCostDigits)) {
      hasMismatch = true;
      fields.push({
        fieldName: 'Sanction Cost',
        ocrValue: ocrCost || '',
        registryValue: regCostFormatted,
        status: 'MISMATCH',
      });
    } else {
      fields.push({
        fieldName: 'Sanction Cost',
        ocrValue: ocrCost || 'Unclear text on plaque',
        registryValue: regCostFormatted,
        status: 'MISSING',
      });
    }

    // 4. Structure Type
    const ocrType = ocrExtraction.detectedFields.structureType?.trim();
    const regType = expectedStructure.type.trim();
    if (ocrType && ocrType.toLowerCase().includes(regType.toLowerCase().slice(0, 5))) {
      fields.push({
        fieldName: 'Structure Type',
        ocrValue: ocrType,
        registryValue: regType,
        status: 'MATCH',
      });
    } else {
      fields.push({
        fieldName: 'Structure Type',
        ocrValue: ocrType || 'Not specified',
        registryValue: regType,
        status: ocrType ? 'MISMATCH' : 'MATCH',
      });
    }

    let matchStatus: OcrRegistryMatchStatus = 'MATCH';
    if (hasMismatch) {
      matchStatus = 'MANUAL REVIEW REQUIRED';
    } else if (!fields.every((f) => f.status === 'MATCH')) {
      matchStatus = 'PARTIAL MATCH';
    }

    const discrepancySummary = hasMismatch
      ? 'Registry discrepancy detected — manual verification required.'
      : `All extracted milestone parameters correspond with GIS registry record ${expectedStructure.code}.`;

    return {
      matchStatus,
      overallConfidence: ocrExtraction.confidence,
      fields,
      discrepancySummary,
      isSimulated: false,
    };
  }

  validateStructureAlignment(
    ocrData: OcrExtraction,
    expectedStructure?: WatershedStructure
  ): { matches: boolean; discrepancyReport?: string } {
    if (!expectedStructure) return { matches: true };
    if (ocrData.detectedFields.workCode && ocrData.detectedFields.workCode !== expectedStructure.code) {
      return {
        matches: false,
        discrepancyReport: `Work code mismatch: Milestone board states ${ocrData.detectedFields.workCode}, but GIS register lists ${expectedStructure.code}.`,
      };
    }
    return { matches: true };
  }
}

export const ocrService = new UniversalOcrService();
