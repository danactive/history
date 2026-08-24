import hashlib
import json
from pathlib import Path

from PIL import Image
import pytest

from classifier_engine import BioClipClassifier, ClassifierConfig, build_image_crops, determine_status


def config() -> ClassifierConfig:
    return ClassifierConfig(
        model_dir=Path("unused"),
        taxonomy_path=Path("unused"),
        embeddings_path=Path("unused"),
    )


def test_wide_image_gets_full_frame_and_edge_crops():
    crops = build_image_crops(Image.new("RGB", (800, 400), color="green"), include_edges=True)

    assert len(crops) == 3
    assert all(crop.width == crop.height for crop in crops)
    assert crops[0].size == (800, 800)
    assert crops[1].size == (400, 400)


def test_square_image_uses_one_full_frame_crop():
    crops = build_image_crops(Image.new("RGB", (400, 400), color="green"))

    assert len(crops) == 1
    assert crops[0].size == (400, 400)


def test_wide_image_defaults_to_one_full_frame_crop_for_cpu_latency():
    crops = build_image_crops(Image.new("RGB", (800, 400), color="green"))

    assert len(crops) == 1
    assert crops[0].size == (800, 800)


def test_status_abstains_on_weak_or_disagreeing_predictions():
    assert determine_status(0.69, 0.03, 1.0, 0.3, 0.2, True, True, config()) == "uncertain"
    assert determine_status(0.75, 0.02, 0.33, 0.3, 0.2, True, True, config()) == "uncertain"


def test_status_abstains_when_leading_families_disagree():
    # Mirrors the failure mode where a stork and a duck were both presented as likely matches.
    assert determine_status(0.75, 0.02, 1.0, 0.3, 0.2, False, False, config()) == "uncertain"


def test_status_identifies_consistent_prediction_and_rejects_non_organism():
    assert determine_status(0.75, 0.02, 0.66, 0.3, 0.2, True, True, config()) == "identified"
    assert determine_status(0.75, 0.02, 0.66, 0.3, 0.2, True, False, config()) == "identified"
    assert determine_status(0.72, 0.02, 1.0, 0.2, 0.25, True, True, config()) == "not_organism"


def test_model_verification_requires_all_manifest_files(tmp_path: Path):
    model_dir = tmp_path / "bioclip"
    model_dir.mkdir()
    weights = b"weights"
    (model_dir / "open_clip_model.safetensors").write_bytes(weights)

    manifest_path = tmp_path / "bioclip-manifest.json"
    manifest_path.write_text(json.dumps({
        "repo_id": "imageomics/bioclip-2",
        "revision": "2957b322090f9cb17ae72c71981c7218a28d81e0",
        "files": [
            {"name": "open_clip_model.safetensors", "sha256": hashlib.sha256(weights).hexdigest()},
            {"name": "tokenizer.json", "sha256": "unused"},
        ],
    }), encoding="utf-8")

    classifier = BioClipClassifier(ClassifierConfig(
        model_dir=model_dir,
        taxonomy_path=Path("unused"),
        embeddings_path=Path("unused"),
        model_manifest_path=manifest_path,
    ))

    with pytest.raises(FileNotFoundError, match="Incomplete BioCLIP 2 model bundle"):
        classifier._verify_model_bundle()
