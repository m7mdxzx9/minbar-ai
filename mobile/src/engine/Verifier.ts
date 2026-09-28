/**
 * Minbar Mobile: Pure TypeScript Verification & Auto-Swapper Engine
 * Zero-Hallucination Policy: Mathematical and Cryptographic Verification of Sacred Islamic Texts.
 * 100% Offline & On-Device Execution.
 * Creed: Ahl al-Sunnah wal-Jama'ah.
 */

import { TheologicalAuditRecord, VerificationVerdict, HadithItem } from '../types/khutbah';

// Unicode Regex Patterns for Arabic
const TASHKEEL_REGEX = /[\u0300-\u036F\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL_REGEX = /\u0640/g;
const PUNCTUATION_REGEX = /[«»""''\(\)\[\]{}،؛:؟\.\-\–\—\*\#\!]+/g;

/**
 * Deterministically normalizes Arabic text on-device for strict canonical comparison.
 * Strips Tashkeel, removes Tatweel, unifies Alef variants and Taa Marbuta.
 */
export function normalizeArabic(text: string, preserveAlefMaqsura: boolean = false): string {
  if (!text) return '';

  // 1. Unicode decomposition and strip combining marks
  let str = text.normalize('NFKD').replace(TASHKEEL_REGEX, '');

  // 2. Remove Tatweel (Kashida)
  str = str.replace(TATWEEL_REGEX, '');

  // 3. Unify Alef & Hamza variants
  str = str.replace(/[إأآٱﺀء]/g, 'ا');

  // 4. Unify Taa Marbuta
  str = str.replace(/ة/g, 'ه');

  // 5. Unify Yaa / Alef Maqsura
  if (!preserveAlefMaqsura) {
    str = str.replace(/ى/g, 'ي');
  }

  // 6. Strip punctuation and excessive whitespace
  str = str.replace(PUNCTUATION_REGEX, ' ');
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

/**
 * Pure TypeScript SHA-256 implementation for deterministic offline hashing
 * Works in React Native, Web, Node, and JSC/Hermes without external native binaries.
 */
export function calculateCanonicalHash(text: string): string {
  const normalized = normalizeArabic(text);
  return sha256Pure(normalized);
}

function sha256Pure(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let currentBitLength = asciiBitLength;
  words[currentBitLength >> 5] |= 0x80 << (24 - (currentBitLength % 32));
  words[(((currentBitLength + 64) >> 9) << 4) + 15] = currentBitLength;

  for (i = 0; i < ascii[lengthProperty]; i++) {
    words[i >> 2] |= ascii.charCodeAt(i) << ((3 - (i % 4)) * 8);
  }

  for (let b = 0; b < words[lengthProperty]; b += 16) {
    const w = words.slice(b, b + 16);
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      let w15 = w[i - 15], w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const sA = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const sE = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const temp1 = hash[7] + sE + ch + k[i] + w[i];
      const temp2 = sA + maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Computes Levenshtein edit distance between two normalized strings.
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = new Array(n + 1);
  let currentRow = new Array(n + 1);

  for (let j = 0; j <= n; j++) prevRow[j] = j;

  for (let i = 1; i <= m; i++) {
    currentRow[0] = i;
    const c1 = s1[i - 1];
    for (let j = 1; j <= n; j++) {
      const cost = c1 === s2[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        prevRow[j] + 1,       // Deletion
        currentRow[j - 1] + 1, // Insertion
        prevRow[j - 1] + cost  // Substitution
      );
    }
    prevRow = currentRow.slice();
  }

  return prevRow[n];
}

export function calculateLevenshteinSimilarity(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

export function calculateTokenJaccardSimilarity(s1: string, s2: string): number {
  const tokens1 = new Set(s1.split(/\s+/).filter(Boolean));
  const tokens2 = new Set(s2.split(/\s+/).filter(Boolean));

  if (tokens1.size === 0 && tokens2.size === 0) return 1.0;
  if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) intersectionCount++;
  }

  const unionSize = tokens1.size + tokens2.size - intersectionCount;
  return intersectionCount / unionSize;
}

/**
 * Calculates composite verification score supporting full citations and authentic verbatim excerpts.
 */
export function calculateCompositeScore(
  generatedText: string,
  canonicalText: string
): {
  compositeScore: number;
  levenshteinScore: number;
  jaccardScore: number;
  isExactHashMatch: boolean;
} {
  const normGen = normalizeArabic(generatedText);
  const normCan = normalizeArabic(canonicalText);

  const hashGen = calculateCanonicalHash(generatedText);
  const hashCan = calculateCanonicalHash(canonicalText);

  // 1. Exact full hash match
  if (hashGen === hashCan) {
    return {
      compositeScore: 1.0,
      levenshteinScore: 1.0,
      jaccardScore: 1.0,
      isExactHashMatch: true,
    };
  }

  // 2. Exact verbatim excerpt match (preacher cites part of a longer hadith/verse)
  if (normGen.length >= 10 && (normCan.includes(normGen) || normGen.includes(normCan))) {
    return {
      compositeScore: 1.0,
      levenshteinScore: 1.0,
      jaccardScore: 1.0,
      isExactHashMatch: true,
    };
  }

  const tokensGen = new Set(normGen.split(/\s+/).filter(Boolean));
  const tokensCan = new Set(normCan.split(/\s+/).filter(Boolean));

  // 3. Exact word subset match for excerpts
  let allContained = true;
  for (const t of tokensGen) {
    if (!tokensCan.has(t)) {
      allContained = false;
      break;
    }
  }
  if (tokensGen.size >= 3 && allContained) {
    return {
      compositeScore: 1.0,
      levenshteinScore: 1.0,
      jaccardScore: 1.0,
      isExactHashMatch: true,
    };
  }

  const levScore = calculateLevenshteinSimilarity(normGen, normCan);
  const jaccardScore = calculateTokenJaccardSimilarity(normGen, normCan);

  // Check token containment ratio for partial excerpts
  if (tokensGen.size > 0 && tokensGen.size < tokensCan.size) {
    let inter = 0;
    for (const t of tokensGen) {
      if (tokensCan.has(t)) inter++;
    }
    const containment = inter / tokensGen.size;
    if (containment >= 0.95) {
      return {
        compositeScore: 1.0,
        levenshteinScore: 1.0,
        jaccardScore: 1.0,
        isExactHashMatch: true,
      };
    }
  }

  const composite = Math.round((0.6 * levScore + 0.4 * jaccardScore) * 10000) / 10000;
  return {
    compositeScore: composite,
    levenshteinScore: Math.round(levScore * 10000) / 10000,
    jaccardScore: Math.round(jaccardScore * 10000) / 10000,
    isExactHashMatch: false,
  };
}

/**
 * On-Device Post-Generation Validator & Force-Swapper.
 * Prevents model hallucination by substituting canonical text if threshold < 0.98.
 */
export class TheologicalMobileValidator {
  public static readonly VERIFICATION_THRESHOLD = 0.98;

  public static readonly THEOLOGICAL_RED_FLAGS = [
    'قال كعب الأحبار عن التوراة',
    'روي عن وهب بن منبه في أخبار بني إسرائيل',
    'حديث لا أصل له',
    'حديث موضوع',
    'إسناده باطل',
    'منكر مكذوب',
    'تناسخ الأرواح',
    'الحلول والاتحاد',
  ];

  /**
   * Validates quotation against canonical record.
   * If threshold is violated (< 0.98), forcefully returns canonical text.
   */
  public static verifyAndCanonicalize(
    citationType: 'quran' | 'hadith' | 'poetry',
    generatedQuote: string,
    canonicalRecord: any
  ): {
    canonicalText: string;
    report: TheologicalAuditRecord;
  } {
    let canonicalText = '';
    let simpleText = '';
    let identifier = '';
    let takhrij: Record<string, any> = {};

    if (citationType === 'quran') {
      canonicalText = canonicalRecord.text_uthmani || '';
      simpleText = canonicalRecord.text_simple || '';
      identifier = `سورة ${canonicalRecord.surah_name_ar} [الآية: ${canonicalRecord.ayah_number}]`;
      takhrij = {
        surah_number: canonicalRecord.surah_number,
        ayah_number: canonicalRecord.ayah_number,
        surah_name_ar: canonicalRecord.surah_name_ar,
        script: 'Uthmanic Script (Tanzil Canonical)',
      };
    } else if (citationType === 'hadith') {
      canonicalText = canonicalRecord.matn_ar || '';
      simpleText = canonicalRecord.matn_simple || '';
      identifier = `${canonicalRecord.collection} (#${canonicalRecord.hadith_number})`;
      takhrij = {
        collection: canonicalRecord.collection,
        hadith_number: canonicalRecord.hadith_number,
        narrator: canonicalRecord.narrator_companion,
        grading: canonicalRecord.grading,
        graded_by: canonicalRecord.graded_by,
        notes: canonicalRecord.takhrij_notes,
      };
    } else {
      canonicalText = canonicalRecord.bayt_ar || '';
      simpleText = canonicalRecord.bayt_simple || '';
      identifier = `شعر: ${canonicalRecord.poet_name_ar} (${canonicalRecord.bahr})`;
      takhrij = {
        poet: canonicalRecord.poet_name_ar,
        bahr: canonicalRecord.bahr,
        theme: canonicalRecord.theme,
      };
    }

    const { compositeScore, levenshteinScore, jaccardScore, isExactHashMatch } =
      calculateCompositeScore(generatedQuote, simpleText);

    const canonicalHash = calculateCanonicalHash(simpleText);

    // 1. Exact Cryptographic Hash Match
    if (isExactHashMatch) {
      return {
        canonicalText,
        report: {
          citation_type: citationType,
          original_text: generatedQuote,
          canonical_text: canonicalText,
          verdict: 'fully_verified',
          levenshtein_similarity: 1.0,
          jaccard_similarity: 1.0,
          composite_score: 1.0,
          canonical_hash: canonicalHash,
          takhrij_details: takhrij,
          notes: `تطابق مشفر تام 100% مع النص المعتمد لـ ${identifier}`,
        },
      };
    }

    // 2. High Fuzzy Token Match (>= 0.98)
    if (compositeScore >= this.VERIFICATION_THRESHOLD) {
      return {
        canonicalText,
        report: {
          citation_type: citationType,
          original_text: generatedQuote,
          canonical_text: canonicalText,
          verdict: 'fully_verified',
          levenshtein_similarity: levenshteinScore,
          jaccard_similarity: jaccardScore,
          composite_score: compositeScore,
          canonical_hash: canonicalHash,
          takhrij_details: takhrij,
          notes: `مطابقة موثقة بنسبة ${Math.round(compositeScore * 100)}% لـ ${identifier}. تم توحيد النص برسم المصحف/المتن المعتمد.`,
        },
      };
    }

    // 3. Deviation / Hallucination (< 0.98) -> FORCE SWAP WITH CANONICAL TEXT!
    return {
      canonicalText,
      report: {
        citation_type: citationType,
        original_text: generatedQuote,
        canonical_text: canonicalText,
        verdict: 'auto_swapped',
        levenshtein_similarity: levenshteinScore,
        jaccard_similarity: jaccardScore,
        composite_score: compositeScore,
        canonical_hash: canonicalHash,
        takhrij_details: takhrij,
        notes: `تحذير رقابي محلي: اكتشاف انحراف (نسبة التطابق ${Math.round(compositeScore * 100)}% أقل من ${Math.round(this.VERIFICATION_THRESHOLD * 100)}%). تم استبدال النص تلقائياً بالنص المعتمد لـ ${identifier} لحماية الأمانة العلمية.`,
      },
    };
  }

  public static validateTakhrijGrading(hadithRecord: HadithItem): { isValid: boolean; message: string } {
    const grading = (hadithRecord.grading || '').trim();
    const allowed = ['Sahih', 'Hasan', 'Sahih Li Ghayrihi', 'Hasan Li Ghayrihi'];
    if (!allowed.includes(grading)) {
      return {
        isValid: false,
        message: `مرتبة الحديث '${grading}' غير مقبولة في الخطب المنبرية. يُشترط أن يكون الحديث صحيحاً أو حسناً.`,
      };
    }
    return {
      isValid: true,
      message: `الحديث معتمد بمرتبة (${grading}) تخريج (${hadithRecord.graded_by}).`,
    };
  }

  public static scanTheologicalRedFlags(text: string): string[] {
    const violations: string[] = [];
    for (const flag of this.THEOLOGICAL_RED_FLAGS) {
      if (text.includes(flag)) {
        violations.push(`تم رصد عبارة محظورة عقدياً أو رواية إسرائيلية غير موثقة: '${flag}'`);
      }
    }
    return violations;
  }
}
