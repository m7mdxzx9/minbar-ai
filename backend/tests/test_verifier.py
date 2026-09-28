"""
Unit and Integration Test Suite for Minbar AI
Tests for Deterministic Verification Engine, Tashkeel Normalization, and RAG Retriever.
"""

import pytest
from app.db.database import init_database
from app.engine.verifier import (
    normalize_arabic,
    calculate_canonical_hash,
    calculate_levenshtein_similarity,
    calculate_token_jaccard_similarity,
    calculate_composite_score,
    TheologicalPostGenerationValidator,
    VerificationVerdict
)
from app.engine.retriever import VerifiedCitationRetriever
from app.db.seed_data import QURAN_SEED_DATA, HADITH_SEED_DATA, POETRY_SEED_DATA


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_database()


def test_arabic_normalization():
    # Text with Tashkeel, Tatweel, and Quranic signs
    raw_text = "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱتَّقُواْ ٱللَّهَ حَقَّ تُقَاتِهِۦ وَلَا تَمُوتُنَّ إِلَّا وَأَنتُم مُّسۡلِمُونَ"
    normalized = normalize_arabic(raw_text)
    
    assert "َ" not in normalized  # No Fatha
    assert "ُ" not in normalized  # No Damma
    assert "ِ" not in normalized  # No Kasra
    assert "ّ" not in normalized  # No Shaddah
    assert "ۡ" not in normalized  # No Quranic Sukun
    assert "يأيها الذين امنوا اتقوا الله حق تقاته ولا تموتن إلا وانتم مسلمون" in normalized or "مسلمون" in normalized


def test_canonical_hash_determinism():
    text1 = "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ"
    text2 = "إنما الأعمال بالنيات"
    hash1 = calculate_canonical_hash(text1)
    hash2 = calculate_canonical_hash(text2)
    assert hash1 == hash2, "Canonical hash must be identical regardless of Tashkeel presence"


def test_exact_cryptographic_verification():
    hadith = HADITH_SEED_DATA[0]
    canonical_text, report = TheologicalPostGenerationValidator.verify_and_canonicalize(
        "hadith",
        hadith["matn_simple"],
        hadith
    )
    
    assert report.verdict == VerificationVerdict.FULLY_VERIFIED
    assert report.composite_score == 1.0
    assert report.levenshtein_score == 1.0
    assert canonical_text == hadith["matn_ar"], "Must return canonical matn with full Tashkeel"


def test_fuzzy_match_above_threshold():
    # Minor single-character typo or spacing
    quran = QURAN_SEED_DATA[0]
    slightly_altered = "يا ايها الذين امنوا اتقوا الله حق تقاته ولا تموتن الا وانتم مسلمون"
    canonical_text, report = TheologicalPostGenerationValidator.verify_and_canonicalize(
        "quran",
        slightly_altered,
        quran
    )
    
    assert report.composite_score >= 0.98
    assert report.verdict == VerificationVerdict.FULLY_VERIFIED
    assert canonical_text == quran["text_uthmani"], "Must auto-align with canonical Uthmanic script"


def test_auto_swap_on_hallucination_or_deviation():
    # Simulated hallucinated / corrupted text
    hadith = HADITH_SEED_DATA[0]
    hallucinated_text = "إنما الأعمال بالنيات الصالحة وإنما لكل إنسان ما تمنى ورجا"
    
    canonical_text, report = TheologicalPostGenerationValidator.verify_and_canonicalize(
        "hadith",
        hallucinated_text,
        hadith
    )
    
    # Must flag deviation (< 0.98) and trigger auto-swap
    assert report.verdict == VerificationVerdict.AUTO_SWAPPED
    assert report.composite_score < 0.98
    assert canonical_text == hadith["matn_ar"], "Zero-Hallucination Policy: Must force-swap with authentic Matn"
    assert "تحذير رقابي" in report.notes


def test_takhrij_grading_gatekeeper():
    # Authentic Hadith
    valid_record = {
        "grading": "Sahih",
        "graded_by": "Al-Bukhari & Muslim",
        "collection": "Sahih al-Bukhari"
    }
    is_valid, msg = TheologicalPostGenerationValidator.validate_takhrij_grading(valid_record)
    assert is_valid is True
    assert "معتمد" in msg

    # Prohibited Da'if / Mawdu'
    invalid_record = {
        "grading": "Mawdu' (موضوع)",
        "graded_by": "Ibn al-Jawzi",
        "collection": "Al-Mawdu'at"
    }
    is_valid, msg = TheologicalPostGenerationValidator.validate_takhrij_grading(invalid_record)
    assert is_valid is False
    assert "غير مقبولة" in msg


def test_theological_red_flag_scanner():
    clean_text = "الحمد لله والصلاة والسلام على رسول الله، أوصيكم ونفسي بتقوى الله."
    assert len(TheologicalPostGenerationValidator.scan_for_theological_red_flags(clean_text)) == 0

    contaminated_text = "وقد روي عن وهب بن منبه في أخبار بني إسرائيل قصة غريبة..."
    flags = TheologicalPostGenerationValidator.scan_for_theological_red_flags(contaminated_text)
    assert len(flags) > 0
    assert "رواية إسرائيلية" in flags[0]


def test_retriever_hybrid_search():
    retriever = VerifiedCitationRetriever()
    
    # Search Quran for patience/prayer
    q_results = retriever.search_quran("الصبر والصلاة", limit=2)
    assert len(q_results) > 0
    assert any("الصبر" in item["text_simple"] for item in q_results)
    assert all("canonical_hash" in item for item in q_results)

    # Search Hadith for intention
    h_results = retriever.search_hadith("النيات", limit=1)
    assert len(h_results) == 1
    assert "النيات" in h_results[0]["matn_simple"]
    assert h_results[0]["grading"] in ["Sahih", "Hasan"]

    # Search Poetry for asceticism/wisdom
    p_results = retriever.search_poetry("الزهد", limit=1)
    assert len(p_results) == 1
    assert len(p_results[0]["bahr"]) > 0
