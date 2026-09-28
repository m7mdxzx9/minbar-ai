"""
Pydantic v2 Data Schemas for Minbar AI
Data contracts for sermon drafting, deterministic verification, and agent orchestration.
Strict adherence to Ahl al-Sunnah wal-Jama'ah creed.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
import uuid


class SermonType(str, Enum):
    JUMUAH = "jumuah"
    EID_AL_FITR = "eid_al_fitr"
    EID_AL_ADHA = "eid_al_adha"
    JANAZAH = "janazah"
    KUSUF = "kusuf"
    ISTISQA = "istisqa"
    GENERAL_REMINDER = "general_reminder"


class BlockType(str, Enum):
    KHUTBAT_AL_HAJAH = "khutbat_al_hajah"
    THEMATIC_EXPOSITION = "thematic_exposition"
    QURAN_CITATION = "quran_citation"
    HADITH_CITATION = "hadith_citation"
    POETRY_CITATION = "poetry_citation"
    ISTIGHFAR_PAUSE = "istighfar_pause"
    SECOND_KHUTBAH = "second_khutbah"
    CLOSING_DUA = "closing_dua"


class VerificationVerdict(str, Enum):
    FULLY_VERIFIED = "fully_verified"
    AUTO_SWAPPED = "auto_swapped"
    FLAGGED = "flagged"
    REJECTED = "rejected"


class TheologicalAuditReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    citation_type: str  # 'quran', 'hadith', 'poetry'
    original_text: str
    canonical_text: str
    verdict: VerificationVerdict
    levenshtein_score: float = Field(ge=0.0, le=1.0)
    jaccard_score: float = Field(ge=0.0, le=1.0)
    composite_score: float = Field(ge=0.0, le=1.0)
    canonical_hash: str
    takhrij_details: Optional[Dict[str, Any]] = None
    notes: str


class QuranCitation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: Optional[int] = None
    surah_number: int = Field(ge=1, le=114)
    ayah_number: int = Field(ge=1)
    surah_name_ar: str
    surah_name_en: str
    juz_number: int
    text_uthmani: str
    text_simple: str
    canonical_hash: str


class HadithCitation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: Optional[int] = None
    collection: str
    book_name_ar: str
    hadith_number: int
    matn_ar: str
    matn_simple: str
    isnad_ar: Optional[str] = None
    narrator_companion: Optional[str] = None
    grading: str  # Sahih or Hasan
    graded_by: str
    takhrij_notes: Optional[str] = None
    canonical_hash: str


class PoetryCitation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: Optional[int] = None
    poet_name_ar: str
    era: Optional[str] = None
    bahr: str
    theme: str
    bayt_ar: str
    bayt_simple: str
    canonical_hash: str


class SermonBlock(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_index: int
    block_type: BlockType
    title_ar: str
    content_ar: str
    verified: bool = False
    verification_score: float = 0.0
    citation_source_type: Optional[str] = None  # 'quran', 'hadith', 'poetry'
    citation_metadata: Optional[Dict[str, Any]] = None
    audit_feedback: Optional[Dict[str, Any]] = None


class KhutbahBlueprint(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    theme: str
    sermon_type: SermonType
    core_theological_tenet: str
    primary_arguments: List[str]
    khutbah_ula_outline: List[str]
    khutbah_thaniyah_outline: List[str]
    target_quran_count: int
    target_hadith_count: int
    target_poetry_count: int


class KhutbahGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    theme: str = Field(..., min_length=3, description="Theme of the sermon in Arabic or English")
    sermon_type: SermonType = SermonType.JUMUAH
    target_duration_minutes: int = Field(default=15, ge=5, le=45)
    audience_profile: str = Field(default="جمهور عام متنوع من المصلين والأسر")
    tone: str = Field(default="موعظة ترقق القلوب وتجمع بين الرجاء والرهبة وتدعو إلى العمل")
    quran_count: int = Field(default=2, ge=1, le=5)
    hadith_count: int = Field(default=2, ge=1, le=5)
    poetry_count: int = Field(default=1, ge=0, le=3)


class TransformBlockRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    sermon_id: str
    block_id: str
    action: str = Field(..., description="Action: 'make_solemn', 'replace_hadith', 'elaborate', 'shorten'")
    custom_instruction: Optional[str] = None


class KhutbahResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    theme: str
    sermon_type: SermonType
    theological_creed: str = "Ahl al-Sunnah wal-Jama'ah"
    verification_status: str
    word_count: int
    estimated_delivery_minutes: float
    blocks: List[SermonBlock]
    blueprint: Optional[KhutbahBlueprint] = None
    audits: List[TheologicalAuditReport] = []
    created_at: str
