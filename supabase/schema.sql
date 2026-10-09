-- =======================================================
-- ZEINITY CREATOR STUDIO — SUPABASE SCHEMA MIGRATION
-- Database Schema khusus YouTube Shorts Production
-- =======================================================

-- 1. TABEL UTAMA KONTEN (CONTENTS)
CREATE TABLE IF NOT EXISTS contents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'idea',
    pillar VARCHAR(50) NOT NULL,
    format VARCHAR(50) NOT NULL,
    hook_text TEXT,
    publish_date TIMESTAMPTZ,
    production_deadline TIMESTAMPTZ,
    target_duration_sec INT DEFAULT 45,
    target_wpm INT DEFAULT 145,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_pillar ON contents(pillar);
CREATE INDEX IF NOT EXISTS idx_contents_format ON contents(format);
CREATE INDEX IF NOT EXISTS idx_contents_publish_date ON contents(publish_date);

-- 2. TABEL RISET & BUKTI FAKTA (RESEARCH_SOURCES)
CREATE TABLE IF NOT EXISTS research_sources (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    platform_or_topic VARCHAR(255) NOT NULL,
    source_url TEXT,
    source_date DATE,
    event_date DATE,
    claim TEXT NOT NULL,
    evidence_quote TEXT,
    summary TEXT,
    verification_status VARCHAR(50) DEFAULT 'unverified',
    is_official_source BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_content ON research_sources(content_id);

-- 3. TABEL NASKAH & SKRIP (SCRIPTS)
CREATE TABLE IF NOT EXISTS scripts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_id TEXT NOT NULL UNIQUE REFERENCES contents(id) ON DELETE CASCADE,
    stage_hook TEXT DEFAULT '',
    stage_context TEXT DEFAULT '',
    stage_payoff TEXT DEFAULT '',
    stage_ending TEXT DEFAULT '',
    full_script TEXT DEFAULT '',
    version INT DEFAULT 1,
    wpm_pace INT DEFAULT 145,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL STORYBOARD & VISUAL SHOTS (STORYBOARDS)
CREATE TABLE IF NOT EXISTS storyboards (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_id TEXT NOT NULL UNIQUE REFERENCES contents(id) ON DELETE CASCADE,
    shots JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL PRODUCTION CHECKLIST & ASSETS (CHECKLISTS)
CREATE TABLE IF NOT EXISTS checklists (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_id TEXT NOT NULL UNIQUE REFERENCES contents(id) ON DELETE CASCADE,
    vo_recorded BOOLEAN DEFAULT FALSE,
    broll_1080p_ready BOOLEAN DEFAULT FALSE,
    captions_contrast_ok BOOLEAN DEFAULT FALSE,
    safe_zone_verified BOOLEAN DEFAULT FALSE,
    audio_levels_balanced BOOLEAN DEFAULT FALSE,
    music_royalty_free BOOLEAN DEFAULT FALSE,
    first_hour_engagement_plan BOOLEAN DEFAULT FALSE,
    custom_items JSONB DEFAULT '[]'::jsonb,
    asset_links JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL ANALITIK & EVALUASI SHORTS (ANALYTICS)
CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_id TEXT NOT NULL UNIQUE REFERENCES contents(id) ON DELETE CASCADE,
    shown_in_feed INT DEFAULT 0,
    views INT DEFAULT 0,
    viewed_percent NUMERIC(5, 2) DEFAULT 0.0,
    swiped_away_percent NUMERIC(5, 2) DEFAULT 0.0,
    apv_percent NUMERIC(5, 2) DEFAULT 0.0,
    avg_view_duration_sec NUMERIC(5, 2) DEFAULT 0.0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    subscribers_gained INT DEFAULT 0,
    evaluation_what_worked TEXT,
    evaluation_what_failed TEXT,
    evaluation_next_experiment TEXT,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Drop policy lama jika sudah ada (mencegah error saat run ulang)
DROP POLICY IF EXISTS "Allow public read-write for contents" ON contents;
DROP POLICY IF EXISTS "Allow public read-write for research_sources" ON research_sources;
DROP POLICY IF EXISTS "Allow public read-write for scripts" ON scripts;
DROP POLICY IF EXISTS "Allow public read-write for storyboards" ON storyboards;
DROP POLICY IF EXISTS "Allow public read-write for checklists" ON checklists;
DROP POLICY IF EXISTS "Allow public read-write for analytics" ON analytics;

-- Buat policy baru
CREATE POLICY "Allow public read-write for contents" ON contents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for research_sources" ON research_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for scripts" ON scripts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for storyboards" ON storyboards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for checklists" ON checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for analytics" ON analytics FOR ALL USING (true) WITH CHECK (true);
