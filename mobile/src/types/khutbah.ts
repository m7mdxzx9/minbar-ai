/**
 * Minbar Mobile: TypeScript Data Contracts
 * 100% Offline & On-Device Data Models
 * Creed: Ahl al-Sunnah wal-Jama'ah (Zero-Hallucination Guardrails)
 */

export type SermonType =
  | 'jumuah'
  | 'eid_al_fitr'
  | 'eid_al_adha'
  | 'janazah'
  | 'general_reminder';

export type BlockType =
  | 'khutbat_al_hajah'
  | 'thematic_exposition'
  | 'quran_citation'
  | 'hadith_citation'
  | 'poetry_citation'
  | 'istighfar_pause'
  | 'second_khutbah'
  | 'closing_dua';

export type VerificationVerdict =
  | 'fully_verified'
  | 'auto_swapped'
  | 'flagged'
  | 'rejected';

export interface QuranVerse {
  id: number;
  surah_number: number;
  ayah_number: number;
  surah_name_ar: string;
  surah_name_en: string;
  juz_number: number;
  page_number?: number;
  text_uthmani: string;
  text_simple: string;
  canonical_hash: string;
}

export interface HadithItem {
  id: number;
  collection: string;
  book_name_ar: string;
  book_number?: number;
  hadith_number: number;
  english_reference?: string;
  matn_ar: string;
  matn_simple: string;
  isnad_ar?: string;
  narrator_companion?: string;
  grading: 'Sahih' | 'Hasan' | 'Sahih Li Ghayrihi' | 'Hasan Li Ghayrihi';
  graded_by: string;
  takhrij_notes?: string;
  canonical_hash: string;
}

export interface PoetryItem {
  id: number;
  poet_name_ar: string;
  era?: string;
  bahr: string;
  theme: string;
  bayt_ar: string;
  bayt_simple: string;
  canonical_hash: string;
}

export interface TheologicalAuditRecord {
  citation_type: 'quran' | 'hadith' | 'poetry';
  original_text: string;
  canonical_text: string;
  verdict: VerificationVerdict;
  levenshtein_similarity: number;
  jaccard_similarity: number;
  composite_score: number;
  canonical_hash: string;
  takhrij_details?: Record<string, any>;
  notes: string;
}

export interface SermonBlock {
  id: string;
  sermon_id?: string;
  order_index: number;
  block_type: BlockType;
  title_ar: string;
  content_ar: string;
  verified: boolean;
  verification_score: number;
  citation_source_type?: 'quran' | 'hadith' | 'poetry' | null;
  canonical_citation_id?: number | null;
  citation_metadata?: QuranVerse | HadithItem | PoetryItem | any;
  audit_feedback?: Record<string, any>;
}

export interface KhutbahSermon {
  id: string;
  title: string;
  theme: string;
  sermon_type: SermonType;
  audience_profile: string;
  tone: string;
  theological_creed: string;
  verification_status: 'fully_verified' | 'flagged_deviations';
  word_count: number;
  estimated_delivery_minutes: number;
  blocks: SermonBlock[];
  audits: TheologicalAuditRecord[];
  created_at?: string;
}

export interface KhutbahParams {
  theme: string;
  sermon_type: SermonType;
  target_duration_minutes: number;
  audience_profile: string;
  tone: string;
  quran_count: number;
  hadith_count: number;
  poetry_count: number;
}
