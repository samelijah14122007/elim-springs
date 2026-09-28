// AI Geo Agent Service Module
// Autonomous GIS & Multimodal Reasoning Engine
// SIH 2026 • PS 26015: "From Field Voices to Watershed Action."
// Reasons across GIS layers, Sentinel-2 spectral indices, field photos, OCR signboards, IVR voice calls, and RAG guidelines

import {
  AgentChatMessage,
  AgentStructuredSections,
  AgentResponse,
  EvidenceBadgeType,
} from '../types';
import { satelliteService } from './satelliteService';

export interface ILlmGeoAgentService {
  sendMessage(
    conversation: AgentChatMessage[],
    userMessage: string,
    contextWatershedId?: string,
    presetFlowId?: 'flow-anomaly' | 'flow-voice' | 'flow-ocr' | 'flow-verification'
  ): Promise<AgentChatMessage>;

  executePresetFlow(
    flowId: 'flow-anomaly' | 'flow-voice' | 'flow-ocr' | 'flow-verification',
    watershedId?: string
  ): Promise<AgentChatMessage>;

  getAgentResponse(query: string, watershedId?: string): Promise<AgentResponse>;
  getEvidenceSummary(watershedId?: string): {
    activeAlerts: number;
    totalEvidenceCount: number;
    verifiedHashes: number;
    pendingVerificationCount: number;
  };
}

class MockLlmGeoAgentService implements ILlmGeoAgentService {
  async sendMessage(
    conversation: AgentChatMessage[],
    userMessage: string,
    contextWatershedId: string = 'ws-dharashiv-ter',
    presetFlowId?: 'flow-anomaly' | 'flow-voice' | 'flow-ocr' | 'flow-verification'
  ): Promise<AgentChatMessage> {
    await new Promise((res) => setTimeout(res, 450));

    if (presetFlowId) {
      return this.executePresetFlow(presetFlowId, contextWatershedId);
    }

    const lower = userMessage.toLowerCase();

    // 1. Rui East Check Dam #4 Polished Scenario & Anomaly Investigation
    if (
      lower.includes('why was rui') ||
      lower.includes('rui east') ||
      lower.includes('evidence is available around rui') ||
      lower.includes('flow a') ||
      (lower.includes('anomaly') && (lower.includes('dam') || lower.includes('silt') || lower.includes('rui')))
    ) {
      return this.generateRuiCheckDamPolishedResponse(contextWatershedId);
    }

    // 2. Citizen Voice & IVR Reports Query
    if (
      lower.includes('flow b') ||
      lower.includes('voice') ||
      lower.includes('ivr') ||
      lower.includes('citizen') ||
      lower.includes('bhashini') ||
      lower.includes('high-urgency citizen') ||
      lower.includes('farmer')
    ) {
      return this.generateFlowB_Voice();
    }

    // 3. OCR Signboard & Registry Discrepancy Query
    if (
      lower.includes('flow c') ||
      lower.includes('ocr') ||
      lower.includes('signboard') ||
      lower.includes('registry') ||
      lower.includes('discrepancy') ||
      lower.includes('milestone')
    ) {
      return this.generateFlowC_Ocr();
    }

    // 4. Pre-Monsoon Field Verification & Checklist Query
    if (
      lower.includes('flow d') ||
      lower.includes('what should a field engineer verify') ||
      lower.includes('field engineer verify') ||
      lower.includes('pre-monsoon') ||
      lower.includes('protocol') ||
      lower.includes('checklist') ||
      lower.includes('verification task')
    ) {
      return this.generateFlowD_Verification();
    }

    // 5. Where are potential vegetation anomalies?
    if (lower.includes('vegetation anomal') || lower.includes('where are potential')) {
      return this.generateVegetationAnomaliesResponse(contextWatershedId);
    }

    // 6. Which assets have voice reports and geo-photos?
    if (lower.includes('which assets have') || (lower.includes('voice') && lower.includes('photo'))) {
      return this.generateAssetsWithDualEvidenceResponse(contextWatershedId);
    }

    // 7. What guideline context is relevant to this issue?
    if (lower.includes('guideline context') || lower.includes('relevant to this issue')) {
      return this.generateGuidelineContextResponse(contextWatershedId);
    }

    // 8. What changed between the baseline and current observation?
    if (
      lower.includes('what changed') ||
      lower.includes('baseline and current') ||
      lower.includes('satellite') ||
      lower.includes('ndvi') ||
      lower.includes('ndwi')
    ) {
      return this.generateTemporalChangeResponse(contextWatershedId);
    }

    // Default Fallback: Full Watershed Status Reasoning
    return this.generateRuiCheckDamPolishedResponse(contextWatershedId);
  }

  async executePresetFlow(
    flowId: 'flow-anomaly' | 'flow-voice' | 'flow-ocr' | 'flow-verification',
    watershedId: string = 'ws-dharashiv-ter'
  ): Promise<AgentChatMessage> {
    switch (flowId) {
      case 'flow-anomaly':
        return this.generateRuiCheckDamPolishedResponse(watershedId);
      case 'flow-voice':
        return this.generateFlowB_Voice();
      case 'flow-ocr':
        return this.generateFlowC_Ocr();
      case 'flow-verification':
        return this.generateFlowD_Verification();
    }
  }

  // =========================================================================
  // SCENARIO 1: POLISHED DEMO SCENARIO FOR RUI EAST CHECK DAM #4
  // =========================================================================
  private generateRuiCheckDamPolishedResponse(watershedId: string): AgentChatMessage {
    const toolInvocations = [
      {
        toolName: 'QueryWatershedGIS',
        description: 'Queries cadastral location, stream order, slope gradient, and asset records',
        summary: 'Found asset: Rui East Check Dam #4 (MH-DHR-2024-CD-04) on 3rd-order stream',
        executionTimestamp: '2026-09-24T10:14:48+05:30',
        input: { asset: 'Rui East Check Dam #4', watershedId },
        output: {
          assetName: 'Rui East Check Dam #4',
          assetCode: 'MH-DHR-2024-CD-04',
          coordinates: { lat: 18.2372, lng: 75.9845 },
          streamOrder: 3,
          catchmentSlopePct: 2.9,
          designedCapacityCuM: 22000,
          upstreamInterventions: 2,
        },
        status: 'success' as const,
      },
      {
        toolName: 'FetchSatelliteIndices',
        description: 'Queries Sentinel-2 multispectral reflectance for NDVI & NDWI anomaly',
        summary: 'NDVI / NDWI observation available: Anomaly anom-dhr-01 detected (-79% moisture)',
        executionTimestamp: '2026-09-24T10:14:50+05:30',
        input: { lat: 18.2372, lng: 75.9845, sensor: 'Sentinel-2 MSI Level-2A' },
        output: {
          anomalyId: 'anom-dhr-01',
          ndwiPreMonsoon: 0.08,
          ndwiPostMonsoon: 0.38,
          moistureDropPct: -78.9,
          estimatedWaterLossCuM: 17160,
        },
        status: 'success' as const,
      },
      {
        toolName: 'FindGeoPhotos',
        description: 'Searches field photos with GPS coordinates and hardware tamper check',
        summary: '2 related geo-coded images found: img-rui-001 (weir basin) & img-rui-002 (milestone)',
        executionTimestamp: '2026-09-24T10:14:55+05:30',
        input: { structureId: 'struct-cd-04', requireTamperCheck: true },
        output: {
          count: 2,
          images: [
            {
              id: 'img-rui-001',
              caption: 'Upstream weir basin filled with dense sediment touching crest level',
              tamperCheck: 'PASSED',
            },
            {
              id: 'img-rui-002',
              caption: 'Milestone plaque on abutment wall',
              tamperCheck: 'PASSED',
            },
          ],
        },
        status: 'success' as const,
      },
      {
        toolName: 'FindVoiceReports',
        description: 'Queries Bhashini speech-to-text pipeline for inbound citizen grievances',
        summary: '1 citizen voice report found: ivr-call-1082 from farmer Dnyaneshwar Shinde',
        executionTimestamp: '2026-09-24T10:14:58+05:30',
        input: { village: 'Rui', structureMentioned: 'Check Dam #4' },
        output: {
          reportId: 'ivr-call-1082',
          caller: 'Dnyaneshwar Shinde (Farmer, Rui Village)',
          language: 'Marathi (मराठी)',
          bhashiniConfidence: 0.94,
          translationExcerpt: 'Pond basin dry due to silt; surrounding dug-wells dried up',
          urgencyScore: 8.4,
        },
        status: 'success' as const,
      },
      {
        toolName: 'RunOCRRegistryAudit',
        description: 'Extracts physical milestone text and cross-references against PMKSY registry',
        summary: 'Registry evidence available: Milestone plaque matches work code MH-DHR-2024-CD-04 (96%)',
        executionTimestamp: '2026-09-24T10:15:00+05:30',
        input: { imageId: 'img-rui-002', expectedCode: 'MH-DHR-2024-CD-04' },
        output: {
          extractedWorkCode: 'MH-DHR-2024-CD-04',
          extractedCost: '₹4,85,000',
          registryMatchPct: 96,
          mismatchDetected: false,
        },
        status: 'success' as const,
      },
      {
        toolName: 'ConsultRagGuidelines',
        description: 'Retrieves PMKSY-WDC 2.0 desiltation threshold and scheme rules',
        summary: 'Relevant prototype guidance found: PMKSY-WDC 2.0 Section 4.3 (desilting >40% norm)',
        executionTimestamp: '2026-09-24T10:15:01+05:30',
        input: { query: 'desiltation check dam threshold', scheme: 'PMKSY-WDC 2.0' },
        output: {
          documentTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 4.3: Drainage Line Treatment & Siltation Management',
          page: 42,
          clause: '4.3.2',
          mandatoryThresholdPct: 40,
        },
        status: 'success' as const,
      },
      {
        toolName: 'BuildEvidenceTrail',
        description: 'Assembles deterministic SHA-256 cryptographic audit chain',
        summary: 'Evidence chain assembled: 7 verifiable blocks linked from genesis to tip',
        executionTimestamp: '2026-09-24T10:15:02+05:30',
        input: { caseId: 'case-es-2026-0842', blocks: 7 },
        output: {
          chainStatus: 'VERIFIED',
          genesisHash: '00000000000000000000000000000000...',
          latestHash: '0x55d01248ba004128fef88e7a91b2c4d6f830a1c3',
        },
        status: 'success' as const,
      },
    ];

    const structuredSections: AgentStructuredSections = {
      whatSystemObserves: [
        'GIS context: Structure CD-04 (Rui East Check Dam #4) is located on a 3rd-order drainage line with an upstream catchment of 480 ha.',
        'Satellite observation: Sentinel-2 NDWI shows surface moisture depletion (-79% relative drop, +0.38 to +0.08), flagged as spatial anomaly anom-dhr-01.',
        'Field evidence: Geo-coded photo img-rui-001 (GPS 18.23724°N, 75.98451°E, tamper check passed) displays dense sediment fill touching weir crest level.',
      ],
      whatWasReported: [
        'Citizen voice report (ivr-call-1082) logged by farmer Dnyaneshwar Shinde via 1800-ELIM-WATER in Marathi, transcribed via Bhashini with 0.94 confidence, describing reduced water retention and dried dug-wells.',
        'OCR extraction on milestone photo (img-rui-002) confirmed physical work code MH-DHR-2024-CD-04 with 96% registry alignment.',
      ],
      relevantGuidance: [
        {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 4.3: Drainage Line Treatment & Siltation Management',
          page: 42,
          clause: '4.3.2',
          norm: 'Mandatory desiltation is stipulated when sediment deposition exceeds 40% of designed pondage basin capacity.',
        },
        {
          docTitle: 'MGNREGA Master Circular: Water Conservation Works',
          section: 'Para 8.4: Renovation of Traditional Water Bodies',
          page: 115,
          clause: '8.4.1',
          norm: 'Desiltation of water harvesting structures is eligible under MGNREGA Category A for drought-prone talukas.',
        },
      ],
      whatThisMayIndicate:
        'Available evidence indicates a potential condition of severe sediment accumulation (estimated 17,160 m³ storage loss) requiring field verification before administrative de-siltation fund release.',
      whatMustBeVerified: [
        'Confirm GPS coordinates on site (18.2372°N, 75.9845°E).',
        'Inspect weir structure, wing walls, and downstream apron for scour or hairline cracking.',
        'Measure sediment depth at 3 weir crest points using a calibrated sounding rod.',
        'Capture current geo-photo with hardware EXIF attestation.',
        'Compare with previous evidence photos (img-rui-001 & img-rui-002).',
        'Record engineer observations and obtain Sarpanch counter-signature.',
      ],
      confidenceCoverage: {
        score: 95,
        rating: 'High',
        sourcesCount: 5,
        totalSources: 5,
        sources: [
          'Watershed GIS Asset Registry',
          'Sentinel-2 MSI Spectral Data',
          'Geo-Coded Ground Photo (img-rui-001)',
          'Bhashini Citizen Voice Report (ivr-call-1082)',
          'PMKSY-WDC 2.0 Operational Guidelines',
        ],
      },
    };

    const structuredContractResponse: AgentResponse = {
      query: 'Why was Rui East Check Dam #4 flagged?',
      watershed: 'ws-dharashiv-ter (Upper Sina - Ter)',
      asset: 'Rui East Check Dam #4 (MH-DHR-2024-CD-04)',
      observations: structuredSections.whatSystemObserves,
      reportedEvidence: structuredSections.whatWasReported,
      guidelineContext: structuredSections.relevantGuidance.map(
        (g) => `${g.docTitle} - ${g.section} (Page ${g.page}): ${g.norm}`
      ),
      toolTrace: toolInvocations.map((t) => ({
        toolName: t.toolName,
        summary: t.summary || t.description,
        status: t.status,
        timestamp: t.executionTimestamp,
      })),
      synthesis:
        'Multiple prototype evidence sources are associated with Rui East Check Dam #4. Satellite observations indicate a potential spatial change, while a voice report describes reduced water retention and a geo-coded field image is available. Relevant prototype guideline context has also been retrieved. These sources should be treated as evidence inputs rather than independent confirmation. Field inspection is required before administrative action.',
      verificationSteps: structuredSections.whatMustBeVerified,
      evidenceCoverage: {
        sourcesCount: 5,
        totalSources: 5,
        score: 95,
      },
      verificationStatus: 'PENDING FIELD VERIFICATION',
    };

    const evidenceBadges: EvidenceBadgeType[] = [
      'SATELLITE OBSERVATION',
      'GIS RECORD',
      'GEO-CODED IMAGE',
      'OCR EXTRACTION',
      'VOICE REPORT',
      'GUIDELINE CONTEXT',
      'FIELD VERIFICATION',
    ];

    return {
      id: `msg-rui-${Date.now()}`,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flowId: 'flow-anomaly',
      text: `### EVIDENCE SYNTHESIS: Rui East Check Dam #4 (CD-04)
Multiple prototype evidence sources are associated with Rui East Check Dam #4. Satellite observations indicate a potential spatial change, while a voice report describes reduced water retention and a geo-coded field image is available. Relevant prototype guideline context has also been retrieved.

These sources should be treated as evidence inputs rather than independent confirmation. Field inspection is required before administrative action.`,
      evidenceBadges,
      structuredSections,
      structuredResponse: structuredContractResponse,
      toolInvocations,
      ragCitations: [
        {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 4.3: Drainage Line Treatment & Siltation Management',
          page: 42,
          clause: '4.3.2',
        },
        {
          docTitle: 'MGNREGA Master Circular: Water Conservation Works',
          section: 'Para 8.4: Renovation of Traditional Water Bodies',
          page: 115,
          clause: '8.4.1',
        },
      ],
      caseAction: {
        caseId: 'case-es-2026-0842',
        structureId: 'struct-cd-04',
        label: 'View Cryptographic Evidence Chain (7 Blocks)',
        type: 'evidence_chain',
      },
    };
  }

  // =========================================================================
  // SCENARIO 2: CITIZEN VOICE & IVR GRIEVANCE (FLOW B)
  // =========================================================================
  private generateFlowB_Voice(): AgentChatMessage {
    const toolInvocations = [
      {
        toolName: 'FindVoiceReports',
        description: 'Queries Bhashini speech-to-text pipeline and caller intent',
        summary: 'Inbound call found: ivr-call-1082 in Marathi with 0.94 transcription confidence',
        executionTimestamp: '2026-09-23T14:22:15+05:30',
        input: { village: 'Rui', channel: 'IVR Voice Call' },
        output: {
          reportId: 'ivr-call-1082',
          callerName: 'Dnyaneshwar Shinde (Farmer)',
          callerVillage: 'Rui, Dharashiv',
          sourceLanguage: 'Marathi (मराठी)',
          bhashiniConfidence: 0.94,
          transcriptMarathi: 'चेक डॅम क्रमांक ४ मध्ये गाळ साचल्यामुळे पाणी अडत नाही आणि विहिरी आटल्या आहेत.',
          translatedEnglish:
            'Water is not being retained in Check Dam #4 due to silt accumulation, and our agricultural wells have dried up.',
          severity: 'High',
          urgencyScore: 8.4,
        },
        status: 'success' as const,
      },
      {
        toolName: 'QueryWatershedGIS',
        description: 'Locates reported structure on 3rd-order stream and checks well depth',
        summary: 'Asset matched: Rui East Check Dam #4 (Stream Order 3, groundwater 18.2m BGL)',
        executionTimestamp: '2026-09-23T14:22:18+05:30',
        input: { structureCode: 'MH-DHR-2024-CD-04', village: 'Rui' },
        output: {
          structure: 'Rui East Check Dam #4',
          coordinates: { lat: 18.2372, lng: 75.9845 },
          groundwaterDepthM: 18.2,
          influencingDugWells: 14,
        },
        status: 'success' as const,
      },
      {
        toolName: 'FetchSatelliteIndices',
        description: 'Corroborates citizen voice grievance against Sentinel-2 NDWI',
        summary: 'Sentinel-2 NDWI drop confirmed: -78.9% moisture deficit post-monsoon',
        executionTimestamp: '2026-09-23T14:22:20+05:30',
        input: { lat: 18.2372, lng: 75.9845, sensor: 'Sentinel-2 MSI' },
        output: {
          surfaceMoistureDeficit: true,
          ndwiChangePct: -78.9,
          confirmedDrySpillway: true,
        },
        status: 'success' as const,
      },
      {
        toolName: 'ConsultRagGuidelines',
        description: 'Retrieves social audit and grievance inspection timeline norms',
        summary: 'PMKSY Section 6.1 retrieved: Mandatory physical inspection within 7 days',
        executionTimestamp: '2026-09-23T14:22:22+05:30',
        input: { query: 'citizen grievance inspection timeline watershed', topic: 'Social audit & verification' },
        output: {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 6.1: Social Audit & Community Grievance Protocol',
          page: 58,
          clause: '6.1.4',
          inspectionWindowDays: 7,
          actionRequired: 'Joint inspection by WDT Junior Engineer and Gram Rozgar Sevak',
        },
        status: 'success' as const,
      },
    ];

    const structuredSections: AgentStructuredSections = {
      whatSystemObserves: [
        'GIS record: Rui village aquifer exhibits moderate water table stress at 18.2 m below ground level (BGL).',
        'Satellite observation: Sentinel-2 NDWI demonstrates that water persistence terminated 40 days prematurely compared to historical average.',
      ],
      whatWasReported: [
        'Citizen voice call received on toll-free helpline 1800-ELIM-WATER from farmer Dnyaneshwar Shinde (Rui Village).',
        'Digital India Bhashini ASR + IndicTrans2 transcribed the Marathi voice recording with 0.94 confidence score.',
        'Complainant reports that check dam silt blockage has dried up 14 adjoining agricultural open dug-wells.',
      ],
      relevantGuidance: [
        {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 6.1: Social Audit & Community Grievance Protocol',
          page: 58,
          clause: '6.1.4',
          norm: 'Community grievances concerning functional water harvesting assets must be physically investigated within 7 working days.',
        },
        {
          docTitle: 'CGWB Manual on Artificial Recharge of Ground Water',
          section: 'Section 5.2: Desiltation & Maintenance of Percolation Tanks',
          page: 72,
          clause: '5.2.1',
          norm: 'Fine clay sedimentation coats the percolation boundary, requiring scraping of 15–30 cm silt crust to restore recharge rates.',
        },
      ],
      whatThisMayIndicate:
        'The citizen report correlates directly with remote sensing telemetry, indicating potential reservoir silt blinding that has reduced artificial percolation.',
      whatMustBeVerified: [
        'Verify static water level in 3 observation dug-wells within 500 meters of CD-04.',
        'Verify the date and work volume of previous desiltation recorded in Gram Panchayat MB register.',
        'Obtain signed statement from complainant farmer during joint field inspection.',
      ],
      confidenceCoverage: {
        score: 92,
        rating: 'High',
        sourcesCount: 4,
        totalSources: 4,
        sources: [
          'Bhashini IVR Gateway (Marathi ASR)',
          'Watershed GIS Hydrogeology',
          'Sentinel-2 NDWI Verification',
          'PMKSY Section 6.1 Grievance Norm',
        ],
      },
    };

    const evidenceBadges: EvidenceBadgeType[] = [
      'VOICE REPORT',
      'GIS RECORD',
      'SATELLITE OBSERVATION',
      'GUIDELINE CONTEXT',
    ];

    return {
      id: `msg-flow-b-${Date.now()}`,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flowId: 'flow-voice',
      text: `### Multimodal Analysis: Citizen IVR Voice Grievance (Rui Village)
Grassroots telephone grievance lodged by farmer Dnyaneshwar Shinde in Marathi has been transcribed via Bhashini and corroborated with Sentinel-2 moisture depletion.`,
      evidenceBadges,
      structuredSections,
      toolInvocations,
      ragCitations: [
        {
          docTitle: 'PMKSY-WDC 2.0 Operational Guidelines',
          section: 'Section 6.1: Social Audit & Community Grievance Protocol',
          page: 58,
          clause: '6.1.4',
        },
      ],
      caseAction: {
        caseId: 'case-es-2026-0842',
        structureId: 'struct-cd-04',
        label: 'View Citizen Evidence Chain Block',
        type: 'evidence_chain',
      },
    };
  }

  // =========================================================================
  // SCENARIO 3: OCR SIGNBOARD VS REGISTRY (FLOW C)
  // =========================================================================
  private generateFlowC_Ocr(): AgentChatMessage {
    const toolInvocations = [
      {
        toolName: 'FindGeoPhotos',
        description: 'Retrieves signboard photograph img-rui-002 with hardware tamper check',
        summary: 'Ground photo located: img-rui-002 with hardware tamper check passed',
        executionTimestamp: '2026-09-24T10:14:22+05:30',
        input: { imageId: 'img-rui-002', structureId: 'struct-cd-04' },
        output: {
          photoId: 'img-rui-002',
          caption: 'Milestone signboard plaque on left abutment of Rui Check Dam #4',
          gps: { lat: 18.23724, lng: 75.98451, accuracyM: 2.8 },
          tamperCheck: 'PASSED',
        },
        status: 'success' as const,
      },
      {
        toolName: 'RunOCRRegistryAudit',
        description: 'Extracts milestone text and cross-references against PMKSY registry',
        summary: 'OCR extraction performed: 96% match to work code MH-DHR-2024-CD-04',
        executionTimestamp: '2026-09-24T10:14:35+05:30',
        input: { imageId: 'img-rui-002', expectedStructure: 'MH-DHR-2024-CD-04' },
        output: {
          extractedWorkCode: 'MH-DHR-2024-CD-04',
          extractedCost: '₹4,85,000',
          extractedAgency: 'Zilla Parishad Dharashiv',
          registryCost: 485000,
          registryYear: '2024-25',
          signboardCompletionYear: '2023-24',
          mismatchDetected: true,
          mismatchField: 'sanctionYear vs completionYear',
          registryMatchPct: 96,
        },
        status: 'success' as const,
      },
      {
        toolName: 'ConsultRagGuidelines',
        description: 'Queries Ministry of Rural Development social audit milestone norms',
        summary: 'MoRD Standards retrieved: Section 3.2 Physical Milestone Plaque Compliance',
        executionTimestamp: '2026-09-24T10:14:40+05:30',
        input: { query: 'milestone signboard specifications social audit PMKSY', topic: 'Social audit & verification' },
        output: {
          docTitle: 'Ministry of Rural Development Social Audit Standards 2022',
          section: 'Section 3.2: Physical Milestone Plaque Compliance',
          page: 29,
          clause: '3.2.1',
          mandate:
            'All permanent water assets must display permanent stone/brass plaque with Work Code, Sanction Amount, and Geotag coordinates.',
        },
        status: 'success' as const,
      },
      {
        toolName: 'BuildEvidenceTrail',
        description: 'Records OCR extraction and registry cross-reference into cryptographic chain',
        summary: 'Evidence block sealed into audit trail with SHA-256 integrity hash',
        executionTimestamp: '2026-09-24T10:14:45+05:30',
        input: { eventType: 'OCR_EXTRACTION', caseId: 'case-es-2026-0842' },
        output: { blockStep: 4, hash: '0x8f2c3b8871ab93821033d4e8b01e459039a8c7e2', status: 'VERIFIED' },
        status: 'success' as const,
      },
    ];

    const structuredSections: AgentStructuredSections = {
      whatSystemObserves: [
        'GIS record: Structure MH-DHR-2024-CD-04 sanctioned under PMKSY 2024-25 budget allocation (₹4,85,000).',
        'Geospatial coordinates in administrative registry (18.2372°N, 75.9845°E) correspond with the photo EXIF geotag within 4.2 meters.',
      ],
      whatWasReported: [
        'Optical Character Recognition (OCR) applied to field photo img-rui-002 extracted work code MH-DHR-2024-CD-04 with 96% character confidence.',
        'Extracted sanction cost of ₹4,85,000 matches administrative registry records.',
        'Discrepancy noted: physical signboard reads completion year 2023-24 while registry logs 2024-25.',
      ],
      relevantGuidance: [
        {
          docTitle: 'Ministry of Rural Development Social Audit Standards 2022',
          section: 'Section 3.2: Physical Milestone Plaque Compliance',
          page: 29,
          clause: '3.2.1',
          norm: 'Discrepancies between physical signboards and financial sanction registries must be re-reconciled against Sub-Divisional Measurement Books (MB) before final DBT tranche release.',
        },
      ],
      whatThisMayIndicate:
        'Available evidence indicates high asset authenticity (96% registry alignment). The financial year discrepancy likely stems from financial year crossover billing rather than ghost asset duplication.',
      whatMustBeVerified: [
        'Inspect physical Measurement Book (MB) volume at Sub-Divisional Engineer office to cross-reference final bill sanction order.',
        'Take a high-contrast close-up photograph of the milestone date engraving.',
        'Confirm implementing agency contractor ledger entries with Gram Panchayat Sarpanch.',
      ],
      confidenceCoverage: {
        score: 91,
        rating: 'High',
        sourcesCount: 4,
        totalSources: 4,
        sources: [
          'Tesseract OCR Engine',
          'State PMKSY Administrative Database',
          'Field Camera EXIF Geotag',
          'MoRD Social Audit Standards',
        ],
      },
    };

    const evidenceBadges: EvidenceBadgeType[] = [
      'GEO-CODED IMAGE',
      'OCR EXTRACTION',
      'GIS RECORD',
      'GUIDELINE CONTEXT',
    ];

    return {
      id: `msg-flow-c-${Date.now()}`,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flowId: 'flow-ocr',
      text: `### Multimodal Analysis: Milestone Signboard OCR vs Scheme Registry Audit
OCR extraction from physical milestone plaque at Rui East Check Dam #4 has been audited against the administrative sanction registry. High asset authenticity confirmed with minor financial year transition discrepancy.`,
      evidenceBadges,
      structuredSections,
      toolInvocations,
      ragCitations: [
        {
          docTitle: 'Ministry of Rural Development Social Audit Standards 2022',
          section: 'Section 3.2: Physical Milestone Plaque Compliance',
          page: 29,
          clause: '3.2.1',
        },
      ],
      caseAction: {
        caseId: 'case-es-2026-0842',
        structureId: 'struct-cd-04',
        label: 'View OCR Evidence Block in Chain',
        type: 'evidence_chain',
      },
    };
  }

  // =========================================================================
  // SCENARIO 4: FIELD VERIFICATION PROTOCOL (FLOW D)
  // =========================================================================
  private generateFlowD_Verification(): AgentChatMessage {
    const toolInvocations = [
      {
        toolName: 'QueryWatershedGIS',
        description: 'Scans all 19 structures in Micro-Watershed 4B1C2d3 for pre-monsoon readiness',
        summary: 'Catchment scanned: 2 of 19 structures in critical silt obstruction state',
        executionTimestamp: '2026-09-25T11:29:40+05:30',
        input: { watershedId: 'ws-dharashiv-ter', priority: 'Critical' },
        output: {
          totalStructures: 19,
          structuresAtRisk: 2,
          criticalAssets: ['MH-DHR-2024-CD-04 (Rui)', 'MH-DHR-2023-GP-02 (Shiradhon)'],
          monsoonWindowDaysRemaining: 68,
        },
        status: 'success' as const,
      },
      {
        toolName: 'FindVoiceReports',
        description: 'Aggregates community maintenance requests for target catchment',
        summary: 'Community reports aggregated: Top grievance is pre-monsoon silt desiltation',
        executionTimestamp: '2026-09-25T11:29:45+05:30',
        input: { watershedId: 'ws-dharashiv-ter', status: 'Pending Verification' },
        output: { count: 3, topGrievance: 'Silt deposition impeding pre-monsoon storage' },
        status: 'success' as const,
      },
      {
        toolName: 'ConsultRagGuidelines',
        description: 'Retrieves pre-monsoon desiltation window and maintenance SOPs',
        summary: 'PMKSY Section 7.1 retrieved: Mandatory pre-monsoon desilting window March 15 to May 30',
        executionTimestamp: '2026-09-25T11:29:50+05:30',
        input: { query: 'pre-monsoon maintenance timeline check dams', topic: 'Structure maintenance & desiltation' },
        output: {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 7.1: Pre-Monsoon Maintenance & Structure Safety Protocol',
          page: 64,
          clause: '7.1.2',
          mandatoryWindow: 'March 15 to May 30',
          benefit: 'Captures early monsoon first-flush runoff without overflow scour',
        },
        status: 'success' as const,
      },
      {
        toolName: 'BuildEvidenceTrail',
        description: 'Prepares field verification ticket with cryptographic parent hash',
        summary: 'Verification checklist assembled with parent cryptographic hash',
        executionTimestamp: '2026-09-25T11:30:00+05:30',
        input: { caseId: 'case-es-2026-0842', targetOfficer: 'Er. S. Patil' },
        output: {
          ticketCreated: true,
          parentHash: '0x55d01248ba004128fef88e7a91b2c4d6f830a1c3',
          ticketId: 'VERIF-2026-0842',
        },
        status: 'success' as const,
      },
    ];

    const structuredSections: AgentStructuredSections = {
      whatSystemObserves: [
        'GIS record: 2 of 19 structures in Micro-Watershed 4B1C2d3 operate under critical silt obstruction (CD-04 at 78% silt, GP-02 at 65% silt).',
        'Field timing context: Pre-monsoon dry season affords an optimal 60-day window (March–May) for mechanical excavator access into dried nala beds.',
      ],
      whatWasReported: [
        'Local farmers have pledged cooperative tractor haulage of fertile black silt topsoil to 14 marginal farmland parcels in Rui village.',
        'WDT Junior Engineer Er. S. Patil has been designated as the inspecting authority.',
      ],
      relevantGuidance: [
        {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 7.1: Pre-Monsoon Maintenance & Structure Safety Protocol',
          page: 64,
          clause: '7.1.2',
          norm: 'Desiltation completed prior to monsoon onset captures up to 85% of early runoff, averting downstream bank erosion.',
        },
        {
          docTitle: 'MGNREGA Master Circular: Water Conservation Works',
          section: 'Para 12.3: Farmer Silt Reclamation Norms',
          page: 142,
          clause: '12.3.1',
          norm: 'Transport of excavated silt to small/marginal farmers’ agricultural plots is fully permissible and incentivized.',
        },
      ],
      whatThisMayIndicate:
        'Executing desiltation now at Check Dam CD-04 will restore 17,160 m³ of water harvesting capacity, sufficient to support critical post-monsoon rabi irrigation for ~45 hectares.',
      whatMustBeVerified: [
        'Conduct physical joint inspection with Junior Engineer, Gram Rozgar Sevak, and Sarpanch.',
        'Demarcate silt excavation boundary and safe bed depth using lime powder markers.',
        'Document pre-excavation 360-degree geotagged photos to establish the baseline for DBT sanction release.',
      ],
      confidenceCoverage: {
        score: 96,
        rating: 'High',
        sourcesCount: 5,
        totalSources: 5,
        sources: [
          'Watershed GIS Priority Ranking',
          'Community IVR Demand Registry',
          'PMKSY Section 7.1 Protocol',
          'MGNREGA Para 12.3 Topsoil Norms',
          'Cryptographic Verification Ticket',
        ],
      },
    };

    const evidenceBadges: EvidenceBadgeType[] = [
      'FIELD VERIFICATION',
      'GIS RECORD',
      'GUIDELINE CONTEXT',
      'SATELLITE OBSERVATION',
    ];

    return {
      id: `msg-flow-d-${Date.now()}`,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flowId: 'flow-verification',
      text: `### Pre-Monsoon Field Verification & Desiltation Protocol
A standardized pre-monsoon field inspection protocol has been formulated for Micro-Watershed 4B1C2d3. Recommended priority assignment dispatched for Rui East Check Dam #4.`,
      evidenceBadges,
      structuredSections,
      toolInvocations,
      ragCitations: [
        {
          docTitle: 'PMKSY-WDC 2.0 Operational Guidelines',
          section: 'Section 7.1: Pre-Monsoon Maintenance & Structure Safety Protocol',
          page: 64,
          clause: '7.1.2',
        },
      ],
      caseAction: {
        caseId: 'case-es-2026-0842',
        structureId: 'struct-cd-04',
        label: 'View Field Verification Chain Block',
        type: 'evidence_chain',
      },
    };
  }

  // =========================================================================
  // SCENARIO 5: VEGETATION ANOMALIES
  // =========================================================================
  private generateVegetationAnomaliesResponse(watershedId: string): AgentChatMessage {
    const toolInvocations = [
      {
        toolName: 'QueryWatershedGIS',
        description: 'Queries ridge-to-valley afforestation zones and drainage density',
        summary: 'GIS query complete: 4,850 ha area analyzed across ridge-to-valley zones',
        executionTimestamp: new Date().toISOString(),
        input: { watershedId },
        output: { areaHa: 4850, treatmentZones: ['Ridge Afforestation', 'Mid-Slope Bunding', 'Valley Nala Bunds'] },
        status: 'success' as const,
      },
      {
        toolName: 'FetchSatelliteIndices',
        description: 'Queries Sentinel-2 multispectral NDVI spatial distribution',
        summary: 'Sentinel-2 NDVI analyzed: Upper ridge +65.5% gain, localized nala depression',
        executionTimestamp: new Date().toISOString(),
        input: { sensor: 'Sentinel-2 MSI', index: 'NDVI' },
        output: {
          meanNdvi: 0.48,
          healthyBiomassHa: 1840,
          stressedBiomassHa: 310,
          anomalyIdentified: 'Localized canopy stress along untreated 2nd-order feeder stream',
        },
        status: 'success' as const,
      },
    ];

    const structuredSections: AgentStructuredSections = {
      whatSystemObserves: [
        'Satellite observation: Sentinel-2 mean NDVI increased from 0.29 to 0.48 across ridge afforestation plots.',
        'Localized vegetation anomaly detected across 310 ha along an untreated 2nd-order tributary northwest of Rui village.',
      ],
      whatWasReported: [
        'Krishi Mitra field reports indicate successful groundnut and soybean canopy establishment in treated valley zones.',
        'Farmers in northern scrubland reported topsoil erosion during unseasonal pre-monsoon showers.',
      ],
      relevantGuidance: [
        {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 3.1: Ridge-to-Valley Soil & Moisture Conservation',
          page: 24,
          clause: '3.1.2',
          norm: 'Continuous Contour Trenches (CCT) and vegetative barriers must precede drainage line masonry check dams.',
        },
      ],
      whatThisMayIndicate:
        'Vegetation index gains correlate with continuous contour trenching on upper ridges, while localized stress indicates untreated gully segments requiring vegetative hedge planting.',
      whatMustBeVerified: [
        'Check survival percentage of native forestry saplings (Neem, Subabul, Khair) in CCT plots.',
        'Verify gully erosion depth along the untreated tributary using staff gauge.',
      ],
      confidenceCoverage: {
        score: 89,
        rating: 'High',
        sourcesCount: 3,
        totalSources: 4,
        sources: ['Sentinel-2 NDVI', 'Watershed GIS Topography', 'PMKSY Section 3.1'],
      },
    };

    return {
      id: `msg-veg-${Date.now()}`,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Multispectral Vegetation & Biomass Analysis
Sentinel-2 multispectral NDVI indicates broad landscape regeneration across treated ridge plots (+65.5%), with isolated vegetation stress along untreated tributaries requiring vegetative hedge planting.`,
      evidenceBadges: ['SATELLITE OBSERVATION', 'GIS RECORD', 'GUIDELINE CONTEXT'],
      structuredSections,
      toolInvocations,
    };
  }

  // =========================================================================
  // SCENARIO 6: ASSETS WITH DUAL EVIDENCE (VOICE + GEO-PHOTOS)
  // =========================================================================
  private generateAssetsWithDualEvidenceResponse(watershedId: string): AgentChatMessage {
    const toolInvocations = [
      {
        toolName: 'FindVoiceReports',
        description: 'Queries citizen calls with linked physical structures',
        summary: '2 voice reports identified with structure links',
        executionTimestamp: new Date().toISOString(),
        input: { watershedId },
        output: { count: 2, structures: ['struct-cd-04 (Rui)', 'struct-cd-02 (Shiradhon)'] },
        status: 'success' as const,
      },
      {
        toolName: 'FindGeoPhotos',
        description: 'Cross-references geotagged field photos against voice report structures',
        summary: 'Matched 2 structures with both citizen voice and field photos',
        executionTimestamp: new Date().toISOString(),
        input: { watershedId },
        output: { matchedCount: 2, assets: ['Rui East Check Dam #4', 'Shiradhon Upstream Masonry Check Dam'] },
        status: 'success' as const,
      },
    ];

    const structuredSections: AgentStructuredSections = {
      whatSystemObserves: [
        'GIS record: 2 assets in Micro-Watershed 4B1C2d3 possess dual evidence coverage (citizen voice + field photo).',
        '1. Rui East Check Dam #4 (CD-04): Inbound voice call ivr-call-1082 and 2 geotagged photos (img-rui-001, img-rui-002).',
        '2. Shiradhon Upstream Masonry Check Dam (CD-02): Inbound voice call ivr-call-1083 and 1 geotagged photo (img-shr-001).',
      ],
      whatWasReported: [
        'Rui: Farmer reported severe silt choking and dried wells; photo confirms crest-level siltation.',
        'Shiradhon: Gram Panchayat member reported minor masonry scouring on right flank; photo confirms need for boulder pitching.',
      ],
      relevantGuidance: [
        {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 6.1: Social Audit & Community Grievance Protocol',
          page: 58,
          clause: '6.1.2',
          norm: 'Assets with dual community reports and visual proof are prioritized for immediate field verification dispatch.',
        },
      ],
      whatThisMayIndicate:
        'Dual-evidence assets represent high-priority ground interventions where community reporting and visual confirmation corroborate.',
      whatMustBeVerified: [
        'Rui East Check Dam #4: Pre-monsoon desiltation volume sounding.',
        'Shiradhon Check Dam #2: Masonry apron mortar repointing.',
      ],
      confidenceCoverage: {
        score: 94,
        rating: 'High',
        sourcesCount: 4,
        totalSources: 4,
        sources: ['Bhashini IVR Gateway', 'Field Camera App', 'Watershed GIS', 'PMKSY Protocol'],
      },
    };

    return {
      id: `msg-dual-${Date.now()}`,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Assets with Dual Evidence (Voice Grievance + Geo-Coded Photos)
In Micro-Watershed 4B1C2d3, two structures possess both citizen voice recordings and geotagged field photos: **Rui East Check Dam #4** (silt choking) and **Shiradhon Masonry Check Dam** (flank scouring).`,
      evidenceBadges: ['VOICE REPORT', 'GEO-CODED IMAGE', 'GIS RECORD'],
      structuredSections,
      toolInvocations,
      caseAction: {
        caseId: 'case-es-2026-0842',
        structureId: 'struct-cd-04',
        label: 'Inspect Rui Check Dam Dual Evidence',
        type: 'evidence_chain',
      },
    };
  }

  // =========================================================================
  // SCENARIO 7: GUIDELINE CONTEXT FOR CURRENT ISSUE
  // =========================================================================
  private generateGuidelineContextResponse(watershedId: string): AgentChatMessage {
    const toolInvocations = [
      {
        toolName: 'ConsultRagGuidelines',
        description: 'Queries RAG vector index over PMKSY-WDC 2.0, MGNREGA, and CGWB guidelines',
        summary: 'Matched 3 relevant regulatory clauses across 2 ministries',
        executionTimestamp: new Date().toISOString(),
        input: { topic: 'Structure maintenance & desiltation' },
        output: {
          matchedDocs: [
            'PMKSY-WDC 2.0 Operational Guidelines',
            'MGNREGA Master Circular 2024-25',
            'CGWB Artificial Recharge Manual',
          ],
        },
        status: 'success' as const,
      },
    ];

    const structuredSections: AgentStructuredSections = {
      whatSystemObserves: [
        'Regulatory analysis: Check dam maintenance protocols across Department of Land Resources (DoLR) and Ministry of Jal Shakti.',
      ],
      whatWasReported: [
        'Current target asset Rui East Check Dam #4 exhibits 78% silt deposition.',
      ],
      relevantGuidance: [
        {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 4.3: Drainage Line Treatment & Siltation Management',
          page: 42,
          clause: '4.3.2',
          norm: 'Desiltation is mandatory once sediment exceeds 40% of storage basin capacity.',
        },
        {
          docTitle: 'MGNREGA Master Circular: Water Conservation Works',
          section: 'Para 8.4: Renovation of Traditional Water Bodies',
          page: 115,
          clause: '8.4.1',
          norm: 'Unskilled manual labor component for de-silting is funded 100% under MGNREGA Category A.',
        },
        {
          docTitle: 'CGWB Manual on Artificial Recharge of Ground Water',
          section: 'Section 5.2: Desiltation & Maintenance of Percolation Tanks',
          page: 72,
          clause: '5.2.1',
          norm: 'Percolation basin bed must be scraped clean of silt cake before pre-monsoon showers to maximize groundwater recharge.',
        },
      ],
      whatThisMayIndicate:
        'Intervention at Rui East Check Dam #4 is fully compliant with central funding guidelines under PMKSY Component B and MGNREGA convergence.',
      whatMustBeVerified: [
        'Confirm Gram Sabha resolution approving desiltation work.',
        'Verify silt disposal and redistribution plan to marginal farmers.',
      ],
      confidenceCoverage: {
        score: 96,
        rating: 'High',
        sourcesCount: 3,
        totalSources: 3,
        sources: ['PMKSY Guidelines', 'MGNREGA Circular', 'CGWB Manual'],
      },
    };

    return {
      id: `msg-guide-${Date.now()}`,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Relevant Government Guidelines & Scheme Mandates
The RAG guideline intelligence service retrieved 3 official mandates governing check dam siltation, maintenance funding, and groundwater recharge standards.`,
      evidenceBadges: ['GUIDELINE CONTEXT', 'GIS RECORD'],
      structuredSections,
      toolInvocations,
    };
  }

  // =========================================================================
  // SCENARIO 8: TEMPORAL SATELLITE CHANGE DETECTION
  // =========================================================================
  private generateTemporalChangeResponse(watershedId: string): AgentChatMessage {
    const toolInvocations = [
      {
        toolName: 'QueryWatershedGIS',
        description: 'Extracts boundary polygon and stream density for catchment',
        summary: 'GIS boundary extracted: Micro-Watershed 4B1C2d3 (4,850 ha)',
        executionTimestamp: new Date().toISOString(),
        input: { watershedId, sensor: 'Sentinel-2 MSI' },
        output: {
          watershedName: 'Upper Sina - Ter',
          areaHa: 4850,
          drainageDensity: 1.88,
          ridgeToValleyInterventions: 19,
        },
        status: 'success' as const,
      },
      {
        toolName: 'FetchSatelliteIndices',
        description: 'Calculates mean NDVI & NDWI spectral reflectance across 2023–2025',
        summary: 'Sentinel-2 delta: NDVI +65.5%, water retention area +142,500 m³',
        executionTimestamp: new Date().toISOString(),
        input: {
          watershedId,
          timeA: '2023-10-15',
          timeB: '2025-10-18',
          sensor: 'Sentinel-2 Multispectral',
        },
        output: {
          ndviDeltaPct: 65.5,
          waterSpreadHaGain: 28.7,
          estimatedWaterStorageGainCuM: 142500,
          soilErosionReductionPct: 38.2,
        },
        status: 'success' as const,
      },
      {
        toolName: 'ConsultRagGuidelines',
        description: 'Queries remote-sensing verification norms under PMKSY-WDC 2.0',
        summary: 'PMKSY Section 9.2: Remote sensing impact corroboration required',
        executionTimestamp: new Date().toISOString(),
        input: { query: 'satellite monitoring of watershed impact', topic: 'Water conservation structures' },
        output: {
          clause: 'Section 9.2: Remote Sensing Impact Assessment',
          requirement: 'NDVI biomass improvement must be verified via ground-truth GPS photo sampling.',
        },
        status: 'success' as const,
      },
    ];

    const structuredSections: AgentStructuredSections = {
      whatSystemObserves: [
        'Satellite observation: Sentinel-2 multispectral reflectance reveals a +65.5% relative increase in mean NDVI (0.29 → 0.48) in upper ridge afforestation zones.',
        'Pondage area captured by drainage line check dams expanded from 14.8 ha to 43.5 ha (+142,500 m³ retention gain).',
        'One localized spectral anomaly (anom-dhr-01) persists at Rui East Check Dam #4 where surface moisture rapidly depleted post-monsoon.',
      ],
      whatWasReported: [
        'Field inspection logs by Krishi Mitra indicate successful rabi crop double-cropping in 340 ha downstream of treated nalas.',
        'Localized desiltation request received for Check Dam CD-04 basin where silt buildup has limited effective percolation depth.',
      ],
      relevantGuidance: [
        {
          docTitle: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
          section: 'Section 9.2: Geospatial & Remote Sensing Monitoring',
          page: 86,
          clause: '9.2.3',
          norm: 'Earth observation metrics must be corroborated with geotagged ground photographs before certifying watershed completion.',
        },
      ],
      whatThisMayIndicate:
        'Available spectral evidence indicates positive hydrological response at the landscape scale, with isolated storage impairment at specific 3rd-order check dams requiring desiltation.',
      whatMustBeVerified: [
        'Verify that downstream agricultural wells maintain water column during March–May.',
        'Confirm that gully plug installations along 1st-order streams are arresting coarse sediment.',
      ],
      confidenceCoverage: {
        score: 88,
        rating: 'High',
        sourcesCount: 3,
        totalSources: 4,
        sources: ['Sentinel-2 MSI', 'Watershed GIS Database', 'PMKSY Guidelines'],
      },
    };

    return {
      id: `msg-sat-${Date.now()}`,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Earth Observation: Baseline (2023) vs Current (2025) Satellite Change
Sentinel-2 multispectral telemetry confirms substantial hydrologic and vegetation recovery (+65.5% NDVI, +142,500 m³ storage), with an isolated silt anomaly at Rui East Check Dam #4.`,
      evidenceBadges: ['SATELLITE OBSERVATION', 'GIS RECORD', 'GUIDELINE CONTEXT'],
      structuredSections,
      toolInvocations,
    };
  }

  // =========================================================================
  // HELPER FUNCTIONS FOR LATER MODULES (SECTION 17)
  // =========================================================================
  async getAgentResponse(query: string, watershedId: string = 'ws-dharashiv-ter'): Promise<AgentResponse> {
    const msg = await this.sendMessage([], query, watershedId);
    if (msg.structuredResponse) {
      return msg.structuredResponse;
    }

    const obs = msg.structuredSections?.whatSystemObserves || [msg.text];
    const rep = msg.structuredSections?.whatWasReported || [];
    const guide = msg.structuredSections?.relevantGuidance.map((g) => `${g.docTitle}: ${g.norm}`) || [];
    const steps = msg.structuredSections?.whatMustBeVerified || [];

    return {
      query,
      watershed: watershedId,
      asset: 'Rui East Check Dam #4 (MH-DHR-2024-CD-04)',
      observations: obs,
      reportedEvidence: rep,
      guidelineContext: guide,
      toolTrace: (msg.toolInvocations || []).map((t) => ({
        toolName: t.toolName,
        summary: t.summary || t.description || t.toolName,
        status: t.status,
        timestamp: t.executionTimestamp,
      })),
      synthesis: msg.structuredSections?.whatThisMayIndicate || msg.text,
      verificationSteps: steps,
      evidenceCoverage: {
        sourcesCount: msg.structuredSections?.confidenceCoverage.sourcesCount || 4,
        totalSources: msg.structuredSections?.confidenceCoverage.totalSources || 5,
        score: msg.structuredSections?.confidenceCoverage.score || 90,
      },
      verificationStatus: 'PENDING FIELD VERIFICATION',
    };
  }

  getEvidenceSummary(watershedId: string = 'ws-dharashiv-ter') {
    return {
      activeAlerts: 2,
      totalEvidenceCount: 7,
      verifiedHashes: 6,
      pendingVerificationCount: 1,
    };
  }
}

export const llmGeoAgentService = new MockLlmGeoAgentService();

export async function getAgentResponse(
  query: string,
  watershedId: string = 'ws-dharashiv-ter'
): Promise<AgentResponse> {
  return llmGeoAgentService.getAgentResponse(query, watershedId);
}

export function getEvidenceSummary(watershedId: string = 'ws-dharashiv-ter') {
  return llmGeoAgentService.getEvidenceSummary(watershedId);
}
