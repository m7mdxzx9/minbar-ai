-- ==============================================================================
-- MINBAR MOBILE: Pre-Bundled Canonical SQLite Database Schema (100% Offline)
-- Platform for Drafting, Editing & Delivering Authentic Islamic Friday Sermons
-- Creed Alignment: Ahl al-Sunnah wal-Jama'ah (Zero-Hallucination Guardrails)
-- Engine: SQLite 3 with FTS5 Full-Text Search
-- ==============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ------------------------------------------------------------------------------
-- 1. VERIFIED QURANIC TEXTS (Uthmanic Script Corpus)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quran_verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
    surah_name_ar TEXT NOT NULL,
    surah_name_en TEXT NOT NULL,
    juz_number INTEGER NOT NULL CHECK (juz_number BETWEEN 1 AND 30),
    page_number INTEGER,
    
    -- Canonical Uthmanic text with full diacritics (Tashkeel)
    text_uthmani TEXT NOT NULL,
    
    -- Normalized Arabic text (without diacritics) for offline search
    text_simple TEXT NOT NULL,
    
    -- Cryptographic SHA-256 hash of normalized text for instant deterministic verification
    canonical_hash TEXT NOT NULL UNIQUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_quran_ref UNIQUE (surah_number, ayah_number)
);

CREATE INDEX IF NOT EXISTS idx_quran_ref ON quran_verses (surah_number, ayah_number);
CREATE INDEX IF NOT EXISTS idx_quran_hash ON quran_verses (canonical_hash);

-- FTS5 Virtual Table for Instant Offline Quran Search
CREATE VIRTUAL TABLE IF NOT EXISTS quran_fts USING fts5(
    text_simple,
    content='quran_verses',
    content_rowid='id'
);

-- Triggers to maintain FTS5 synchronization automatically
CREATE TRIGGER IF NOT EXISTS trg_quran_ai AFTER INSERT ON quran_verses BEGIN
    INSERT INTO quran_fts(rowid, text_simple) VALUES (new.id, new.text_simple);
END;
CREATE TRIGGER IF NOT EXISTS trg_quran_ad AFTER DELETE ON quran_verses BEGIN
    INSERT INTO quran_fts(quran_fts, rowid, text_simple) VALUES ('delete', old.id, old.text_simple);
END;
CREATE TRIGGER IF NOT EXISTS trg_quran_au AFTER UPDATE ON quran_verses BEGIN
    INSERT INTO quran_fts(quran_fts, rowid, text_simple) VALUES ('delete', old.id, old.text_simple);
    INSERT INTO quran_fts(rowid, text_simple) VALUES (new.id, new.text_simple);
END;


-- ------------------------------------------------------------------------------
-- 2. VERIFIED HADITH CORPUS (Sunnah Repositories with Strict Takhrij)
-- Strictly Sahih / Hasan. Da'if, Mawdu', and Isra'iliyyat strictly banned.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hadith_corpus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection TEXT NOT NULL,             -- e.g. 'Sahih al-Bukhari', 'Sahih Muslim'
    book_name_ar TEXT NOT NULL,
    book_number INTEGER,
    hadith_number INTEGER NOT NULL,
    english_reference TEXT,
    
    -- Canonical prophetic matn with full diacritics
    matn_ar TEXT NOT NULL,
    
    -- Normalized matn for search and validation
    matn_simple TEXT NOT NULL,
    
    -- Chain of narrators (Isnad)
    isnad_ar TEXT,
    
    -- Primary companion narrator
    narrator_companion TEXT,
    
    -- Strict grading constraint
    grading TEXT NOT NULL CHECK (grading IN ('Sahih', 'Hasan', 'Sahih Li Ghayrihi', 'Hasan Li Ghayrihi')),
    
    -- Classical or contemporary Muhaddith certifying the grading
    graded_by TEXT NOT NULL,              -- e.g. 'Al-Bukhari', 'Muslim', 'Ibn Hajar', 'Al-Albani'
    
    -- Scholarly Takhrij notes
    takhrij_notes TEXT,
    
    -- SHA-256 canonical hash of normalized matn
    canonical_hash TEXT NOT NULL UNIQUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_hadith_ref UNIQUE (collection, hadith_number)
);

CREATE INDEX IF NOT EXISTS idx_hadith_collection ON hadith_corpus (collection, hadith_number);
CREATE INDEX IF NOT EXISTS idx_hadith_hash ON hadith_corpus (canonical_hash);

-- FTS5 Virtual Table for Instant Offline Hadith Search
CREATE VIRTUAL TABLE IF NOT EXISTS hadith_fts USING fts5(
    matn_simple,
    narrator_companion,
    content='hadith_corpus',
    content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS trg_hadith_ai AFTER INSERT ON hadith_corpus BEGIN
    INSERT INTO hadith_fts(rowid, matn_simple, narrator_companion) VALUES (new.id, new.matn_simple, new.narrator_companion);
END;
CREATE TRIGGER IF NOT EXISTS trg_hadith_ad AFTER DELETE ON hadith_corpus BEGIN
    INSERT INTO hadith_fts(hadith_fts, rowid, matn_simple, narrator_companion) VALUES ('delete', old.id, old.matn_simple, old.narrator_companion);
END;
CREATE TRIGGER IF NOT EXISTS trg_hadith_au AFTER UPDATE ON hadith_corpus BEGIN
    INSERT INTO hadith_fts(hadith_fts, rowid, matn_simple, narrator_companion) VALUES ('delete', old.id, old.matn_simple, old.narrator_companion);
    INSERT INTO hadith_fts(rowid, matn_simple, narrator_companion) VALUES (new.id, new.matn_simple, new.narrator_companion);
END;


-- ------------------------------------------------------------------------------
-- 3. CLASSICAL ARABIC POETRY & RHETORICAL CITATIONS
-- Categorized by Bahr (meter) and theological/rhetorical theme
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS poetry_corpus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poet_name_ar TEXT NOT NULL,
    era TEXT,
    bahr TEXT NOT NULL,                   -- e.g. 'بحر البسيط', 'بحر الكامل', 'بحر الوافر'
    theme TEXT NOT NULL,                  -- e.g. 'الزهد والمواعظ', 'الحكمة', 'الصبر'
    
    -- Verse (Bayt) with Sadr and 'Ajuz
    bayt_ar TEXT NOT NULL,
    bayt_simple TEXT NOT NULL,
    
    canonical_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_poetry_theme ON poetry_corpus (theme);
CREATE INDEX IF NOT EXISTS idx_poetry_hash ON poetry_corpus (canonical_hash);

-- FTS5 Virtual Table for Instant Offline Poetry Search
CREATE VIRTUAL TABLE IF NOT EXISTS poetry_fts USING fts5(
    bayt_simple,
    theme,
    poet_name_ar,
    content='poetry_corpus',
    content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS trg_poetry_ai AFTER INSERT ON poetry_corpus BEGIN
    INSERT INTO poetry_fts(rowid, bayt_simple, theme, poet_name_ar) VALUES (new.id, new.bayt_simple, new.theme, new.poet_name_ar);
END;
CREATE TRIGGER IF NOT EXISTS trg_poetry_ad AFTER DELETE ON poetry_corpus BEGIN
    INSERT INTO poetry_fts(poetry_fts, rowid, bayt_simple, theme, poet_name_ar) VALUES ('delete', old.id, old.bayt_simple, old.theme, old.poet_name_ar);
END;
CREATE TRIGGER IF NOT EXISTS trg_poetry_au AFTER UPDATE ON poetry_corpus BEGIN
    INSERT INTO poetry_fts(poetry_fts, rowid, bayt_simple, theme, poet_name_ar) VALUES ('delete', old.id, old.bayt_simple, old.theme, old.poet_name_ar);
    INSERT INTO poetry_fts(rowid, bayt_simple, theme, poet_name_ar) VALUES (new.id, new.bayt_simple, new.theme, new.poet_name_ar);
END;


-- ------------------------------------------------------------------------------
-- 4. LOCAL SERMONS & DISCRETE BLOCKS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sermons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    theme TEXT NOT NULL,
    target_duration_minutes INTEGER NOT NULL,
    sermon_type TEXT NOT NULL,
    audience_profile TEXT,
    tone TEXT,
    theological_creed TEXT DEFAULT 'Ahl al-Sunnah wal-Jamaah',
    verification_status TEXT DEFAULT 'fully_verified',
    word_count INTEGER DEFAULT 0,
    estimated_delivery_minutes REAL DEFAULT 0.0,
    blueprint_metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sermon_blocks (
    id TEXT PRIMARY KEY,
    sermon_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    block_type TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    verified INTEGER DEFAULT 1,
    verification_score REAL DEFAULT 1.0,
    citation_source_type TEXT,
    canonical_citation_id INTEGER,
    citation_metadata TEXT,
    audit_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sermon_blocks ON sermon_blocks (sermon_id, order_index);

-- ------------------------------------------------------------------------------
-- 5. ON-DEVICE THEOLOGICAL AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS theological_audits (
    id TEXT PRIMARY KEY,
    sermon_id TEXT NOT NULL,
    block_id TEXT,
    audit_type TEXT NOT NULL,
    verdict TEXT NOT NULL,
    original_text TEXT NOT NULL,
    canonical_text TEXT,
    levenshtein_similarity REAL,
    jaccard_similarity REAL,
    composite_score REAL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE
);
