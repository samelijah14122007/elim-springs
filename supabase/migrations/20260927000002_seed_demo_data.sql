-- ==============================================================================
-- ELIM SPRINGS — DEMO SEED DATA (SIH 2026 - PS 26015)
-- "From Field Voices to Watershed Action"
-- Migration: 20260927000002_seed_demo_data.sql
-- ==============================================================================
-- NOTE: ALL DATA IN THIS FILE IS DEMO / PROTOTYPE DATA 
-- PRESERVING THE FLAGSHIP RUI EAST CHECK DAM #4 SCENARIO
-- ==============================================================================

-- 1. Profiles
INSERT INTO public.profiles (id, full_name, email, role, phone, organization)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Er. S. Patil', 's.patil@wdc.gov.in', 'ENGINEER', '+91 98221 44551', 'Watershed Development Component (WDC) Dharashiv'),
    ('a0000000-0000-0000-0000-000000000002', 'Ramesh Shinde', 'ramesh.shinde@ruralmail.in', 'CITIZEN', '+91 98234 11209', 'Rui Village Farmer Community'),
    ('a0000000-0000-0000-0000-000000000003', 'Sarpanch Gram Panchayat Rui', 'sarpanch.rui@gp.maharashtra.gov.in', 'GRAM_PANCHAYAT', '+91 94220 88712', 'Gram Panchayat Rui, Dharashiv'),
    ('a0000000-0000-0000-0000-000000000004', 'Dr. V. Rao', 'comm.watershed@maharashtra.gov.in', 'STATE_COMMISSIONER', '+91 98220 12345', 'State Watershed Development Mission')
ON CONFLICT (id) DO NOTHING;

-- 2. State (Maharashtra, Andhra Pradesh, Karnataka)
INSERT INTO public.states (id, name, code, state_type)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Maharashtra', 'MH', 'STATE'),
    ('b0000000-0000-0000-0000-000000000002', 'Andhra Pradesh', 'AP', 'STATE'),
    ('b0000000-0000-0000-0000-000000000003', 'Karnataka', 'KA', 'STATE')
ON CONFLICT (code) DO NOTHING;

-- 3. Districts
INSERT INTO public.districts (id, state_id, name, code)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Dharashiv', 'DHR'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Anantapur', 'ATP'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Chikkaballapura', 'CBP')
ON CONFLICT (id) DO NOTHING;

-- 4. Watersheds
INSERT INTO public.watersheds (id, district_id, name, code, description, area_sq_km, latitude, longitude, status)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Upper Sina - Ter Basin', 'ws-dharashiv-ter', 'Upper Sina River tributary basin with severe post-monsoon depletion and high soil erosion.', 48.5, 18.2372, 75.9845, 'ACTIVE'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Kalyandurg Micro-Basin', 'ws-anantapur-kd', 'Rayalaseema drought-prone watershed requiring deep recharge structures.', 36.2, 14.5510, 77.1080, 'ACTIVE'),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Alipura Granitic Watershed', 'ws-chikka-ali', 'Granite basement micro-catchment with localized check dams.', 29.8, 13.6210, 77.7120, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 5. Micro-Watersheds
INSERT INTO public.micro_watersheds (id, watershed_id, name, code, area_sq_km, latitude, longitude)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Rui Micro-Watershed 4B1C2d3', '4B1C2d3', 12.8, 18.2372, 75.9845),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Dhoki Micro-Watershed 4B1C2d4', '4B1C2d4', 15.4, 18.2110, 75.9420)
ON CONFLICT (code) DO NOTHING;

-- 6. Assets (Preserving all 4 demo scenarios)
INSERT INTO public.assets (id, micro_watershed_id, asset_code, name, asset_type, scheme, construction_year, latitude, longitude, elevation, sanction_cost, pondage_capacity, current_condition, siltation_percent, status)
VALUES
    -- Flagship Rui East Check Dam #4
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'MH-DHR-2024-CD-04', 'Rui East Check Dam #4', 'CHECK_DAM', 'PMKSY-WDC 2.0', 2022, 18.2372, 75.9845, 620, 480000, 18500, 'Heavy Siltation & Minor Apron Scour', 68.0, 'NEEDS_MAINTENANCE'),
    -- Dhoki Percolation Tank
    ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'MH-DHR-2023-PT-02', 'Dhoki Percolation Tank', 'PERCOLATION_TANK', 'MGNREGA', 2021, 18.2110, 75.9420, 605, 1200000, 45000, 'Operational with Moderate Silt', 32.0, 'OPERATIONAL'),
    -- Kalyandurg Check Dam #1
    ('f0000000-0000-0000-0000-000000000003', NULL, 'AP-ATP-2022-CD-01', 'Kalyandurg Check Dam #1', 'CHECK_DAM', 'PMKSY-WDC 2.0', 2020, 14.5510, 77.1080, 580, 420000, 14000, 'Good Condition', 15.0, 'OPERATIONAL'),
    -- Alipura Masonry Check Dam
    ('f0000000-0000-0000-0000-000000000004', NULL, 'KA-CBP-2023-MCD-01', 'Alipura Masonry Check Dam', 'MASONRY_CHECK_DAM', 'State Watershed Dept', 2019, 13.6210, 77.7120, 690, 650000, 22000, 'Minor Wall Crack Noted', 28.0, 'OPERATIONAL')
ON CONFLICT (asset_code) DO NOTHING;

-- 7. Evidence Records (Rui East Dam #4 multi-source evidence)
INSERT INTO public.evidence (id, asset_id, watershed_id, micro_watershed_id, evidence_type, source, title, description, latitude, longitude, captured_at, status, integrity_hash)
VALUES
    -- Evidence 1: Sentinel-2 EO Anomaly
    ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'SATELLITE_OBSERVATION', 'Sentinel-2 Multispectral Instrument', 'Water Persistence & NDWI Depletion Alert', 'Sentinel-2 post-monsoon imagery indicates surface water retention dropped by 58% compared to historical baseline. Silt accumulation suspected.', 18.2372, 75.9845, NOW() - INTERVAL '14 days', 'VERIFIED', '0x8f41c9b207e4d82f71092a7e28941bb02998f41c9b207e4d82f71092a7e28941'),
    
    -- Evidence 2: Citizen Voice Hotline (1800-ELIM-WATER)
    ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'VOICE_REPORT', '1800-ELIM-WATER Citizen Hotline', 'Citizen Call: Rui Check Dam Silt Blockage', 'Inbound call from farmer Ramesh Shinde reporting that check dam 4 is filled with black silt up to the spillway crest, preventing water percolation into downstream open wells.', 18.2370, 75.9842, NOW() - INTERVAL '10 days', 'VERIFIED', '0x9a32c7104b281f9e8024d9c72e410b28491823a890471b0293481092471b0284'),
    
    -- Evidence 3: Geo-coded Field Photograph
    ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'GEO_PHOTO', 'Field Worker Mobile App', 'Upstream Reservoir Bed Siltation Photo', 'High-resolution field photograph showing 1.2m deep silt bed, dry pond area, and visible information plaque on the right abutment wall.', 18.2372, 75.9845, NOW() - INTERVAL '7 days', 'VERIFIED', '0x4f129a02938471b0293481092471b028491823a890471b0293481092471b0284'),

    -- Evidence 4: OCR Extraction from Information Board
    ('10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'OCR_DOCUMENT', 'OCR Plaque Recognition Engine', 'Government Information Plaque Audit', 'OCR extracted text: Scheme PMKSY-WDC 2.0, Work Code MH-DHR-2024-CD-04, Sanction INR 4.80 Lakh. Verified against official registry with 94.2% match.', 18.2372, 75.9845, NOW() - INTERVAL '7 days', 'VERIFIED', '0x3c21a890471b0293481092471b028491823a890471b0293481092471b0284f12')
ON CONFLICT (id) DO NOTHING;

-- 8. Geo Photos Specific Data
INSERT INTO public.geo_photos (id, evidence_id, asset_id, storage_path, latitude, longitude, altitude, azimuth, gps_accuracy, captured_at, device, condition, damage_assessment, exif_verified, tamper_check_status)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'geo-images/rui-check-dam-04-silt.jpg', 18.2372, 75.9845, 620.4, 42.0, 3.2, NOW() - INTERVAL '7 days', 'Samsung Galaxy M32 (GPS Glonass)', 'Heavy Siltation', 'Requires mechanical de-siltation of 6,200 cu.m and masonry apron joint grouting.', true, 'VERIFIED')
ON CONFLICT (id) DO NOTHING;

-- 9. Voice Reports Specific Data
INSERT INTO public.voice_reports (id, evidence_id, caller_id, storage_path, language, duration_seconds, transcript, translation, issue_category, urgency, latitude, longitude, structured_report, processing_status)
VALUES
    ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '+91 98234 11209', 'voice-reports/ivr-call-98234-marathi.wav', 'Marathi', 45, 'नमस्कार, मी रुई गावातील शेतकरी रमेश शिंदे बोलतोय. आपल्या पूर्व बाजूच्या चेक डॅम क्रमांक ४ मध्ये काळी माती पूर्ण भरली आहे. पाणी साठत नाही आणि विहिरी कोरड्या पडत आहेत. कृपया गाळ काढण्याची सोय करा.', 'Hello, I am Ramesh Shinde, a farmer from Rui village. Check Dam No. 4 on the eastern side is completely filled with black silt. Water is not holding and nearby wells are drying up. Please arrange for silt removal.', 'Siltation & Storage Impairment', 'Critical', 18.2370, 75.9842, '{"structure": "Check Dam #4", "village": "Rui", "issue": "Heavy Siltation", "severity": "CRITICAL"}'::jsonb, 'TRANSCRIBED')
ON CONFLICT (id) DO NOTHING;

-- 10. OCR Results Specific Data
INSERT INTO public.ocr_results (id, evidence_id, asset_id, work_code, scheme_name, sanction_cost, structure_type, ocr_confidence, registry_match_status, registry_reference, discrepancy_description)
VALUES
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'MH-DHR-2024-CD-04', 'PMKSY-WDC 2.0', 480000, 'Check Dam (Cement Nala Bund)', 0.942, 'MATCH', 'PMKSY-WDC-2022-MH-DHR-0842', 'All fields match official Dharashiv WDC registry records.')
ON CONFLICT (id) DO NOTHING;

-- 11. Satellite Observations Specific Data
INSERT INTO public.satellite_observations (id, asset_id, watershed_id, source, product, acquisition_date, cloud_cover, resolution_m, ndvi_mean, ndvi_min, ndvi_max, ndwi_mean, water_area_ha, change_summary, anomaly_status, observation_status)
VALUES
    ('50000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Copernicus Sentinel-2', 'L2A Surface Reflectance (Simulated Prototype)', NOW() - INTERVAL '14 days', 1.2, 10.0, 0.28, 0.12, 0.45, -0.15, 0.42, 'Rapid water persistence dry-down between post-monsoon and winter acquisition.', 'HIGH_ANOMALY', 'VERIFIED')
ON CONFLICT (id) DO NOTHING;

-- 12. RAG Documents (Government Manuals)
INSERT INTO public.rag_documents (id, title, publisher, document_type, version, source_reference, status)
VALUES
    ('60000000-0000-0000-0000-000000000001', 'PMKSY-WDC 2.0 Operational Guidelines', 'Department of Land Resources (DoLR), MoRD', 'GUIDELINES', '2.0 (2021)', 'DoLR/WDC-PMKSY/2021/04', 'ACTIVE'),
    ('60000000-0000-0000-0000-000000000002', 'MGNREGA Natural Resource Management Manual', 'Ministry of Rural Development (MoRD)', 'TECHNICAL_MANUAL', '2023', 'MoRD/NRM/Vol-III', 'ACTIVE'),
    ('60000000-0000-0000-0000-000000000003', 'Manual on Artificial Recharge of Ground Water', 'Central Ground Water Board (CGWB)', 'TECHNICAL_MANUAL', '2020', 'CGWB/MoJS/2020/AR', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 13. RAG Chunks (Statutory Clauses)
INSERT INTO public.rag_chunks (id, document_id, content, page_reference, topic)
VALUES
    ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Clause 6.1.4: Maintenance and De-siltation Norms. Check dams and percolation tanks experiencing >50% storage capacity loss due to siltation must be surveyed by the WDT Civil Engineer. Convergence funding under PMKSY Maintenance Head or MGNREGA de-silting is mandatory before next monsoon.', 'Page 48, Section 6.1', 'De-siltation & Maintenance'),
    ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', 'Section 4.3: Drainage Line Treatment. Cement nala bunds and gully plugs must follow the ridge-to-valley sequence. Silt traps and vegetative vegetative barriers must be installed upstream of check dams to arrest black cotton soil run-off.', 'Page 32, Section 4.3', 'Ridge to Valley Treatment'),
    ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', 'Chapter 7: Artificial Recharge in Basaltic Terrains. Deccan Trap basalts require desilted reservoir beds to expose vesicular horizons and joint planes that facilitate vertical percolation into the unconfined aquifer.', 'Page 76, Chapter 7', 'Basalt Hydrogeology & Recharge')
ON CONFLICT (id) DO NOTHING;

-- 14. Cases (Core Case ES-2026-0842)
INSERT INTO public.cases (id, case_number, asset_id, watershed_id, micro_watershed_id, created_from_evidence_id, title, description, priority, status, assigned_to, reported_at, sla_due_at)
VALUES
    ('80000000-0000-0000-0000-000000000001', 'ES-2026-0842', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Rui East Check Dam #4 Siltation & Storage Impairment', 'Multi-modal detection uniting Sentinel-2 NDWI deficit, citizen IVR call in Marathi, and field photo confirming 68% reservoir siltation and minor apron scour.', 'CRITICAL', 'FIELD_VERIFICATION_DISPATCHED', 'Er. S. Patil (WDT Civil)', NOW() - INTERVAL '6 days', NOW() + INTERVAL '3 days')
ON CONFLICT (case_number) DO NOTHING;

-- 15. AI Analysis Transcript
INSERT INTO public.ai_analyses (id, asset_id, case_id, analysis_type, question, observations, reported_evidence, guidance, interpretation, verification_required, confidence, evidence_coverage)
VALUES
    ('90000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'MULTI_SOURCE_DIAGNOSTIC', 'Evaluate failure modes and statutory compliance for Rui East Check Dam #4', '{"satellite": "NDWI persistence dropped 58%", "field_photo": "1.2m silt bed visible", "ocr": "Scheme PMKSY-WDC 2.0 match confirmed"}'::jsonb, '{"ivr_caller": "Ramesh Shinde", "language": "Marathi", "issue": "Check Dam #4 Siltation"}'::jsonb, '{"pmksy_clause": "6.1.4 Mandatory Desiltation", "fund_head": "Convergence MGNREGA/WDC"}'::jsonb, 'Strong multi-source convergence indicates 68% storage loss. Immediate mechanical desilting and apron scour protection recommended under PMKSY-WDC 2.0 Section 6.1.', true, 0.94, 0.88)
ON CONFLICT (id) DO NOTHING;

-- 16. Evidence Chain Events (Cryptographic SHA-256 Ledger)
INSERT INTO public.evidence_chain_events (id, evidence_id, case_id, event_type, actor_id, event_data, previous_hash, current_hash, status)
VALUES
    ('a1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'CITIZEN_REPORT', '1800-ELIM-WATER IVR Pipeline', '{"action": "Genesis Voice Call Logged", "caller": "Ramesh Shinde", "village": "Rui"}'::jsonb, '0000000000000000000000000000000000000000000000000000000000000000', '0x8f41c9b207e4d82f71092a7e28941bb02998f41c9b207e4d82f71092a7e28941', 'VERIFIED'),
    ('a1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000001', 'OCR_MATCH', 'OCR Registry Audit Service', '{"action": "Plaque Text Matched", "code": "MH-DHR-2024-CD-04", "confidence": 0.942}'::jsonb, '0x8f41c9b207e4d82f71092a7e28941bb02998f41c9b207e4d82f71092a7e28941', '0x9a32c7104b281f9e8024d9c72e410b28491823a890471b0293481092471b0284', 'VERIFIED'),
    ('a1000000-0000-0000-0000-000000000003', NULL, '80000000-0000-0000-0000-000000000001', 'AI_DIAGNOSTIC', 'ELIM SPRINGS AI Geo Agent', '{"action": "Multi-Source Reasoning Completed", "scheme": "PMKSY-WDC 2.0"}'::jsonb, '0x9a32c7104b281f9e8024d9c72e410b28491823a890471b0293481092471b0284', '0x4f129a02938471b0293481092471b028491823a890471b0293481092471b0284', 'VERIFIED'),
    ('a1000000-0000-0000-0000-000000000004', NULL, '80000000-0000-0000-0000-000000000001', 'FIELD_VERIFICATION', 'Er. S. Patil & Sarpanch Rui', '{"action": "Ground Inspection Verified", "silt_confirmed": "68%", "outcome": "REQUIRES_MAINTENANCE"}'::jsonb, '0x4f129a02938471b0293481092471b028491823a890471b0293481092471b0284', '0x3c21a890471b0293481092471b028491823a890471b0293481092471b0284f12', 'VERIFIED')
ON CONFLICT (id) DO NOTHING;

-- 17. Field Verifications (Dual Sign-Off)
INSERT INTO public.field_verifications (id, case_id, asset_id, inspector_id, verification_date, latitude, longitude, gps_accuracy, observed_condition, measurements, notes, checklist, engineer_signoff, sarpanch_signoff, outcome)
VALUES
    ('b1000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days', 18.2372, 75.9845, 2.8, 'Severe silt bed of 1.25m depth. Apron joint sealant degraded by 30%. Headwall structurally intact.', '{"silt_depth_m": 1.25, "silt_volume_cum": 6200, "apron_crack_length_m": 4.5, "freeboard_m": 0.4}'::jsonb, 'De-silting required before June 2026 monsoon. Gram Panchayat passed resolution for MGNREGA labor convergence.', '{"silt_inspected": true, "weir_wall_intact": true, "apron_inspected": true, "downstream_wells_checked": true}'::jsonb, '{"signed": true, "name": "Er. S. Patil", "designation": "WDT Civil Engineer", "timestamp": "2026-09-25T14:30:00Z"}'::jsonb, '{"signed": true, "name": "Gram Panchayat Sarpanch", "village": "Rui", "resolution_no": "GP/RUI/2026/89"}'::jsonb, 'REQUIRES_MAINTENANCE')
ON CONFLICT (id) DO NOTHING;

-- 18. Reports (DPR Requisition Engine)
INSERT INTO public.reports (id, case_id, asset_id, report_type, title, summary, scorecard_grade, dpr_estimate, report_data, generated_by)
VALUES
    ('c1000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'DPR', 'Detailed Project Report (DPR): Drainage Line Treatment & Reservoir De-siltation at Rui East Check Dam #4', 'Statutory proposal for mechanical desiltation of 6,200 cu.m and apron scour restoration under PMKSY-WDC 2.0 Convergence Head.', 'B+', '{"estimatedCostInr": 320000, "expectedWaterRetentionCuM": 15000, "beneficiaryFarmers": 42, "commandAreaHa": 65, "convergenceScheme": "MGNREGA / PMKSY-WDC 2.0"}'::jsonb, '{"caseNumber": "ES-2026-0842", "assetCode": "MH-DHR-2024-CD-04", "engineerSignoff": "Er. S. Patil", "sarpanchSignoff": "Sarpanch Rui GP"}'::jsonb, 'Er. S. Patil (WDT Civil)')
ON CONFLICT (id) DO NOTHING;
