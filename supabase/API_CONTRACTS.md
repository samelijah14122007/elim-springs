# ELIM SPRINGS — Backend & Supabase API / Data Contracts
**SIH 2026 — PS 26015: "From Field Voices to Watershed Action"**

This document specifies the exact REST & Supabase JS client API contracts powering the ELIM SPRINGS service layer and future Lovable frontend integrations.

All endpoints use Supabase's native **PostgREST API** on PostgreSQL tables with Row Level Security (RLS).

---

## 1. Authentication & Base Headers

All requests to Supabase PostgREST endpoints require:

```http
Host: <SUPABASE_PROJECT_ID>.supabase.co
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <SUPABASE_ANON_KEY> (or user JWT when logged in)
Content-Type: application/json
Prefer: return=representation
```

---

## 2. Core Entities API Contracts

### 2.1 Watersheds

#### `GET /rest/v1/watersheds`
Retrieve all registered watershed basins.
- **Equivalent JS:** `supabase.from('watersheds').select('*')`
- **Response `200 OK`:**
```json
[
  {
    "id": "d0000000-0000-0000-0000-000000000001",
    "district_id": "c0000000-0000-0000-0000-000000000001",
    "name": "Upper Sina - Ter Basin",
    "code": "ws-dharashiv-ter",
    "description": "Upper Sina River tributary basin with severe post-monsoon depletion.",
    "area_sq_km": 48.5,
    "latitude": 18.2372,
    "longitude": 75.9845,
    "status": "ACTIVE",
    "created_at": "2026-09-27T10:00:00Z"
  }
]
```

#### `GET /rest/v1/watersheds?id=eq.:id`
- **Equivalent JS:** `supabase.from('watersheds').select('*, districts(*), micro_watersheds(*)').eq('id', id).single()`

---

### 2.2 Assets (Water Harvesting Structures)

#### `GET /rest/v1/assets`
Filterable by `watershed_id`, `asset_type`, `status`.
- **Query Params:** `?micro_watershed_id=eq.:mws_id&order=siltation_percent.desc`
- **Equivalent JS:** `supabase.from('assets').select('*').order('siltation_percent', { ascending: false })`
- **Response `200 OK`:**
```json
[
  {
    "id": "f0000000-0000-0000-0000-000000000001",
    "micro_watershed_id": "e0000000-0000-0000-0000-000000000001",
    "asset_code": "MH-DHR-2024-CD-04",
    "name": "Rui East Check Dam #4",
    "asset_type": "CHECK_DAM",
    "scheme": "PMKSY-WDC 2.0",
    "construction_year": 2022,
    "latitude": 18.2372,
    "longitude": 75.9845,
    "sanction_cost": 480000,
    "pondage_capacity": 18500,
    "siltation_percent": 68.0,
    "current_condition": "Heavy Siltation & Minor Apron Scour",
    "status": "NEEDS_MAINTENANCE"
  }
]
```

#### `GET /rest/v1/assets?id=eq.:id`
- **Equivalent JS:** `supabase.from('assets').select('*').eq('id', id).single()`

#### `GET /rest/v1/evidence?asset_id=eq.:assetId`
Retrieve all multi-modal evidence linked to a specific asset.
- **Equivalent JS:** `supabase.from('evidence').select('*, geo_photos(*), voice_reports(*), ocr_results(*), satellite_observations(*)').eq('asset_id', assetId)`

---

## 3. Evidence Ingestion Contracts

### 3.1 Base Evidence
#### `POST /rest/v1/evidence`
- **Equivalent JS:** `supabase.from('evidence').insert([payload]).select().single()`
- **Payload:**
```json
{
  "asset_id": "f0000000-0000-0000-0000-000000000001",
  "watershed_id": "d0000000-0000-0000-0000-000000000001",
  "evidence_type": "GEO_PHOTO",
  "source": "Field Verification Mobile App",
  "title": "Rui East Check Dam #4 Reservoir Siltation Evidence",
  "description": "Ground photograph showing 1.25m black silt bed and cracked apron joints.",
  "latitude": 18.2372,
  "longitude": 75.9845,
  "integrity_hash": "0x502b2012f15d54a61c339e1a765f5708663eca3a74bcedad6a5dc98a6ccc1e84",
  "status": "VERIFIED"
}
```

### 3.2 Geo Photos
#### `POST /rest/v1/geo_photos`
- **Equivalent JS:** `supabase.from('geo_photos').insert([payload]).select().single()`
- **Payload:**
```json
{
  "evidence_id": "10000000-0000-0000-0000-000000000003",
  "asset_id": "f0000000-0000-0000-0000-000000000001",
  "storage_path": "geo-images/rui-check-dam-04-silt.jpg",
  "latitude": 18.2372,
  "longitude": 75.9845,
  "altitude": 620.4,
  "azimuth": 42.0,
  "gps_accuracy": 3.2,
  "device": "Samsung Galaxy M32 (GPS Glonass)",
  "condition": "Heavy Siltation",
  "damage_assessment": "Requires mechanical de-siltation of 6,200 cu.m",
  "exif_verified": true,
  "tamper_check_status": "VERIFIED"
}
```

### 3.3 Voice Reports (1800-ELIM-WATER)
#### `POST /rest/v1/voice_reports`
- **Equivalent JS:** `supabase.from('voice_reports').insert([payload]).select().single()`
- **Payload:**
```json
{
  "evidence_id": "10000000-0000-0000-0000-000000000002",
  "caller_id": "+91 98234 11209",
  "storage_path": "voice-reports/ivr-call-98234-marathi.wav",
  "language": "Marathi",
  "duration_seconds": 45,
  "transcript": "चेक डॅम क्रमांक ४ मध्ये काळी माती पूर्ण भरली आहे.",
  "translation": "Check Dam No. 4 is completely filled with black silt.",
  "issue_category": "Siltation & Storage Impairment",
  "urgency": "Critical",
  "latitude": 18.2370,
  "longitude": 75.9842,
  "structured_report": {
    "structure": "Check Dam #4",
    "village": "Rui",
    "severity": "CRITICAL"
  },
  "processing_status": "TRANSCRIBED"
}
```

### 3.4 OCR Results (Information Board Audit)
#### `POST /rest/v1/ocr_results`
- **Equivalent JS:** `supabase.from('ocr_results').insert([payload]).select().single()`
- **Payload:**
```json
{
  "evidence_id": "10000000-0000-0000-0000-000000000004",
  "asset_id": "f0000000-0000-0000-0000-000000000001",
  "work_code": "MH-DHR-2024-CD-04",
  "scheme_name": "PMKSY-WDC 2.0",
  "sanction_cost": 480000,
  "structure_type": "Check Dam",
  "ocr_confidence": 0.942,
  "registry_match_status": "MATCH",
  "registry_reference": "PMKSY-WDC-2022-MH-DHR-0842"
}
```

### 3.5 Satellite Observations
#### `POST /rest/v1/satellite_observations`
- **Equivalent JS:** `supabase.from('satellite_observations').insert([payload]).select().single()`
- **Payload:**
```json
{
  "asset_id": "f0000000-0000-0000-0000-000000000001",
  "watershed_id": "d0000000-0000-0000-0000-000000000001",
  "source": "Copernicus Sentinel-2",
  "product": "L2A Surface Reflectance (Simulated Prototype)",
  "acquisition_date": "2026-09-15T00:00:00Z",
  "cloud_cover": 1.2,
  "resolution_m": 10.0,
  "ndvi_mean": 0.28,
  "ndwi_mean": -0.15,
  "water_area_ha": 0.42,
  "anomaly_status": "HIGH_ANOMALY",
  "observation_status": "VERIFIED"
}
```

---

## 4. Case Management & Field Verification Contracts

### 4.1 Cases

#### `GET /rest/v1/cases`
Filter by status, priority, or watershed:
- **Query Params:** `?status=eq.FIELD_VERIFICATION_DISPATCHED&order=created_at.desc`
- **Equivalent JS:** `supabase.from('cases').select('*, assets(*), evidence(*)').order('created_at', { ascending: false })`

#### `GET /rest/v1/cases?id=eq.:id`
- **Equivalent JS:** `supabase.from('cases').select('*, field_verifications(*), evidence_chain_events(*)').eq('id', id).single()`

#### `POST /rest/v1/cases`
- **Equivalent JS:** `supabase.from('cases').insert([payload]).select().single()`
- **Payload:**
```json
{
  "case_number": "ES-2026-0842",
  "asset_id": "f0000000-0000-0000-0000-000000000001",
  "watershed_id": "d0000000-0000-0000-0000-000000000001",
  "created_from_evidence_id": "10000000-0000-0000-0000-000000000001",
  "title": "Rui East Check Dam #4 Siltation & Storage Impairment",
  "description": "Multi-modal detection confirming 68% silt loss and reduced downstream percolation.",
  "priority": "CRITICAL",
  "status": "FIELD_VERIFICATION_DISPATCHED",
  "assigned_to": "Er. S. Patil (WDT Civil)"
}
```

#### `PATCH /rest/v1/cases?id=eq.:id`
- **Equivalent JS:** `supabase.from('cases').update({ status: 'ENGINEER_APPROVED' }).eq('id', id)`
- **Payload:**
```json
{
  "status": "ENGINEER_APPROVED",
  "resolved_at": "2026-09-27T10:30:00Z"
}
```

### 4.2 Field Verifications

#### `POST /rest/v1/field_verifications`
- **Equivalent JS:** `supabase.from('field_verifications').insert([payload]).select().single()`
- **Payload:**
```json
{
  "case_id": "80000000-0000-0000-0000-000000000001",
  "asset_id": "f0000000-0000-0000-0000-000000000001",
  "inspector_id": "a0000000-0000-0000-0000-000000000001",
  "latitude": 18.2372,
  "longitude": 75.9845,
  "observed_condition": "Severe silt bed of 1.25m depth (68% capacity loss confirmed)",
  "measurements": {
    "siltDepthMeters": 1.25,
    "siltVolumeCuM": 6200,
    "apronCrackLengthMeters": 4.5
  },
  "engineer_signoff": {
    "signed": true,
    "name": "Er. S. Patil",
    "designation": "WDT Civil Engineer",
    "timestamp": "2026-09-27T10:00:00Z"
  },
  "sarpanch_signoff": {
    "signed": true,
    "name": "Gram Panchayat Sarpanch",
    "village": "Rui",
    "resolutionNo": "GP/RUI/2026/89"
  },
  "outcome": "REQUIRES_MAINTENANCE"
}
```

#### `GET /rest/v1/field_verifications?case_id=eq.:caseId`
- **Equivalent JS:** `supabase.from('field_verifications').select('*').eq('case_id', caseId).single()`

---

## 5. Reports & DPR Requisition Contracts

#### `GET /rest/v1/reports`
Filter by `case_id`, `asset_id`, or `report_type`:
- **Query Params:** `?report_type=eq.DPR&order=created_at.desc`
- **Equivalent JS:** `supabase.from('reports').select('*').eq('report_type', 'DPR')`

#### `POST /rest/v1/reports`
- **Equivalent JS:** `supabase.from('reports').insert([payload]).select().single()`
- **Payload:**
```json
{
  "case_id": "80000000-0000-0000-0000-000000000001",
  "asset_id": "f0000000-0000-0000-0000-000000000001",
  "report_type": "DPR",
  "title": "Detailed Project Report (DPR): Drainage Line Treatment & Reservoir De-siltation at Rui East Check Dam #4",
  "summary": "Sanction requisition under PMKSY-WDC 2.0 Convergence Head for mechanical desilting.",
  "scorecard_grade": "B+",
  "dpr_estimate": {
    "estimatedCostInr": 320000,
    "expectedWaterRetentionCuM": 15000,
    "beneficiaryFarmers": 42,
    "commandAreaHa": 65,
    "convergenceScheme": "MGNREGA / PMKSY-WDC 2.0"
  },
  "report_data": {
    "caseNumber": "ES-2026-0842",
    "assetCode": "MH-DHR-2024-CD-04",
    "engineerSignoff": "Er. S. Patil",
    "sarpanchSignoff": "Sarpanch Rui GP"
  },
  "generated_by": "Er. S. Patil (WDT Civil)"
}
```

---

## 6. Storage Bucket Contracts

Files are uploaded to private/authenticated buckets via Supabase Storage:

| Bucket Name | Purpose | Max Size | Allowed MIME Types |
|:---|:---|:---|:---|
| `geo-images` | Geotagged ground truth photos | 15 MB | `image/jpeg`, `image/png`, `image/webp` |
| `voice-reports` | IVR audio calls & citizen recordings | 25 MB | `audio/wav`, `audio/mpeg`, `audio/ogg`, `audio/webm` |
| `documents` | Statutory manuals (PMKSY, MGNREGA, CGWB) | 50 MB | `application/pdf`, `application/json` |
| `reports` | Generated DPR PDF requisitions & scorecards | 20 MB | `application/pdf`, `application/json` |

---

## 7. Cryptographic Evidence Chain (SHA-256)

All evidence chain events stored in `public.evidence_chain_events` follow the Merkle-linked structure:

$$\text{CurrentHash} = \text{SHA256}(\text{PreviousHash} + \text{CanonicalJSON}(\text{EventData}))$$

- **Initial Hash (Genesis):** `0000000000000000000000000000000000000000000000000000000000000000`
- **Tamper Evidence:** Any modification to a historical event immediately invalidates all downstream event hashes.
