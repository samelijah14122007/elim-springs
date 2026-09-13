// Retrieval-Augmented Generation (RAG) Service Module
// Watershed Document Guideline Intelligence Engine
// Indexes Ministry of Jal Shakti, PMKSY-WDC 2.0, MGNREGA & CGWB Technical Manuals
// Local prototype semantic retrieval with zero external dependencies and zero API key requirements

import {
  RagKnowledgeDocument,
  RagSearchResult,
  EvidenceContext,
  VerificationChecklist,
  VerificationChecklistTask,
} from '../types';

export interface IRagService {
  searchGuidelines(query: string, limit?: number): Promise<RagSearchResult[]>;
  getAllDocuments(): Promise<RagKnowledgeDocument[]>;
  getDocumentById(id: string): Promise<RagKnowledgeDocument | undefined>;
  getRelevantGuidelines(context: EvidenceContext): Promise<RagSearchResult[]>;
  getVerificationChecklist(context: EvidenceContext, result?: RagSearchResult): Promise<VerificationChecklist>;
  getGuidelineEvidenceTrail(context: EvidenceContext): Promise<{
    context: EvidenceContext;
    guidelines: RagSearchResult[];
    checklist: VerificationChecklist;
  }>;
}

export const mockGovernmentDocs: RagKnowledgeDocument[] = [
  {
    id: 'pmksy-wdc-2-guidelines',
    title: 'PMKSY - Watershed Development Component (WDC 2.0) Operational Guidelines',
    issuingMinistry: 'Department of Land Resources, Ministry of Rural Development, Govt of India',
    documentType: 'Operational Guidelines',
    year: 2022,
    totalSections: 14,
    topic: 'Watershed Interventions, Funding Norms & Social Audit',
    sourceStatus: 'PROTOTYPE KNOWLEDGE RECORD',
    chunks: [
      {
        chunkId: 'pmksy-sec-4-checkdams',
        sectionTitle: 'Section 4.3: Drainage Line Treatment & Siltation Management',
        clauseNumber: 'Clause 4.3.2',
        page: 'Prototype reference (Sec 4.3, p. 42)',
        topic: 'Structure maintenance & desiltation',
        applicableStructure: 'Check Dam / Cement Nala Bund',
        applicableIssue: 'Silt accumulation & storage volume depletion',
        text: 'Masonry Check Dams and Cement Nala Bunds constructed across 2nd and 3rd order streams shall be periodically desilted when silt deposition exceeds 40% of original pondage capacity. Priority desiltation funds can be allocated under Component B (Maintenance & Community Assets). Desilted fertile topsoil must be distributed to marginal farmers for soil conditioning.',
        prototypeSummary:
          'Check dams across 2nd and 3rd order drainage lines shall be prioritized for desiltation when silt deposition exceeds 40% of original pondage capacity. Silt removal is eligible under Component B maintenance grants and desilted sediment should be repurposed for agricultural soil enrichment under Gram Panchayat supervision.',
        keyNorms: [
          'Desiltation threshold: Silt volume > 40% of design capacity',
          'Eligible funding: Component B Maintenance Grant',
          'Silt reuse: Farmland topsoil nourishment',
          'Stream order mandate: 2nd and 3rd order drainage lines',
        ],
        verificationPoints: [
          'Verify physical silt accumulation depth relative to weir crest height',
          'Confirm if sediment deposition exceeds the 40% threshold capacity',
          'Record GPS coordinates and photograph upstream pondage spread',
          'Inspect downstream apron and wingwalls for undercut or structural stress',
          'Verify Gram Panchayat social audit resolution for desiltation fund allocation',
        ],
      },
      {
        chunkId: 'pmksy-sec-6-community-verification',
        sectionTitle: 'Section 6.1: Social Audit & Ground-Truth Verification Protocol',
        clauseNumber: 'Clause 6.1.4',
        page: 'Prototype reference (Sec 6.1, p. 68)',
        topic: 'Social audit & verification',
        applicableStructure: 'All Watershed Structures',
        applicableIssue: 'Citizen grievance & structural defect reporting',
        text: 'Every community grievance received regarding water harvesting structure breach, seepage, or failure must undergo mandatory physical inspection by the Watershed Development Team (WDT) Engineer within 7 working days, accompanied by geo-tagged timestamped photographs signed by the Gram Panchayat President.',
        prototypeSummary:
          'Grievances received regarding water harvesting structure breach, seepage, or storage impairment mandate an on-site physical inspection by the WDT Engineer within 7 working days, supported by geo-tagged timestamped photographs and Sarpanch co-signature.',
        keyNorms: [
          'Mandatory ground audit: Within 7 working days of grievance receipt',
          'Required evidence: Geo-tagged photo with verified device timestamp',
          'Sign-off: WDT Engineer and Sarpanch co-signature',
          'Public disclosure: Recorded in Gram Panchayat grievance register',
        ],
        verificationPoints: [
          'Conduct physical site inspection within 7 working days of grievance logging',
          'Capture geo-tagged, timestamped ground photographs of reported defects',
          'Verify caller report against physical structure condition on the ground',
          'Cross-reference physical signboard text with official GIS asset ledger',
          'Obtain joint verification sign-off with Gram Panchayat Sarpanch',
        ],
      },
      {
        chunkId: 'pmksy-sec-7-fund-norms',
        sectionTitle: 'Section 7.2: Permissible Maintenance Expenditure & Asset Registry',
        clauseNumber: 'Clause 7.2.1',
        page: 'Prototype reference (Sec 7.2, p. 74)',
        topic: 'Water conservation structures',
        applicableStructure: 'Water Harvesting Assets',
        applicableIssue: 'Maintenance & repair approval',
        text: 'Up to 10% of total watershed project outlay is admissible for repair and maintenance of community water harvesting assets. Pre-sanction estimate must be backed by ground-truth photographic evidence and technical inspection report.',
        prototypeSummary:
          'Maintenance expenditure up to 10% of project outlay is permissible for community water assets provided pre-sanction technical estimates are corroborated by geo-coded ground photos and verified in the watershed asset registry.',
        keyNorms: [
          'Permissible maintenance limit: Up to 10% of project budget',
          'Prerequisite: Verified entry in Watershed GIS Asset Registry',
          'Evidence requirement: Pre-sanction ground-truth photographic audit',
        ],
        verificationPoints: [
          'Verify that asset is listed in the official PMKSY GIS asset registry',
          'Confirm maintenance estimate does not exceed component ceiling',
          'Verify baseline photographic proof before approving repair sanction',
        ],
      },
    ],
  },
  {
    id: 'mgnrega-water-circular',
    title: 'MGNREGA Master Circular: Natural Resource Management & Water Conservation Works',
    issuingMinistry: 'Ministry of Rural Development, Govt of India',
    documentType: 'Master Circular',
    year: 2024,
    totalSections: 9,
    topic: 'Permissible NRM Works, Desiltation & Ridge-to-Valley Protocol',
    sourceStatus: 'PROTOTYPE KNOWLEDGE RECORD',
    chunks: [
      {
        chunkId: 'mgnrega-percolation-tanks',
        sectionTitle: 'Para 8.4: Renovation of Traditional Water Bodies & Percolation Tanks',
        clauseNumber: 'Para 8.4.1',
        page: 'Prototype reference (Para 8.4, p. 115)',
        topic: 'Water conservation structures',
        applicableStructure: 'Percolation Tank / Farm Pond',
        applicableIssue: 'Water retention failure & feeder channel choking',
        text: 'Deepening of percolation tanks and restoration of feeder channels is 100% permissible under MGNREGA Category A works. Machine excavation is restricted except where rock breaking is essential. Minimum 60:40 wage to material ratio must be preserved at the Gram Panchayat block level.',
        prototypeSummary:
          'Deepening of percolation tanks and clearing of feeder channels is fully permissible under MGNREGA Category A Natural Resource Management works, mandating adherence to the 60:40 wage-to-material expenditure ratio at the Gram Panchayat level.',
        keyNorms: [
          'Permissibility: 100% Category A Natural Resource Management',
          'Wage:Material ratio: 60:40 GP block level mandate',
          'Feeder channel desilting permissible under social audit',
        ],
        verificationPoints: [
          'Inspect feeder channel alignment for silt, weed, or boulder obstructions',
          'Verify existing storage depth and estimate silt excavation volume',
          'Ensure compliance with 60:40 wage-to-material expenditure ratio',
          'Confirm Gram Sabha approval for tank desiltation work code',
        ],
      },
      {
        chunkId: 'mgnrega-gully-plugs',
        sectionTitle: 'Para 8.7: Ridge to Valley Treatment Protocol',
        clauseNumber: 'Para 8.7.3',
        page: 'Prototype reference (Para 8.7, p. 122)',
        topic: 'Ridge-to-valley protocol',
        applicableStructure: 'Gully Plug / Continuous Contour Trench (CCT)',
        applicableIssue: 'Upstream soil erosion & slope runoff velocity',
        text: 'Interventions must strictly follow the Ridge-to-Valley principle. Loose Boulder Structures (LBS) and Brushwood dams must be completed on 1st order streams before undertaking cement structures on 3rd and 4th order drainage lines.',
        prototypeSummary:
          'Watershed soil and water interventions must strictly follow the Ridge-to-Valley sequence. Continuous contour trenches and loose boulder structures on 1st order ridge lines must precede masonry structures on downstream drainage streams.',
        keyNorms: [
          'Strict sequence: Ridge to Valley execution',
          '1st order streams: Loose Boulder Structure / Gully plugs',
          '3rd order streams: Cement Nala Bunds',
        ],
        verificationPoints: [
          'Inspect ridge catchment above the structure for untreated rills or gullies',
          'Verify stability of 1st and 2nd order loose boulder gully plugs',
          'Ensure continuous contour trenches (CCT) are unblocked along ridge contours',
          'Assess vegetative cover along contour bund flanks',
        ],
      },
    ],
  },
  {
    id: 'cgwb-artificial-recharge',
    title: 'Central Ground Water Board (CGWB) Manual on Artificial Recharge of Ground Water',
    issuingMinistry: 'Ministry of Jal Shakti, Department of Water Resources, Govt of India',
    documentType: 'Technical Manual',
    year: 2021,
    totalSections: 18,
    topic: 'Artificial Aquifer Recharge, Sub-surface Dykes & Infiltration Shafts',
    sourceStatus: 'PROTOTYPE KNOWLEDGE RECORD',
    chunks: [
      {
        chunkId: 'cgwb-recharge-shafts',
        sectionTitle: 'Chapter 5.2: Inverted Bore Recharge Shafts in Silted Percolation Tanks',
        clauseNumber: 'Section 5.2.1',
        page: 'Prototype reference (Ch 5.2, p. 84)',
        topic: 'Artificial groundwater recharge',
        applicableStructure: 'Percolation Tank / Recharge Shaft',
        applicableIssue: 'Impermeable clay silt layer & infiltration stagnation',
        text: 'Where percolation tanks have developed impermeable clay silt layers causing stagnation rather than infiltration, one or more inverted bore recharge shafts of 150-300mm diameter packed with gravel-sand filters should be installed to pierce the unconfined impermeable layer and recharge the deep basalt / hard rock aquifer directly.',
        prototypeSummary:
          'When percolation tanks accumulate fine impermeable clayey silt that prevents downward percolation, one or more inverted bore recharge shafts of 150-300mm diameter filled with graded gravel packs should be installed to pierce the impermeable layer and recharge the underlying aquifer directly.',
        keyNorms: [
          'Remedy for silted tanks: Inverted gravel-packed recharge shaft',
          'Bore diameter: 150 - 300 mm slotted casing pipe',
          'Filter medium: Graded pea gravel and coarse river sand pack',
          'Target stratum: Unconfined basalt or hard rock fractured aquifer',
        ],
        verificationPoints: [
          'Determine if surface water is stagnant with negligible infiltration into aquifer',
          'Test silt layer thickness and permeability using hand auger core',
          'Evaluate depth to underlying weathered basalt/hard rock permeable zone',
          'Inspect gravel and coarse sand filter chamber to prevent fine sediment ingress',
        ],
      },
      {
        chunkId: 'cgwb-hydrogeology-recharge',
        sectionTitle: 'Chapter 3.1: Hydrogeological Site Suitability for Check Dams & Dykes',
        clauseNumber: 'Section 3.1.4',
        page: 'Prototype reference (Ch 3.1, p. 56)',
        topic: 'Drainage line treatment',
        applicableStructure: 'Check Dam / Sub-surface Dyke',
        applicableIssue: 'Basal seepage, scouring & foundation piping',
        text: 'Check dams should be founded on competent bed material. Where bedrock is fractured or permeable gravel beds occur, cutoff trenches or downstream impervious aprons must be provided to avert piping failure under the foundation.',
        prototypeSummary:
          'Check dams and sub-surface dykes must be anchored to competent impervious strata with adequate cutoff depth. Where downstream scour or basal piping is detected, emergency underpinning and stilling basin rehabilitation are mandatory to prevent structural breach.',
        keyNorms: [
          'Foundation requirement: Anchor into impervious bedrock or cutoff depth',
          'Basal piping indicator: Downstream water boils or undermining',
          'Corrective measure: Cutoff trench and downstream stilling apron reinforcement',
        ],
        verificationPoints: [
          'Inspect downstream toe and stilling basin for turbulent piping or sediment boils',
          'Check wingwall abutment junctions for subsurface lateral bypass flow',
          'Measure differential water head across upstream weir and downstream apron',
          'Verify scour hole depth below stilling basin apron',
        ],
      },
    ],
  },
];

class RagService implements IRagService {
  private documents: RagKnowledgeDocument[] = mockGovernmentDocs;

  async getAllDocuments(): Promise<RagKnowledgeDocument[]> {
    return this.documents;
  }

  async getDocumentById(id: string): Promise<RagKnowledgeDocument | undefined> {
    return this.documents.find((d) => d.id === id);
  }

  async searchGuidelines(query: string, limit: number = 4): Promise<RagSearchResult[]> {
    await new Promise((res) => setTimeout(res, 180));

    const q = query.toLowerCase().trim();
    if (!q) return [];

    const tokens = q.split(/\s+/).filter((t) => t.length > 2);
    const results: RagSearchResult[] = [];

    for (const doc of this.documents) {
      for (const chunk of doc.chunks) {
        let score = 0.45; // baseline prior

        const chunkText = (
          chunk.sectionTitle +
          ' ' +
          chunk.topic +
          ' ' +
          chunk.applicableStructure +
          ' ' +
          chunk.applicableIssue +
          ' ' +
          chunk.text +
          ' ' +
          chunk.prototypeSummary +
          ' ' +
          chunk.keyNorms.join(' ')
        ).toLowerCase();

        // Exact keyword matching
        if (tokens.some((t) => chunkText.includes(t))) {
          score += 0.25;
        }

        // Domain-specific concept boosts
        if ((q.includes('silt') || q.includes('desilt') || q.includes('choke')) && chunk.applicableIssue.toLowerCase().includes('silt')) {
          score += 0.25;
        }
        if ((q.includes('check dam') || q.includes('nala bund')) && chunk.applicableStructure.toLowerCase().includes('check dam')) {
          score += 0.2;
        }
        if ((q.includes('percolation') || q.includes('tank')) && chunk.applicableStructure.toLowerCase().includes('percolation')) {
          score += 0.22;
        }
        if ((q.includes('recharge') || q.includes('shaft') || q.includes('groundwater')) && chunk.topic.toLowerCase().includes('recharge')) {
          score += 0.26;
        }
        if ((q.includes('seep') || q.includes('crack') || q.includes('breach') || q.includes('piping') || q.includes('wall')) && chunk.applicableIssue.toLowerCase().includes('seepage')) {
          score += 0.28;
        }
        if ((q.includes('citizen') || q.includes('voice') || q.includes('grievance') || q.includes('ivr') || q.includes('audit')) && chunk.topic.toLowerCase().includes('audit')) {
          score += 0.27;
        }
        if ((q.includes('ridge') || q.includes('valley') || q.includes('gully') || q.includes('order')) && chunk.topic.toLowerCase().includes('ridge')) {
          score += 0.25;
        }
        if (q.includes('mgnrega') && doc.id.includes('mgnrega')) {
          score += 0.25;
        }
        if (q.includes('pmksy') && doc.id.includes('pmksy')) {
          score += 0.25;
        }
        if (q.includes('cgwb') && doc.id.includes('cgwb')) {
          score += 0.25;
        }

        if (score > 0.5) {
          results.push({
            chunkId: chunk.chunkId,
            documentId: doc.id,
            docTitle: doc.title,
            issuingMinistry: doc.issuingMinistry,
            documentType: doc.documentType,
            topic: chunk.topic,
            sectionTitle: chunk.sectionTitle,
            clauseNumber: chunk.clauseNumber,
            pageNumber: chunk.page,
            content: chunk.text,
            prototypeSummary: chunk.prototypeSummary,
            applicableStructure: chunk.applicableStructure,
            applicableIssue: chunk.applicableIssue,
            relevanceScore: Math.min(Number(score.toFixed(2)), 0.98),
            highlightedNorms: chunk.keyNorms,
            verificationPoints: chunk.verificationPoints,
            sourceStatus: 'PROTOTYPE KNOWLEDGE RECORD',
          });
        }
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }

  async getRelevantGuidelines(context: EvidenceContext): Promise<RagSearchResult[]> {
    // Generate context query from evidence context
    const parts = [
      context.issue || '',
      context.assetName || '',
      context.assetType || '',
      context.voiceReportSnippet || '',
      context.locationDescription || '',
    ];
    const query = parts.filter(Boolean).join(' ');
    return this.searchGuidelines(query || 'check dam siltation maintenance', 4);
  }

  async getVerificationChecklist(
    context: EvidenceContext,
    result?: RagSearchResult
  ): Promise<VerificationChecklist> {
    const activeResult = result || (await this.getRelevantGuidelines(context))[0];

    const evidenceAvailable: {
      type: 'Geo-Photo' | 'Voice Report (IVR)' | 'GIS Location' | 'Satellite Observation' | 'OCR Signboard';
      label: string;
      refId?: string;
    }[] = [];

    if (context.geoPhotoId) {
      evidenceAvailable.push({
        type: 'Geo-Photo',
        label: `Ground Photo: ${context.geoPhotoId}`,
        refId: context.geoPhotoId,
      });
    }
    if (context.voiceReportId) {
      evidenceAvailable.push({
        type: 'Voice Report (IVR)',
        label: `Voice Complaint: ${context.voiceReportId} (${context.voiceCallerRole || 'Caller'})`,
        refId: context.voiceReportId,
      });
    }
    if (context.satelliteAnomalyId) {
      evidenceAvailable.push({
        type: 'Satellite Observation',
        label: `Spatial Anomaly: ${context.satelliteAnomalyId}`,
        refId: context.satelliteAnomalyId,
      });
    }
    if (context.assetId || context.assetName) {
      evidenceAvailable.push({
        type: 'GIS Location',
        label: `Registered Asset: ${context.assetName || context.assetId}`,
        refId: context.assetId,
      });
    }

    const defaultTasks: VerificationChecklistTask[] = (
      activeResult?.verificationPoints || [
        'Confirm physical structure GPS coordinates with handheld GPS receiver (<5m accuracy)',
        'Inspect sediment deposition depth relative to weir crest level',
        'Check downstream stilling basin apron for scour or basal piping signs',
        'Record pondage spread area and vegetative encroachment',
        'Capture calibrated before-inspection photographs',
        'Obtain Gram Panchayat Sarpanch joint verification sign-off',
      ]
    ).map((task, idx) => ({
      id: `task-${idx + 1}`,
      task,
      guidelineBasis: `${activeResult?.docTitle.split(':')[0] || 'PMKSY-WDC 2.0'} (${activeResult?.clauseNumber || 'Guideline Norm'})`,
      completed: false,
      mandatory: idx < 4,
    }));

    return {
      id: `chk-${Date.now().toString().slice(-4)}`,
      guidelineDocTitle: activeResult?.docTitle || 'PMKSY-WDC 2.0 Operational Guidelines',
      section: activeResult?.sectionTitle || 'Section 4.3: Drainage Line Treatment',
      page: activeResult?.pageNumber ? String(activeResult.pageNumber) : 'Prototype reference',
      issue: context.issue || activeResult?.applicableIssue || 'Check dam silt accumulation',
      assetName: context.assetName || 'Watershed Drainage Structure',
      evidenceAvailable,
      tasks: defaultTasks,
      status: 'PENDING FIELD VERIFICATION',
      createdAt: new Date().toISOString(),
      recommendedOfficer: 'Junior Engineer (WDT Civil)',
    };
  }

  async getGuidelineEvidenceTrail(context: EvidenceContext): Promise<{
    context: EvidenceContext;
    guidelines: RagSearchResult[];
    checklist: VerificationChecklist;
  }> {
    const guidelines = await this.getRelevantGuidelines(context);
    const checklist = await this.getVerificationChecklist(context, guidelines[0]);
    return {
      context,
      guidelines,
      checklist,
    };
  }
}

export const ragService = new RagService();
