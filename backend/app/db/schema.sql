-- ==============================================================================
-- MINBAR AI: Database Schema (Production PostgreSQL + pgvector)
-- Platform for Drafting & Verifying Islamic Friday Sermons (Khutbahs)
-- Creed Alignment: Ahl al-Sunnah wal-Jama'ah (Strict Zero-Hallucination Policy)
-- ==============================================================================

-- Enable essential extensions for UUID generation and vector similarity search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ------------------------------------------------------------------------------
-- 1. VERIFIED QURANIC TEXTS (Uthmanic Script Corpus)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quran_verses (
    id SERIAL PRIMARY KEY,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INT NOT NULL CHECK (ayah_number >= 1),
    surah_name_ar VARCHAR(100) NOT NULL,
    surah_name_en VARCHAR(100) NOT NULL,
    juz_number INT NOT NULL CHECK (juz_number BETWEEN 1 AND 30),
    page_number INT CHECK (page_number BETWEEN 1 AND 604),
    
    -- Exact canonical Uthmanic text with full diacritics (Tashkeel)
    text_uthmani TEXT NOT NULL,
    
    -- Normalized Arabic text (without diacritics/tashkeel) for lexical search
    text_simple TEXT NOT NULL,
    
    -- Cryptographic SHA-256 hash of normalized text for instant deterministic verification
    canonical_hash VARCHAR(64) NOT NULL,
    
    -- Dense semantic embedding vector (OpenAI text-embedding-3-small or multilingual E5)
    embedding vector(1536),
    
    -- Generated PostgreSQL full-text search vector
    tsv_content tsvector GENERATED ALWAYS AS (to_tsvector('arabic', text_simple)) STORED,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_quran_surah_ayah UNIQUE (surah_number, ayah_number)
);

CREATE INDEX IF NOT EXISTS idx_quran_canonical_hash ON quran_verses USING hash (canonical_hash);
CREATE INDEX IF NOT EXISTS idx_quran_surah_ayah ON quran_verses (surah_number, ayah_number);
CREATE INDEX IF NOT EXISTS idx_quran_tsv ON quran_verses USING gin (tsv_content);
CREATE INDEX IF NOT EXISTS idx_quran_embedding ON quran_verses USING hnsw (embedding vector_cosine_ops);


-- ------------------------------------------------------------------------------
-- 2. VERIFIED HADITH CORPUS (Sunnah Repositories with Strict Takhrij)
-- Theological Constraint: Strictly authenticated narrations (Sahih / Hasan)
-- Fabricated (Mawdu'), weak (Da'if), and unverified Isra'iliyyat are prohibited.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hadith_corpus (
    id SERIAL PRIMARY KEY,
    collection VARCHAR(100) NOT NULL,              -- e.g., 'Sahih al-Bukhari', 'Sahih Muslim', 'Jami at-Tirmidhi'
    book_name_ar VARCHAR(255) NOT NULL,            -- e.g., 'كتاب الإيمان', 'كتاب الصلاة'
    book_number INT,
    hadith_number INT NOT NULL,
    english_reference VARCHAR(100),
    
    -- The core prophetic matn (text) with complete Tashkeel
    matn_ar TEXT NOT NULL,
    
    -- Normalized matn for search and validation
    matn_simple TEXT NOT NULL,
    
    -- Sanad / Isnad (Chain of narrators)
    isnad_ar TEXT,
    
    -- Primary companion narrator
    narrator_companion VARCHAR(150),
    
    -- Strict theological grading constraint
    grading VARCHAR(50) NOT NULL CHECK (grading IN ('Sahih', 'Hasan', 'Sahih Li Ghayrihi', 'Hasan Li Ghayrihi')),
    
    -- Classical or contemporary Muhaddith certifying the grading
    graded_by VARCHAR(255) NOT NULL,               -- e.g., 'Al-Bukhari', 'Muslim', 'Ibn Hajar al-Asqalani', 'Al-Albani'
    
    -- Scholarly Takhrij notes and cross-references
    takhrij_notes TEXT,
    
    -- SHA-256 canonical hash of the normalized matn
    canonical_hash VARCHAR(64) NOT NULL,
    
    -- Dense semantic embedding vector
    embedding vector(1536),
    
    -- Generated PostgreSQL full-text search vector
    tsv_content tsvector GENERATED ALWAYS AS (to_tsvector('arabic', matn_simple)) STORED,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_hadith_ref UNIQUE (collection, hadith_number)
);

CREATE INDEX IF NOT EXISTS idx_hadith_canonical_hash ON hadith_corpus USING hash (canonical_hash);
CREATE INDEX IF NOT EXISTS idx_hadith_collection_num ON hadith_corpus (collection, hadith_number);
CREATE INDEX IF NOT EXISTS idx_hadith_grading ON hadith_corpus (grading);
CREATE INDEX IF NOT EXISTS idx_hadith_tsv ON hadith_corpus USING gin (tsv_content);
CREATE INDEX IF NOT EXISTS idx_hadith_embedding ON hadith_corpus USING hnsw (embedding vector_cosine_ops);


-- ------------------------------------------------------------------------------
-- 3. CLASSICAL ARABIC POETRY & RHETORICAL CITATIONS
-- Tagged by classical poetic meter (Bahr) and theological/rhetorical theme
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS poetry_corpus (
    id SERIAL PRIMARY KEY,
    poet_name_ar VARCHAR(150) NOT NULL,            -- e.g., 'الإمام الشافعي', 'حسان بن ثابت', 'أبو العتاهية'
    era VARCHAR(100),                              -- e.g., 'المخضرمون', 'العصر الأموي', 'العصر العباسي'
    bahr VARCHAR(100) NOT NULL,                    -- e.g., 'بحر الطويل', 'بحر الكامل', 'بحر البسيط', 'بحر الوافر'
    theme VARCHAR(100) NOT NULL,                   -- e.g., 'الزهد والمواعظ', 'الحكمة', 'بر الوالدين', 'الصبر'
    
    -- Classical verse (Bayt) with Sadr (first hemistich) and 'Ajuz (second hemistich)
    bayt_ar TEXT NOT NULL,
    bayt_simple TEXT NOT NULL,
    
    canonical_hash VARCHAR(64) NOT NULL,
    embedding vector(1536),
    tsv_content tsvector GENERATED ALWAYS AS (to_tsvector('arabic', bayt_simple)) STORED,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_poetry_theme ON poetry_corpus (theme);
CREATE INDEX IF NOT EXISTS idx_poetry_bahr ON poetry_corpus (bahr);
CREATE INDEX IF NOT EXISTS idx_poetry_canonical_hash ON poetry_corpus USING hash (canonical_hash);
CREATE INDEX IF NOT EXISTS idx_poetry_tsv ON poetry_corpus USING gin (tsv_content);
CREATE INDEX IF NOT EXISTS idx_poetry_embedding ON poetry_corpus USING hnsw (embedding vector_cosine_ops);


-- ------------------------------------------------------------------------------
-- 4. SERMONS (Master Khutbah Records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    theme VARCHAR(255) NOT NULL,
    target_duration_minutes INT NOT NULL CHECK (target_duration_minutes BETWEEN 5 AND 60),
    sermon_type VARCHAR(50) NOT NULL CHECK (sermon_type IN ('jumuah', 'eid_al_fitr', 'eid_al_adha', 'janazah', 'kusuf', 'istisqa', 'general_reminder')),
    audience_profile VARCHAR(100) DEFAULT 'General Congregation',
    tone VARCHAR(50) DEFAULT 'Solemn and Exhortative',
    
    -- Theological adherence guarantee
    theological_creed VARCHAR(100) NOT NULL DEFAULT 'Ahl al-Sunnah wal-Jamaah',
    
    -- System verification status
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (verification_status IN ('pending', 'fully_verified', 'flagged_deviations', 'rejected')),
    
    -- Delivery telemetry
    word_count INT DEFAULT 0,
    estimated_delivery_minutes NUMERIC(4,1) DEFAULT 0.0,
    
    -- Serialized LangGraph blueprint & state checkpoints
    blueprint_metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sermons_verification_status ON sermons (verification_status);
CREATE INDEX IF NOT EXISTS idx_sermons_created_at ON sermons (created_at DESC);


-- ------------------------------------------------------------------------------
-- 5. SERMON BLOCKS (Semantic Discrete Blocks for TipTap/Rich Text Editor)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sermon_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sermon_id UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    
    block_type VARCHAR(50) NOT NULL CHECK (block_type IN (
        'khutbat_al_hajah',             -- Classical Sunnah introduction (مقدمة الحاجة)
        'thematic_exposition',          -- Thematic explanation & contemporary application
        'quran_citation',               -- Deterministically retrieved Uthmanic verse
        'hadith_citation',              -- Authenticated Sunnah citation with Takhrij
        'poetry_citation',              -- Classical Arabic wisdom verse
        'istighfar_pause',              -- Classical sitting pause between the two sermons
        'second_khutbah',               -- Second sermon summary & practical exhortation
        'closing_dua'                   -- Closing ma'thur prayers for the Ummah
    )),
    
    title_ar VARCHAR(255) NOT NULL,
    content_ar TEXT NOT NULL,
    
    -- Block-level verification state
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_score NUMERIC(5,4) DEFAULT 0.0000 CHECK (verification_score BETWEEN 0.0000 AND 1.0000),
    
    -- Reference to the canonical database source
    citation_source_type VARCHAR(50) CHECK (citation_source_type IN ('quran', 'hadith', 'poetry', NULL)),
    canonical_citation_id INT,
    
    -- Audit details (hash matches, Levenshtein, Takhrij chain verification)
    audit_feedback JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_sermon_block_order UNIQUE (sermon_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_sermon_blocks_sermon ON sermon_blocks (sermon_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sermon_blocks_type ON sermon_blocks (block_type);


-- ------------------------------------------------------------------------------
-- 6. THEOLOGICAL & VERIFICATION AUDIT TRAIL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS theological_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sermon_id UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
    block_id UUID REFERENCES sermon_blocks(id) ON DELETE SET NULL,
    
    audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN (
        'quote_hash_verification',
        'tashkeel_fidelity',
        'takhrij_validation',
        'creed_compliance',
        'israiliyyat_check'
    )),
    
    verdict VARCHAR(50) NOT NULL CHECK (verdict IN ('passed', 'auto_swapped', 'flagged', 'rejected')),
    
    original_text TEXT NOT NULL,
    canonical_text TEXT,
    
    levenshtein_similarity NUMERIC(5,4),
    jaccard_similarity NUMERIC(5,4),
    composite_score NUMERIC(5,4),
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_theological_audits_sermon ON theological_audits (sermon_id);
CREATE INDEX IF NOT EXISTS idx_theological_audits_verdict ON theological_audits (verdict);

-- ------------------------------------------------------------------------------
-- Trigger for automatic updated_at timestamp management
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_sermons_timestamp ON sermons;
CREATE TRIGGER trg_update_sermons_timestamp
    BEFORE UPDATE ON sermons
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_sermon_blocks_timestamp ON sermon_blocks;
CREATE TRIGGER trg_update_sermon_blocks_timestamp
    BEFORE UPDATE ON sermon_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
