from pathlib import Path

from PIL import Image
import pytest

from architecture_engine import ArchitectureClassifier


TESTS_DIR = Path(__file__).resolve().parent


def resolve_fixture(local_relative: Path, repo_relative: Path) -> Path:
    local_path = TESTS_DIR / local_relative
    if local_path.is_file():
        return local_path

    for parent in TESTS_DIR.parents:
        candidate = parent / repo_relative
        if candidate.is_file():
            return candidate

    raise FileNotFoundError(f"Missing test fixture: {local_relative} or {repo_relative}")


ART_DECO_DETAIL_FIXTURE = resolve_fixture(
    Path("fixtures/architecture/Art_deco_Marine_Building.jpg"),
    Path("public/test/fixtures/architecture/Art_deco_Marine_Building.jpg"),
)
GOTHIC_FACADE_FIXTURE = resolve_fixture(
    Path("fixtures/architecture/Gothic_facade.jpg"),
    Path("public/test/fixtures/architecture/Gothic_facade.jpg"),
)
ORGANISM_FIXTURE = resolve_fixture(
    Path("fixtures/classifier/Long-tailed_fiscal_Lanius_cabanisi.jpg"),
    Path("public/test/fixtures/classifier/Long-tailed_fiscal_Lanius_cabanisi.jpg"),
)


@pytest.fixture(scope="module")
def classifier() -> ArchitectureClassifier:
    engine = ArchitectureClassifier()
    engine.initialize()
    assert engine.ready, engine.error
    return engine


def test_art_deco_detail_suppresses_conflicting_style(
    classifier: ArchitectureClassifier,
):
    with Image.open(ART_DECO_DETAIL_FIXTURE) as image:
        result = classifier.classify(image)

    assert result["status"] == "uncertain"
    assert result["acceptedPrediction"] is None
    assert "Art Deco" in {prediction["family"] for prediction in result["predictions"]}


def test_gothic_facade_is_identified_as_gothic(
    classifier: ArchitectureClassifier,
):
    with Image.open(GOTHIC_FACADE_FIXTURE) as image:
        result = classifier.classify(image)

    assert result["status"] == "identified"
    assert result["acceptedPrediction"] is not None
    assert result["acceptedPrediction"]["family"] == "Gothic"


def test_organism_fixture_does_not_produce_an_architecture_suggestion(
    classifier: ArchitectureClassifier,
):
    with Image.open(ORGANISM_FIXTURE) as image:
        result = classifier.classify(image)

    assert result["status"] != "identified"
    assert result["acceptedPrediction"] is None
