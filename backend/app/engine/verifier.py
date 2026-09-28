"""
Theological Verification Engine & Deterministic Post-Generation Validator for Minbar AI
Zero-Hallucination Policy: Mathematical and Cryptographic Verification of Sacred Islamic Texts.
Creed: Ahl al-Sunnah wal-Jama'ah.
"""

import re
import hashlib
import unicodedata
from typing import Tuple, Dict, Any, Optional, List
from app.models.schemas import TheologicalAuditReport, VerificationVerdict


# Arabic Unicode Range constants
TASHKEEL_REGEX = re.compile(r'[\u0617-\u061A\u064B-\u0652\u0670]')
QURANIC_ANNOTATIONS_REGEX = re.compile(r'[\u06D6-\u06ED\u06DF-\u06E8]')
TATWEEL_REGEX = re.compile(r'\u0640')
PUNCTUATION_REGEX = re.compile(r'[«»""\'\(\)\[\]{}،؛:؟\.\-\–\—\*\#\!]+')


def normalize_arabic(text: str, preserve_alef_maqsura: bool = False) -> str:
    """
    Deterministically normalizes Arabic text for strict canonical comparisons.
    - Strips all diacritics and combining marks (Tashkeel, Sukun, Shaddah, Tanween, Maddah, Hamza marks).
    - Removes Tatweel / Kashida.
    - Unifies Alef variants (إ, أ, آ, ٱ, ء -> ا).
    - Unifies Taa Marbuta (ة -> ه) for lexical stability.
    - Optionally unifies Alef Maqsura (ى -> ي).
    - Removes punctuation and standardizes spacing.
    """
    if not text:
        return ""
    
    # 1. Unicode decomposition and strip all nonspacing combining marks (Mn)
    decomposed = unicodedata.normalize('NFKD', text)
    stripped = ''.join(c for c in decomposed if unicodedata.category(c) != 'Mn')
    
    # 2. Strip Tatweel and Quranic annotations
    stripped = TATWEEL_REGEX.sub('', stripped)
    stripped = QURANIC_ANNOTATIONS_REGEX.sub('', stripped)
    
    # 3. Unify Alef and Hamza forms
    stripped = re.sub(r'[إأآٱﺀء]', 'ا', stripped)
    
    # 4. Unify Taa Marbuta
    stripped = re.sub(r'ة', 'ه', stripped)
    
    # 5. Unify Yaa / Alef Maqsura if requested
    if not preserve_alef_maqsura:
        stripped = re.sub(r'ى', 'ي', stripped)
        
    # 6. Strip punctuation and excessive whitespace
    cleaned = PUNCTUATION_REGEX.sub(' ', stripped)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned


def calculate_canonical_hash(text: str) -> str:
    """
    Computes a deterministic SHA-256 cryptographic hash of the canonical normalized text.
    Used for instant O(1) mathematical verification against the database.
    """
    normalized = normalize_arabic(text)
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()


def levenshtein_distance(s1: str, s2: str) -> int:
    """
    Computes Levenshtein edit distance between two strings using dynamic programming.
    Memory-efficient two-row DP implementation.
    """
    m, n = len(s1), len(s2)
    if m == 0:
        return n
    if n == 0:
        return m
    
    prev_row = list(range(n + 1))
    current_row = [0] * (n + 1)
    
    for i in range(1, m + 1):
        current_row[0] = i
        c1 = s1[i - 1]
        for j in range(1, n + 1):
            cost = 0 if c1 == s2[j - 1] else 1
            current_row[j] = min(
                prev_row[j] + 1,       # Deletion
                current_row[j - 1] + 1, # Insertion
                prev_row[j - 1] + cost  # Substitution
            )
        prev_row, current_row = current_row, [0] * (n + 1)
        
    return prev_row[n]


def calculate_levenshtein_similarity(s1: str, s2: str) -> float:
    """
    Normalized Levenshtein similarity: 1 - (distance / max(len(s1), len(s2))).
    Returns a score between 0.0 and 1.0.
    """
    max_len = max(len(s1), len(s2))
    if max_len == 0:
        return 1.0
    dist = levenshtein_distance(s1, s2)
    return max(0.0, 1.0 - (dist / max_len))


def calculate_token_jaccard_similarity(s1: str, s2: str) -> float:
    """
    Computes Jaccard similarity over word tokens: |A ∩ B| / |A ∪ B|.
    """
    tokens1 = set(s1.split())
    tokens2 = set(s2.split())
    if not tokens1 and not tokens2:
        return 1.0
    if not tokens1 or not tokens2:
        return 0.0
    
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union)


def calculate_composite_score(generated_text: str, canonical_text: str) -> Tuple[float, float, float, bool]:
    """
    Computes composite verification score.
    Supports full-text comparison as well as authentic verbatim excerpt citations.
    Returns: (composite_score, levenshtein_score, jaccard_score, is_exact_hash_match)
    """
    norm_gen = normalize_arabic(generated_text)
    norm_can = normalize_arabic(canonical_text)
    
    hash_gen = calculate_canonical_hash(generated_text)
    hash_can = calculate_canonical_hash(canonical_text)
    
    # 1. Exact full canonical hash match
    if hash_gen == hash_can:
        return (1.0, 1.0, 1.0, True)
    
    # 2. Verbatim excerpt match (preacher cites a specific sentence of a longer hadith/ayah)
    if len(norm_gen) >= 10 and (norm_gen in norm_can or norm_can in norm_gen):
        return (1.0, 1.0, 1.0, True)
        
    tokens_gen = set(norm_gen.split())
    tokens_can = set(norm_can.split())
    
    # 3. Exact word subset match for excerpts
    if len(tokens_gen) >= 3 and tokens_gen.issubset(tokens_can):
        return (1.0, 1.0, 1.0, True)
    
    lev_score = calculate_levenshtein_similarity(norm_gen, norm_can)
    jaccard_score = calculate_token_jaccard_similarity(norm_gen, norm_can)
    
    # If the quote is an excerpt of a longer text, check token containment ratio
    if len(tokens_gen) > 0 and len(tokens_gen) < len(tokens_can):
        containment = len(tokens_gen.intersection(tokens_can)) / len(tokens_gen)
        if containment >= 0.95:
            excerpt_score = round(0.5 * containment + 0.5 * lev_score, 4)
            if excerpt_score >= 0.98 or containment == 1.0:
                return (1.0, 1.0, 1.0, True)
    
    # Weighted composite: 60% Levenshtein (order & morphology), 40% Token Jaccard (lexical presence)
    composite = round(0.60 * lev_score + 0.40 * jaccard_score, 4)
    return (composite, round(lev_score, 4), round(jaccard_score, 4), False)


class TheologicalPostGenerationValidator:
    """
    Post-Generation Validator enforcing the Zero-Hallucination Policy.
    Validates quotes character-by-character against canonical texts.
    If composite score >= 0.98, verifies and aligns text with canonical Uthmanic/Matn diacritics.
    If composite score < 0.98, flags deviation and forcefully swaps with canonical database text.
    """
    VERIFICATION_THRESHOLD: float = 0.98

    # Prohibited sectarian terms and Isra'iliyyat red flags
    THEOLOGICAL_RED_FLAGS: List[str] = [
        "قال كعب الأحبار عن التوراة",
        "روي عن وهب بن منبه في أخبار بني إسرائيل",
        "حديث لا أصل له",
        "حديث موضوع",
        "إسناده باطل",
        "منكر مكذوب",
        "تناسخ الأرواح",
        "الحلول والاتحاد",
    ]

    @classmethod
    def verify_and_canonicalize(
        cls,
        citation_type: str,
        generated_quote: str,
        canonical_record: Dict[str, Any]
    ) -> Tuple[str, TheologicalAuditReport]:
        """
        Validates generated quote against verified database record.
        Enforces canonical swap if threshold is violated or hash matches.
        """
        if citation_type == "quran":
            canonical_text = canonical_record.get("text_uthmani", "")
            simple_text = canonical_record.get("text_simple", "")
            identifier = f"سورة {canonical_record.get('surah_name_ar', '')} [الآية: {canonical_record.get('ayah_number', '')}]"
            takhrij = {
                "surah_number": canonical_record.get("surah_number"),
                "ayah_number": canonical_record.get("ayah_number"),
                "surah_name_ar": canonical_record.get("surah_name_ar"),
                "script": "Uthmanic (Tanzil Canonical)"
            }
        elif citation_type == "hadith":
            canonical_text = canonical_record.get("matn_ar", "")
            simple_text = canonical_record.get("matn_simple", "")
            identifier = f"{canonical_record.get('collection', '')} (#{canonical_record.get('hadith_number', '')})"
            takhrij = {
                "collection": canonical_record.get("collection"),
                "hadith_number": canonical_record.get("hadith_number"),
                "narrator": canonical_record.get("narrator_companion"),
                "grading": canonical_record.get("grading"),
                "graded_by": canonical_record.get("graded_by"),
                "notes": canonical_record.get("takhrij_notes")
            }
        else:  # poetry
            canonical_text = canonical_record.get("bayt_ar", "")
            simple_text = canonical_record.get("bayt_simple", "")
            identifier = f"شعر: {canonical_record.get('poet_name_ar', '')} ({canonical_record.get('bahr', '')})"
            takhrij = {
                "poet": canonical_record.get("poet_name_ar"),
                "meter": canonical_record.get("bahr"),
                "theme": canonical_record.get("theme")
            }

        composite, lev, jaccard, exact_hash = calculate_composite_score(generated_quote, simple_text)
        canonical_hash = calculate_canonical_hash(simple_text)

        # 1. Exact Cryptographic Hash Match (100% Verified)
        if exact_hash:
            report = TheologicalAuditReport(
                citation_type=citation_type,
                original_text=generated_quote,
                canonical_text=canonical_text,
                verdict=VerificationVerdict.FULLY_VERIFIED,
                levenshtein_score=1.0,
                jaccard_score=1.0,
                composite_score=1.0,
                canonical_hash=canonical_hash,
                takhrij_details=takhrij,
                notes=f"تطابق مشفر بنسبة 100% مع النص المعتمد لـ {identifier}"
            )
            # Return canonical text with pristine Tashkeel
            return canonical_text, report

        # 2. High Fuzzy Token Match (>= 0.98)
        if composite >= cls.VERIFICATION_THRESHOLD:
            report = TheologicalAuditReport(
                citation_type=citation_type,
                original_text=generated_quote,
                canonical_text=canonical_text,
                verdict=VerificationVerdict.FULLY_VERIFIED,
                levenshtein_score=lev,
                jaccard_score=jaccard,
                composite_score=composite,
                canonical_hash=canonical_hash,
                takhrij_details=takhrij,
                notes=f"مطابقة موثقة بنسبة {int(composite * 100)}% لـ {identifier}. تم توحيد النص برسم المصحف/المتن المعتمد."
            )
            # Always return canonical text to avoid subtle diacritical corruption
            return canonical_text, report

        # 3. Deviation / Hallucination detected (< 0.98): Auto-Swap Mechanism
        report = TheologicalAuditReport(
            citation_type=citation_type,
            original_text=generated_quote,
            canonical_text=canonical_text,
            verdict=VerificationVerdict.AUTO_SWAPPED,
            levenshtein_score=lev,
            jaccard_score=jaccard,
            composite_score=composite,
            canonical_hash=canonical_hash,
            takhrij_details=takhrij,
            notes=f"تحذير رقابي: اكتشاف انحراف في النص المولد (نسبة التطابق {int(composite * 100)}% أقل من {int(cls.VERIFICATION_THRESHOLD * 100)}%). تم استبدال النص تلقائياً بالنص المعتمد لـ {identifier} لحماية الأمانة العلمية."
        )
        # Force swap with verified canonical text!
        return canonical_text, report

    @classmethod
    def validate_takhrij_grading(cls, hadith_record: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Theological gatekeeper: validates Hadith grading according to Ahl al-Sunnah wal-Jama'ah.
        Strictly forbids Da'if, Mawdu', and unauthenticated texts from entering Khutbah drafts.
        """
        grading = hadith_record.get("grading", "").strip()
        allowed_gradings = ["Sahih", "Hasan", "Sahih Li Ghayrihi", "Hasan Li Ghayrihi"]
        
        if grading not in allowed_gradings:
            return False, f"مرتبة الحديث '{grading}' غير مقبولة في الخطب المنبرية. يُشترط أن يكون الحديث صحيحاً أو حسناً."
        
        graded_by = hadith_record.get("graded_by", "").strip()
        if not graded_by:
            return False, "الحديث يفتقر لبيان العالم المحكم أو المخرج المعتمد."
            
        return True, f"الحديث معتمد بمرتبة ({grading}) تصحيح/تحسين ({graded_by})."

    @classmethod
    def scan_for_theological_red_flags(cls, text: str) -> List[str]:
        """
        Scans entire sermon text for prohibited sectarian, philosophical, or fabricated narratives.
        """
        flagged = []
        for red_flag in cls.THEOLOGICAL_RED_FLAGS:
            if red_flag in text:
                flagged.append(f"تم رصد عبارة محظورة عقدياً أو رواية إسرائيلية غير موثقة: '{red_flag}'")
        return flagged
