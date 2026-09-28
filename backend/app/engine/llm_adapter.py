"""
Unified LLM Adapter for Minbar AI
Supports:
1. 'builtin': High-performance deterministic rhetorical synthesizer (100% offline, zero-hallucination).
2. 'gemini': Google Gemini API (gemini-1.5-flash / gemini-2.0-flash) via direct HTTP.
3. 'ollama': Local Ollama instance (http://localhost:11434) via direct HTTP.

Strict Theological Guardrail: All models are wrapped in strict Ahl al-Sunnah wal-Jama'ah
system prompts with locked retrieved citations, followed by deterministic post-generation validation.
"""

import os
import json
from typing import Dict, Any, List, Optional
import httpx


SYSTEM_PROMPT_KHUTBAH = """أنت خطيب مصقع وبليغ وعالم بالشريعة الإسلامية على منهج وعقيدة أهل السنة والجماعة.
مهمتك: صياغة خطبة جمعة أو موعظة إسلامية بليغة ومؤثرة تجمع بين رقة العبارة وفصاحة اللفظ وقوة الحجة وعمق التأصيل الشرعي.

قواعد عقدية ومنهجية صارمة لا تقبل الاستثناء (Zero-Hallucination Policy):
1. يمنع منعاً باتاً تأليف أو تحريف أو هلوسة أو نسبة أي آية قرآنية أو حديث نبوي من عندك.
2. يجب الالتزام حصراً وبدقة تامة بنصوص الآيات والأحاديث المرفقة في قسم «الشواهد الشرعية المعتمدة»، واستخدامها بنصها وتخريجها دون أدنى تغيير في الألفاظ أو التشكيل.
3. الالتزام بهيكل الخطبة المسنون:
   - الخطبة الأولى: خطبة الحاجة النبوية، الاستهلال والتمهيد للموضوع، التأصيل بالآيات القرآنية، الاستدلال بالأحاديث الصحيحة، الربط بالحياة المعاصرة، ثم الدعوة للاستغفار.
   - الخطبة الثانية: حمد الله والوصية بتقوى الله، خلاصة العمل والتطبيق، والدعاء المأثور لعموم المسلمين.
"""

SYSTEM_PROMPT_REFINE = """أنت محرر بلاغي ومحقق شرعي على عقيدة أهل السنة والجماعة.
مهمتك: مراجعة وإعادة صياغة الفقرة المحددة من الخطبة وفق طلب المستخدم بدقة وبلاغة عربية فائقة.
تنبيه حاسم: إذا كانت الفقرة تحتوي على آية قرآنية أو حديث نبوي شريف، يُمنع منعاً باتاً المساس بنص الآية أو الحديث أو تغييرهما، ويكون التعديل على الشرح والأسلوب البلاغي فقط.
"""


class LLMAdapter:
    @staticmethod
    def generate_sermon_content(
        theme: str,
        sermon_type: str,
        duration: int,
        audience: str,
        tone: str,
        verified_citations: Dict[str, List[Dict[str, Any]]],
        model_provider: str = "builtin",
        api_key: Optional[str] = None,
        custom_model: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Attempts generation with the chosen provider (gemini / ollama).
        If provider is 'builtin' or if remote call fails, returns None so caller uses the built-in deterministic synthesizer.
        """
        if model_provider == "builtin":
            return None

        # Build prompt payload
        citations_context = "=== الشواهد الشرعية المعتمدة والموثقة (استخدم هذه النصوص حصراً بنصها) ===\n"
        for q in verified_citations.get("quran", []):
            citations_context += f"- آية قرآنية: {q.get('text_uthmani')} [{q.get('surah_name_ar')}: {q.get('ayah_number')}]\n"
        for h in verified_citations.get("hadith", []):
            citations_context += f"- حديث شريف: «{h.get('matn_ar')}» [التخريج: {h.get('collection')} - {h.get('grading')}]\n"
        for p in verified_citations.get("poetry", []):
            citations_context += f"- شاهد شعري: «{p.get('bayt_ar')}» [الشاعر: {p.get('poet_name_ar')}]\n"

        user_prompt = f"""
موضوع الخطبة: {theme}
نوع الخطبة: {sermon_type}
المدة المستهدفة: {duration} دقيقة (~{duration * 95} كلمة)
طبيعة الحضور: {audience}
النبرة والأسلوب: {tone}

{citations_context}

المطلوب: قم بصياغة نص الخطبة الكامل بأسلوب بليغ ومقسم إلى فقرات واضحة مع إدراج الشواهد السابقة نصاً.
أخرج النتيجة بصيغة JSON تحتوي على قائمة الفقرات:
[
  {{"title_ar": "عنوان الفقرة", "content_ar": "نص الفقرة الكامل", "block_type": "نوع الفقرة"}}
]
"""
        key = api_key or os.getenv("GEMINI_API_KEY")

        if model_provider == "gemini" and key:
            try:
                model_name = custom_model or "gemini-1.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": f"{SYSTEM_PROMPT_KHUTBAH}\n\n{user_prompt}"}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.4,
                        "responseMimeType": "application/json"
                    }
                }
                with httpx.Client(timeout=30.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(raw_text)
                        if isinstance(parsed, list):
                            return {"blocks": parsed}
                        if isinstance(parsed, dict) and "blocks" in parsed:
                            return parsed
            except Exception as e:
                # Log and fallback gracefully to deterministic engine
                print(f"[LLMAdapter] Gemini call failed: {e}. Falling back to built-in verified engine.")

        elif (model_provider == "groq" or (key and key.startswith("gsk_"))) and key:
            try:
                model_name = custom_model if custom_model and ("llama" in custom_model or "mixtral" in custom_model or "gemma" in custom_model) else "llama-3.3-70b-versatile"
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": f"{SYSTEM_PROMPT_KHUTBAH}\nأخرج النتيجة بصيغة JSON فقط كقائمة من الفقرات."},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.4
                }
                with httpx.Client(timeout=45.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_text = data["choices"][0]["message"]["content"].strip()
                        if raw_text.startswith("```"):
                            raw_text = raw_text.split("\n", 1)[1]
                            if raw_text.endswith("```"):
                                raw_text = raw_text.rsplit("\n", 1)[0]
                            raw_text = raw_text.strip()
                        parsed = json.loads(raw_text)
                        if isinstance(parsed, list):
                            return {"blocks": parsed}
                        if isinstance(parsed, dict) and "blocks" in parsed:
                            return parsed
            except Exception as e:
                print(f"[LLMAdapter] Groq call failed: {e}. Falling back to built-in verified engine.")

        elif (model_provider == "grok" or (key and key.startswith("xai-"))) and key:
            try:
                model_name = custom_model if custom_model and "grok" in custom_model else "grok-beta"
                url = "https://api.x.ai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": f"{SYSTEM_PROMPT_KHUTBAH}\nأخرج النتيجة بصيغة JSON فقط."},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.4
                }
                with httpx.Client(timeout=45.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_text = data["choices"][0]["message"]["content"].strip()
                        if raw_text.startswith("```"):
                            raw_text = raw_text.split("\n", 1)[1]
                            if raw_text.endswith("```"):
                                raw_text = raw_text.rsplit("\n", 1)[0]
                            raw_text = raw_text.strip()
                        parsed = json.loads(raw_text)
                        if isinstance(parsed, list):
                            return {"blocks": parsed}
                        if isinstance(parsed, dict) and "blocks" in parsed:
                            return parsed
            except Exception as e:
                print(f"[LLMAdapter] Grok call failed: {e}. Falling back to built-in verified engine.")

        elif model_provider == "ollama":
            try:
                ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
                model_name = custom_model or "llama3.2"
                payload = {
                    "model": model_name,
                    "prompt": f"{SYSTEM_PROMPT_KHUTBAH}\n\n{user_prompt}",
                    "stream": False,
                    "format": "json"
                }
                with httpx.Client(timeout=45.0) as client:
                    resp = client.post(ollama_url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_text = data.get("response", "")
                        parsed = json.loads(raw_text)
                        if isinstance(parsed, list):
                            return {"blocks": parsed}
                        if isinstance(parsed, dict) and "blocks" in parsed:
                            return parsed
            except Exception as e:
                print(f"[LLMAdapter] Ollama call failed: {e}. Falling back to built-in verified engine.")

        return None

    @staticmethod
    def refine_block_content(
        current_text: str,
        action: str,
        block_type: str,
        custom_instruction: Optional[str] = None,
        model_provider: str = "builtin",
        api_key: Optional[str] = None
    ) -> str:
        """
        Refines a single block according to user request.
        Actions: 'rephrase', 'elaborate', 'shorten', 'make_solemn'.
        """
        key = api_key or os.getenv("GEMINI_API_KEY")

        if model_provider == "gemini" and key:
            try:
                instruction_text = custom_instruction or ""
                if action == "rephrase":
                    instruction_text += " أعد صياغة هذا المقطع بأفصح عبارة وأرقى أسلوب بياني عربي رصين."
                elif action == "elaborate":
                    instruction_text += " قم ببسط وشرح هذا المعنى وتوسيعه وتدعيمه بالأمثلة التوجيهية المؤثرة."
                elif action == "shorten":
                    instruction_text += " قم بإيجاز وتلخيص هذا المقطع وحذف الحشو مع الحفاظ التام على جوهر المعنى."
                elif action == "make_solemn":
                    instruction_text += " أضف إلى المقطع نبرة وعظية مؤثرة ترقق القلوب وتذكر بالآخرة ومراقبة الله."

                prompt = f"""
{SYSTEM_PROMPT_REFINE}

الفقرة الأصلية:
{current_text}

التوجيه المطلوب:
{instruction_text}

المطلوب: أخرج فقط النص المعدل مباشرة دون مقدمات أو تعليقات.
"""
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.4}
                }
                with httpx.Client(timeout=20.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        res_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                        if res_text:
                            return res_text
            except Exception as e:
                print(f"[LLMAdapter] Refinement call failed: {e}. Using deterministic fallback.")

        elif (model_provider == "groq" or (key and key.startswith("gsk_"))) and key:
            try:
                instruction_text = custom_instruction or ""
                if action == "rephrase":
                    instruction_text += " أعد صياغة هذا المقطع بأفصح عبارة وأرقى أسلوب بياني عربي رصين."
                elif action == "elaborate":
                    instruction_text += " قم ببسط وشرح هذا المعنى وتوسيعه وتدعيمه بالأمثلة التوجيهية المؤثرة."
                elif action == "shorten":
                    instruction_text += " قم بإيجاز وتلخيص هذا المقطع وحذف الحشو مع الحفاظ التام على جوهر المعنى."
                elif action == "make_solemn":
                    instruction_text += " أضف إلى المقطع نبرة وعظية مؤثرة ترقق القلوب وتذكر بالآخرة ومراقبة الله."

                prompt = f"""{SYSTEM_PROMPT_REFINE}

الفقرة الأصلية:
{current_text}

التوجيه المطلوب:
{instruction_text}

المطلوب: أخرج فقط النص المعدل مباشرة دون مقدمات أو تعليقات."""

                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.4
                }
                with httpx.Client(timeout=25.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        res_text = data["choices"][0]["message"]["content"].strip()
                        if res_text:
                            return res_text
            except Exception as e:
                print(f"[LLMAdapter] Groq refine call failed: {e}. Using deterministic fallback.")

        elif (model_provider == "grok" or (key and key.startswith("xai-"))) and key:
            try:
                instruction_text = custom_instruction or ""
                if action == "rephrase":
                    instruction_text += " أعد صياغة هذا المقطع بأفصح عبارة وأرقى أسلوب بياني عربي رصين."
                elif action == "elaborate":
                    instruction_text += " قم ببسط وشرح هذا المعنى وتوسيعه وتدعيمه بالأمثلة التوجيهية المؤثرة."
                elif action == "shorten":
                    instruction_text += " قم بإيجاز وتلخيص هذا المقطع وحذف الحشو مع الحفاظ التام على جوهر المعنى."
                elif action == "make_solemn":
                    instruction_text += " أضف إلى المقطع نبرة وعظية مؤثرة ترقق القلوب وتذكر بالآخرة ومراقبة الله."

                prompt = f"""{SYSTEM_PROMPT_REFINE}

الفقرة الأصلية:
{current_text}

التوجيه المطلوب:
{instruction_text}

المطلوب: أخرج فقط النص المعدل مباشرة دون مقدمات أو تعليقات."""

                url = "https://api.x.ai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "grok-beta",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.4
                }
                with httpx.Client(timeout=25.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        res_text = data["choices"][0]["message"]["content"].strip()
                        if res_text:
                            return res_text
            except Exception as e:
                print(f"[LLMAdapter] Grok refine call failed: {e}. Using deterministic fallback.")

        # Deterministic refinement fallback
        if action == "make_solemn":
            return (
                current_text + "\n\n"
                "فَيَا عِبَادَ اللَّهِ: الْحَذَرَ الْحَذَرَ مِنْ رُكُونِ الْغَفْلَةِ وَطُولِ الأَمَلِ! "
                "فَإِنَّ الدُّنْيَا دَارُ مَمَرٍّ لَا دَارُ مَقَرٍّ، وَإِنَّ القَبْرَ أَوَّلُ مَنَازِلِ الآخِرَةِ، "
                "فَأَعِدُّوا لِلْمَسْأَلَةِ جَوَابًا، وَلِلْجَوَابِ صَوَابًا، وَتَزَوَّدُوا بِالتَّقْوَى فَإِنَّهَا نِعْمَ الزَّادُ لِيَوْمِ الْمَعَادِ."
            )
        elif action == "elaborate":
            return (
                current_text + "\n\n"
                "وتفصيل ذلك وتأكيده أن سلف الأمة الصالح كانوا يحرصون على هذا المعنى أشد الحرص، "
                "فيترجمونه سلوكاً واقعياً في بيوتهم وأسواقهم ومجالسهم، لا يبتغون به إلا وجه الله والدار الآخرة، "
                "فصلحت بذلك أحوالهم واستقامت مجتمعاتهم على هدى وبصيرة."
            )
        elif action == "shorten":
            sentences = [s.strip() for s in current_text.split("،") if len(s.strip()) > 10]
            if len(sentences) > 2:
                return "، ".join(sentences[:2]) + "."
            return current_text
        elif action == "rephrase":
            return (
                "اعلموا رحمكم الله ورضي عنكم، أن من أعظم المطالب الشرعية وأشرف المقاصد الإيمانية: " +
                current_text.replace("اعلموا أن", "").replace("أيها المسلمون", "").strip()
            )

        return current_text
