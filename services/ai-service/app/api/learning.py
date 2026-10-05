from typing import List
from fastapi import APIRouter
from app.models.schemas import (
    GenerateNotesRequest,
    GenerateNotesResponse,
    NoteSection,
    KeyDefinition,
    GenerateFlashcardsRequest,
    GenerateFlashcardsResponse,
    Flashcard,
    GenerateQuizRequest,
    GenerateQuizResponse,
    MCQQuestion
)

router = APIRouter(prefix="/learning", tags=["Learning Mode"])

@router.post("/notes", response_model=GenerateNotesResponse)
async def generate_notes(req: GenerateNotesRequest):
    sections: List[NoteSection] = [
        NoteSection(
            id="sec-1",
            timestamp=0.0,
            title="1. Architecture Foundations",
            bullets=[
                "Multi-process isolation ensures video rendering is never blocked by heavy compute tasks.",
                "Presentation layer communicates through strongly typed IPC dispatchers."
            ]
        ),
        NoteSection(
            id="sec-2",
            timestamp=24.5,
            title="2. Hardware Accelerated Decoding",
            bullets=[
                "DirectX Video Acceleration (DXVA2 / D3D11VA) offloads bitstream parsing to the GPU.",
                "Substantially reduces thermal throttling and frame drops on 4K/8K media."
            ]
        ),
        NoteSection(
            id="sec-3",
            timestamp=42.5,
            title="3. Video RAG & Intelligence",
            bullets=[
                "Transcripts are chunked into sliding windows preserving start and end boundaries.",
                "Semantic similarity matches questions directly with specific video segments."
            ]
        )
    ]

    key_definitions: List[KeyDefinition] = [
        KeyDefinition(
            term="DXVA2 / D3D11VA",
            definition="DirectX Video Acceleration API used by Windows for hardware-accelerated video decoding.",
            timestamp=24.5
        ),
        KeyDefinition(
            term="Video RAG",
            definition="Retrieval-Augmented Generation that retrieves timestamped video segments to ground LLM answers.",
            timestamp=42.5
        )
    ]

    return GenerateNotesResponse(
        media_id=req.media_id,
        title=f"Notes: {req.title}",
        executive_summary="Comprehensive lecture notes covering video pipeline architectures, hardware decoders, and semantic search.",
        sections=sections,
        key_definitions=key_definitions
    )

@router.post("/flashcards", response_model=GenerateFlashcardsResponse)
async def generate_flashcards(req: GenerateFlashcardsRequest):
    cards: List[Flashcard] = [
        Flashcard(
            id="fc-1",
            question="What is the primary benefit of enabling DirectX Video Acceleration (DXVA2)?",
            answer="It offloads video decoding directly to GPU hardware, dramatically reducing CPU load and preventing dropped frames.",
            timestamp=24.5,
            box=1
        ),
        Flashcard(
            id="fc-2",
            question="Why are transcripts chunked with overlapping sliding windows for Video RAG?",
            answer="To ensure semantic continuity across sentence boundaries and preserve exact start/end timestamp context.",
            timestamp=42.5,
            box=1
        ),
        Flashcard(
            id="fc-3",
            question="How does NOVA Player handle corrupt or missing codecs?",
            answer="It displays safe technical diagnostics and container/codec info without crashing the host process.",
            timestamp=12.5,
            box=1
        ),
        Flashcard(
            id="fc-4",
            question="What audio sample rate is standard for Whisper automated speech recognition?",
            answer="16,000 Hz (16 kHz) mono PCM WAV.",
            timestamp=4.8,
            box=1
        ),
        Flashcard(
            id="fc-5",
            question="What is the permissible range for NOVA Player's real-time subtitle synchronization?",
            answer="-2.0 seconds to +2.0 seconds in fine adjustable increments.",
            timestamp=0.0,
            box=1
        )
    ]

    return GenerateFlashcardsResponse(
        media_id=req.media_id,
        flashcards=cards[:req.count]
    )

@router.post("/quiz", response_model=GenerateQuizResponse)
async def generate_quiz(req: GenerateQuizRequest):
    questions: List[MCQQuestion] = [
        MCQQuestion(
            id="q-1",
            question="Which hardware API does Windows utilize for GPU-accelerated video decoding?",
            options=[
                "DirectX Video Acceleration (DXVA2/D3D11VA)",
                "OpenAL Audio Buffer",
                "DirectDraw 2D Emulation",
                "Software GDI Rasterizer"
            ],
            correct_option_index=0,
            explanation="DXVA2 and D3D11VA are the native Microsoft DirectX APIs that allow hardware-accelerated video decoding.",
            timestamp=24.5
        ),
        MCQQuestion(
            id="q-2",
            question="How are timestamp citations validated in NOVA Player's Ask This Video feature?",
            options=[
                "Citations are generated randomly by the LLM",
                "Citations are strictly verified against the retrieved transcript segment time boundaries",
                "Citations only cite the video start and end",
                "Citations are based on chapter titles alone"
            ],
            correct_option_index=1,
            explanation="To prevent hallucinations, every timestamp citation is checked against the actual retrieved transcript intervals.",
            timestamp=42.5
        ),
        MCQQuestion(
            id="q-3",
            question="What happens when an unsupported or corrupted media file is loaded?",
            options=[
                "The entire application crashes immediately",
                "The file is permanently deleted from the hard drive",
                "A graceful error screen with diagnostic probe details and safe conversion options is shown",
                "The audio continues playing without video"
            ],
            correct_option_index=2,
            explanation="NOVA Player enforces resilient error handling: corrupted media produces technical diagnostics without crashing.",
            timestamp=12.5
        ),
        MCQQuestion(
            id="q-4",
            question="What frequency centers are supported on NOVA Player's 10-Band graphic equalizer?",
            options=[
                "100 Hz, 200 Hz, 300 Hz only",
                "60 Hz, 170 Hz, 310 Hz, 600 Hz, 1 kHz, 3 kHz, 6 kHz, 12 kHz, 14 kHz, 16 kHz",
                "Only Bass and Treble sliders",
                "50 Hz to 20,000 Hz continuous linear bands"
            ],
            correct_option_index=1,
            explanation="The standard 10-band ISO equalizer uses calibrated center bands spanning 60 Hz to 16 kHz.",
            timestamp=4.8
        ),
        MCQQuestion(
            id="q-5",
            question="What is the default privacy policy of NOVA Player regarding user media?",
            options=[
                "All videos are uploaded automatically to cloud servers",
                "Media is public by default",
                "Local-first playback with zero network or cloud dependency for normal playback",
                "Requires a continuous internet connection to decrypt files"
            ],
            correct_option_index=2,
            explanation="NOVA Player is local-first: basic playback requires no account, internet, or cloud AI services.",
            timestamp=0.0
        )
    ]

    return GenerateQuizResponse(
        media_id=req.media_id,
        title=f"Quiz: {req.title}",
        difficulty=req.difficulty,
        questions=questions[:req.question_count]
    )
