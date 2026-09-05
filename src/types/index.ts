// Core domain types for ELIM SPRINGS - Watershed Intelligence Platform

export type LanguageCode =
  | 'en' // English
  | 'as' // Assamese (অসমীয়া)
  | 'bn' // Bengali (বাংলা)
  | 'brx' // Bodo (बड़ो)
  | 'doi' // Dogri (डोगरी)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'hi' // Hindi (हिन्दी)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ks' // Kashmiri (کٲشُر / कॉशुर)
  | 'kok' // Konkani (कोंकणी)
  | 'mai' // Maithili (मैथिली)
  | 'ml' // Malayalam (മലയാളം)
  | 'mni' // Manipuri (মৈতৈলোন্)
  | 'mr' // Marathi (मराठी)
  | 'ne' // Nepali (नेपाली)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'sa' // Sanskrit (संस्कृतम्)
  | 'sat' // Santali (ᱥᱟᱱᱛᱟᱲᱤ)
  | 'sd' // Sindhi (سنڌي)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'ur'; // Urdu (اردو)

export interface WatershedCatchment {
  id: string;
  code: string; // e.g. 4B1C2d3
  name: string; // e.g. Upper Sina - Ter Micro-Watershed
  district: string;
  state: string;
  areaHa: number;
  rainfallAnnualMm: number;
  soilType: string;
  averageSlopePct: number;
  drainageDensityKmPerSqKm: number;
  center: [number, number]; // Lat, Lng
  zoom: number;
  boundaryGeoJson: GeoJSON.Polygon;
  totalStructures: number;
  criticalAlerts: number;
  groundwaterDepthM: number;
  vegetationIndexNdvi: number;
  waterPersistenceNdwi: number;
}

export type StructureType = 
  | 'Check Dam'
  | 'Percolation Tank'
  | 'Gully Plug'
  | 'Continuous Contour Trench (CCT)'
  | 'Farm Pond'
  | 'Sub-surface Dyke'
  | 'Recharge Shaft';

export type StructureHealthStatus =
  | 'Healthy'
  | 'Needs Inspection'
  | 'At Risk'
  | 'Under Verification'
  | 'Optimal'
  | 'Minor Leakage'
  | 'Heavy Siltation'
  | 'Breach Risk'
  | 'Dried';

export type AssetPriority = 'Critical' | 'High' | 'Medium' | 'Normal';

export interface WatershedStructure {
  id: string;
  code: string;
  name: string;
  type: StructureType;
  watershedId: string;
  watershedName?: string;
  lat: number;
  lng: number;
  sanctionYear: string;
  scheme: 'PMKSY-WDC' | 'MGNREGA' | 'State Watershed Dept' | 'Jal Jeevan Mission';
  estimatedCostInr: number;
  capacityCuM: number;
  currentSiltPct: number;
  health: StructureHealthStatus;
  lastInspected: string;
  assignedEngineer: string;
  streamOrder: number;
  evidenceCount?: number;
  priority?: AssetPriority;
  isSimulated?: boolean;
}

export interface DrainageStream {
  id: string;
  watershedId: string;
  streamOrder: 1 | 2 | 3 | 4;
  name: string;
  lengthKm: number;
  coordinates: [number, number][]; // Array of [lat, lng]
}

export type GisAlertCategory =
  | 'Potential silt accumulation'
  | 'Reduced vegetation signal'
  | 'Possible structure deterioration'
  | 'Water persistence anomaly'
  | 'Field report pending verification';

export interface GisAlert {
  id: string;
  watershedId: string;
  lat: number;
  lng: number;
  title: string;
  category: GisAlertCategory;
  severity: 'Critical' | 'Warning' | 'Advisory';
  observationNotes: string;
  detectedDate: string;
  associatedStructureId?: string;
  associatedCaseId?: string;
  evidenceStatus: 'Field verification required' | 'Under inspection' | 'Verified';
}

export interface WatershedSpatialSummary {
  watershedId: string;
  watershedCode: string;
  watershedName: string;
  catchmentAreaHa: number;
  drainageLengthKm: number;
  checkDamsCount: number;
  percolationTanksCount: number;
  geoPhotosCount: number;
  openAlertsCount: number;
  openVerificationCasesCount: number;
}

export interface LocationSectionReport {
  lat: number;
  lng: number;
  latDms: string;
  lngDms: string;
  elevationM: number | null;
  state: string | null;
  district: string | null;
  taluka: string | null;
  village: string | null;
  cadastralSurveyNo?: string | null;
  isAvailable: boolean;
  statusNote: string;
}

export interface HydrologySectionReport {
  basinName: string | null;
  subBasin: string | null;
  watershedName: string | null;
  watershedCode: string | null;
  streamOrder: number | null;
  distanceToStreamM: number | null;
  drainageDensityKmPerSqKm: number | null;
  upstreamCatchmentHa: number | null;
  isAvailable: boolean;
  statusNote: string;
}

export interface AssetSectionReport {
  nearestAsset: WatershedStructure | null;
  distanceM: number | null;
  totalNearbyCount: number;
  isAvailable: boolean;
  statusNote: string;
}

export interface EvidenceSectionReport {
  photos: GeoCodedImage[];
  voiceReportsCount: number;
  satelliteAnomaly: string | null;
  erosionRiskLevel: string | null;
  latestSha256: string | null;
  verificationStatus: string | null;
  isAvailable: boolean;
  statusNote: string;
}

export interface LocationInspectionResult {
  lat: number;
  lng: number;
  watershedId: string;
  watershedName: string;
  watershedCode: string;
  nearbyAssets: WatershedStructure[];
  nearbyPhotos: GeoCodedImage[];
  nearbyAlerts: GisAlert[];
  closestStreamOrder?: number;
  distanceToNearestStreamM?: number;
  locationReport?: LocationSectionReport;
  hydrologyReport?: HydrologySectionReport;
  assetReport?: AssetSectionReport;
  evidenceReport?: EvidenceSectionReport;
}


export type GeoImageEvidenceStatus =
  | 'Verified Metadata'
  | 'Pending Review'
  | 'Needs Verification'
  | 'Registry Match'
  | 'Registry Mismatch';

export type ObservedConditionTag =
  | 'Silt accumulation'
  | 'Crack / structural concern'
  | 'Vegetation stress'
  | 'Water presence'
  | 'Encroachment concern'
  | 'Construction progress'
  | 'Completed intervention'
  | 'Signboard visible';

export type OcrRegistryMatchStatus =
  | 'MATCH'
  | 'PARTIAL MATCH'
  | 'MISMATCH'
  | 'NO MATCH'
  | 'MANUAL REVIEW REQUIRED'
  | 'REGISTRY MISMATCH — MANUAL REVIEW REQUIRED'
  | 'NO_RELIABLE_TEXT_DETECTED';

export interface OcrComparisonField {
  fieldName: string;
  ocrValue: string;
  registryValue: string;
  status: 'MATCH' | 'MISMATCH' | 'MISSING';
}

export interface OcrRegistryComparisonResult {
  matchStatus: OcrRegistryMatchStatus;
  overallConfidence: number;
  fields: OcrComparisonField[];
  discrepancySummary?: string;
  isSimulated: boolean;
}

export interface OcrExtraction {
  rawText: string;
  confidence: number;
  status?: 'TEXT_DETECTED' | 'NO_RELIABLE_TEXT_DETECTED' | 'PROCESSED';
  detectedFields: {
    projectName?: string;
    workCode?: string;
    assetName?: string;
    assetType?: string;
    schemeName?: string;
    gramPanchayat?: string;
    village?: string;
    block?: string;
    district?: string;
    state?: string;
    structureType?: string;
    sanctionCost?: string;
    financialYear?: string;
    sanctionYear?: string;
    constructionYear?: string;
    implementingAgency?: string;
    department?: string;
    workDescription?: string;
  };
  fieldConfidences?: Record<string, number>;
  fieldSources?: Record<string, string>;
  mismatchDetected: boolean;
  mismatchReason?: string;
  comparisonResult?: OcrRegistryComparisonResult;
}


export type LocationSourceType =
  | 'EXIF_GPS'
  | 'MANUAL_ASSOCIATION'
  | 'ASSET_PROXIMITY'
  | 'NONE';

export interface GeoCodedImage {
  id: string;
  caseId?: string;
  structureId?: string;
  watershedId: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  uploadedBy: {
    name: string;
    role: 'Panchayat Citizen' | 'Gram Rozgar Sevak' | 'Junior Engineer' | 'Satellite Drone' | 'Krishi Mitra';
    phone: string;
    village: string;
  };
  timestamp: string;
  gps: {
    lat: number;
    lng: number;
    altitudeM: number;
    accuracyM: number;
    azimuthDeg: number;
  };
  hasGps?: boolean;
  locationSource?: LocationSourceType;
  isDemoImage?: boolean;
  exifVerified?: boolean;
  deviceInfo: {
    deviceModel: string;
    appVersion: string;
    tamperCheckPassed: boolean;
  };
  ocr?: OcrExtraction;
  aiDamageAssessment: {
    structureIdentified: StructureType;
    anomalyScore: number; // 0 - 100
    detectedDefects: string[];
    siltationEstimatePct: number;
    structuralIntegrityPct: number;
    recommendedAction: string;
    confidence: number;
  };
  evidenceHash: string;
  evidenceStatus?: GeoImageEvidenceStatus;
  observedTags?: ObservedConditionTag[];
  satelliteAnomalyId?: string;
  isSimulated?: boolean;
  imageClassification?: 'FIELD_EVIDENCE' | 'REFERENCE_IMAGE' | 'TEST_IMAGE' | 'SIMULATED';
  isReference?: boolean;
  referenceSource?: string;
  referenceLicense?: string;
}

export type CallerRole =
  | 'Citizen'
  | 'Farmer'
  | 'Gram Rozgar Sevak'
  | 'Field Surveyor'
  | 'Watershed Committee Member';

export type VoiceReportProcessingStatus =
  | 'Received'
  | 'Transcribed'
  | 'Translated'
  | 'Structured'
  | 'Location Matched'
  | 'Pending Verification'
  | 'Converted to Case';

export type VoiceIssueCategory =
  | 'Water retention'
  | 'Silt accumulation'
  | 'Structure concern'
  | 'Drainage blockage'
  | 'Vegetation loss'
  | 'Encroachment concern'
  | 'Intervention progress'
  | 'Other';

export type VoiceUrgency = 'Critical' | 'High' | 'Medium' | 'Low';

export type BhashiniConnectionStatus =
  | 'BHASHINI_LIVE'
  | 'BHASHINI_SIMULATED'
  | 'BHASHINI_AUTH_FAILED'
  | 'BHASHINI_NETWORK_ERROR'
  | 'BHASHINI_UNSUPPORTED_LANGUAGE';

export interface BhashiniConfig {
  endpoint: string;
  isConfigured: boolean;
  hasUdyatKey: boolean;
  hasInferenceKey: boolean;
}

export interface BhashiniLanguageTestResult {
  language: LanguageCode;
  languageName: string;
  task: string;
  success: boolean;
  sampleInput: string;
  sampleOutput: string;
  statusCode: number;
}

export interface BhashiniConnectionResult {
  status: BhashiniConnectionStatus;
  mode: 'LIVE' | 'SIMULATED';
  success: boolean;
  endpoint: string;
  message: string;
  supportedLanguages: LanguageCode[];
  testedLanguages: BhashiniLanguageTestResult[];
}


export interface StructuredVoiceFieldReport {
  reportId: string;
  reporterName: string;
  reporterPhone: string;
  reporterRole: CallerRole;
  language: LanguageCode;
  languageName: string;
  watershedId: string;
  watershedName: string;
  village: string;
  lat?: number;
  lng?: number;
  associatedStructureId?: string;
  associatedStructureName?: string;
  associatedImageId?: string;
  issueCategory: VoiceIssueCategory;
  description: string;
  urgency: VoiceUrgency;
  urgencyScore: number; // 1-10
  timestamp: string;
  originalTranscript: string;
  englishTranslation: string;
  processingStatus: VoiceReportProcessingStatus;
  evidenceNotes: string;
}

export interface IvrVoiceReport {
  id: string;
  caseId?: string;
  callerPhone: string;
  callerName: string;
  callerRole?: CallerRole;
  callerVillage: string;
  watershedId: string;
  watershedName?: string;
  lat?: number;
  lng?: number;
  associatedStructureId?: string;
  associatedImageId?: string;
  callTimestamp: string;
  durationSeconds: number;
  sourceLanguage: LanguageCode;
  sourceLanguageName: string;
  audioUrl: string;
  originalTranscript: string;
  englishTranslation: string;
  detectedIntent?: string;
  urgency?: VoiceUrgency;
  processingStatus?: VoiceReportProcessingStatus;
  caseStatus?: string;
  bhashiniModelUsed: string;
  bhashiniConfidence: number;
  aiExtractedEntities: {
    structureMentioned?: string;
    issueCategory: string;
    severity: 'High' | 'Medium' | 'Low';
    reportedLocation: string;
    urgencyScore: number; // 1-10
  };
  status: 'Transcribed' | 'Converted to Case' | 'Dismissed' | 'Verified' | VoiceReportProcessingStatus;
  structuredReport?: StructuredVoiceFieldReport;
  isSimulated?: boolean;
}

export type CaseStatus = 
  | 'REPORTED'
  | 'PENDING_REVIEW'
  | 'AI_ASSESSED'
  | 'FIELD_VERIFICATION_DISPATCHED'
  | 'INSPECTION_COMPLETED'
  | 'ENGINEER_APPROVED'
  | 'REQUIRES_MORE_EVIDENCE'
  | 'ACTION_IN_PROGRESS'
  | 'RESOLVED';

export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CaseVerificationOutcome =
  | 'VERIFIED CONDITION'
  | 'REQUIRES MAINTENANCE'
  | 'NO ISSUE FOUND'
  | 'MORE EVIDENCE REQUIRED'
  | 'OTHER';

export interface CaseFieldVerification {
  assignedTo: string;
  deadline: string;
  verifiedAt?: string;
  inspectorNotes?: string;
  groundTruthConfirmed: boolean;
  verificationPhotos: string[];
  measurements?: {
    siltDepthM?: number;
    scourLengthM?: number;
    waterLevelM?: number;
    gpsAccuracyM?: number;
    observations?: string;
  };
  observedCondition?: CaseVerificationOutcome;
  checklistCompleted?: Record<string, boolean>;
  signatures: {
    inspector: string;
    sarpanch: string;
    inspectorSignedAt?: string;
    sarpanchSignedAt?: string;
  };
}

export type ReportType =
  | 'WATERSHED_EVIDENCE_SUMMARY'
  | 'ASSET_VERIFICATION'
  | 'FIELD_VERIFICATION'
  | 'EVIDENCE_CHAIN'
  | 'WATER_SECURITY_SCORECARD'
  | 'DPR_MAINTENANCE_REQUISITION';

export type EvidenceEventType =
  | 'VOICE_REPORT'
  | 'GEO_IMAGE'
  | 'OCR_EXTRACTION'
  | 'SATELLITE_ANOMALY'
  | 'AI_REASONING'
  | 'GUIDELINE_RETRIEVAL'
  | 'FIELD_VERIFICATION'
  | 'ADMIN_SANCTION';

export interface EvidenceAuditEntry {
  step: number;
  eventId?: string;
  eventType?: EvidenceEventType;
  source?: string;
  actor: string;
  action: string;
  description?: string;
  timestamp: string;
  previousHash?: string;
  sha256Hash: string; // current cryptographic hash
  currentHash?: string; // alias for sha256Hash
  inputPayloadExcerpt: string;
  payloadExcerpt?: string; // alias for inputPayloadExcerpt
  verificationStatus: 'VERIFIED' | 'PENDING' | 'FLAGGED';
  status?: 'VERIFIED' | 'PENDING' | 'FLAGGED';
  isTampered?: boolean;
}

export type EvidenceChainEvent = EvidenceAuditEntry;

export interface EvidenceChainResult {
  isValid: boolean;
  totalEvents: number;
  verifiedEvents: number;
  brokenIndex?: number;
  message: string;
  verificationTimestamp: string;
}

export interface WatershedCase {
  id: string;
  caseNumber: string; // e.g. ES-2026-0842
  watershedId: string;
  structureId?: string;
  assetName?: string;
  title: string;
  description: string;
  issue?: string;
  reportedVia: 'IVR Voice Call' | 'Geo-coded Field Photo' | 'Satellite Anomaly' | 'Field Inspector App' | string;
  source?: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedOfficer?: string;
  evidenceCount?: number;
  createdAt: string;
  updatedAt: string;
  location: {
    village: string;
    lat: number;
    lng: number;
  };
  associatedVoiceId?: string;
  associatedImageId?: string;
  evidenceChain: EvidenceAuditEntry[];
  aiRecommendation: {
    summary: string;
    schemeReference: string; // e.g. PMKSY WDC 2.0 Section 6.1
    estimatedRepairCostInr: number;
    expectedWaterRetentionCuM: number;
    urgencyIndex: number;
  };
  fieldVerification?: CaseFieldVerification;
  finalOutcome?: {
    sanctionOrderNo?: string;
    contractorAllocated?: string;
    workStartedDate?: string;
    completionTarget?: string;
    actualImpactCapacityCuM?: number;
  };
}

export interface SatelliteTileLayerConfig {
  id: string;
  name: string;
  sensor: 'Sentinel-2 Multispectral' | 'Landsat-9 OLI' | 'PlanetScope High-Res' | 'SRTM DEM';
  description: string;
  resolution: string;
  tileUrlPattern: string;
  cloudCoverPct: number;
  acquisitionDate: string;
  spectralBands: string[];
}

export interface ChangeDetectionRecord {
  watershedId: string;
  timeA: {
    label: string;
    date: string;
    ndviMean: number;
    ndwiMean: number;
    surfaceWaterAreaHa: number;
    imageUrl: string;
  };
  timeB: {
    label: string;
    date: string;
    ndviMean: number;
    ndwiMean: number;
    surfaceWaterAreaHa: number;
    imageUrl: string;
  };
  deltaMetrics: {
    vegetationGrowthPct: number;
    waterStorageGainCuM: number;
    soilErosionReductionPct: number;
    biomassDensityDeltaPct: number;
  };
  aiInsight: string;
  anomalies?: {
    id: string;
    title: string;
    lat: number;
    lng: number;
    type: string;
    severity: 'Critical' | 'Warning' | 'Advisory';
    notes: string;
  }[];
  responsibleInterpretation?: string;
  isSimulated?: boolean;
}

export interface SatelliteObservationMetadata {
  id: string;
  watershedId: string;
  watershedName: string;
  watershedCode: string;
  sensor: 'Sentinel-2 MSI' | 'Landsat-9 OLI' | 'ISRO Resourcesat';
  level: string;
  observationDate: string;
  comparisonDate: string;
  orbitPass: string;
  sunZenithAngleDeg: number;
  sunAzimuthAngleDeg: number;
  spatialResolutionM: number;
  cloudCoverPct: number;
  spatialCoverageHa: number;
  processingStatus: string;
  isSimulated: boolean;
}

export interface NdviClassDistribution {
  category: 'Very Low' | 'Low' | 'Moderate' | 'Healthy' | 'Very Healthy';
  range: string;
  percentage: number;
  areaHa: number;
  color: string;
}

export interface NdwiClassDistribution {
  category: 'Deep Water' | 'Shallow / Turbid Water' | 'High Moisture Saturated' | 'Dry Soil / Terrestrial';
  range: string;
  percentage: number;
  areaHa: number;
  color: string;
}

export interface SpectralAnomalyArea {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  type: 'Vegetation Stress' | 'Silt Choking' | 'Moisture Deficit' | 'Erosion Scour';
  severity: 'Critical' | 'Warning' | 'Advisory';
  dropPct: number;
  notes: string;
}

export interface SpectralIndexResult {
  watershedId: string;
  acquisitionDate: string;
  comparisonDate: string;
  sensor: string;
  cloudCoverPct: number;
  ndvi: {
    mean: number;
    min: number;
    max: number;
    comparisonMean: number;
    changePct: number;
    distribution: NdviClassDistribution[];
    anomalies: SpectralAnomalyArea[];
  };
  ndwi: {
    mean: number;
    min: number;
    max: number;
    comparisonMean: number;
    changePct: number;
    surfaceWaterAreaHa: number;
    comparisonSurfaceWaterAreaHa: number;
    seasonalPersistenceMonths: number;
    distribution: NdwiClassDistribution[];
  };
  isSimulated: boolean;
}

export interface LulcClassItem {
  category:
    | 'Khareef single crop'
    | 'Double crop irrigated'
    | 'Scrubland'
    | 'Waterbodies'
    | 'Afforestation'
    | 'Settlement & Barren';
  areaHa: number;
  percentage: number;
  color: string;
  preInterventionAreaHa: number;
  changeHa: number;
  changePct: number;
}

export interface LulcBreakdownRecord {
  watershedId: string;
  observationYear: number;
  comparisonYear: number;
  totalAreaHa: number;
  classes: LulcClassItem[];
  transitions: {
    from: string;
    to: string;
    areaHa: number;
    significance: string;
  }[];
  classificationMethod: string;
  isSimulated: boolean;
}

export type GuidelineTopic =
  | 'Water conservation structures'
  | 'Drainage line treatment'
  | 'Artificial groundwater recharge'
  | 'Social audit & verification'
  | 'Ridge-to-valley protocol'
  | 'Structure maintenance & desiltation';

export interface EvidenceContext {
  assetId?: string;
  assetName?: string;
  assetType?: StructureType;
  issue?: string;
  voiceReportId?: string;
  voiceReportSnippet?: string;
  voiceCallerRole?: string;
  geoPhotoId?: string;
  satelliteAnomalyId?: string;
  watershedId?: string;
  watershedName?: string;
  locationDescription?: string;
}

export interface VerificationChecklistTask {
  id: string;
  task: string;
  guidelineBasis: string;
  completed: boolean;
  mandatory: boolean;
}

export interface VerificationChecklist {
  id: string;
  guidelineDocTitle: string;
  section: string;
  page: string;
  issue: string;
  assetName?: string;
  evidenceAvailable: {
    type: 'Geo-Photo' | 'Voice Report (IVR)' | 'GIS Location' | 'Satellite Observation' | 'OCR Signboard';
    label: string;
    refId?: string;
  }[];
  tasks: VerificationChecklistTask[];
  status: 'PENDING FIELD VERIFICATION' | 'INSPECTION_IN_PROGRESS' | 'VERIFIED';
  createdAt: string;
  recommendedOfficer: string;
}

export interface RagKnowledgeChunk {
  chunkId: string;
  sectionTitle: string;
  clauseNumber?: string;
  page: string; // e.g. "Prototype reference"
  topic: GuidelineTopic;
  text: string;
  prototypeSummary: string;
  applicableStructure: string;
  applicableIssue: string;
  keyNorms: string[];
  verificationPoints: string[];
}

export interface RagKnowledgeDocument {
  id: string;
  title: string;
  issuingMinistry: string;
  documentType: 'Operational Guidelines' | 'Technical Manual' | 'Master Circular' | 'Standard Schedule of Rates (SoR)';
  year: number;
  totalSections: number;
  topic: string;
  sourceStatus: 'PROTOTYPE KNOWLEDGE RECORD';
  chunks: RagKnowledgeChunk[];
}

export type EvidenceBadgeType =
  | 'SATELLITE OBSERVATION'
  | 'GIS RECORD'
  | 'GEO-CODED IMAGE'
  | 'OCR EXTRACTION'
  | 'VOICE REPORT'
  | 'GUIDELINE CONTEXT'
  | 'FIELD VERIFICATION';

export interface AgentStructuredSections {
  whatSystemObserves: string[];
  whatWasReported: string[];
  relevantGuidance: {
    docTitle: string;
    section: string;
    page: string | number;
    clause?: string;
    norm: string;
  }[];
  whatThisMayIndicate: string;
  whatMustBeVerified: string[];
  confidenceCoverage: {
    score: number; // 0 - 100
    rating: 'High' | 'Moderate' | 'Preliminary';
    sourcesCount: number;
    totalSources: number;
    sources: string[];
  };
}

export interface AgentResponse {
  query: string;
  watershed: string;
  asset: string;
  observations: string[];
  reportedEvidence: string[];
  guidelineContext: string[];
  toolTrace: Array<{
    toolName: string;
    summary: string;
    status: 'success' | 'running' | 'failed';
    timestamp?: string;
  }>;
  synthesis: string;
  verificationSteps: string[];
  evidenceCoverage: {
    sourcesCount: number;
    totalSources: number;
    score: number;
  };
  verificationStatus: 'PENDING FIELD VERIFICATION' | 'IN_PROGRESS' | 'VERIFIED';
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  text: string;
  flowId?: 'flow-anomaly' | 'flow-voice' | 'flow-ocr' | 'flow-verification' | 'custom';
  evidenceBadges?: EvidenceBadgeType[];
  structuredSections?: AgentStructuredSections;
  structuredResponse?: AgentResponse;
  toolInvocations?: {
    toolName: string;
    description?: string;
    summary?: string;
    executionTimestamp?: string;
    input: Record<string, any>;
    output: Record<string, any>;
    status: 'success' | 'running' | 'failed';
  }[];
  ragCitations?: {
    docTitle: string;
    section: string;
    page: number | string;
    clause?: string;
  }[];
  caseAction?: {
    caseId?: string;
    structureId?: string;
    label: string;
    type: 'evidence_chain' | 'verification_checklist' | 'view_photo' | 'view_gis';
  };
}

export interface WatershedReportCard {
  watershedId: string;
  watershedName: string;
  district: string;
  gramPanchayat: string;
  healthGrade: 'A+' | 'A' | 'B' | 'C' | 'D (Critical)';
  score: number; // 0 - 100
  waterSecurityDays: number;
  structuresAudited: number;
  structuresOperational: number;
  siltRemovalPendingCuM: number;
  communityComplaintsResolvedPct: number;
  biomassCoverageChangePct: number;
}

export interface RagSearchResult {
  chunkId: string;
  documentId: string;
  docTitle: string;
  issuingMinistry: string;
  documentType: string;
  topic: string;
  sectionTitle: string;
  clauseNumber?: string;
  pageNumber: string | number; // "Prototype reference"
  content: string;
  prototypeSummary: string;
  applicableStructure: string;
  applicableIssue: string;
  relevanceScore: number; // 0 - 1
  highlightedNorms: string[];
  verificationPoints: string[];
  sourceStatus: string;
}

// ==========================================
// SIH 2026 • PS 26015 FOUNDATION DOMAIN TYPES
// ==========================================

export type Watershed = WatershedCatchment;
export type GeoImage = GeoCodedImage;
export type OCRResult = OcrExtraction;
export type IVRReport = IvrVoiceReport;
export type EvidenceEvent = EvidenceAuditEntry;
export type Case = WatershedCase;
export type GuidelineDocument = RagKnowledgeDocument;
export type DPRReport = WatershedReportCard;

export interface SatelliteObservation {
  id: string;
  watershedId: string;
  sensor: 'Sentinel-2 MSI' | 'Landsat-9 OLI' | 'ISRO Resourcesat' | 'SRTM DEM';
  acquisitionDate: string;
  cloudCoverPct: number;
  ndviMean: number;
  ndwiMean: number;
  surfaceWaterSpreadHa: number;
  isSimulated: boolean;
  metadata?: Record<string, any>;
}

export interface FieldReport {
  id: string;
  watershedId: string;
  reportedBy: string;
  role: 'Panchayat Citizen' | 'Gram Rozgar Sevak' | 'Junior Engineer' | 'Krishi Mitra';
  phone: string;
  village: string;
  channel: 'IVR Voice Call' | 'Geo-coded Field Photo' | 'Field App';
  timestamp: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  associatedCaseId?: string;
}

export interface FieldVerification {
  id: string;
  caseId: string;
  assignedTo: string;
  deadline: string;
  verifiedAt?: string;
  inspectorNotes?: string;
  groundTruthConfirmed: boolean;
  verificationPhotos: string[];
  signatures: {
    inspector: string;
    sarpanch: string;
  };
}

export interface AgentToolResult {
  toolName: string;
  executionTimestamp: string;
  input: Record<string, any>;
  output: Record<string, any>;
  status: 'success' | 'running' | 'failed';
}

// ============================================================================
// BHUVAN / NRSC INDIAN GEOSPATIAL INTEGRATION TYPES
// ============================================================================

export type BhuvanConnectionStatus =
  | 'BHUVAN_CONNECTED'
  | 'BHUVAN_NOT_CONFIGURED'
  | 'BHUVAN_CORS_OR_NETWORK_BLOCKED'
  | 'BHUVAN_LAYER_DISCOVERY_FAILED';

export interface BhuvanConfig {
  wmsUrl: string;
  wmtsUrl: string;
  isConfigured: boolean;
}

export interface BhuvanLayerMetadata {
  id: string;
  name: string;
  title: string;
  category: 'base' | 'administrative' | 'hydrology' | 'lulc' | 'watershed';
  description: string;
  isThematic: boolean;
  serviceType: 'wms' | 'wmts';
  isLiveDiscovered?: boolean;
  abstract?: string;
}

export interface BhuvanConnectionResult {
  status: BhuvanConnectionStatus;
  message: string;
  wmsWorking: boolean;
  wmtsWorking: boolean;
  discoveredLayersCount: number;
  layers: BhuvanLayerMetadata[];
  details: string;
}

export interface IndianGeographicHierarchy {
  country: 'INDIA';
  state?: { code: string; name: string };
  district?: { code: string; name: string };
  watershed?: { code: string; name: string };
  microWatershed?: { code: string; name: string };
  asset?: { code: string; name: string };
  evidence?: { id: string; type: string };
}



