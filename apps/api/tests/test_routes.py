import io

from fastapi.testclient import TestClient
from PIL import Image

import architecture
import classify
from main import main_py_app


class FakeOrganismEngine:
    def __init__(self, available=True, identified=False):
        self.available = available
        self.identified = identified
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
        status = "identified" if self.identified else "uncertain"
        taxa = [
            ("1", "Lanius cabanisi", "Long-tailed fiscal", "Laniidae", 0.80),
            ("2", "Lanius excubitoroides", "Grey-backed fiscal", "Laniidae", 0.76),
            ("3", "Lanius collaris", "Common fiscal", "Laniidae", 0.72),
            ("4", "Lanius dorsalis", "Taita fiscal", "Laniidae", 0.68),
            ("5", "Lanius somalicus", "Somali fiscal", "Laniidae", 0.65),
        ]
        return {
            "status": status,
            "model": {
                "id": "imageomics/bioclip-2",
                "revision": "test",
                "taxonomy": "test",
            },
            "predictions": [
                {
                    "taxonId": taxon_id,
                    "scientificName": scientific_name,
                    "commonName": common_name,
                    "family": family,
                    "score": score,
                    "matchStrength": (
                        "strong" if self.identified and index == 0
                        else "possible" if index < 3
                        else "weak"
                    ),
                }
                for index, (taxon_id, scientific_name, common_name, family, score)
                in enumerate(taxa)
            ],
            "diagnostics": {"metadataAvailable": any(metadata.values())},
        }


class FakeArchitectureEngine:
    def __init__(self, identified=False):
        self.identified = identified
        self.ready = False
        self.error = None

    def health(self):
        return {
            "status": "not_loaded",
            "model": {"id": "google/siglip2-base-patch16-224"},
        }

    def classify(self, _image, metadata):
        styles = [
            ("gothic", "Gothic", "Gothic", 0.20),
            ("gothic-revival", "Gothic Revival", "Gothic", 0.18),
            ("romanesque", "Romanesque", "Romanesque", 0.16),
            ("baroque", "Baroque", "Baroque", 0.14),
        ]
        predictions = [
            {
                "styleId": style_id,
                "name": name,
                "family": family,
                "score": score,
                "matchStrength": "strong" if self.identified and index == 0 else "possible",
                "reviewCues": ["pointed arches"],
            }
            for index, (style_id, name, family, score) in enumerate(styles)
        ]
        return {
            "status": "identified" if self.identified else "uncertain",
            "acceptedPrediction": predictions[0] if self.identified else None,
            "predictions": predictions,
            "diagnostics": {"metadataAvailable": any(metadata.values())},
        }


def jpeg_bytes(color="green") -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (224, 224), color=color).save(buffer, format="JPEG")
    return buffer.getvalue()


def test_health_and_classification(monkeypatch):
    engine = FakeOrganismEngine()
    monkeypatch.setattr(classify, "engine", engine)
    monkeypatch.setattr(architecture, "engine", FakeArchitectureEngine())

    with TestClient(main_py_app) as client:
        health = client.get("/health")
        response = client.post(
            "/classify/organism",
            content=jpeg_bytes(),
            headers={
                "X-Photo-Date": "2026-08-22",
                "X-Photo-City": "Tarangire%20%E2%80%94%20M%C5%8Dto",
                "X-Photo-Metadata-Encoding": "percent",
            },
        )

    assert health.status_code == 200
    assert health.json()["classifiers"]["organism"]["status"] == "ok"
    assert health.json()["classifiers"]["architecture"]["status"] == "not_loaded"
    assert response.status_code == 200
    assert response.json()["status"] == "uncertain"
    assert response.json()["diagnostics"]["metadataAvailable"] is True
    assert engine.last_metadata["city"] == "Tarangire — Mōto"


def test_invalid_image_is_rejected(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeOrganismEngine())

    with TestClient(main_py_app) as client:
        response = client.post("/classify/organism", content=b"not-an-image")

    assert response.status_code == 400
    assert response.json() == {"error": "Unsupported or invalid image"}


def test_health_reports_missing_classifier(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeOrganismEngine(available=False))
    monkeypatch.setattr(architecture, "engine", FakeArchitectureEngine())

    with TestClient(main_py_app) as client:
        response = client.get("/health")

    assert response.status_code == 503
    assert response.json()["classifiers"]["organism"]["error"] == "weights missing"


def test_combined_route_returns_four_balanced_uncertain_results(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeOrganismEngine())
    monkeypatch.setattr(architecture, "engine", FakeArchitectureEngine())

    with TestClient(main_py_app) as client:
        response = client.post("/classify/photo", content=jpeg_bytes())

    assert response.status_code == 200
    assert response.json()["status"] == "matched"
    suggestions = response.json()["suggestions"]
    assert len(suggestions) == 4
    assert [item["type"] for item in suggestions] == [
        "organism",
        "architecture",
        "organism",
        "architecture",
    ]
    assert all(item["matchStrength"] == "possible" for item in suggestions)


def test_combined_route_returns_four_balanced_identified_results(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeOrganismEngine(identified=True))
    monkeypatch.setattr(architecture, "engine", FakeArchitectureEngine(identified=True))

    with TestClient(main_py_app) as client:
        response = client.post("/classify/photo", content=jpeg_bytes())

    assert response.status_code == 200
    suggestions = response.json()["suggestions"]
    assert len(suggestions) == 4
    assert [item["type"] for item in suggestions] == [
        "organism",
        "architecture",
        "organism",
        "architecture",
    ]
    assert [item["matchStrength"] for item in suggestions] == [
        "strong",
        "strong",
        "possible",
        "possible",
    ]


def test_identified_specialist_supplies_all_four_results(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeOrganismEngine(identified=True))
    monkeypatch.setattr(architecture, "engine", FakeArchitectureEngine())

    with TestClient(main_py_app) as client:
        response = client.post("/classify/photo", content=jpeg_bytes())

    suggestions = response.json()["suggestions"]
    assert len(suggestions) == 4
    assert all(item["type"] == "organism" for item in suggestions)
    assert [item["matchStrength"] for item in suggestions] == [
        "strong",
        "possible",
        "possible",
        "weak",
    ]


def test_legacy_classify_route_is_removed(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeOrganismEngine())

    with TestClient(main_py_app) as client:
        response = client.post("/classify", content=jpeg_bytes())

    assert response.status_code == 404


def test_scores_route(monkeypatch):
    monkeypatch.setattr(classify, "engine", FakeOrganismEngine())

    with TestClient(main_py_app) as client:
        response = client.post("/scores", content=jpeg_bytes(color="blue"))

    assert response.status_code == 200
    assert "aesthetic_score" in response.json()
    assert isinstance(response.json()["aesthetic_score"], float)
