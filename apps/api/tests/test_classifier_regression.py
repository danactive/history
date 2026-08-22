from pathlib import Path

from PIL import Image
import pytest

from classifier_engine import BioClipClassifier


FIXTURE_DIR = Path(__file__).parent / "fixtures" / "classifier"


@pytest.fixture(scope="module")
def classifier() -> BioClipClassifier:
    engine = BioClipClassifier()
    engine.initialize()
    assert engine.ready, engine.error
    return engine


@pytest.mark.parametrize(("filename", "scientific_name"), [
    ("Long-tailed_fiscal_Lanius_cabanisi.jpg", "Lanius cabanisi"),
    ("Ochre_sea_star.jpg", "Pisaster ochraceus"),
])
def test_clear_organism_fixture_is_identified(
    classifier: BioClipClassifier,
    filename: str,
    scientific_name: str,
):
    with Image.open(FIXTURE_DIR / filename) as image:
        result = classifier.classify(image)

    assert result["status"] == "identified"
    assert result["predictions"][0]["scientificName"] == scientific_name
    assert result["predictions"][0]["matchStrength"] == "strong"
    assert result["diagnostics"]["candidateCount"] > 800_000
