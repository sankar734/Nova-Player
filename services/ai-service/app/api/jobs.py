import asyncio
import json
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from app.models.schemas import JobStatusResponse
from app.services.job_manager import job_manager

router = APIRouter(prefix="/jobs", tags=["Async Jobs"])

@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/{job_id}/cancel")
async def cancel_job(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job_manager.cancel_job(job_id)
    return {"message": "Cancellation requested", "job_id": job_id}

@router.get("/{job_id}/events")
async def stream_job_events(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        while True:
            current = job_manager.get_job(job_id)
            if not current:
                break
            payload = json.dumps(current.model_dump())
            yield {
                "event": "progress",
                "data": payload
            }
            if current.status in ["completed", "failed", "cancelled"]:
                break
            await asyncio.sleep(0.5)

    return EventSourceResponse(event_generator())
