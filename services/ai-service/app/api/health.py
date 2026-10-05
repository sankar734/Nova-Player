from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.job_manager import job_manager

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    # Detect if CUDA or CPU is active
    cuda_available = False
    device = "cpu"
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            device = torch.cuda.get_device_name(0)
    except ImportError:
        pass

    return HealthResponse(
        status="healthy",
        version="1.0.0",
        service="nova-ai-service",
        cuda_available=cuda_available,
        device=device,
        active_jobs=len([j for j in job_manager._jobs.values() if j["status"] in ["queued", "processing"]]),
        models_available=["faster-whisper", "rag-mini-lm", "summarizer-core", "learning-mcq-engine"]
    )
