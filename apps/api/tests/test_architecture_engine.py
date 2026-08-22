from pathlib import Path

from architecture_engine import (
    ArchitectureConfig,
    determine_architecture_status,
    load_architecture_taxonomy,
)


def config() -> ArchitectureConfig:
    return ArchitectureConfig(
        model_dir=Path("unused"),
        manifest_path=Path("unused"),
        taxonomy_path=Path("unused"),
        minimum_similarity=0.08,
        minimum_family_margin=0.004,
        minimum_style_margin=0.003,
        architecture_margin=0.01,
        minimum_crop_agreement=0.5,
    )


def test_architecture_taxonomy_includes_gothic_styles():
    taxonomy_path = Path(__file__).parents[1] / "architecture_taxonomy.json"
    styles, version = load_architecture_taxonomy(taxonomy_path)
    names = {style.name for style in styles}

    assert version == "architecture-styles-v1"
    assert "Gothic" in names
    assert "Gothic Revival" in names
    assert "Art Deco" in names


def test_status_requires_architecture_gate_and_family_agreement():
    assert determine_architecture_status(0.20, 0.02, 1.0, 0.25, 0.10, config()) == "identified"
    assert determine_architecture_status(0.20, 0.02, 1.0, 0.10, 0.25, config()) == "not_architecture"
    assert determine_architecture_status(0.20, 0.001, 1.0, 0.25, 0.10, config()) == "uncertain"
