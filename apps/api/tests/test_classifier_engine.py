from pathlib import Path

from PIL import Image

from classifier_engine import ClassifierConfig, build_image_crops, determine_status


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
