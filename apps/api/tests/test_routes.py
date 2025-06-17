import pytest
from fastapi.testclient import TestClient
from main import main_py_app
from PIL import Image
import io

client = TestClient(main_py_app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_scores_route():
    # Create a dummy image in-memory
    img = Image.new("RGB", (224, 224), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post("/scores", data=buf.read())
    assert response.status_code == 200
    assert "aesthetic_score" in response.json()
    assert isinstance(response.json()["aesthetic_score"], float)

def test_classify_route():
    # Create a dummy image in-memory
    img = Image.new("RGB", (224, 224), color="green")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    res = client.post("/classify", content=img_bytes)
    assert res.status_code == 200

    body = res.json()
    print("DEBUG BODY:", body)

    assert "predictions" in body
    predictions = body["predictions"]["predictions"]
    assert isinstance(predictions, list), f"Expected list, got: {type(predictions)}"
    assert all("label" in pred and "score" in pred for pred in predictions)
