"""
API Integration Tests for Minbar AI FastAPI Application.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["creed"] == "Ahl al-Sunnah wal-Jama'ah"
    assert data["zero_hallucination_engine"] == "ACTIVE"


def test_generate_sermon_endpoint():
    payload = {
        "theme": "بر الوالدين وحفظ حقوقهما",
        "sermon_type": "jumuah",
        "target_duration_minutes": 10,
        "audience_profile": "عامة المسلمين",
        "tone": "موعظة بليغة ومؤثرة",
        "quran_count": 1,
        "hadith_count": 1,
        "poetry_count": 1
    }
    response = client.post("/api/sermons/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["theological_creed"] == "Ahl al-Sunnah wal-Jama'ah"
    assert data["verification_status"] == "fully_verified"
    assert len(data["blocks"]) >= 6

    # Test GET sermon by id
    sermon_id = data["id"]
    get_res = client.get(f"/api/sermons/{sermon_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == sermon_id


def test_transform_block_endpoint():
    # First generate a sermon
    gen_payload = {
        "theme": "التوكل على الله وحسن الظن به",
        "sermon_type": "jumuah",
        "target_duration_minutes": 10,
        "quran_count": 1,
        "hadith_count": 1,
        "poetry_count": 1
    }
    gen_res = client.post("/api/sermons/generate", json=gen_payload)
    sermon = gen_res.json()
    sermon_id = sermon["id"]
    
    # Find an exposition block
    expo_block = next(b for b in sermon["blocks"] if b["block_type"] == "thematic_exposition")
    
    # Transform block: make_solemn
    transform_payload = {
        "sermon_id": sermon_id,
        "block_id": expo_block["id"],
        "action": "make_solemn"
    }
    trans_res = client.post("/api/sermons/transform-block", json=transform_payload)
    assert trans_res.status_code == 200
    trans_data = trans_res.json()
    assert trans_data["status"] == "success"
    assert "الْحَذَرَ" in trans_data["updated_block"]["content_ar"] or "عِبَادَ اللَّهِ" in trans_data["updated_block"]["content_ar"]


def test_search_citations_endpoint():
    res = client.post("/api/citations/search?query=الصبر&type=all")
    assert res.status_code == 200
    data = res.json()
    assert "quran" in data
    assert "hadith" in data
    assert len(data["quran"]) > 0


def test_verify_quote_endpoint():
    # Verify exact hadith quote
    hadith_quote = "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى"
    res = client.post(f"/api/citations/verify-quote?citation_type=hadith&quote={hadith_quote}")
    assert res.status_code == 200
    data = res.json()
    assert data["threshold_met"] is True
    assert data["report"]["verdict"] in ["fully_verified", "auto_swapped"]
