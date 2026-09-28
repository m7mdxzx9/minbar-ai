"""
Unit & Integration Tests for Minbar AI Multi-Agent LangGraph Pipeline.
"""

import pytest
from app.db.database import init_database, get_sermon_from_db
from app.agents.agents import (
    KhutbahStructurer,
    VerifiedCitationRetrieverAgent,
    RhetoricalSynthesizer,
    TheologicalLinguisticAuditor
)
from app.agents.graph import execute_sermon_pipeline
from app.engine.retriever import VerifiedCitationRetriever


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_database()


def test_planner_blueprint_generation():
    req = {
        "theme": "الصبر عند الشدائد وتفويض الأمر لله",
        "sermon_type": "jumuah",
        "target_duration_minutes": 15,
        "audience_profile": "عامة المصلين",
        "quran_count": 2,
        "hadith_count": 2,
        "poetry_count": 1
    }
    blueprint = KhutbahStructurer.generate_blueprint(req)
    
    assert blueprint["theme"] == req["theme"]
    assert blueprint["theological_creed"] == "Ahl al-Sunnah wal-Jama'ah"
    assert blueprint["target_word_count"] > 1000
    assert len(blueprint["sections"]) >= 8
    
    section_types = [s["block_type"] for s in blueprint["sections"]]
    assert "khutbat_al_hajah" in section_types
    assert "istighfar_pause" in section_types
    assert "second_khutbah" in section_types
    assert "closing_dua" in section_types


def test_retriever_agent_citations():
    retriever_engine = VerifiedCitationRetriever()
    agent = VerifiedCitationRetrieverAgent(retriever_engine)
    
    blueprint = {
        "theme": "النية والإخلاص في العمل",
        "citation_requirements": {"quran": 1, "hadith": 1, "poetry": 1}
    }
    citations = agent.fetch_citations_for_blueprint(blueprint)
    
    assert len(citations["quran"]) >= 1
    assert len(citations["hadith"]) >= 1
    assert len(citations["poetry"]) >= 1
    
    # Verify hadith is strictly Sahih or Hasan
    hadith = citations["hadith"][0]
    assert hadith["grading"] in ["Sahih", "Hasan"]
    assert "canonical_hash" in hadith


def test_full_langgraph_pipeline_execution():
    req = {
        "theme": "الأخوة في الله وحفظ حقوق المسلمين",
        "sermon_type": "jumuah",
        "target_duration_minutes": 12,
        "audience_profile": "المصلون في المسجد الجامع",
        "tone": "موعظة ترقق القلوب وتدعو إلى التراحم والتآلف",
        "quran_count": 1,
        "hadith_count": 1,
        "poetry_count": 1
    }
    
    final_sermon = execute_sermon_pipeline(req)
    
    assert final_sermon is not None
    assert final_sermon["theological_creed"] == "Ahl al-Sunnah wal-Jama'ah"
    assert final_sermon["verification_status"] == "fully_verified"
    assert final_sermon["word_count"] > 200
    assert final_sermon["estimated_delivery_minutes"] > 0
    assert len(final_sermon["blocks"]) >= 6
    
    # Check that database persistence succeeded
    db_sermon = get_sermon_from_db(final_sermon["id"])
    assert db_sermon is not None
    assert len(db_sermon["blocks"]) == len(final_sermon["blocks"])
    
    # Confirm that citation blocks have verified flag set to True
    citation_blocks = [b for b in final_sermon["blocks"] if b.get("citation_source_type")]
    assert len(citation_blocks) >= 2
    for cb in citation_blocks:
        assert cb["verified"] is True
        assert cb["verification_score"] >= 0.98


def test_sermon_customization_counts_and_selection():
    """Verify that user customization of citation counts and specific selection works dynamically."""
    req = {
        "theme": "بر الوالدين وحقهما في الإسلام",
        "sermon_type": "jumuah",
        "target_duration_minutes": 15,
        "quran_count": 3,
        "hadith_count": 2,
        "poetry_count": 0,
        "selected_citation_ids": ["q_17_23", "h_1"]
    }

    final_sermon = execute_sermon_pipeline(req)
    assert final_sermon is not None

    blocks = final_sermon["blocks"]
    quran_blocks = [b for b in blocks if b.get("citation_source_type") == "quran"]
    hadith_blocks = [b for b in blocks if b.get("citation_source_type") == "hadith"]
    poetry_blocks = [b for b in blocks if b.get("citation_source_type") == "poetry"]

    # Verify exact counts
    assert len(quran_blocks) == 3, f"Expected 3 quran blocks, got {len(quran_blocks)}"
    assert len(hadith_blocks) == 2, f"Expected 2 hadith blocks, got {len(hadith_blocks)}"
    assert len(poetry_blocks) == 0, f"Expected 0 poetry blocks, got {len(poetry_blocks)}"

    # Verify that the selected citations are present
    assert any("الإسراء" in b.get("title_ar", "") or "23" in b.get("title_ar", "") for b in quran_blocks)
    assert any("1" in str(b.get("title_ar", "")) or "بدء الوحي" in str(b.get("content_ar", "")) or "الأعمال بالنيات" in str(b.get("content_ar", "")) for b in hadith_blocks)

    # Verify sequential ordering
    order_indices = [b["order_index"] for b in blocks]
    assert order_indices == list(range(1, len(blocks) + 1))

