from pathlib import Path

from PIL import Image
import pytest

from architecture_engine import ArchitectureClassifier


FIXTURE_DIR = Path(__file__).parent / "fixtures" / "architecture"
ORGANISM_FIXTURE_DIR = Path(__file__).parent / "fixtures" / "classifier"


@pytest.fixture(scope="module")
def classifier() -> ArchitectureClassifier:
    engine = ArchitectureClassifier()
    engine.initialize()
    assert engine.ready, engine.error
    return engine


def test_art_deco_detail_suppresses_conflicting_style(
    classifier: ArchitectureClassifier,
):
    with Image.open(FIXTURE_DIR / "Art_deco_Marine_Building.jpg") as image:
        result = classifier.classify(image)

    assert result["status"] == "uncertain"
    assert result["acceptedPrediction"] is None
    assert "Art Deco" in {prediction["family"] for prediction in result["predictions"]}


def test_organism_fixture_does_not_produce_an_architecture_suggestion(
    classifier: ArchitectureClassifier,
):
    with Image.open(ORGANISM_FIXTURE_DIR / "Long-tailed_fiscal_Lanius_cabanisi.jpg") as image:
        result = classifier.classify(image)

    assert result["status"] != "identified"
    assert result["acceptedPrediction"] is None
