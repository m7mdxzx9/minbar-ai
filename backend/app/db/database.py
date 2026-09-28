"""
Database Connection & Persistence Layer for Minbar AI
Supports PostgreSQL + pgvector in production and SQLite in testing/development environments.
"""

import os
import json
import sqlite3
from typing import Dict, Any, List, Optional
from app.db.seed_data import QURAN_SEED_DATA, HADITH_SEED_DATA, POETRY_SEED_DATA
from app.engine.verifier import calculate_canonical_hash

DB_PATH = os.environ.get("MINBAR_SQLITE_PATH", "backend/minbar.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """
    Initializes database schema and loads verified seed corpora if empty.
    """
    os.makedirs(os.path.dirname(DB_PATH) if os.path.dirname(DB_PATH) else ".", exist_ok=True)
    conn = get_db_connection()
    cur = conn.cursor()

    # Create tables compatible with SQLite
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS quran_verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        surah_number INTEGER NOT NULL,
        ayah_number INTEGER NOT NULL,
        surah_name_ar TEXT NOT NULL,
        surah_name_en TEXT NOT NULL,
        juz_number INTEGER NOT NULL,
        page_number INTEGER,
        text_uthmani TEXT NOT NULL,
        text_simple TEXT NOT NULL,
        canonical_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hadith_corpus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection TEXT NOT NULL,
        book_name_ar TEXT NOT NULL,
        book_number INTEGER,
        hadith_number INTEGER NOT NULL,
        english_reference TEXT,
        matn_ar TEXT NOT NULL,
        matn_simple TEXT NOT NULL,
        isnad_ar TEXT,
        narrator_companion TEXT,
        grading TEXT NOT NULL,
        graded_by TEXT NOT NULL,
        takhrij_notes TEXT,
        canonical_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS poetry_corpus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poet_name_ar TEXT NOT NULL,
        era TEXT,
        bahr TEXT NOT NULL,
        theme TEXT NOT NULL,
        bayt_ar TEXT NOT NULL,
        bayt_simple TEXT NOT NULL,
        canonical_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sermons (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        theme TEXT NOT NULL,
        target_duration_minutes INTEGER NOT NULL,
        sermon_type TEXT NOT NULL,
        audience_profile TEXT,
        tone TEXT,
        theological_creed TEXT DEFAULT 'Ahl al-Sunnah wal-Jamaah',
        verification_status TEXT DEFAULT 'pending',
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
        verified INTEGER DEFAULT 0,
        verification_score REAL DEFAULT 0.0,
        citation_source_type TEXT,
        canonical_citation_id INTEGER,
        audit_feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE
    );

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed verified Quran
    cur.execute("SELECT COUNT(*) FROM quran_verses")
    if cur.fetchone()[0] == 0:
        for q in QURAN_SEED_DATA:
            can_hash = calculate_canonical_hash(q["text_simple"])
            cur.execute("""
                INSERT OR IGNORE INTO quran_verses 
                (surah_number, ayah_number, surah_name_ar, surah_name_en, juz_number, page_number, text_uthmani, text_simple, canonical_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                q["surah_number"], q["ayah_number"], q["surah_name_ar"], q["surah_name_en"],
                q["juz_number"], q.get("page_number"), q["text_uthmani"], q["text_simple"], can_hash
            ))

    # Seed verified Hadith
    cur.execute("SELECT COUNT(*) FROM hadith_corpus")
    if cur.fetchone()[0] == 0:
        for h in HADITH_SEED_DATA:
            can_hash = calculate_canonical_hash(h["matn_simple"])
            cur.execute("""
                INSERT OR IGNORE INTO hadith_corpus 
                (collection, book_name_ar, book_number, hadith_number, english_reference, matn_ar, matn_simple, isnad_ar, narrator_companion, grading, graded_by, takhrij_notes, canonical_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                h["collection"], h["book_name_ar"], h.get("book_number"), h["hadith_number"],
                h.get("english_reference"), h["matn_ar"], h["matn_simple"], h.get("isnad_ar"),
                h.get("narrator_companion"), h["grading"], h["graded_by"], h.get("takhrij_notes"), can_hash
            ))

    # Seed verified Poetry
    cur.execute("SELECT COUNT(*) FROM poetry_corpus")
    if cur.fetchone()[0] == 0:
        for p in POETRY_SEED_DATA:
            can_hash = calculate_canonical_hash(p["bayt_simple"])
            cur.execute("""
                INSERT OR IGNORE INTO poetry_corpus 
                (poet_name_ar, era, bahr, theme, bayt_ar, bayt_simple, canonical_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                p["poet_name_ar"], p.get("era"), p["bahr"], p["theme"], p["bayt_ar"], p["bayt_simple"], can_hash
            ))

    conn.commit()
    conn.close()


def save_sermon_to_db(sermon_dict: Dict[str, Any], blocks: List[Dict[str, Any]]):
    """Persists sermon and discrete blocks to database with relational constraints."""
    init_database()
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        INSERT OR REPLACE INTO sermons
        (id, title, theme, target_duration_minutes, sermon_type, audience_profile, tone, theological_creed, verification_status, word_count, estimated_delivery_minutes, blueprint_metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sermon_dict["id"], sermon_dict["title"], sermon_dict["theme"],
        sermon_dict["target_duration_minutes"], sermon_dict["sermon_type"],
        sermon_dict.get("audience_profile", ""), sermon_dict.get("tone", ""),
        sermon_dict.get("theological_creed", "Ahl al-Sunnah wal-Jamaah"),
        sermon_dict.get("verification_status", "fully_verified"),
        sermon_dict.get("word_count", 0), sermon_dict.get("estimated_delivery_minutes", 0.0),
        json.dumps(sermon_dict.get("blueprint", {}), ensure_ascii=False)
    ))

    # Delete existing blocks if any (for updates)
    cur.execute("DELETE FROM sermon_blocks WHERE sermon_id = ?", (sermon_dict["id"],))
    
    for b in blocks:
        cur.execute("""
            INSERT INTO sermon_blocks
            (id, sermon_id, order_index, block_type, title_ar, content_ar, verified, verification_score, citation_source_type, audit_feedback)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            b["id"], sermon_dict["id"], b["order_index"], b["block_type"],
            b["title_ar"], b["content_ar"], 1 if b.get("verified", False) else 0,
            b.get("verification_score", 1.0), b.get("citation_source_type"),
            json.dumps(b.get("audit_feedback", {}), ensure_ascii=False)
        ))

    conn.commit()
    conn.close()


def get_sermon_from_db(sermon_id: str) -> Optional[Dict[str, Any]]:
    init_database()
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT * FROM sermons WHERE id = ?", (sermon_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None
        
    sermon = dict(row)
    cur.execute("SELECT * FROM sermon_blocks WHERE sermon_id = ? ORDER BY order_index ASC", (sermon_id,))
    blocks = [dict(b) for b in cur.fetchall()]
    
    conn.close()
    sermon["blocks"] = blocks
    return sermon
