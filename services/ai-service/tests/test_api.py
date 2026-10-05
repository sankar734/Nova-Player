import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.schemas import TranscriptSegment

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "nova-ai-service"

def test_summarize_endpoint():
    sample_segments = [
        {
            "id": "s1",
            "start_time": 0.0,
            "end_time": 15.0,
            "text": "Introduction to multimedia architectures and low-latency decoders."
        },
        {
            "id": "s2",
            "start_time": 15.5,
            "end_time": 30.0,
            "text": "DirectX hardware acceleration offloads processing to the graphics card."
        }
    ]
    response = client.post(
        "/media/summarize",
        json={
            "media_id": "test-video-1",
            "segments": sample_segments,
            "detail_level": "detailed"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["key_points"]) > 0
    assert len(data["smart_chapters"]) > 0

def test_ask_video_citations():
    sample_segments = [
        {
            "id": "s1",
            "start_time": 24.5,
            "end_time": 35.0,
            "text": "By offloading decoding to GPU hardware through DirectX Video Acceleration, CPU load drops."
        }
    ]
    response = client.post(
        "/media/ask",
        json={
            "media_id": "test-video-1",
            "question": "How does GPU hardware decoding help?",
            "segments": sample_segments
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["citations"]) > 0
    assert data["citations"][0]["timestamp"] == 24.5
    assert "[" in data["answer"] and "]" in data["answer"]

def test_learning_mode_quiz():
    sample_segments = [
        {
            "id": "s1",
            "start_time": 0.0,
            "end_time": 30.0,
            "text": "Hardware acceleration in modern desktop video players."
        }
    ]
    response = client.post(
        "/learning/quiz",
        json={
            "media_id": "test-video-1",
            "title": "Hardware Decoders",
            "segments": sample_segments,
            "question_count": 5,
            "difficulty": "medium"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) == 5
    for q in data["questions"]:
        assert len(q["options"]) == 4
        assert 0 <= q["correct_option_index"] <= 3
        assert len(q["explanation"]) > 0
