# ELIM SPRINGS

> **"From Field Voices to Watershed Action."**  
> **Smart India Hackathon 2026 — Problem Statement: PS 26015**  
> *A Pan-India Geospatial Watershed Intelligence & Evidence-Based Governance Platform*

---

## 1. Executive Summary

**ELIM SPRINGS** bridges the critical gap between grassroots rural water distress and institutional watershed interventions. Built specifically for **Smart India Hackathon 2026 (PS 26015)**, the platform operationalizes an accountable evidence pipeline:

$$\text{Citizen Voice} \longrightarrow \text{Geo-Photo Evidence} \longrightarrow \text{Earth Observation} \longrightarrow \text{AI Geo-Agent} \longrightarrow \text{Field Ground Verification} \longrightarrow \text{DPR Sanction}$$

Rather than relying on speculative AI summaries, ELIM SPRINGS adheres to strict scientific and engineering rigor:
- Multi-temporal Sentinel-2 MSI and ISRO Bhuvan observations report **surface-water extent**, never fabricated volumetric claims without physical sounding rod surveys.
- Field evidence is locked in a **tamper-evident SHA-256 cryptographic chain**.
- Technical maintenance actions require **dual-signatory ground verification** by the Watershed Development Team (WDT) Junior Engineer and the local Gram Panchayat Sarpanch.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CITIZEN & FIELD EVIDENCE INGESTION                     │
│  Toll-Free Voice (1800-ELIM-JAL)   │  Field Geo-Photos (EXIF GPS & Azimuth) │
│  23 Indian Scheduled Languages     │  Signboard OCR (Project Code Matching)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BHASHINI & MULTILINGUAL AI CORE                        │
│  Bhashini ULCA ASR / NMT Translation  │  Web Speech & Synthesis Fallback   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPATIAL & HYDROLOGICAL REPOSITORY                         │
│  Pan-India Hierarchy (28 States + 8 UTs + 118 Districts + 12 River Basins)  │
│  ISRO Bhuvan WMS / 2D Vector Hydrology  │  CGWB / DoLR Micro-Watersheds     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EARTH OBSERVATION & REMOTE SENSING                     │
│  Sentinel-2 MSI Level-2A (10m)      │  NDWI Surface Water Delineation       │
│  NDVI Riparian Biomass Tracking     │  LULC Transition Dynamics & RUSLE     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EVALUATION & VERIFICATION LAYER                      │
│  AI Geo-Agent Synthesis             │  RAG: PMKSY-WDC 2.0 / MGNREGA         │
│  Dual-Signatory Ground Truth Audit  │  SHA-256 Cryptographic Audit Trail    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ACTION & WORK ORDER EXECUTION                         │
│  Automated DPR Generation           │  Maintenance Sanction Work Orders    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite v8.3.1, Tailwind CSS v4, Lucide React
- **Geospatial & Mapping**: Leaflet v1.9, ISRO Bhuvan WMS / WMTS, Proj4, GeoJSON vector tiling
- **Earth Observation**: Sentinel-2 MSI Multi-Spectral Reflectance, NDWI, NDVI, RUSLE
- **Multilingual AI**: Bhashini ULCA API, Web Speech Recognition, Web SpeechSynthesis
- **Computer Vision & OCR**: Tesseract.js client-side OCR for institutional scheme signboards
- **Cryptographic Security**: Browser Crypto API SHA-256 merkle-style audit chaining
- **Backend / Persistence**: Supabase PostgreSQL, Supabase Storage, Row Level Security (RLS)

---

## 4. Key Functional Modules

### 4.1. Pan-India Watershed GIS
- **Sovereign India Bounds**: Initializes at national bounding box `[[6.5, 68.0], [37.5, 97.5]]`, centered at `[22.5, 82.0]`.
- **Progressive Zoom Detail Engine**:
  - **Zoom 4–5**: Sovereign boundary outline, 28 States and 8 Union Territories (36 administrative units).
  - **Zoom 6–7**: 118 District boundaries + 12 Major River Basins (Ganga, Godavari, Krishna, Narmada, Cauvery, Indus, Brahmaputra, etc.).
  - **Zoom 8–10**: Sub-basins and CGWB/DoLR codified Watersheds (e.g., Upper Sina `4B1C2d3`, Ken-Betwa `2C2B5a`, Kalyandurg `4D3A1b`).
  - **Zoom 11–12**: Micro-watershed polygons and monitored water bodies with live surface-water spread badges.
  - **Zoom 13+**: Individual check dams (`CD`), percolation tanks (`PT`), geo-photos (`📷`), and citizen alerts.
- **National Search**: Instant multi-tier search across States, UTs, Districts, Basins, Watersheds, and Assets.

### 4.2. Dedicated Water Body Intelligence
- **Year-by-Year Multi-Temporal Timeline (2022–2026)**: Evaluates multi-year surface-water extent changes across dry-season epochs.
- **Before / After Split Comparison Slider**: Interactive draggable divider comparing two observation years over identical geographic extents.
- **Water Surface Extent Time Series Graph**: Filterable by 1-Year, 3-Year, and 5-Year horizons.
- **Remote Sensing Indices**: NDWI ($> 0.20$ water threshold), NDVI riparian buffer biomass ($+0.48$), and LULC crop dynamics.
- **RUSLE Soil Erosion Context**: Quantitative soil loss risk calculated using $A = R \cdot K \cdot LS \cdot C \cdot P$.
- **Separated Field Photographs**: Clear visual and metadata distinction between ground truth photos, reference imagery, and simulated samples.

### 4.3. Citizen Voice & Bhashini Multilingual Pipeline
- **23 Indian Scheduled Languages**: Real-time voice processing supporting Hindi, Marathi, Telugu, Tamil, Kannada, Bengali, Gujarati, Punjabi, Odia, Assamese, Malayalam, Urdu, and more.
- **Dual Pipeline**: Live Bhashini ULCA API with seamless browser Web Speech API fallback.
- **Automated Extraction**: Identifies structure names, damage categories, village locations, and urgency ratings.

### 4.4. Field Evidence & Signboard OCR
- **EXIF Verification**: Extracts hardware GPS coordinates, altitude, azimuth, and capture timestamp.
- **Automated Signboard OCR**: Validates scheme names, work codes, and sanction years against government registries.
- **Anti-Tamper SHA-256 Hashing**: Generates unique SHA-256 hashes upon upload to guarantee chain-of-custody.

### 4.5. Case Management & Field Ground-Truth Verification
- **Dual Sign-Off Protocol**: Mandates joint inspection sign-offs from both the Junior Engineer (WDT) and Gram Panchayat Sarpanch before sanctioning funds.
- **Physical Sounding Rod Telemetry**: Records silt depth (meters) and static water level measurements.
- **DPR Generation**: Generates automated Detailed Project Reports with cost estimates per Central Water Commission (CWC) norms.

---

## 5. Implementation Status Matrix

| Module / Component | Implementation Type | Operational Status | Description |
| :--- | :--- | :---: | :--- |
| **National India GIS Extent** | LIVE | **ACTIVE** | Pan-India extent (28 States + 8 UTs + 118 Districts + 12 Basins) |
| **Progressive Zoom Engine** | LIVE | **ACTIVE** | Zoom 4–13+ dynamic vector scaling |
| **Pan-India Location Search** | LIVE | **ACTIVE** | Autocomplete and fly-to navigation across all administrative tiers |
| **Water Body Intelligence** | HYBRID | **ACTIVE** | Multi-temporal Sentinel-2 telemetry + interactive comparison slider |
| **Bhashini Voice Pipeline** | HYBRID | **ACTIVE** | Bhashini ULCA API with Web Speech API browser fallback |
| **Signboard OCR Engine** | LIVE | **ACTIVE** | In-browser Tesseract.js OCR with field matching against registry |
| **SHA-256 Evidence Chain** | LIVE | **ACTIVE** | Merkle-style cryptographic audit log for all case events |
| **Dual Ground Verification** | LIVE | **ACTIVE** | Field inspection workflow with JE and Sarpanch digital signatures |
| **DPR / Work Order Export** | LIVE | **ACTIVE** | Instant print-ready engineering DPRs conforming to PMKSY-WDC 2.0 |
| **RUSLE Soil Erosion Engine**| LIVE | **ACTIVE** | Standard empirical soil loss modeling ($A = R \cdot K \cdot LS \cdot C \cdot P$) |
| **Supabase PostgreSQL** | HYBRID | **CONFIGURED** | Direct PostgreSQL persistence with in-memory offline fallback |
| **ISRO Bhuvan OGC Services** | HYBRID | **CONFIGURED** | Bhuvan WMS / Thematic layers with OpenStreetMap baseline |

---

## 6. Installation & Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/samelijah14122007/elim-springs.git
cd elim-springs

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start local development server
npm run dev
```

The application will be accessible at: **`http://localhost:5173/`**

### Building for Production

```bash
# Type check and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 7. Environment Variables Reference

Copy `.env.example` to `.env` to configure external service credentials. **Never commit `.env` to version control.**

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | Optional | `https://your-project.supabase.co` | Supabase project endpoint |
| `VITE_SUPABASE_ANON_KEY` | Optional | `your-anon-key` | Client-side public Supabase key |
| `BHASHINI_UDYAT_KEY` | Optional | `your-udyat-key` | Bhashini ULCA authentication |
| `BHASHINI_INFERENCE_KEY` | Optional | `your-inference-key` | Bhashini ASR/NMT translation key |
| `BHUVAN_WMS_URL` | Optional | `https://bhuvan-ras2.nrsc.gov.in/...` | ISRO Bhuvan OGC WMS endpoint |
| `NASA_API_KEY` | Optional | `your-nasa-key` | NASA Earth observation data access |

*Note: ELIM SPRINGS contains integrated mock datasets and intelligent local fallbacks, allowing full functionality even when external cloud credentials are not supplied.*

---

## 8. Development Timeline (September 5–28, 2026)

- **Sept 5, 2026**: Project initialization, core data structures, and foundational design system.
- **Sept 6, 2026**: Pan-India geospatial architecture (28 States, 8 UTs, 12 Major Basins).
- **Sept 7, 2026**: Geo-coded evidence data models and asset-evidence relationships.
- **Sept 8, 2026**: Supabase PostgreSQL database integration and client adapters.
- **Sept 9, 2026**: EXIF geo-photo extraction and tamper-check validation.
- **Sept 10, 2026**: In-browser OCR extraction for government watershed signboards.
- **Sept 11, 2026**: Multilingual IVR citizen grievance voice recording workflow.
- **Sept 12, 2026**: Bhashini 23-language translation and entity extraction pipeline.
- **Sept 13, 2026**: PMKSY-WDC 2.0 watershed guidelines knowledge base and RAG layer.
- **Sept 14, 2026**: AI Geo-Agent multi-stream reasoning engine.
- **Sept 15, 2026**: Cryptographic SHA-256 evidence chain of custody.
- **Sept 16, 2026**: Earth observation architecture and Sentinel-2 reflectance pipelines.
- **Sept 17, 2026**: Multi-spectral NDWI, NDVI, and LULC transition analysis.
- **Sept 18, 2026**: RUSLE empirical catchment soil erosion risk modeling.
- **Sept 19, 2026**: Dual-signatory field ground-truth verification workflow.
- **Sept 20, 2026**: Case management lifecycle and prioritisation queue.
- **Sept 21, 2026**: Automated Detailed Project Report (DPR) generation engine.
- **Sept 22, 2026**: ISRO Bhuvan WMS / WMTS thematic integration and tile service.
- **Sept 23, 2026**: Pan-India national search across all 7 administrative tiers.
- **Sept 24, 2026**: Comprehensive 23-language localization and accessibility audit.
- **Sept 25, 2026**: Institutional dark & light theme design system.
- **Sept 26, 2026**: Executive command center dashboard with 4-section layout.
- **Sept 27, 2026**: Dedicated Water Body Intelligence page with 13 analytical sections.
- **Sept 28, 2026**: Full QA suite, build verification, and SIH-ready release.

---

## 9. Security & Compliance

- **No Secrets in Code**: Environment credentials are isolated in local `.env` files protected by `.gitignore`.
- **Zero Hallucination Surface Metrics**: Surface water area reports explicitly state sensor resolution and declare that volumetric calculation requires bathymetric surveys.
- **Cryptographic Auditability**: Case milestones (from citizen grievance to DPR sanction) are cryptographically linked using SHA-256 hashes.
- **Dual-Control Governance**: Digital sign-offs prevent unilateral fund sanctioning without local panchayat verification.

---

## 10. License

Developed for **Smart India Hackathon 2026 (PS 26015)**. Distributed under the MIT License.
