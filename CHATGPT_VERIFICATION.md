# ELIM SPRINGS — SYSTEM ARCHITECTURE & VERIFICATION GUIDE
## Smart India Hackathon (SIH 2026) | Problem Statement PS 26015
> **"From Field Voices to Watershed Action"**  
> *Application of Geospatial Techniques for visualization and analysis to interpret Geo-Coded Images to enhance watershed Development Outcomes.*

---

## 1. Executive Summary

**ELIM SPRINGS** is a full-stack Indian GovTech, ClimateTech, and GeoAI platform designed for the **Department of Land Resources (DoLR), Ministry of Rural Development, Government of India**, under the **PMKSY-WDC 2.0 (Watershed Development Component of Pradhan Mantri Krishi Sinchayee Yojana)** framework.

The platform bridges the gap between grassroots community observations and verified civil watershed engineering. It ingests:
1. **Multilingual Voice Reports (IVR)** in 22 scheduled Indian languages + English via **Bhashini ULCA / ASR**.
2. **Primary Field Evidence Geo-Photos** with EXIF GPS parsing, hardware camera validation, SHA-256 cryptographic hashing, and signboard OCR extraction (**Tesseract.js**).
3. **Multi-Spectral Satellite Observations** (**Sentinel-2 MSI 10m L2A BOA**, **NASA POWER Agro-Climatology**, and **ISRO Bhuvan WMS**) for NDVI canopy vigor, NDWI surface water spread, and temporal change detection.
4. **Soil Erosion Analytics (RUSLE)** using ICAR-NBSS&LUP standards ($A = R \times K \times LS \times C \times P$) alongside physical ground void measurements ($V = L \times W \times D$, $M = V \times \rho_{\text{bulk}}$).
5. **Cryptographic Ground Truth Evidence Chain** ensuring every case undergoes field sounding-rod verification before Detailed Project Report (DPR) generation and work order sanctioning.

---

## 2. Technology Stack & Architecture

| Layer | Technologies Used | Primary Responsibilities |
|---|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 8, Tailwind CSS | High-performance single page application, dark-mode geospatial UI, Figma-grade design system |
| **Geospatial Mapping** | Leaflet, Leaflet-WMS, Proj4, GeoJSON | Pan-India 10-level hierarchy, 25 thematic layers, Strahler stream networks (Orders 1–4) |
| **Backend & Database** | Supabase PostgreSQL, Supabase Storage, Row-Level Security (RLS) | Relational persistence for profiles, voice reports, geo-photos, evidence chain, cases, DPRs |
| **Python GeoAI Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic, Shapely, GeoPandas | Fast geospatial computations, buffer calculations, polygon containment, raster telemetry |
| **Speech & Language** | Bhashini ULCA / ASR APIs | Dial-in IVR speech-to-text and translation across 23 languages |
| **Computer Vision / OCR** | Tesseract.js | In-browser client OCR extracting scheme names, sanction years, and asset codes from signboards |
| **Earth Observation** | Sentinel-2 L2A, NASA POWER, NASA GIBS, ISRO Bhuvan | Vegetation canopy indices, soil moisture, precipitation climatology, and temporal change detection |
| **Soil Erosion Modeling**| RUSLE Empirical Analytical Model | $A = R \cdot K \cdot LS \cdot C \cdot P$ soil loss estimation with ICAR-NBSS&LUP risk zoning |

---

## 3. Top 10 Core Modules & Verification Proofs

### Module 01: Watershed GIS & Pan-India 10-Level Hierarchy
- **File**: [`src/components/gis/LeafletWatershedMap.tsx`](src/components/gis/LeafletWatershedMap.tsx), [`src/components/common/PanIndiaHierarchyBar.tsx`](src/components/common/PanIndiaHierarchyBar.tsx)
- **Hierarchy**: `INDIA (Nation) → STATE → DISTRICT → BASIN → SUB-BASIN → WATERSHED → MICRO-WATERSHED → VILLAGE/GP → ASSET → GEO-EVIDENCE`.
- **25 Thematic Layers**:
  - *Hydrology*: Basins, Sub-basins, Micro-catchments, Strahler Streams 1-4, Water bodies.
  - *Soil & Remote Sensing*: Soil Erosion Risk (RUSLE), Sentinel-2 NDVI, Sentinel-2 NDWI, Bhuvan LULC 50k, NASA SMAP.
  - *Administrative*: States/UTs, Districts, Talukas, Gram Panchayats, Cadastral Survey Plots.
  - *Assets & Evidence*: Field Geo-Photos, Check Dams, Contour Trenches (CCT), Citizen Voice Reports, Active Cases.
  - *Audit & Terrain*: Ground Truth Audit Marks, AI Geo-Anomalies, ICAR Soil Series, Cartosat 30m Contours, NASA FIRMS.

### Module 02–06: Earth Observation & Multi-Spectral Raster Viewer (Zero Stock Photos)
- **Files**: [`src/views/SatelliteView.tsx`](src/views/SatelliteView.tsx), [`src/components/satellite/SatelliteRasterViewer.tsx`](src/components/satellite/SatelliteRasterViewer.tsx), [`src/components/satellite/ChangeDetectionSlider.tsx`](src/components/satellite/ChangeDetectionSlider.tsx)
- **Verification Rule**: Zero stock or AI-generated mountain photos.
- **Features**: Authentic SVG/raster rendering of Sentinel-2 L2A reflectance bands, true color (RGB), false color (CIR), NDVI continuous heatmaps, and NDWI water spread with interactive pixel crosshairs and temporal change slider (2023 baseline vs. 2025 outcome).

### Module 07–08: Primary Field Geo-Photo Evidence & Signboard OCR
- **Files**: [`src/views/GeoImagesView.tsx`](src/views/GeoImagesView.tsx), [`src/components/geoimages/PhotoInspectorModal.tsx`](src/components/geoimages/PhotoInspectorModal.tsx), [`src/components/geoimages/PhotoUploadModal.tsx`](src/components/geoimages/PhotoUploadModal.tsx)
- **Features**: EXIF parsing, camera hardware inspection, SHA-256 cryptographic hashing, client-side Tesseract OCR entity parsing, and Geo-Photo + Satellite Split Link.

### Module 09–10: Voice IVR & Bhashini Speech Pipeline
- **Files**: [`src/views/IvrReportsView.tsx`](src/views/IvrReportsView.tsx), [`src/services/bhashiniService.ts`](src/services/bhashiniService.ts)
- **Features**: Voice grievance recording, automatic speech recognition (ASR), translation into English, urgency extraction, and automatic case linking.

### Module 11–12: Watershed RAG & AI Geo Agent
- **Files**: [`src/views/RagKnowledgeView.tsx`](src/views/RagKnowledgeView.tsx), [`src/views/AgentView.tsx`](src/views/AgentView.tsx), [`src/services/ragService.ts`](src/services/ragService.ts)
- **Features**: PMKSY-WDC 2.0 operational guidelines index, autonomous multi-tool GIS reasoner.

### Module 13–15: Ground Truth Evidence Chain & Case Management
- **Files**: [`src/views/EvidenceCasesView.tsx`](src/views/EvidenceCasesView.tsx), [`src/services/evidenceService.ts`](src/services/evidenceService.ts)
- **Features**: SHA-256 audit ledger, field sounding-rod verification workflow (reported vs. verified), dual sign-off.

### Module 16–17: Executive Dashboard & Detailed Project Reports (DPR)
- **Files**: [`src/views/DashboardView.tsx`](src/views/DashboardView.tsx), [`src/views/ReportsView.tsx`](src/views/ReportsView.tsx)
- **Features**: 13 geospatial KPIs, downloadable DPRs with engineering bill of quantities (BOQ) and cost-benefit ratios.

### Module 18: Real-World Reference Image Sources Library
- **File**: [`src/components/geoimages/ReferenceImageLibraryModal.tsx`](src/components/geoimages/ReferenceImageLibraryModal.tsx)
- **Features**: Vetted photographic benchmarks for check dam siltation, gully erosion, CCTs, and farm ponds. Strict cryptographic isolation from official evidence chain.

### Module 19: NASA Earth Observation & Agro-Climatology Integration
- **Files**: [`src/services/nasaService.ts`](src/services/nasaService.ts), [`src/components/satellite/NasaDataStatusPanel.tsx`](src/components/satellite/NasaDataStatusPanel.tsx)
- **Features**: Querying NASA POWER API for 30-year precipitation climatology, calculating the RUSLE $R$-factor ($R = 79 + 0.363 \times P$), and displaying NASA Earthdata access matrix with authentication disclosures.

### Module 20: Soil Erosion Analytics & Field Measurements
- **Files**: [`src/services/erosionService.ts`](src/services/erosionService.ts), [`src/components/satellite/SoilErosionAnalyticsPanel.tsx`](src/components/satellite/SoilErosionAnalyticsPanel.tsx), [`src/components/geoimages/FieldErosionMeasurementModal.tsx`](src/components/geoimages/FieldErosionMeasurementModal.tsx)
- **Features**: Transparent RUSLE equation ($A = R \times K \times LS \times C \times P$), land degradation transition matrix, and physical void measurement calculator.

---

## 4. True 23-Indian-Language Support (22 Scheduled + English)

The entire UI is translated across all 23 languages without fallback:
1. **English (en)**
2. **Assamese (as)**
3. **Bengali (bn)**
4. **Bodo (brx)**
5. **Dogri (doi)**
6. **Gujarati (gu)**
7. **Hindi (hi)**
8. **Kannada (kn)**
9. **Kashmiri (ks)**
10. **Konkani (kok)**
11. **Maithili (mai)**
12. **Malayalam (ml)**
13. **Manipuri (mni)**
14. **Marathi (mr)**
15. **Nepali (ne)**
16. **Odia (or)**
17. **Punjabi (pa)**
18. **Sanskrit (sa)**
19. **Santali (sat)**
20. **Sindhi (sd)**
21. **Tamil (ta)**
22. **Telugu (te)**
23. **Urdu (ur)** *(with native RTL text direction)*

---

## 5. Verification Quick Start

### Frontend (React + Vite)
```bash
# 1. Install dependencies
npm install

# 2. Typecheck & Build
npx tsc -b && npm run build

# 3. Start local development server
npm run dev
# URL: http://localhost:5173
```

### Python Geo-AI Backend (FastAPI)
```bash
cd python-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```
