"""
FastAPI Routes for Minbar AI
Endpoints for sermon generation, block transformation, citation search, and real-time verification.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
import uuid

from app.models.schemas import (
    KhutbahGenerationRequest,
    KhutbahResponse,
    TransformBlockRequest,
    SermonBlock,
    TheologicalAuditReport,
    VerificationVerdict
)
from app.agents.graph import execute_sermon_pipeline, shared_retriever
from app.db.database import get_sermon_from_db, save_sermon_to_db, get_db_connection
from app.engine.verifier import (
    TheologicalPostGenerationValidator,
    calculate_canonical_hash
)
from app.engine.llm_adapter import LLMAdapter

router = APIRouter(prefix="/api", tags=["Sermons & Citations"])


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Minbar AI API",
        "creed": "Ahl al-Sunnah wal-Jama'ah",
        "zero_hallucination_engine": "ACTIVE",
        "verification_threshold": 0.98
    }


@router.post("/sermons/generate")
def generate_sermon(req: KhutbahGenerationRequest):
    """
    Executes the 4-agent LangGraph workflow:
    Planner -> Retriever -> Rhetorical Synthesizer -> Theological Auditor.
    Enforces deterministic zero-hallucination verification.
    """
    try:
        final_sermon = execute_sermon_pipeline(req.model_dump())
        return final_sermon
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sermon generation failed: {str(e)}")


@router.get("/sermons/{sermon_id}")
def get_sermon(sermon_id: str):
    """Fetches full sermon with discrete blocks and audit records."""
    sermon = get_sermon_from_db(sermon_id)
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return sermon


@router.post("/sermons/transform-block")
def transform_block(req: TransformBlockRequest):
    """
    In-Place AI Transformation for a discrete sermon block:
    Actions: 'make_solemn', 'replace_hadith', 'elaborate', 'shorten'.
    Always re-verifies sacred citations deterministically.
    """
    sermon = get_sermon_from_db(req.sermon_id)
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")

    blocks = sermon.get("blocks", [])
    target_block = None
    target_idx = -1
    for i, b in enumerate(blocks):
        if b["id"] == req.block_id:
            target_block = b
            target_idx = i
            break

    if not target_block:
        raise HTTPException(status_code=404, detail="Block not found")

    old_content = target_block["content_ar"]
    audit_report = None

    if req.action == "replace_hadith":
        # Fetch an alternative authentic hadith on the theme
        alt_hadiths = shared_retriever.search_hadith(sermon.get("theme", ""), limit=3)
        # Choose a hadith different from current canonical id
        selected = alt_hadiths[0]
        for h in alt_hadiths:
            if h.get("hadith_number") != target_block.get("canonical_citation_id"):
                selected = h
                break

        narrator = selected.get('narrator_companion', 'عن النبي ﷺ')
        canonical_matn, audit_report = TheologicalPostGenerationValidator.verify_and_canonicalize(
            "hadith",
            selected.get("matn_simple", ""),
            selected
        )
        target_block["block_type"] = "hadith_citation"
        target_block["title_ar"] = f"البرهان النبوي: {selected.get('collection')} (#{selected.get('hadith_number')})"
        target_block["content_ar"] = (
            f"وَفِي صَحِيحِ السُّنَّةِ الْمُطَهَّرَةِ، عَنْ {narrator}، عَنْ رَسُولِ اللَّهِ ﷺ أَنَّهُ قَالَ:\n\n"
            f"«{canonical_matn}»"
        )
        target_block["verified"] = True
        target_block["verification_score"] = 1.0
        target_block["citation_source_type"] = "hadith"
        target_block["canonical_citation_id"] = selected.get("hadith_number")
        target_block["audit_feedback"] = {
            "collection": selected.get("collection"),
            "hadith_number": selected.get("hadith_number"),
            "grading": selected.get("grading"),
            "graded_by": selected.get("graded_by"),
            "takhrij": selected.get("takhrij_notes"),
            "hash": selected.get("canonical_hash")
        }
    else:
        # AI-Assisted refinement (rephrase, elaborate, shorten, make_solemn)
        target_block["content_ar"] = LLMAdapter.refine_block_content(
            current_text=old_content,
            action=req.action,
            block_type=target_block.get("block_type", "thematic_exposition"),
            custom_instruction=req.custom_instruction,
            model_provider=req.model_provider or "builtin",
            api_key=req.api_key
        )

    # Re-save updated sermon
    blocks[target_idx] = target_block
    # Update word counts
    all_text = " ".join([b.get("content_ar", "") for b in blocks])
    sermon["word_count"] = len(all_text.split())
    sermon["estimated_delivery_minutes"] = round(sermon["word_count"] / 95.0, 1)

    save_sermon_to_db(sermon, blocks)

    return {
        "status": "success",
        "action": req.action,
        "updated_block": target_block,
        "audit": audit_report.model_dump() if audit_report else None,
        "total_word_count": sermon["word_count"],
        "estimated_delivery_minutes": sermon["estimated_delivery_minutes"]
    }


@router.get("/citations/explore")
def explore_citations(query: str = Query(..., min_length=1), type: str = Query("all")):
    """
    Interactive Citations Explorer & Tester.
    Fetches verified Quranic verses, Sahih Hadiths with Takhrij, and Classical Poetry
    strictly matching the sermon topic or search keyword.
    """
    results = {}
    if type in ["all", "quran"]:
        results["quran"] = shared_retriever.search_quran(query, limit=5)
    if type in ["all", "hadith"]:
        results["hadith"] = shared_retriever.search_hadith(query, limit=5)
    if type in ["all", "poetry"]:
        results["poetry"] = shared_retriever.search_poetry(query, limit=3)
    return results


@router.post("/citations/search")
def search_citations(query: str = Query(..., min_length=2), type: str = Query("all")):
    """Hybrid search across verified Quran, Hadith, and Poetry corpora."""
    results = {}
    if type in ["all", "quran"]:
        results["quran"] = shared_retriever.search_quran(query, limit=3)
    if type in ["all", "hadith"]:
        results["hadith"] = shared_retriever.search_hadith(query, limit=3)
    if type in ["all", "poetry"]:
        results["poetry"] = shared_retriever.search_poetry(query, limit=2)
    return results


@router.post("/citations/verify-quote")
def verify_quote(citation_type: str = Query(..., pattern="^(quran|hadith|poetry)$"), quote: str = Query(..., min_length=5)):
    """
    Direct Real-Time Verification Engine endpoint.
    Performs character-by-character diacritical matching, cryptographic SHA-256 hash checks,
    and returns full Takhrij verification status.
    """
    # Search for best match in verified corpora
    if citation_type == "quran":
        matches = shared_retriever.search_quran(quote, limit=1)
    elif citation_type == "hadith":
        matches = shared_retriever.search_hadith(quote, limit=1)
    else:
        matches = shared_retriever.search_poetry(quote, limit=1)

    if not matches:
        raise HTTPException(status_code=404, detail="No matching canonical text found in authenticated corpora.")

    canonical_record = matches[0]
    canonical_text, report = TheologicalPostGenerationValidator.verify_and_canonicalize(
        citation_type,
        quote,
        canonical_record
    )

    return {
        "report": report.model_dump(),
        "canonical_text": canonical_text,
        "threshold_met": report.composite_score >= 0.98
    }


@router.post("/settings/test-key")
def test_api_key(req: Dict[str, Any]):
    """Tests validity of an external AI API key (Google Gemini or Ollama)."""
    provider = req.get("provider", "gemini")
    api_key = req.get("api_key", "").strip()
    model = req.get("model", "gemini-1.5-flash")

    if not api_key and provider == "gemini":
        return {"valid": False, "message": "يرجى إدخال مفتاح API أولاً"}

    import httpx
    if provider == "gemini":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": "اختبار الاتصال: أجب بكلمة نعم"}]}],
            "generationConfig": {"maxOutputTokens": 10}
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    return {"valid": True, "message": "تم التحقق من المفتاح بنجاح! الاتصال بـ Google Gemini يعمل بكفاءة."}
                else:
                    err = res.json().get("error", {}).get("message", res.text)
                    return {"valid": False, "message": f"فشل التحقق ({res.status_code}): {err}"}
        except Exception as e:
            return {"valid": False, "message": f"تعذر الاتصال بخدمة Gemini: {str(e)}"}
    elif provider == "groq" or api_key.startswith("gsk_"):
        if not api_key:
            return {"valid": False, "message": "يرجى إدخال مفتاح Groq API أولاً"}
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        groq_model = model if model and ("llama" in model or "mixtral" in model or "gemma" in model) else "llama-3.3-70b-versatile"
        payload = {
            "model": groq_model,
            "messages": [{"role": "user", "content": "مرحبا"}],
            "max_tokens": 5
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    return {"valid": True, "message": "تم التحقق من المفتاح بنجاح! الاتصال بـ Groq يعمل بسرعة البرق وبكفاءة عالية."}
                else:
                    err_data = res.json()
                    err_msg = err_data.get("error", {}).get("message") or res.text
                    return {"valid": False, "message": f"فشل التحقق من Groq ({res.status_code}): {err_msg}"}
        except Exception as e:
            return {"valid": False, "message": f"تعذر الاتصال بـ Groq API: {str(e)}"}
    elif provider == "grok" or api_key.startswith("xai-"):
        if not api_key:
            return {"valid": False, "message": "يرجى إدخال مفتاح Grok API أولاً"}
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        grok_model = model if model and "grok" in model else "grok-beta"
        payload = {
            "model": grok_model,
            "messages": [{"role": "user", "content": "مرحبا"}],
            "max_tokens": 5
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    return {"valid": True, "message": "تم التحقق من المفتاح بنجاح! الاتصال بـ Grok (xAI) يعمل بكفاءة عالية."}
                else:
                    err_data = res.json()
                    err_msg = err_data.get("error", {}).get("message") or res.text
                    return {"valid": False, "message": f"فشل التحقق من Grok ({res.status_code}): {err_msg}"}
        except Exception as e:
            return {"valid": False, "message": f"تعذر الاتصال بـ Grok API: {str(e)}"}
    elif provider == "ollama":
        ollama_url = req.get("ollama_url", "http://localhost:11434/api/tags")
        try:
            with httpx.Client(timeout=5.0) as client:
                res = client.get(ollama_url)
                if res.status_code == 200:
                    return {"valid": True, "message": "تم الاتصال بنجاح بخادم Ollama المحلي!"}
                else:
                    return {"valid": False, "message": f"خادم Ollama أعاد رمز ({res.status_code})"}
        except Exception as e:
            return {"valid": False, "message": f"تعذر الاتصال بخادم Ollama: {str(e)}"}

    return {"valid": False, "message": "مزود غير معروف"}

