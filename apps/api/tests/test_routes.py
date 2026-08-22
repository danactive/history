import io

from fastapi.testclient import TestClient
from PIL import Image

import classify
from main import main_py_app


class FakeEngine:
    def __init__(self, available=True):
        self.available = available
        self.ready = False
        self.error = None
        self.last_metadata = None

    def initialize(self):
        self.ready = self.available
        if not self.available:
            self.error = "weights missing"

    def health(self):
        return {
            "status": "ok" if self.ready else "unavailable",
            "model": {"id": "imageomics/bioclip-2"},
            **({"error": self.error} if self.error else {}),
        }

    def classify(self, _image, metadata):
        self.last_metadata = metadata
        return {
            "status": "uncertain",
            "model": {
                "id": "imageomics/bioclip-2",
                "revision": "test",
                "taxonomy": "test",
            },
            "predictions": [],
            "diagnostics": {"metadataAvailable": any(metadata.values())},
        }


def jpeg_bytes(color="green") -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (224, 224), color=color).save(buffer, format="JPEG")
    return buffer.getvalue()


def test_health_and_classification(monkeypatch):
    engine = FakeEngine()
    monkeypatch.setattr(classify, "engine", engine)

    with TestClient(main_py_app) as client:
        health = client.get("/health")
        response = client.post(
            "/classify",
            content=jpeg_bytes(),
            headers={
                "X-Photo-Date": "2026-08-22",
                "X-Photo-City": "Tarangire%20%E2%80%94%20M%C5%8Dto",
                "X-Photo-Metadata-Encoding": "percent",
            },
        )

    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    assert response.status_code == 200
    assert response.json()["status"] == "uncertain"
    assert response.json()["diagnostics"]["metadataAvailable"] is True
    assert engine.last_metadata["city"] == "Tarangire — Mōto"


def test_invalid_image_is_rejected(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeEngine())

    with TestClient(main_py_app) as client:
        response = client.post("/classify", content=b"not-an-image")

    assert response.status_code == 400
    assert response.json() == {"error": "Unsupported or invalid image"}


def test_health_reports_missing_classifier(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeEngine(available=False))

    with TestClient(main_py_app) as client:
        response = client.get("/health")

    assert response.status_code == 503
    assert response.json()["error"] == "weights missing"


def test_scores_route(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeEngine())

    with TestClient(main_py_app) as client:
        response = client.post("/scores", content=jpeg_bytes(color="blue"))

    assert response.status_code == 200
    assert "aesthetic_score" in response.json()
    assert isinstance(response.json()["aesthetic_score"], float)
