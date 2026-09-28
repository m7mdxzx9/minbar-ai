# Minbar AI (منبر الذكاء الاصطناعي)

### Intelligent, Strictly Authenticated Platform for Drafting & Editing Islamic Friday Sermons (Khutbahs)
**Creed Alignment:** *Ahl al-Sunnah wal-Jama'ah* | **Theological Policy:** *Zero-Hallucination Mandate*

---

## 1. Theological Guardrails & Zero-Hallucination Architecture

Minbar AI enforces an immutable theological principle: **The system never generates, paraphrases, or invents Quranic verses or Hadiths from latent LLM weights.** All sacred citations are deterministically retrieved, cryptographically hashed, and verified via a closed-loop system:

```
[ User Request / Sermon Parameters ]
                 │
                 ▼
     ┌───────────────────────┐
     │ Agent 1: Structurer   │ ──► Sunnah Khutbah Blueprint (Khutbat al-Hajah,
     │ (Planner)             │     Thematic Core, 2 Khutbahs, Istighfar Pause, Du'a)
     └───────────────────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Agent 2: Retriever    │ ──► Hybrid Search (BM25 + Dense Semantic Vector)
     │ (Verified RAG Engine) │     over Authenticated Uthmanic & Sunnah Corpora
     └───────────────────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Agent 3: Synthesizer  │ ──► Classical Arabic Eloquence (Fasaha & Balagha)
     │ (Writer)              │     Embeds verified citations verbatim in markers
     └───────────────────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Agent 4: Auditor      │ ◄── Deterministic Post-Generation Validator
     │ (Theological Critic)  │     (SHA-256 Hash + Levenshtein / Jaccard >= 0.98)
     └───────────────────────┘
                 │
                 ├── [Deviations Detected (< 0.98)] ──► Force-Swap with Canonical Database Text
                 └── [Verified (>= 0.98 / 100% Hash)] ──► Certified Khutbah Delivered to Canvas
```

### The 5 Closed-Loop Safeguards:
1. **Quranic Texts:** Strict extraction from verified Uthmanic script databases (Tanzil / King Fahd Complex) with exact diacritical marks (Tashkeel).
2. **Hadith Texts:** Exclusive retrieval from authenticated Sunnah repositories (*Sahih al-Bukhari*, *Sahih Muslim*, *Sunan Abi Dawud*, *Jami' at-Tirmidhi*, *Sunan an-Nasa'i*, *Sunan Ibn Majah*) with gradings strictly attributed to acknowledged muhaddithin (*Ibn Hajar*, *Al-Nawawi*, *Al-Albani*). Rejects any *Da'if*, *Mawdu'*, or unauthenticated narrations.
3. **Arabic Poetry:** Classical verses sourced from curated corpora tagged by classical meter (*Bahr*) and ethical theme (*Zuhd*, *Hikmah*, *Sabr*).
4. **Theological Red Flag Filter:** Automated scanning that eliminates unverified historical narratives, *Isra'iliyyat*, and philosophical deviations.
5. **Deterministic Post-Generation Validator:** Character-by-character diacritical matching, cryptographic SHA-256 hash checks, and normalized edit distance. If a citation lacks a $\ge 0.98$ match, the system automatically swaps it with the canonical text.

---

## 2. Deliverables Summary

| Component | File Path | Description |
| :--- | :--- | :--- |
| **Database Schema** | [`backend/app/db/schema.sql`](file:///c:/Users/HP/Documents/antigravity/lively-noether/backend/app/db/schema.sql) | PostgreSQL + pgvector DDL for `quran_verses`, `hadith_corpus`, `poetry_corpus`, `sermons`, `sermon_blocks`, and `theological_audits`. |
| **Verification Engine** | [`backend/app/engine/verifier.py`](file:///c:/Users/HP/Documents/antigravity/lively-noether/backend/app/engine/verifier.py) | Algorithmic zero-hallucination validator, Arabic normalization, SHA-256 canonical hashing, Levenshtein, Token Jaccard, and Auto-Swap. |
| **Hybrid Retriever** | [`backend/app/engine/retriever.py`](file:///c:/Users/HP/Documents/antigravity/lively-noether/backend/app/engine/retriever.py) | BM25Okapi + dense semantic cosine ranking with Reciprocal Rank Fusion (RRF). |
| **Multi-Agent Machine** | [`backend/app/agents/agents.py`](file:///c:/Users/HP/Documents/antigravity/lively-noether/backend/app/agents/agents.py) & [`graph.py`](file:///c:/Users/HP/Documents/antigravity/lively-noether/backend/app/agents/graph.py) | LangGraph `StateGraph` orchestrating Planner, Retriever, Synthesizer, and Auditor. |
| **Editorial Canvas** | [`frontend/src/components/KhutbahEditor.tsx`](file:///c:/Users/HP/Documents/antigravity/lively-noether/frontend/src/components/KhutbahEditor.tsx) | Responsive Arabic block-based editor with warm editorial manuscript aesthetics, delivery timer, and inline AI hooks. |
| **Citation Cards** | [`frontend/src/components/CitationCard.tsx`](file:///c:/Users/HP/Documents/antigravity/lively-noether/frontend/src/components/CitationCard.tsx) | Inline collapsible cards with verification seals, Takhrij metadata, and cryptographic hash previews. |
| **Audit Inspector** | [`frontend/src/components/TheologicalAuditModal.tsx`](file:///c:/Users/HP/Documents/antigravity/lively-noether/frontend/src/components/TheologicalAuditModal.tsx) | Full modal inspecting character-level validation and zero-hallucination certificate. |
| **Pulpit Prompter** | [`frontend/src/components/TeleprompterModal.tsx`](file:///c:/Users/HP/Documents/antigravity/lively-noether/frontend/src/components/TeleprompterModal.tsx) | Minbar delivery mode for Friday preachers with large Arabic script, auto-scroll, and stopwatch. |

---

## 3. Quick Start & Execution

### 1. Run Automated Test Suite (16/16 Tests Passing)
```bash
cd backend
python -m pytest tests/ -v
```

### 2. Start FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
Interactive OpenAPI documentation will be accessible at: `http://localhost:8000/docs`

### 3. Launch Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to access the editorial canvas.

---

## 4. Architectural Highlights & Typography

* **Typography Hierarchy:**
  * Arabic Sermon Body: **Amiri** (line-height $1.85 - 2.1$) and **IBM Plex Sans Arabic**.
  * UI Metadata & Telemetry: **Plus Jakarta Sans** / **Geist**.
* **Pacing Engine:** Calibrated to the deliberate Sunnah minbar delivery rate of **90–110 words per minute**, providing real-time estimates of sermon delivery time as text is typed or transformed.
* **Hybrid In-Place Editing:**
  * `make_solemn`: Amplifies solemn exhortation (*Tarqiq al-Qulub*) and remembrance of the Hereafter.
  * `replace_hadith`: Seamlessly queries the verified Sunnah corpus for an alternative authentic narration on the same theme.
  * `elaborate`: Expands theological exposition and contemporary social application.
  * `shorten`: Summarizes while locking sacred texts in place.
