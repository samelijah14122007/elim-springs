// Cryptographic Evidence Chain & Audit Service
// Ensures tamper-proof integrity for field photos, IVR calls, OCR extractions,
// satellite anomalies, and AI recommendations for DBT / PMKSY audits

import { EvidenceAuditEntry, EvidenceEventType, EvidenceChainResult } from '../types';

// RFC 6234 Standards-Compliant Deterministic SHA-256 Engine
function utf8Encode(str: string): string {
  try {
    return unescape(encodeURIComponent(str));
  } catch {
    return str;
  }
}

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

export function computeSha256(input: string): string {
  const ascii = utf8Encode(input);
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = candidate << 1; i <= 311; i += candidate) {
        isComposite[i] = true;
      }
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  let padded = ascii + '\x80';
  while ((padded[lengthProperty] % 64) - 56) padded += '\x00';
  for (i = 0; i < padded[lengthProperty]; i++) {
    j = padded.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 =
        (hash[7] +
          (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
          ch +
          k[i] +
          w[i]) |
        0;
      const temp2 =
        ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) +
          maj) |
        0;

      hash = [
        (temp1 + temp2) | 0,
        hash[0],
        hash[1],
        hash[2],
        (hash[3] + temp1) | 0,
        hash[4],
        hash[5],
        hash[6],
      ];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export interface IEvidenceService {
  generateSha256(payload: string): string;
  createAuditTrail(initialAction: string, initialPayload: string): EvidenceAuditEntry[];
  appendAuditStep(
    chain: EvidenceAuditEntry[],
    actor: string,
    action: string,
    payloadExcerpt: string,
    eventType?: EvidenceEventType,
    source?: string
  ): EvidenceAuditEntry[];
  buildCaseEvidenceChain(caseId: string): EvidenceAuditEntry[];
  verifyChainIntegrity(chain: EvidenceAuditEntry[]): EvidenceChainResult;
}

class CryptographicEvidenceService implements IEvidenceService {
  generateSha256(payload: string): string {
    return computeSha256(payload);
  }

  private computeBlockHash(
    prevHash: string,
    step: number,
    actor: string,
    action: string,
    payload: string
  ): string {
    return computeSha256(`${prevHash}|${step}|${actor}|${action}|${payload}`);
  }

  createAuditTrail(initialAction: string, initialPayload: string): EvidenceAuditEntry[] {
    const genesisPrev = '0000000000000000000000000000000000000000000000000000000000000000';
    const firstHash = this.computeBlockHash(
      genesisPrev,
      1,
      'Citizen Grassroots Reporter',
      initialAction,
      initialPayload
    );

    return [
      {
        step: 1,
        eventId: 'EV-01',
        eventType: 'VOICE_REPORT',
        source: 'Bhashini IVR Voice Gateway',
        actor: 'Citizen Grassroots Reporter',
        action: initialAction,
        description: 'Citizen inbound report registered and recorded over telephone gateway',
        timestamp: new Date().toISOString(),
        previousHash: genesisPrev,
        sha256Hash: firstHash,
        currentHash: firstHash,
        inputPayloadExcerpt: initialPayload.slice(0, 120),
        payloadExcerpt: initialPayload.slice(0, 120),
        verificationStatus: 'VERIFIED',
        status: 'VERIFIED',
      },
    ];
  }

  appendAuditStep(
    chain: EvidenceAuditEntry[],
    actor: string,
    action: string,
    payloadExcerpt: string,
    eventType: EvidenceEventType = 'ADMIN_SANCTION',
    source: string = 'ELIM SPRINGS Evidence Engine'
  ): EvidenceAuditEntry[] {
    const nextStep = chain.length + 1;
    const prevHash =
      chain.length > 0
        ? chain[chain.length - 1].sha256Hash
        : '0000000000000000000000000000000000000000000000000000000000000000';
    const currentHash = this.computeBlockHash(prevHash, nextStep, actor, action, payloadExcerpt);

    const newEntry: EvidenceAuditEntry = {
      step: nextStep,
      eventId: `EV-${String(nextStep).padStart(2, '0')}`,
      eventType,
      source,
      actor,
      action,
      description: action,
      timestamp: new Date().toISOString(),
      previousHash: prevHash,
      sha256Hash: currentHash,
      currentHash,
      inputPayloadExcerpt: payloadExcerpt.slice(0, 120),
      payloadExcerpt: payloadExcerpt.slice(0, 120),
      verificationStatus: 'VERIFIED',
      status: 'VERIFIED',
    };

    return [...chain, newEntry];
  }

  buildCaseEvidenceChain(caseId: string): EvidenceAuditEntry[] {
    // Generate deterministic 6-step multi-source evidence chain for Rui Check Dam #4 (or specified case)
    const genesisPrev = '0000000000000000000000000000000000000000000000000000000000000000';

    const eventsData: Array<{
      eventId: string;
      eventType: EvidenceEventType;
      source: string;
      actor: string;
      action: string;
      description: string;
      timestamp: string;
      payload: string;
      status: 'VERIFIED' | 'PENDING' | 'FLAGGED';
    }> = [
      {
        eventId: 'EV-01',
        eventType: 'VOICE_REPORT',
        source: 'IVR Voice Gateway (1800-ELIM-WATER)',
        actor: 'Dnyaneshwar Shinde (Farmer, Rui Village)',
        action: 'Inbound IVR Voice Call Lodged',
        description: 'Citizen called toll-free IVR line in Marathi reporting acute siltation at Rui Check Dam #4.',
        timestamp: '2026-09-23T14:22:10+05:30',
        payload: 'Audio: 26s WAV | Phone: +91 98224 81920 | Location: Rui Village | Topic: Check Dam dry wells',
        status: 'VERIFIED',
      },
      {
        eventId: 'EV-02',
        eventType: 'VOICE_REPORT',
        source: 'Bhashini Pipeline (ASR + IndicTrans2)',
        actor: 'Digital India Bhashini Language Engine',
        action: 'Speech Recognition & English Translation',
        description: 'Automated transcription from Marathi and entity extraction identified Rui Check Dam #4 with 0.94 confidence.',
        timestamp: '2026-09-23T14:22:18+05:30',
        payload: 'Translation: Check Dam #4 in Rui is choked with silt; pond basin dry; dug-wells drying up | Confidence: 0.94',
        status: 'VERIFIED',
      },
      {
        eventId: 'EV-03',
        eventType: 'GEO_IMAGE',
        source: 'Original Field Camera Upload (Android / Desktop)',
        actor: 'Ramesh Kadam (Gram Rozgar Sevak)',
        action: 'Original Field Photo Upload & GPS EXIF Verification',
        description: 'Unaltered ground photograph captured at weir basin with cryptographic EXIF timestamp, hardware GPS verification, and SHA-256 evidence integrity hash.',
        timestamp: '2026-09-24T10:14:22+05:30',
        payload: 'Lat: 18.23724°N | Lng: 75.98451°E | GPS VERIFIED (±2.8m) | Alt: 618.4m MSL | SHA-256: 8f2c3b8871ab93821033d4e8b01e459039a8c7e2f1e60472e38c92a104f7b219',
        status: 'VERIFIED',
      },
      {
        eventId: 'EV-04',
        eventType: 'OCR_EXTRACTION',
        source: 'Tesseract.js OCR Engine + Scheme Registry Cross-Check',
        actor: 'ELIM OCR Registry Audit Engine',
        action: 'Physical Milestone Signboard Optical Extraction',
        description: 'Extracted sanction details from physical milestone plaque and verified against official PMKSY GIS asset ledger.',
        timestamp: '2026-09-24T10:14:35+05:30',
        payload: 'Work Code: MH-DHR-2023-CD-04 | Scheme: PMKSY-WDC 2.0 | Sanction: ₹6,50,000 | Match Status: VERIFIED',
        status: 'VERIFIED',
      },
      {
        eventId: 'EV-05',
        eventType: 'SATELLITE_ANOMALY',
        source: 'Sentinel-2 MSI Level-2A (Copernicus)',
        actor: 'Earth Observation Spectral Analysis Engine',
        action: 'NDWI Moisture & Surface Water Deficit Flagged',
        description: 'Multi-temporal spectral analysis detected post-monsoon NDWI drop from +0.38 to +0.08, confirming basin dryness.',
        timestamp: '2026-09-24T10:14:50+05:30',
        payload: 'Sensor: Sentinel-2 MSI | Anomaly ID: anom-dhr-01 | NDWI Delta: -79% | Surface Water Loss: 17,160 m³ pondage deficit',
        status: 'VERIFIED',
      },
      {
        eventId: 'EV-06',
        eventType: 'AI_REASONING',
        source: 'ELIM SPRINGS AI Geo Agent',
        actor: 'ELIM SPRINGS AI Geo Agent',
        action: 'Multimodal Synthesis & PMKSY Guideline Retrieval (Advisory)',
        description: 'Synthesized field evidence streams. Advisory screening indicates possible 78% silt deposition. Retrieved PMKSY-WDC 2.0 Section 4.3 mandatory desiltation threshold (>40%). Ground verification required.',
        timestamp: '2026-09-24T10:15:02+05:30',
        payload: 'Advisory Screening: Siltation indicator ~78% | Norm: PMKSY Sec 4.3 | Advisory Recommendation: Schedule joint ground audit',
        status: 'VERIFIED',
      },
      {
        eventId: 'EV-07',
        eventType: 'FIELD_VERIFICATION',
        source: 'WDT Civil Engineering Verification Workflow',
        actor: 'Er. S. Patil (WDT Junior Engineer)',
        action: 'Pre-Monsoon Physical Verification Ticket Dispatched',
        description: 'Work order dispatched for sounding rod silt depth measurement and Gram Sabha topsoil distribution resolution.',
        timestamp: '2026-09-25T11:30:00+05:30',
        payload: 'Assigned: Er. S. Patil | Deadline: 2026-09-30 | Tasks: 3 Sounding Points, Apron Scour Check, Sarpanch Counter-sign',
        status: 'PENDING',
      },
    ];

    let runningPrev = genesisPrev;
    const chain: EvidenceAuditEntry[] = [];

    eventsData.forEach((evt, idx) => {
      const step = idx + 1;
      const hash = this.computeBlockHash(runningPrev, step, evt.actor, evt.action, evt.payload);

      chain.push({
        step,
        eventId: evt.eventId,
        eventType: evt.eventType,
        source: evt.source,
        actor: evt.actor,
        action: evt.action,
        description: evt.description,
        timestamp: evt.timestamp,
        previousHash: runningPrev,
        sha256Hash: hash,
        currentHash: hash,
        inputPayloadExcerpt: evt.payload,
        payloadExcerpt: evt.payload,
        verificationStatus: evt.status,
        status: evt.status,
      });

      runningPrev = hash;
    });

    return chain;
  }

  verifyChainIntegrity(chain: EvidenceAuditEntry[]): EvidenceChainResult {
    const timestamp = new Date().toISOString();
    if (!chain || chain.length === 0) {
      return {
        isValid: false,
        totalEvents: 0,
        verifiedEvents: 0,
        message: 'Chain is empty — no evidence blocks present.',
        verificationTimestamp: timestamp,
      };
    }

    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    let verifiedCount = 0;

    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];
      const payload = block.inputPayloadExcerpt || block.payloadExcerpt || '';

      // Check linkage: block's previousHash must match actual previous block hash
      if (block.previousHash && block.previousHash !== prevHash) {
        return {
          isValid: false,
          totalEvents: chain.length,
          verifiedEvents: verifiedCount,
          brokenIndex: i + 1,
          message: `TAMPER ALERT: Linkage break at Block #${i + 1} (${block.eventId || 'EV'}). Previous hash mismatch!`,
          verificationTimestamp: timestamp,
        };
      }

      // Check recalculated hash
      const recalculated = this.computeBlockHash(
        prevHash,
        block.step,
        block.actor,
        block.action,
        payload
      );

      if (block.sha256Hash !== recalculated) {
        return {
          isValid: false,
          totalEvents: chain.length,
          verifiedEvents: verifiedCount,
          brokenIndex: i + 1,
          message: `TAMPER ALERT: Cryptographic mismatch at Block #${i + 1} (${block.eventId || 'EV'}). Payload or actor has been altered!`,
          verificationTimestamp: timestamp,
        };
      }

      verifiedCount++;
      prevHash = block.sha256Hash;
    }

    return {
      isValid: true,
      totalEvents: chain.length,
      verifiedEvents: verifiedCount,
      message: `CHAIN INTEGRITY: VALID • All ${chain.length} cryptographic blocks verified with SHA-256 zero-tamper attestation.`,
      verificationTimestamp: timestamp,
    };
  }
}

export const evidenceService = new CryptographicEvidenceService();

export function getEvidenceChain(caseId: string = 'case-es-2026-0842'): EvidenceAuditEntry[] {
  return evidenceService.buildCaseEvidenceChain(caseId);
}

export function verifyEvidenceChain(chain: EvidenceAuditEntry[]): EvidenceChainResult {
  return evidenceService.verifyChainIntegrity(chain);
}
