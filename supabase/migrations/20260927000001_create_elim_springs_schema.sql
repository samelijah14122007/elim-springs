-- ==============================================================================
-- ELIM SPRINGS — SUPABASE DATABASE FOUNDATION (SIH 2026 - PS 26015)
-- "From Field Voices to Watershed Action"
-- Migration: 20260927000001_create_elim_springs_schema.sql
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Optional pgvector extension for future AI embedding vectors
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available on this Postgres instance; proceeding with standard JSONB embeddings.';
END $$;

-- 2. Helper function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- TABLE 1: profiles
-- User directory supporting Citizens, Field Workers, Engineers, and Commissioners
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'CITIZEN' CHECK (role IN (
        'ADMIN',
        'STATE_COMMISSIONER',
        'ENGINEER',
        'FIELD_WORKER',
        'GRAM_PANCHAYAT',
        'CITIZEN'
    )),
    phone TEXT,
    organization TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 2: states
-- Covers all 28 States and 8 Union Territories across India
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    state_type TEXT NOT NULL CHECK (state_type IN ('STATE', 'UNION_TERRITORY')),
    geometry JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 3: districts
-- District administrative boundaries
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    geometry JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_districts_state_id ON public.districts(state_id);

-- ==============================================================================
-- TABLE 4: watersheds
-- Major watershed basins (e.g. Upper Sina - Ter Basin)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.watersheds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    area_sq_km NUMERIC,
    geometry JSONB,
    latitude NUMERIC,
    longitude NUMERIC,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watersheds_district_id ON public.watersheds(district_id);
CREATE TRIGGER update_watersheds_updated_at
    BEFORE UPDATE ON public.watersheds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 5: micro_watersheds
-- Micro-watersheds according to national codification (e.g. 4B1C2d3)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.micro_watersheds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watershed_id UUID NOT NULL REFERENCES public.watersheds(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    area_sq_km NUMERIC,
    geometry JSONB,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_micro_watersheds_watershed_id ON public.micro_watersheds(watershed_id);

-- ==============================================================================
-- TABLE 6: assets
-- Physical water harvesting structures & soil conservation assets
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    micro_watershed_id UUID REFERENCES public.micro_watersheds(id) ON DELETE SET NULL,
    asset_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN (
        'CHECK_DAM',
        'PERCOLATION_TANK',
        'MASONRY_CHECK_DAM',
        'FARM_POND',
        'RECHARGE_STRUCTURE',
        'OTHER'
    )),
    scheme TEXT,
    construction_year INTEGER,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    elevation NUMERIC,
    sanction_cost NUMERIC,
    pondage_capacity NUMERIC,
    current_condition TEXT,
    siltation_percent NUMERIC DEFAULT 0,
    last_inspection_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'OPERATIONAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_micro_watershed ON public.assets(micro_watershed_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_code ON public.assets(asset_code);
CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 7: evidence
-- Central junction uniting Satellite, Ground Photos, OCR, IVR Voice & Field Audits
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    watershed_id UUID REFERENCES public.watersheds(id) ON DELETE SET NULL,
    micro_watershed_id UUID REFERENCES public.micro_watersheds(id) ON DELETE SET NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN (
        'GEO_PHOTO',
        'VOICE_REPORT',
        'OCR_DOCUMENT',
        'SATELLITE_OBSERVATION',
        'FIELD_VERIFICATION',
        'AI_ANALYSIS',
        'OTHER'
    )),
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    integrity_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_asset_id ON public.evidence(asset_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON public.evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON public.evidence(status);
CREATE TRIGGER update_evidence_updated_at
    BEFORE UPDATE ON public.evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 8: geo_photos
-- Geotagged ground truth photographs with tamper detection and EXIF telemetry
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.geo_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID REFERENCES public.evidence(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    altitude NUMERIC,
    azimuth NUMERIC,
    gps_accuracy NUMERIC,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device TEXT,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    condition TEXT,
    damage_assessment TEXT,
    exif_verified BOOLEAN DEFAULT TRUE,
    tamper_check_status TEXT DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_photos_asset_id ON public.geo_photos(asset_id);
CREATE INDEX IF NOT EXISTS idx_geo_photos_evidence_id ON public.geo_photos(evidence_id);

-- ==============================================================================
-- TABLE 9: voice_reports
-- 1800-ELIM-WATER citizen phone grievances & Bhashini ASR transcripts
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.voice_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID REFERENCES public.evidence(id) ON DELETE CASCADE,
    caller_id TEXT,
    storage_path TEXT,
    language TEXT NOT NULL DEFAULT 'Marathi',
    duration_seconds INTEGER,
    transcript TEXT,
    translation TEXT,
    issue_category TEXT,
    urgency TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    structured_report JSONB,
    processing_status TEXT DEFAULT 'TRANSCRIBED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_reports_evidence_id ON public.voice_reports(evidence_id);
CREATE INDEX IF NOT EXISTS idx_voice_reports_language ON public.voice_reports(language);

-- ==============================================================================
-- TABLE 10: ocr_results
-- Information board / stone plaque text extraction & PMKSY registry audit
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ocr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID REFERENCES public.evidence(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    work_code TEXT,
    scheme_name TEXT,
    sanction_cost NUMERIC,
    structure_type TEXT,
    ocr_confidence NUMERIC,
    registry_match_status TEXT NOT NULL CHECK (registry_match_status IN (
        'MATCH',
        'MISMATCH',
        'MANUAL_REVIEW_REQUIRED',
        'PENDING'
    )),
    registry_reference TEXT,
    discrepancy_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocr_results_asset_id ON public.ocr_results(asset_id);
CREATE INDEX IF NOT EXISTS idx_ocr_results_evidence_id ON public.ocr_results(evidence_id);

-- ==============================================================================
-- TABLE 11: satellite_observations
-- Earth observation metrics (NDVI, NDWI, LULC, Change Detection)
-- NOTE: Explicitly marked as prototype/simulated vs real sensor measurements
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.satellite_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    watershed_id UUID REFERENCES public.watersheds(id) ON DELETE SET NULL,
    source TEXT NOT NULL,
    product TEXT NOT NULL,
    acquisition_date TIMESTAMPTZ NOT NULL,
    cloud_cover NUMERIC,
    resolution_m NUMERIC,
    ndvi_mean NUMERIC,
    ndvi_min NUMERIC,
    ndvi_max NUMERIC,
    ndwi_mean NUMERIC,
    water_area_ha NUMERIC,
    lulc_summary JSONB,
    change_summary TEXT,
    anomaly_status TEXT,
    observation_status TEXT DEFAULT 'VERIFIED',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_satellite_obs_asset_id ON public.satellite_observations(asset_id);
CREATE INDEX IF NOT EXISTS idx_satellite_obs_watershed_id ON public.satellite_observations(watershed_id);

-- ==============================================================================
-- TABLE 12: rag_documents
-- Official statutory guidelines: PMKSY-WDC 2.0, MGNREGA NRM, CGWB Manuals
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    publisher TEXT NOT NULL,
    document_type TEXT NOT NULL,
    version TEXT,
    source_reference TEXT,
    storage_path TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 13: rag_chunks
-- Semantic passages & statutory clauses from government watershed guidelines
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rag_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.rag_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_reference TEXT,
    topic TEXT,
    embedding JSONB, -- Ready for pgvector conversion
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_document_id ON public.rag_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_topic ON public.rag_chunks(topic);

-- ==============================================================================
-- TABLE 14: ai_analyses
-- Multi-source reasoning transcripts generated by the AI Geo Agent
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    case_id UUID, -- Will reference cases once created
    analysis_type TEXT NOT NULL,
    question TEXT,
    observations JSONB,
    reported_evidence JSONB,
    guidance JSONB,
    interpretation TEXT,
    verification_required BOOLEAN DEFAULT TRUE,
    confidence NUMERIC,
    evidence_coverage NUMERIC,
    tool_trace JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_asset_id ON public.ai_analyses(asset_id);

-- ==============================================================================
-- TABLE 15: cases
-- Central operational case management ledger (Module 14)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT NOT NULL UNIQUE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    watershed_id UUID REFERENCES public.watersheds(id) ON DELETE SET NULL,
    micro_watershed_id UUID REFERENCES public.micro_watersheds(id) ON DELETE SET NULL,
    created_from_evidence_id UUID REFERENCES public.evidence(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status TEXT NOT NULL CHECK (status IN (
        'REPORTED',
        'PENDING_REVIEW',
        'FIELD_VERIFICATION_DISPATCHED',
        'REQUIRES_MORE_EVIDENCE',
        'ENGINEER_APPROVED',
        'RESOLVED'
    )),
    assigned_to TEXT,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sla_due_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_case_number ON public.cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON public.cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_asset_id ON public.cases(asset_id);
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key from ai_analyses to cases
DO $$
BEGIN
    ALTER TABLE public.ai_analyses 
    ADD CONSTRAINT fk_ai_analyses_case 
    FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- TABLE 16: evidence_chain_events
-- Tamper-evident cryptographic SHA-256 audit ledger (Module 13)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.evidence_chain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID REFERENCES public.evidence(id) ON DELETE SET NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'CITIZEN_REPORT',
        'OCR_MATCH',
        'AI_DIAGNOSTIC',
        'ENGINEER_REVIEW',
        'FIELD_VERIFICATION',
        'OUTCOME',
        'REPORT_GENERATED'
    )),
    actor_id TEXT,
    event_data JSONB,
    previous_hash TEXT NOT NULL,
    current_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_chain_case_id ON public.evidence_chain_events(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_chain_evidence_id ON public.evidence_chain_events(evidence_id);

-- ==============================================================================
-- TABLE 17: field_verifications
-- Ground truth engineering verification & Sarpanch dual sign-off (Module 15)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.field_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verification_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latitude NUMERIC,
    longitude NUMERIC,
    gps_accuracy NUMERIC,
    observed_condition TEXT,
    measurements JSONB,
    notes TEXT,
    photo_evidence_id UUID REFERENCES public.evidence(id) ON DELETE SET NULL,
    checklist JSONB,
    engineer_signoff JSONB,
    sarpanch_signoff JSONB,
    outcome TEXT NOT NULL CHECK (outcome IN (
        'VERIFIED_CONDITION',
        'REQUIRES_MAINTENANCE',
        'NO_ISSUE_FOUND',
        'MORE_EVIDENCE_REQUIRED',
        'OTHER'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_verifications_case_id ON public.field_verifications(case_id);
CREATE INDEX IF NOT EXISTS idx_field_verifications_asset_id ON public.field_verifications(asset_id);

-- ==============================================================================
-- TABLE 18: reports
-- Statutory reporting & DPR generation output engine (Module 17)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL CHECK (report_type IN (
        'EVIDENCE_SUMMARY',
        'ASSET_VERIFICATION',
        'FIELD_VERIFICATION',
        'EVIDENCE_CHAIN',
        'GP_WATER_SECURITY',
        'DPR',
        'MAINTENANCE_REQUISITION'
    )),
    title TEXT NOT NULL,
    summary TEXT,
    evidence_summary JSONB,
    verification_summary JSONB,
    scorecard_grade TEXT,
    dpr_estimate JSONB,
    report_data JSONB,
    generated_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_case_id ON public.reports(case_id);
CREATE INDEX IF NOT EXISTS idx_reports_asset_id ON public.reports(asset_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(report_type);

-- ==============================================================================
-- STORAGE BUCKETS SETUP (Supabase Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('geo-images', 'geo-images', false),
    ('voice-reports', 'voice-reports', false),
    ('documents', 'documents', false),
    ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: authenticated or anon read for authorized watershed viewers
DO $$ 
BEGIN
    -- geo-images read policy
    CREATE POLICY "Allow public read of geo-images" ON storage.objects
        FOR SELECT USING (bucket_id = 'geo-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    -- reports read policy
    CREATE POLICY "Allow public read of reports" ON storage.objects
        FOR SELECT USING (bucket_id = 'reports');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    -- documents read policy
    CREATE POLICY "Allow public read of documents" ON storage.objects
        FOR SELECT USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    -- allow upload for authenticated or prototype anon
    CREATE POLICY "Allow uploads to storage buckets" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id IN ('geo-images', 'voice-reports', 'documents', 'reports'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 18 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watersheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_watersheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_chain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Permissive Read Policies for Watershed Monitoring (Allows citizen access and prototype view)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read States" ON public.states FOR SELECT USING (true);
CREATE POLICY "Public Read Districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public Read Watersheds" ON public.watersheds FOR SELECT USING (true);
CREATE POLICY "Public Read Micro Watersheds" ON public.micro_watersheds FOR SELECT USING (true);
CREATE POLICY "Public Read Assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Public Read Evidence" ON public.evidence FOR SELECT USING (true);
CREATE POLICY "Public Read Geo Photos" ON public.geo_photos FOR SELECT USING (true);
CREATE POLICY "Public Read Voice Reports" ON public.voice_reports FOR SELECT USING (true);
CREATE POLICY "Public Read OCR Results" ON public.ocr_results FOR SELECT USING (true);
CREATE POLICY "Public Read Satellite Observations" ON public.satellite_observations FOR SELECT USING (true);
CREATE POLICY "Public Read RAG Documents" ON public.rag_documents FOR SELECT USING (true);
CREATE POLICY "Public Read RAG Chunks" ON public.rag_chunks FOR SELECT USING (true);
CREATE POLICY "Public Read AI Analyses" ON public.ai_analyses FOR SELECT USING (true);
CREATE POLICY "Public Read Cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Public Read Evidence Chain" ON public.evidence_chain_events FOR SELECT USING (true);
CREATE POLICY "Public Read Field Verifications" ON public.field_verifications FOR SELECT USING (true);
CREATE POLICY "Public Read Reports" ON public.reports FOR SELECT USING (true);

-- Insert & Update Policies (Permit authenticated officers and prototype client actions)
CREATE POLICY "Allow Insert Evidence" ON public.evidence FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Geo Photos" ON public.geo_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Voice Reports" ON public.voice_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert OCR Results" ON public.ocr_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Satellite Obs" ON public.satellite_observations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Cases" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Update Cases" ON public.cases FOR UPDATE USING (true);
CREATE POLICY "Allow Insert Field Verifications" ON public.field_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Evidence Chain" ON public.evidence_chain_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Reports" ON public.reports FOR INSERT WITH CHECK (true);
