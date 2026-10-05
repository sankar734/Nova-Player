from typing import List, Optional
from pydantic import BaseModel, Field

# ==========================================
# 1. Health & System
# ==========================================

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    service: str = "nova-ai-service"
    cuda_available: bool = False
    device: str = "cpu"
    active_jobs: int = 0
    models_available: List[str] = Field(default_factory=list)

# ==========================================
# 2. Transcription Models
# ==========================================

class WordTiming(BaseModel):
    word: str
    start: float
    end: float
    probability: float

class TranscriptSegment(BaseModel):
    id: str
    start_time: float
    end_time: float
    text: str
    confidence: Optional[float] = None
    words: Optional[List[WordTiming]] = None

class TranscribeRequest(BaseModel):
    media_path: str
    media_id: str
    language: Optional[str] = None
    model_size: str = "base" # tiny, base, small, medium, large
    extract_audio: bool = True

class TranscribeResponse(BaseModel):
    media_id: str
    language: str
    duration: float
    segments: List[TranscriptSegment]
    srt_content: str
    vtt_content: str

# ==========================================
# 3. Translation Models
# ==========================================

class TranslateSubtitleRequest(BaseModel):
    segments: List[TranscriptSegment]
    source_language: str = "en"
    target_language: str # e.g. "ta", "hi", "es", "fr", "de"

class TranslateSubtitleResponse(BaseModel):
    target_language: str
    translated_segments: List[TranscriptSegment]
    srt_content: str
    vtt_content: str

# ==========================================
# 4. Video RAG & Ask This Video
# ==========================================

class Citation(BaseModel):
    timestamp: float
    label: str
    snippet: str

class AskVideoRequest(BaseModel):
    media_id: str
    question: str
    current_timestamp: Optional[float] = None
    time_window_seconds: Optional[float] = 300.0 # 5 min surrounding context
    segments: List[TranscriptSegment]

class AskVideoResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence: float
    relevant_segments: List[TranscriptSegment]

class SemanticSearchRequest(BaseModel):
    media_id: str
    query: str
    segments: List[TranscriptSegment]
    top_k: int = 5

class SearchResultItem(BaseModel):
    start_time: float
    end_time: float
    label: str
    text: str
    relevance_score: float

class SemanticSearchResponse(BaseModel):
    results: List[SearchResultItem]

# ==========================================
# 5. Summarization & Chapters
# ==========================================

class SmartChapter(BaseModel):
    start_time: float
    end_time: float
    title: str
    summary: str

class KeyMoment(BaseModel):
    timestamp: float
    title: str
    description: str

class SummarizeRequest(BaseModel):
    media_id: str
    segments: List[TranscriptSegment]
    detail_level: str = "detailed" # short, detailed, key_points

class SummarizeResponse(BaseModel):
    media_id: str
    short_summary: str
    detailed_summary: str
    key_points: List[str]
    smart_chapters: List[SmartChapter]
    key_moments: List[KeyMoment]

# ==========================================
# 6. Learning Mode (NOVA Learn)
# ==========================================

class NoteSection(BaseModel):
    id: str
    timestamp: Optional[float] = None
    title: str
    bullets: List[str]

class KeyDefinition(BaseModel):
    term: str
    definition: str
    timestamp: Optional[float] = None

class GenerateNotesRequest(BaseModel):
    media_id: str
    title: str
    segments: List[TranscriptSegment]

class GenerateNotesResponse(BaseModel):
    media_id: str
    title: str
    executive_summary: str
    sections: List[NoteSection]
    key_definitions: List[KeyDefinition]

class Flashcard(BaseModel):
    id: str
    question: str
    answer: str
    timestamp: Optional[float] = None
    box: int = 1

class GenerateFlashcardsRequest(BaseModel):
    media_id: str
    segments: List[TranscriptSegment]
    count: int = 10

class GenerateFlashcardsResponse(BaseModel):
    media_id: str
    flashcards: List[Flashcard]

class MCQQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str
    timestamp: float

class GenerateQuizRequest(BaseModel):
    media_id: str
    title: str
    segments: List[TranscriptSegment]
    question_count: int = 10 # 5, 10, 20
    difficulty: str = "medium"

class GenerateQuizResponse(BaseModel):
    media_id: str
    title: str
    difficulty: str
    questions: List[MCQQuestion]

# ==========================================
# 7. Asynchronous Jobs
# ==========================================

class JobStatusResponse(BaseModel):
    job_id: str
    job_type: str
    status: str # queued, processing, completed, failed, cancelled
    progress_percent: float
    message: str
    result: Optional[dict] = None
    error: Optional[str] = None
