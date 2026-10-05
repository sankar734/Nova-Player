import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.transcribe import router as transcribe_router
from app.api.rag import router as rag_router
from app.api.summarize import router as summarize_router
from app.api.learning import router as learning_router
from app.api.jobs import router as jobs_router

app = FastAPI(
    title="NOVA Player AI & Media Intelligence Service",
    description="High-performance backend for Speech-to-Text, Video RAG, and Learning Mode",
    version="1.0.0"
)

# Allow local desktop webview and Tauri IPC
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(transcribe_router)
app.include_router(rag_router)
app.include_router(summarize_router)
app.include_router(learning_router)
app.include_router(jobs_router)

@app.get("/")
async def root():
    return {
        "service": "NOVA Player AI Service",
        "tagline": "Play Anything. Understand Everything.",
        "status": "online"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8765, reload=False)
