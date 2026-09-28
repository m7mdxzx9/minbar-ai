/**
 * TypeScript Data Contracts for Minbar AI
 * Full alignment with Backend Pydantic v2 Schemas
 * Creed: Ahl al-Sunnah wal-Jama'ah (Zero-Hallucination Policy)
 */

export type SermonType =
  | 'jumuah'
  | 'eid_al_fitr'
  | 'eid_al_adha'
  | 'janazah'
  | 'kusuf'
  | 'istisqa'
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

export interface QuranMetadata {
  id?: number;
  surah_number: number;
  ayah_number: number;
  surah_name_ar: string;
  surah_name_en: string;
  juz_number: number;
  text_uthmani: string;
  text_simple: string;
  canonical_hash: string;
}

export interface HadithMetadata {
  id?: number;
  collection: string;
  book_name_ar: string;
  hadith_number: number;
  matn_ar: string;
  matn_simple: string;
  isnad_ar?: string;
  narrator_companion?: string;
  grading: string;
  graded_by: string;
  takhrij_notes?: string;
  canonical_hash: string;
}

export interface PoetryMetadata {
  id?: number;
  poet_name_ar: string;
  era?: string;
  bahr: string;
  theme: string;
  bayt_ar: string;
  bayt_simple: string;
  canonical_hash: string;
}

export interface TheologicalAuditReport {
  citation_type: 'quran' | 'hadith' | 'poetry';
  original_text: string;
  canonical_text: string;
  verdict: VerificationVerdict;
  levenshtein_score: number;
  jaccard_score: number;
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
  citation_metadata?: QuranMetadata | HadithMetadata | PoetryMetadata | any;
  audit_feedback?: Record<string, any>;
}

export interface KhutbahBlueprint {
  theme: string;
  sermon_type: SermonType;
  target_duration_minutes: number;
  target_word_count: number;
  audience_profile: string;
  tone: string;
  theological_creed: string;
  sections: Array<{
    block_type: string;
    title_ar: string;
    focus: string;
  }>;
  citation_requirements: {
    quran: number;
    hadith: number;
    poetry: number;
  };
}

export interface KhutbahSermon {
  id: string;
  title: string;
  theme: string;
  sermon_type: SermonType;
  audience_profile: string;
  tone: string;
  theological_creed: string;
  verification_status: 'fully_verified' | 'flagged_deviations' | 'pending';
  word_count: number;
  estimated_delivery_minutes: number;
  target_duration_minutes?: number;
  blueprint?: KhutbahBlueprint;
  blocks: SermonBlock[];
  audits: TheologicalAuditReport[];
  created_at?: string;
}

export interface KhutbahGenerationParams {
  theme: string;
  sermon_type: SermonType;
  target_duration_minutes: number;
  audience_profile: string;
  tone: string;
  quran_count: number;
  hadith_count: number;
  poetry_count: number;
  model_provider?: 'builtin' | 'groq' | 'gemini' | 'grok' | 'ollama';
  api_key?: string;
  custom_model_name?: string;
  selected_citation_ids?: string[];
  custom_instructions?: string;
}

export interface ExploratoryCitationsResponse {
  quran?: QuranMetadata[];
  hadith?: HadithMetadata[];
  poetry?: PoetryMetadata[];
}
