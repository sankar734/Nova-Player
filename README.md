# NOVA PLAYER
> **"Play Anything. Understand Everything."**
> AI-Powered Universal Multimedia Player & Video Intelligence Platform

NOVA Player is a high-performance desktop application engineered for Windows 10/11 (with cross-platform abstractions for Linux and macOS). It pairs a native multimedia engine with local-first AI intelligence, supporting universal playback, ffprobe-driven stream inspection, timeline scrubbing, synchronized transcripts, conversational Video RAG with verifiable timestamp citations, and a lecture learning workspace (notes, flashcards, quizzes).

---

## Key Capabilities

- **Universal Playback Core:** Broad container and codec support (MP4, MKV, AVI, MOV, WebM, FLV, TS, H.264, HEVC, AV1, VP9, AAC, MP3, FLAC, AC3).
- **Probed Technical Inspection:** Resolution, quality label (720p HD, 1080p Full HD, 4K UHD), frame rate, pixel format, and HDR primaries detected via `ffprobe` (never guessed from filenames).
- **Subtitle Engine:** SRT/VTT/ASS parsing, fine delay sync (`-2.0s` to `+2.0s`), custom typography, and dual subtitles for language learning.
- **Audio DSP & 10-Band Equalizer:** ISO center bands (60Hz to 16kHz), presets, audio delay sync (`-500ms` to `+500ms`), and peak-limited volume boost.
- **Video RAG ("Ask This Video"):** Conversational Q&A grounded strictly in extracted transcript evidence with interactive timestamp citations `[HH:MM:SS]`.
- **NOVA Learn Mode:** Auto-generated structured lecture notes, spaced-repetition flashcards, and interactive MCQ quizzes with score tracking.
- **Safe FFmpeg Tools:** Injection-safe media conversion, audio extraction, lossless trimming, and animated GIF generation.
- **Local-First & Privacy Preserving:** Playback functions 100% offline without accounts or cloud dependencies.

---

## System Requirements

- **Operating System:** Windows 10/11 (64-bit)
- **Node.js:** v20+ or v24+
- **Rust Toolchain:** 1.80+ (with MSVC toolchain for Windows)
- **Python:** 3.10+ (tested on Python 3.14)
- **FFmpeg & ffprobe:** 6.x - 9.x (installed in PATH or bundled)

---

## Getting Started

### 1. Install Dependencies
```powershell
# Root monorepo dependencies
npm install

# Python AI Service dependencies
python -m pip install -r services/ai-service/requirements.txt
```

### 2. Run Test Suites
```powershell
# Run Media Engine Vitest Suite
npm test --workspace=@nova/media-engine

# Run Python AI Service Pytest Suite
cd services/ai-service
python -m pytest tests/test_api.py
```

### 3. Launch Development Environment
```powershell
# Start Python AI Service (in separate terminal)
python services/ai-service/app/main.py

# Start Desktop Application
npm run dev:desktop
```
