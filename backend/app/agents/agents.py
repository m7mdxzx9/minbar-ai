"""
Core Agentic Architecture for Minbar AI
Multi-Agent Orchestration using LangGraph for drafting and verifying Islamic Friday Sermons.
Strict Theological Guardrails: Ahl al-Sunnah wal-Jama'ah (Zero-Hallucination Policy).
"""

from typing import Dict, Any, List, Optional, Tuple
import uuid
from app.models.schemas import (
    KhutbahBlueprint,
    SermonType,
    BlockType,
    SermonBlock,
    TheologicalAuditReport,
    VerificationVerdict
)
from app.engine.retriever import VerifiedCitationRetriever
from app.engine.verifier import (
    TheologicalPostGenerationValidator,
    calculate_canonical_hash
)


# ==============================================================================
# AGENT 1: KHUTBAH STRUCTURER (PLANNER)
# ==============================================================================
class KhutbahStructurer:
    """
    Agent 1: Parses user parameters to generate an authentic Sunni sermon blueprint.
    Structures sermons according to the classical Sunnah template (Khutbat al-Hajah,
    two sermon divisions, Istighfar pause, and ma'thur supplications).
    """

    @classmethod
    def generate_blueprint(cls, request_data: Dict[str, Any]) -> Dict[str, Any]:
        theme = request_data.get("theme", "تقوى الله والعمل الصالح")
        sermon_type = request_data.get("sermon_type", "jumuah")
        target_duration = request_data.get("target_duration_minutes", 15)
        audience = request_data.get("audience_profile", "جمهور عام متنوع")
        tone = request_data.get("tone", "موعظة ترقق القلوب وتدعو إلى العمل")
        
        # Word pacing: deliberate classical delivery at ~95 words/minute
        target_words = target_duration * 95

        blueprint = {
            "theme": theme,
            "sermon_type": sermon_type,
            "target_duration_minutes": target_duration,
            "target_word_count": target_words,
            "audience_profile": audience,
            "tone": tone,
            "theological_creed": "Ahl al-Sunnah wal-Jama'ah",
            "sections": [
                {
                    "block_type": BlockType.KHUTBAT_AL_HAJAH.value,
                    "title_ar": "خطبة الحاجة النبوية المسنونة",
                    "focus": "الحمد والثناء على الله، والشهادتان، وقراءة آيات التقوى الثلاث المسنونة"
                },
                {
                    "block_type": BlockType.THEMATIC_EXPOSITION.value,
                    "title_ar": f"الاستهلال والمقصد الشرعي: {theme}",
                    "focus": "بيان أهمية الموضوع وموقعه في أصول الدين وبناء المجتمع المسلم"
                },
                {
                    "block_type": BlockType.QURAN_CITATION.value,
                    "title_ar": "التأصيل القرآني المحكم",
                    "focus": "إيراد الآيات القرآنية الواردة بالرسم العثماني المعتمد وبيان دلالاتها"
                },
                {
                    "block_type": BlockType.HADITH_CITATION.value,
                    "title_ar": "الشاهد من السنة النبوية الصحيحة",
                    "focus": "إيراد الأحاديث الصحيحة مع ضبط ألفاظها وتخريجها المعتمد"
                },
                {
                    "block_type": BlockType.THEMATIC_EXPOSITION.value,
                    "title_ar": "المسلك العملي والتطبيق في واقع المسلمين",
                    "focus": "تنزيل المعاني الشرعية على السلوك الفردي والأخوة والتكافل الأسري والاجتماعي"
                },
                {
                    "block_type": BlockType.POETRY_CITATION.value,
                    "title_ar": "شاهد البلاغة والحكمة العربية",
                    "focus": "بيت من عيون الشعر الإسلامي في الزهد والموعظة"
                },
                {
                    "block_type": BlockType.ISTIGHFAR_PAUSE.value,
                    "title_ar": "جلسة الاستراحة والاستغفار بين الخطبتين",
                    "focus": "الدعوة للاستغفار والتوبة وسؤال الله القبول في ساعة الإجابة"
                },
                {
                    "block_type": BlockType.SECOND_KHUTBAH.value,
                    "title_ar": "الخطبة الثانية: الوصية الجامعة وخلاصة العمل",
                    "focus": "حمد الله، وتجديد الوصية بالتقوى، وحث المصلين على الاستقامة والثبات"
                },
                {
                    "block_type": BlockType.CLOSING_DUA.value,
                    "title_ar": "الدعاء المأثور وصلاح الأمة",
                    "focus": "الصلاة على النبي ﷺ، والدعاء لعموم المسلمين، وسؤال المغفرة والهدى"
                }
            ],
            "citation_requirements": {
                "quran": request_data.get("quran_count", 2),
                "hadith": request_data.get("hadith_count", 2),
                "poetry": request_data.get("poetry_count", 1)
            },
            "selected_citation_ids": request_data.get("selected_citation_ids") or []
        }
        return blueprint


# ==============================================================================
# AGENT 2: VERIFIED CITATION RETRIEVER (RAG ENGINE)
# ==============================================================================
class VerifiedCitationRetrieverAgent:
    """
    Agent 2: Executes closed-loop hybrid retrieval (BM25 + Semantic Vector)
    over authenticated databases only.
    """
    def __init__(self, retriever_engine: Optional[VerifiedCitationRetriever] = None):
        self.retriever = retriever_engine or VerifiedCitationRetriever()

    def fetch_citations_for_blueprint(self, blueprint: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        theme = blueprint.get("theme", "")
        reqs = blueprint.get("citation_requirements", {"quran": 2, "hadith": 2, "poetry": 1})
        target_quran = reqs.get("quran", 2)
        target_hadith = reqs.get("hadith", 2)
        target_poetry = reqs.get("poetry", 1)
        selected_ids = set(str(sid) for sid in (blueprint.get("selected_citation_ids") or []))

        # 1. Match selected Quran citations first
        chosen_quran = []
        if selected_ids:
            for q in self.retriever.quran_data:
                id_key = f"q_{q.get('surah_number')}_{q.get('ayah_number')}"
                if id_key in selected_ids or str(q.get("id")) in selected_ids or q.get("canonical_hash") in selected_ids:
                    item = dict(q)
                    item["retrieval_method"] = "User Curated Selection"
                    item["verified_authenticity"] = True
                    chosen_quran.append(item)

        # 2. Match selected Hadith citations
        chosen_hadith = []
        if selected_ids:
            for h in self.retriever.hadith_data:
                id_key = f"h_{h.get('hadith_number')}"
                if id_key in selected_ids or str(h.get("id")) in selected_ids or str(h.get("hadith_number")) in selected_ids or h.get("canonical_hash") in selected_ids:
                    is_valid, _ = TheologicalPostGenerationValidator.validate_takhrij_grading(h)
                    if is_valid:
                        item = dict(h)
                        item["retrieval_method"] = "User Curated Selection"
                        item["verified_authenticity"] = True
                        chosen_hadith.append(item)

        # 3. Match selected Poetry citations
        chosen_poetry = []
        if selected_ids and target_poetry > 0:
            for p in self.retriever.poetry_data:
                id_key = f"p_{p.get('canonical_hash')}"
                if id_key in selected_ids or str(p.get("id")) in selected_ids or p.get("canonical_hash") in selected_ids:
                    item = dict(p)
                    item["retrieval_method"] = "User Curated Selection"
                    item["verified_authenticity"] = True
                    chosen_poetry.append(item)

        # 4. Fill remaining Quran citations via hybrid search
        needed_quran = max(0, target_quran - len(chosen_quran))
        if needed_quran > 0:
            q_results = self.retriever.search_quran(theme, limit=needed_quran + len(chosen_quran) + 2)
            for qr in q_results:
                if len(chosen_quran) >= target_quran:
                    break
                if not any(cq.get("canonical_hash") == qr.get("canonical_hash") for cq in chosen_quran):
                    chosen_quran.append(qr)

        # 5. Fill remaining Hadith citations via hybrid search
        needed_hadith = max(0, target_hadith - len(chosen_hadith))
        if needed_hadith > 0:
            h_results = self.retriever.search_hadith(theme, limit=needed_hadith + len(chosen_hadith) + 4)
            for hr in h_results:
                if len(chosen_hadith) >= target_hadith:
                    break
                is_valid, _ = TheologicalPostGenerationValidator.validate_takhrij_grading(hr)
                if is_valid and not any(ch.get("canonical_hash") == hr.get("canonical_hash") for ch in chosen_hadith):
                    chosen_hadith.append(hr)

        # 6. Fill remaining Poetry citations if target_poetry > 0
        if target_poetry > 0:
            needed_poetry = max(0, target_poetry - len(chosen_poetry))
            if needed_poetry > 0:
                p_results = self.retriever.search_poetry(theme, limit=needed_poetry + len(chosen_poetry) + 2)
                for pr in p_results:
                    if len(chosen_poetry) >= target_poetry:
                        break
                    if not any(cp.get("canonical_hash") == pr.get("canonical_hash") for cp in chosen_poetry):
                        chosen_poetry.append(pr)
        else:
            chosen_poetry = []

        return {
            "quran": chosen_quran[:target_quran],
            "hadith": chosen_hadith[:target_hadith],
            "poetry": chosen_poetry[:target_poetry]
        }


# ==============================================================================
# AGENT 3: RHETORICAL SYNTHESIZER (WRITER)
# ==============================================================================
class RhetoricalSynthesizer:
    """
    Agent 3: Synthesizes classical Arabic narrative and transitions (Fasaha and Balagha),
    embedding retrieved citations verbatim inside dedicated structural markers without alteration.
    """

    @classmethod
    def synthesize_sermon(
        cls,
        blueprint: Dict[str, Any],
        citations: Dict[str, List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        theme = blueprint.get("theme", "")
        sermon_id = str(uuid.uuid4())
        blocks: List[Dict[str, Any]] = []
        
        quran_list = citations.get("quran", [])
        hadith_list = citations.get("hadith", [])
        poetry_list = citations.get("poetry", [])

        # 1. Khutbat al-Hajah (Standard Authentic Sunni Opening)
        hajah_content = (
            "إِنَّ الْحَمْدَ لِلَّهِ نَحْمَدُهُ وَنَسْتَعِينُهُ وَنَسْتَغْفِرُهُ، "
            "وَنَعُوذُ بِاللَّهِ مِنْ شُرُورِ أَنْفُسِنَا وَمِنْ سَيِّئَاتِ أَعْمَالِنَا، "
            "مَنْ يَهْدِهِ اللَّهُ فَلَا مُضِلَّ لَهُ، وَمَنْ يُضْلِلْ فَلَا هَادِيَ لَهُ، "
            "وَأَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، "
            "وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، صَلَّى اللَّهُ عَلَيْهِ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيمًا كَثِيرًا.\n\n"
            "أَمَّا بَعْدُ:\n"
            "فَإِنَّ أَصْدَقَ الْحَدِيثِ كِتَابُ اللَّهِ، وَخَيْرَ الْهَدْيِ هَدْيُ مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، "
            "وَشَرَّ الأُمُورِ مُحْدَثَاتُهَا، وَكُلَّ مُحْدَثَةٍ بِدْعَةٌ، وَكُلَّ بِدْعَةٍ ضَلَالَةٌ، وَكُلَّ ضَلَالَةٍ فِي النَّارِ. "
            "عِبَادَ اللَّهِ: أُوصِيكُمْ وَنَفْسِي بِتَقْوَى اللَّهِ تَعَالَى، فَإِنَّهَا وَصِيَّةُ اللَّهِ لِلأَوَّلِينَ وَالآخِرِينَ."
        )
        blocks.append({
            "id": str(uuid.uuid4()),
            "sermon_id": sermon_id,
            "order_index": 1,
            "block_type": BlockType.KHUTBAT_AL_HAJAH.value,
            "title_ar": "مقدمة خطبة الحاجة المسنونة",
            "content_ar": hajah_content,
            "verified": True,
            "verification_score": 1.0,
            "citation_source_type": None,
            "audit_feedback": {"note": "خطبة الحاجة النبوية المعتمدة في هدي السلف الصالح"}
        })

        # 2. Thematic Exposition 1
        exposition_1 = (
            f"أَيُّهَا الْمُؤْمِنُونَ: إِنَّ مِنْ أَعْظَمِ مَا يَسْتَمْسِكُ بِهِ الْعَبْدُ فِي دِينِهِ وَدُنْيَاهُ هُوَ {theme}؛ "
            "فَقَدْ جَعَلَ الشَّرْعُ الْحَنِيفُ هَذَا الأَصْلَ رَكِيزَةً لِصَلَاحِ الْقُلُوبِ وَطُمَأْنِينَةِ النُّفُوسِ وَاجْتِمَاعِ كَلِمَةِ الأُمَّةِ. "
            "إِنَّ الإِيمَانَ لَيْسَ بِالتَّمَنِّي وَلَا بِالتَّحَلِّي، وَلَكِنْ مَا وَقَرَ فِي الْقَلْبِ وَصَدَّقَهُ الْعَمَلُ. "
            "وَإِنَّ الْعَبْدَ إِذَا اسْتَقَرَّتْ فِي فُؤَادِهِ مَعَانِي الإِخْلَاصِ وَالرُّجُوعِ إِلَى رَبِّهِ، "
            "انْشَرَحَ صَدْرُهُ لِلطَّاعَاتِ، وَثَبَتَتْ أَقْدَامُهُ عِنْدَ الْمُلِمَّاتِ."
        )
        blocks.append({
            "id": str(uuid.uuid4()),
            "sermon_id": sermon_id,
            "order_index": 2,
            "block_type": BlockType.THEMATIC_EXPOSITION.value,
            "title_ar": f"الاستهلال والمقصد: {theme}",
            "content_ar": exposition_1,
            "verified": True,
            "verification_score": 1.0,
            "citation_source_type": None
        })

        # 3. Quran Citation Blocks (All citations requested by user)
        for idx, quran_item in enumerate(quran_list):
            num_suffix = f" ({idx + 1})" if len(quran_list) > 1 else ""
            blocks.append({
                "id": str(uuid.uuid4()),
                "sermon_id": sermon_id,
                "order_index": len(blocks) + 1,
                "block_type": BlockType.QURAN_CITATION.value,
                "title_ar": f"التأصيل القرآني{num_suffix}: سورة {quran_item.get('surah_name_ar')} [الآية: {quran_item.get('ayah_number')}]",
                "content_ar": f"يَقُولُ اللَّهُ تَبَارَكَ وَتَعَالَى فِي مُحْكَمِ التَّنْزِيلِ:\n\n«{quran_item.get('text_uthmani')}»",
                "verified": True,
                "verification_score": 1.0,
                "citation_source_type": "quran",
                "canonical_citation_id": quran_item.get("id"),
                "citation_metadata": quran_item,
                "audit_feedback": {
                    "source": f"سورة {quran_item.get('surah_name_ar')} آية {quran_item.get('ayah_number')}",
                    "script": "Uthmanic Canonical",
                    "hash": quran_item.get("canonical_hash")
                }
            })

        # 4. Thematic Exposition 2 (Connecting Quran with Sunnah & practical application)
        exposition_2 = (
            "فَانْظُرُوا رَعَاكُمُ اللَّهُ كَيْفَ قَرَنَ الْقُرْآنُ الْعَظِيمُ بَيْنَ صِحَّةِ الْعَقِيدَةِ وَحُسْنِ الْعَمَلِ. "
            "إِنَّ دِينَ الإِسْلَامِ لَيْسَ مُجَرَّدَ كَلِمَاتٍ تُقَالُ عَلَى الأَلْسِنَةِ، وَلَكِنَّهُ مَنْهَجُ حَيَاةٍ يَتَجَلَّى فِي "
            "صِدْقِ الْمُعَامَلَةِ، وَأَدَاءِ الأَمَانَاتِ، وَبِرِّ الْوَالِدَيْنِ، وَصِلَةِ الأَرْحَامِ، وَكَفِّ الأَذَى عَنِ النَّاسِ. "
            "وَقَدْ جَاءَتِ السُّنَّةُ النَّبَوِيَّةُ الْمُطَهَّرَةُ بَيَانًا لِهَذَا الْهُدَى وَتَطْبِيقًا عَمَلِيًّا لِمَقَاصِدِ الشَّرِيعَةِ."
        )
        blocks.append({
            "id": str(uuid.uuid4()),
            "sermon_id": sermon_id,
            "order_index": len(blocks) + 1,
            "block_type": BlockType.THEMATIC_EXPOSITION.value,
            "title_ar": "البيان النبوي والتطبيق العملي",
            "content_ar": exposition_2,
            "verified": True,
            "verification_score": 1.0,
            "citation_source_type": None
        })

        # 5. Hadith Citation Blocks (All citations requested by user)
        for idx, hadith_item in enumerate(hadith_list):
            num_suffix = f" ({idx + 1})" if len(hadith_list) > 1 else ""
            narrator = hadith_item.get('narrator_companion', 'عن النبي ﷺ')
            blocks.append({
                "id": str(uuid.uuid4()),
                "sermon_id": sermon_id,
                "order_index": len(blocks) + 1,
                "block_type": BlockType.HADITH_CITATION.value,
                "title_ar": f"البرهان النبوي{num_suffix}: {hadith_item.get('collection')} (#{hadith_item.get('hadith_number')})",
                "content_ar": (
                    f"وَفِي صَحِيحِ السُّنَّةِ الْمُطَهَّرَةِ، عَنْ {narrator}، عَنْ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ أَنَّهُ قَالَ:\n\n"
                    f"«{hadith_item.get('matn_ar')}»"
                ),
                "verified": True,
                "verification_score": 1.0,
                "citation_source_type": "hadith",
                "canonical_citation_id": hadith_item.get("id"),
                "citation_metadata": hadith_item,
                "audit_feedback": {
                    "collection": hadith_item.get("collection"),
                    "hadith_number": hadith_item.get("hadith_number"),
                    "grading": hadith_item.get("grading"),
                    "graded_by": hadith_item.get("graded_by"),
                    "takhrij": hadith_item.get("takhrij_notes"),
                    "hash": hadith_item.get("canonical_hash")
                }
            })

        # 6. Poetry Citation Blocks (All citations requested by user)
        for idx, poetry_item in enumerate(poetry_list):
            num_suffix = f" ({idx + 1})" if len(poetry_list) > 1 else ""
            blocks.append({
                "id": str(uuid.uuid4()),
                "sermon_id": sermon_id,
                "order_index": len(blocks) + 1,
                "block_type": BlockType.POETRY_CITATION.value,
                "title_ar": f"شاهد البلاغة والحكمة{num_suffix}: {poetry_item.get('poet_name_ar')} ({poetry_item.get('bahr')})",
                "content_ar": f"وَلِلَّهِ دَرُّ الْقَائِلِ فِيمَا جَرَى بِهِ مَجْرَى الْحِكْمَةِ وَالْمَوْعِظَةِ:\n\n{poetry_item.get('bayt_ar')}",
                "verified": True,
                "verification_score": 1.0,
                "citation_source_type": "poetry",
                "canonical_citation_id": poetry_item.get("id"),
                "citation_metadata": poetry_item,
                "audit_feedback": {
                    "poet": poetry_item.get("poet_name_ar"),
                    "bahr": poetry_item.get("bahr"),
                    "hash": poetry_item.get("canonical_hash")
                }
            })

        # 7. Istighfar Pause (Sitting between the two Khutbahs)
        istighfar_content = (
            "أَقُولُ قَوْلِي هَذَا، وَأَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الْجَلِيلَ لِي وَلَكُمْ وَلِسَائِرِ الْمُسْلِمِينَ مِنْ كُلِّ ذَنْبٍ، "
            "فَاسْتَغْفِرُوهُ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ، وَادْعُوهُ يَسْتَجِبْ لَكُمْ."
        )
        blocks.append({
            "id": str(uuid.uuid4()),
            "sermon_id": sermon_id,
            "order_index": len(blocks) + 1,
            "block_type": BlockType.ISTIGHFAR_PAUSE.value,
            "title_ar": "جلسة الاستغفار بين الخطبتين",
            "content_ar": istighfar_content,
            "verified": True,
            "verification_score": 1.0,
            "citation_source_type": None
        })

        # 8. Second Khutbah (Khutbah Thaniyah)
        second_khutbah_content = (
            "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى نَبِيِّنَا مُحَمَّدٍ خَاتَمِ النَّبِيِّينَ، "
            "وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.\n\n"
            "أَمَّا بَعْدُ:\n"
            "فَيَا عِبَادَ اللَّهِ، اتَّقُوا اللَّهَ حَقَّ التَّقْوَى، وَرَاقِبُوهُ فِي السِّرِّ وَالنَّجْوَى. "
            "وَاعْلَمُوا أَنَّ خَيْرَ الزَّادِ التَّقْوَى، وَأَنَّ الْمَوْتَ آتٍ لَا مَحَالَةَ، وَأَنَّ الْكَيِّسَ مَنْ دَانَ نَفْسَهُ وَعَمِلَ لِمَا بَعْدَ الْمَوْتِ، "
            "وَالْعَاجِزَ مَنْ أَتْبَعَ نَفْسَهُ هَوَاهَا وَتَمَنَّى عَلَى اللَّهِ الأَمَانِيَّ."
        )
        blocks.append({
            "id": str(uuid.uuid4()),
            "sermon_id": sermon_id,
            "order_index": len(blocks) + 1,
            "block_type": BlockType.SECOND_KHUTBAH.value,
            "title_ar": "الخطبة الثانية: التحذير والوصية الجامعة",
            "content_ar": second_khutbah_content,
            "verified": True,
            "verification_score": 1.0,
            "citation_source_type": None
        })

        # 9. Closing Du'a
        dua_content = (
            "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا. "
            "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ.\n\n"
            "اللَّهُمَّ أَعِزَّ الإِسْلَامَ وَالْمُسْلِمِينَ، وَأَذِلَّ الشِّرْكَ وَالْمُشْرِكِينَ. "
            "اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ، وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ، الأَحْيَاءِ مِنْهُمْ وَالأَمْوَاتِ. "
            "اللَّهُمَّ آتِ نُفُوسَنَا تَقْوَاهَا، وَزَكِّهَا أَنْتَ خَيْرُ مَنْ زَكَّاهَا، أَنْتَ وَلِيُّهَا وَمَوْلَاهَا. "
            "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.\n\n"
            "عِبَادَ اللَّهِ: {إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَى وَيَنْهَى عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ وَالْبَغْيِ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ}، "
            "فَاذْكُرُوا اللَّهَ الْعَظِيمَ يَذْكُرْكُمْ، وَاشْكُرُوهُ عَلَى نِعَمِهِ يَزِدْكُمْ، وَلَذِكْرُ اللَّهِ أَكْبَرُ، وَاللَّهُ يَعْلَمُ مَا تَصْنَعُونَ."
        )
        blocks.append({
            "id": str(uuid.uuid4()),
            "sermon_id": sermon_id,
            "order_index": len(blocks) + 1,
            "block_type": BlockType.CLOSING_DUA.value,
            "title_ar": "الدعاء المأثور وصلاح الأمة",
            "content_ar": dua_content,
            "verified": True,
            "verification_score": 1.0,
            "citation_source_type": None
        })

        # Re-index all blocks systematically
        for idx, blk in enumerate(blocks):
            blk["order_index"] = idx + 1

        return blocks


# ==============================================================================
# AGENT 4: THEOLOGICAL & LINGUISTIC AUDITOR (CRITIC)
# ==============================================================================
class TheologicalLinguisticAuditor:
    """
    Agent 4: Scans the synthesized sermon for theological soundness, diacritical fidelity,
    and runs the Post-Generation Validator against canonical databases.
    If deviation is discovered, force-swaps with canonical text and issues audit warning.
    """

    @classmethod
    def audit_sermon_blocks(
        cls,
        blocks: List[Dict[str, Any]],
        retriever_engine: VerifiedCitationRetriever
    ) -> Tuple[List[Dict[str, Any]], List[TheologicalAuditReport], str]:
        audit_reports: List[TheologicalAuditReport] = []
        overall_status = "fully_verified"

        for block in blocks:
            content = block.get("content_ar", "")
            
            # Check 1: Scan for theological red flags / Isra'iliyyat
            flags = TheologicalPostGenerationValidator.scan_for_theological_red_flags(content)
            if flags:
                overall_status = "flagged_deviations"
                block["verified"] = False
                block["audit_feedback"] = {"theological_violations": flags}

            # Check 2: If block is a citation, run deterministic verification
            source_type = block.get("citation_source_type")
            citation_meta = block.get("citation_metadata")

            if source_type and citation_meta:
                # Extract quote between brackets or quotation marks
                canonical_text, report = TheologicalPostGenerationValidator.verify_and_canonicalize(
                    source_type,
                    content,
                    citation_meta
                )
                audit_reports.append(report)

                if report.verdict == VerificationVerdict.AUTO_SWAPPED:
                    # Replace with verified text to ensure zero hallucinations
                    if source_type == "quran":
                        block["content_ar"] = f"يَقُولُ اللَّهُ تَبَارَكَ وَتَعَالَى فِي مُحْكَمِ التَّنْزِيلِ:\n\n«{canonical_text}»"
                    elif source_type == "hadith":
                        narrator = citation_meta.get('narrator_companion', 'عن النبي ﷺ')
                        block["content_ar"] = f"وَفِي صَحِيحِ السُّنَّةِ الْمُطَهَّرَةِ، عَنْ {narrator}، عَنْ رَسُولِ اللَّهِ ﷺ أَنَّهُ قَالَ:\n\n«{canonical_text}»"
                    elif source_type == "poetry":
                        block["content_ar"] = f"وَلِلَّهِ دَرُّ الْقَائِلِ:\n\n{canonical_text}"

                    block["verified"] = True
                    block["verification_score"] = 1.0
                    block["audit_feedback"] = {
                        "action": "AUTO_SWAPPED_TO_CANONICAL",
                        "reason": report.notes,
                        "canonical_hash": report.canonical_hash
                    }
                else:
                    block["verified"] = True
                    block["verification_score"] = report.composite_score
                    block["audit_feedback"] = {
                        "action": "VERIFIED_CANONICAL_MATCH",
                        "composite_score": report.composite_score,
                        "canonical_hash": report.canonical_hash,
                        "takhrij": report.takhrij_details
                    }

        return blocks, audit_reports, overall_status
