import asyncio
import uuid
import time
from typing import Dict, Optional, Any
from app.models.schemas import JobStatusResponse

class JobManager:
    def __init__(self):
        self._jobs: Dict[str, dict] = {}
        self._cancellation_events: Dict[str, asyncio.Event] = {}

    def create_job(self, job_type: str, message: str = "Job queued") -> str:
        job_id = str(uuid.uuid4())
        self._jobs[job_id] = {
            "job_id": job_id,
            "job_type": job_type,
            "status": "queued",
            "progress_percent": 0.0,
            "message": message,
            "result": None,
            "error": None,
            "created_at": time.time(),
            "updated_at": time.time()
        }
        self._cancellation_events[job_id] = asyncio.Event()
        return job_id

    def update_job(self, job_id: str, progress: float, message: str, status: str = "processing"):
        if job_id in self._jobs:
            self._jobs[job_id]["progress_percent"] = progress
            self._jobs[job_id]["message"] = message
            self._jobs[job_id]["status"] = status
            self._jobs[job_id]["updated_at"] = time.time()

    def complete_job(self, job_id: str, result: Any, message: str = "Completed successfully"):
        if job_id in self._jobs:
            self._jobs[job_id]["progress_percent"] = 100.0
            self._jobs[job_id]["status"] = "completed"
            self._jobs[job_id]["message"] = message
            self._jobs[job_id]["result"] = result
            self._jobs[job_id]["updated_at"] = time.time()

    def fail_job(self, job_id: str, error: str):
        if job_id in self._jobs:
            self._jobs[job_id]["status"] = "failed"
            self._jobs[job_id]["error"] = error
            self._jobs[job_id]["message"] = f"Failed: {error}"
            self._jobs[job_id]["updated_at"] = time.time()

    def cancel_job(self, job_id: str):
        if job_id in self._jobs:
            self._jobs[job_id]["status"] = "cancelled"
            self._jobs[job_id]["message"] = "Job cancelled by user"
            if job_id in self._cancellation_events:
                self._cancellation_events[job_id].set()

    def is_cancelled(self, job_id: str) -> bool:
        event = self._cancellation_events.get(job_id)
        return event.is_set() if event else False

    def get_job(self, job_id: str) -> Optional[JobStatusResponse]:
        job = self._jobs.get(job_id)
        if not job:
            return None
        return JobStatusResponse(**job)

# Global singleton
job_manager = JobManager()
