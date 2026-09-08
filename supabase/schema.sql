-- ==============================================================================
-- ELIM SPRINGS — MASTER SUPABASE SQL SCHEMA (SIH 2026 - PS 26015)
-- "From Field Voices to Watershed Action"
-- Run this entire script in Supabase SQL Editor to set up the database.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not enabled; proceeding with standard JSONB embeddings.';
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
-- 1. PROFILES
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

-- ==============================================================================
-- 2. STATES
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
-- 3. DISTRICTS
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
-- 4. WATERSHEDS
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

-- ==============================================================================
-- 5. MICRO_WATERSHEDS
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
-- 6. ASSETS
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
CREATE INDEX IF NOT EXISTS idx_assets_code ON public.assets(asset_code);

-- ==============================================================================
-- 7. EVIDENCE
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

-- ==============================================================================
-- 8. GEO_PHOTOS
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

-- ==============================================================================
-- 9. VOICE_REPORTS
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

-- ==============================================================================
-- 10. OCR_RESULTS
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

-- ==============================================================================
-- 11. SATELLITE_OBSERVATIONS
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

-- ==============================================================================
-- 12. RAG_DOCUMENTS
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
-- 13. RAG_CHUNKS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rag_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.rag_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_reference TEXT,
    topic TEXT,
    embedding JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 14. CASES
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

-- ==============================================================================
-- 15. AI_ANALYSES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
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

-- ==============================================================================
-- 16. EVIDENCE_CHAIN_EVENTS
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

-- ==============================================================================
-- 17. FIELD_VERIFICATIONS
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

-- ==============================================================================
-- 18. REPORTS
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

-- ==============================================================================
-- STORAGE BUCKETS & RLS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('geo-images', 'geo-images', false),
    ('voice-reports', 'voice-reports', false),
    ('documents', 'documents', false),
    ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
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

-- Read Policies
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

-- Insert/Update Policies
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
