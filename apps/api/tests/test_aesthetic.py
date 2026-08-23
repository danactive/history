from pathlib import Path

import numpy as np
from PIL import Image

from aesthetic import _exposure_score, _normalize_model_score, _overall_score, score_photo_image


FIXTURE_DIRECTORY = Path(__file__).parent / "fixtures" / "classifier"


def test_exposure_score_penalizes_clipped_images():
    balanced = np.full((256, 256), 0.5, dtype=np.float32)
    clipped = np.ones((256, 256), dtype=np.float32)

    assert _exposure_score(balanced) > _exposure_score(clipped)


def test_model_score_normalization_calibrates_raw_logits():
    assert 3.0 < _normalize_model_score(-0.49) < 5.0
    assert 0.0 < _normalize_model_score(-100.0) < 0.01
    assert 9.99 < _normalize_model_score(100.0) < 10.0


def test_overall_score_weights_technical_composition_and_aesthetic():
    assert _overall_score(10.0, 10.0, 10.0) == 100.0
    assert _overall_score(10.0, 0.0, 0.0) == 40.0
    assert _overall_score(7.5, None, None) == 75.0


def test_score_photo_real_fixture_reports_independent_characteristics():
    fixture = FIXTURE_DIRECTORY / "Long-tailed_fiscal_Lanius_cabanisi.jpg"
    with Image.open(fixture) as image:
        score = score_photo_image(image.convert("RGB"))

    for name in [
        "technical_score",
        "overall_score",
        "sharpness_score",
        "exposure_score",
        "resolution_score",
    ]:
        maximum = 100.0 if name == "overall_score" else 10.0
        assert 0.0 <= score[name] <= maximum
    assert score["composition_score"] is not None
    assert score["aesthetic_score"] is not None
    assert 0.0 <= score["composition_score"] <= 10.0
    assert 0.0 <= score["aesthetic_score"] <= 10.0
    assert score["image_width"] > 0
    assert score["image_height"] > 0
    assert score["notes"]
