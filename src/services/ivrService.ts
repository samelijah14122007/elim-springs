// IVR (Interactive Voice Response) Service Module
// Handles public-sector citizen voice reports, telephone audio simulation, and field report structuring
// Ready for future integration with national telecom voice gateways (e.g. CDAC / C-DoT / NIC IVR)

import {
  IvrVoiceReport,
  StructuredVoiceFieldReport,
  WatershedStructure,
  GeoCodedImage,
  VoiceReportProcessingStatus,
  VoiceUrgency,
  VoiceIssueCategory,
} from '../types';
import { mockIvrReports, mockStructures, mockGeoImages } from '../data/mockData';

export interface IIvrService {
  getVoiceReports(watershedId?: string): Promise<IvrVoiceReport[]>;
  getVoiceReport(id: string): Promise<IvrVoiceReport | undefined>;
  convertVoiceReportToFieldReport(report: IvrVoiceReport): StructuredVoiceFieldReport;
  filterReports(
    reports: IvrVoiceReport[],
    filters: {
      language?: string;
      urgency?: string;
      processingStatus?: string;
      searchQuery?: string;
    }
  ): IvrVoiceReport[];
  // AI Geo Agent telemetry & query methods
  queryHighUrgencyVoiceReports(watershedId?: string): IvrVoiceReport[];
  queryReportsWithFieldEvidence(watershedId?: string): {
    report: IvrVoiceReport;
    structure?: WatershedStructure;
    images: GeoCodedImage[];
  }[];
  queryReportsByIntent(watershedId: string, keyword: string): IvrVoiceReport[];
}

class IvrService implements IIvrService {
  private reports: IvrVoiceReport[] = mockIvrReports;

  async getVoiceReports(watershedId?: string): Promise<IvrVoiceReport[]> {
    if (!watershedId) return this.reports;
    return this.reports.filter((r) => r.watershedId === watershedId);
  }

  async getVoiceReport(id: string): Promise<IvrVoiceReport | undefined> {
    return this.reports.find((r) => r.id === id);
  }

  convertVoiceReportToFieldReport(report: IvrVoiceReport): StructuredVoiceFieldReport {
    // If the report already has a pre-structured report, return it
    if (report.structuredReport) return report.structuredReport;

    const urgency: VoiceUrgency = report.urgency || (report.aiExtractedEntities.severity === 'High' ? 'High' : 'Medium');
    const urgencyScore = report.aiExtractedEntities.urgencyScore || (urgency === 'Critical' ? 9 : urgency === 'High' ? 8 : 5);

    let issueCategory: VoiceIssueCategory = 'Other';
    const cat = report.aiExtractedEntities.issueCategory;
    if (cat.includes('Silt')) issueCategory = 'Silt accumulation';
    else if (cat.includes('Breach') || cat.includes('Crack')) issueCategory = 'Structure concern';
    else if (cat.includes('Water') || cat.includes('Retention')) issueCategory = 'Water retention';
    else if (cat.includes('Encroachment') || cat.includes('Theft') || cat.includes('Pump')) issueCategory = 'Encroachment concern';
    else if (cat.includes('Drainage') || cat.includes('Blockage')) issueCategory = 'Drainage blockage';
    else if (cat.includes('Vegetation')) issueCategory = 'Vegetation loss';

    return {
      reportId: report.id,
      reporterName: report.callerName,
      reporterPhone: report.callerPhone,
      reporterRole: report.callerRole || 'Citizen',
      language: report.sourceLanguage,
      languageName: report.sourceLanguageName,
      watershedId: report.watershedId,
      watershedName: report.watershedName || 'Watershed Area',
      village: report.callerVillage,
      lat: report.lat,
      lng: report.lng,
      associatedStructureId: report.associatedStructureId,
      associatedStructureName: report.aiExtractedEntities.structureMentioned,
      associatedImageId: report.associatedImageId,
      issueCategory,
      description: report.englishTranslation,
      urgency,
      urgencyScore,
      timestamp: report.callTimestamp,
      originalTranscript: report.originalTranscript,
      englishTranslation: report.englishTranslation,
      processingStatus: report.processingStatus || (report.status === 'Converted to Case' ? 'Converted to Case' : 'Structured'),
      evidenceNotes: `Reported by caller via 1800-ELIM-WATER. Bhashini confidence: ${(report.bhashiniConfidence * 100).toFixed(0)}%. Ground truth verification required before administrative sign-off.`,
    };
  }

  filterReports(
    reports: IvrVoiceReport[],
    filters: {
      language?: string;
      urgency?: string;
      processingStatus?: string;
      searchQuery?: string;
    }
  ): IvrVoiceReport[] {
    return reports.filter((report) => {
      // 1. Language filter
      if (filters.language && filters.language !== 'ALL' && report.sourceLanguage !== filters.language) {
        return false;
      }

      // 2. Urgency filter
      if (filters.urgency && filters.urgency !== 'ALL') {
        const reportUrgency = report.urgency || (report.aiExtractedEntities.severity === 'High' ? 'High' : 'Medium');
        if (reportUrgency !== filters.urgency) return false;
      }

      // 3. Processing status filter
      if (filters.processingStatus && filters.processingStatus !== 'ALL') {
        const status = report.processingStatus || report.status;
        if (status !== filters.processingStatus) return false;
      }

      // 4. Search query
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = report.callerName.toLowerCase().includes(query);
        const matchesVillage = report.callerVillage.toLowerCase().includes(query);
        const matchesPhone = report.callerPhone.includes(query);
        const matchesText = report.englishTranslation.toLowerCase().includes(query);
        const matchesIntent = (report.detectedIntent || '').toLowerCase().includes(query);
        const matchesStructure = (report.aiExtractedEntities.structureMentioned || '').toLowerCase().includes(query);
        if (!matchesName && !matchesVillage && !matchesPhone && !matchesText && !matchesIntent && !matchesStructure) {
          return false;
        }
      }

      return true;
    });
  }

  // AI Geo Agent queries
  queryHighUrgencyVoiceReports(watershedId?: string): IvrVoiceReport[] {
    const list = watershedId ? this.reports.filter((r) => r.watershedId === watershedId) : this.reports;
    return list.filter((r) => r.urgency === 'Critical' || r.urgency === 'High' || r.aiExtractedEntities.severity === 'High');
  }

  queryReportsWithFieldEvidence(watershedId?: string): {
    report: IvrVoiceReport;
    structure?: WatershedStructure;
    images: GeoCodedImage[];
  }[] {
    const list = watershedId ? this.reports.filter((r) => r.watershedId === watershedId) : this.reports;

    return list.map((report) => {
      const structure = mockStructures.find(
        (s) => s.id === report.associatedStructureId || s.name === report.aiExtractedEntities.structureMentioned
      );
      const images = mockGeoImages.filter(
        (img) =>
          img.id === report.associatedImageId ||
          (structure && img.structureId === structure.id) ||
          (report.lat && report.lng && Math.abs(img.gps.lat - report.lat) < 0.005 && Math.abs(img.gps.lng - report.lng) < 0.005)
      );

      return {
        report,
        structure,
        images,
      };
    });
  }

  queryReportsByIntent(watershedId: string, keyword: string): IvrVoiceReport[] {
    const list = this.reports.filter((r) => r.watershedId === watershedId);
    const kw = keyword.toLowerCase();
    return list.filter(
      (r) =>
        (r.detectedIntent || '').toLowerCase().includes(kw) ||
        r.englishTranslation.toLowerCase().includes(kw) ||
        r.aiExtractedEntities.issueCategory.toLowerCase().includes(kw)
    );
  }
}

export const ivrService = new IvrService();
