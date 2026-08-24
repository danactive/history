import json

from taxonomy import load_taxonomy, taxon_prompts


def test_loads_existing_string_label_map(tmp_path):
    path = tmp_path / "taxonomy.json"
    path.write_text(json.dumps({"1": "Araneus diadematus"}), encoding="utf-8")

    taxa, version = load_taxonomy(path)

    assert version.startswith("inat21-")
    assert taxa[0].scientific_name == "Araneus diadematus"
    assert taxa[0].resolved_genus == "Araneus"
    assert taxa[0].lineage == ["Araneus", "Araneus diadematus"]


def test_loads_enriched_taxonomy_and_builds_hierarchical_prompts(tmp_path):
    path = tmp_path / "taxonomy.json"
    path.write_text(json.dumps({
        "1": {
            "name": "Araneus diadematus",
            "common_name": "Cross orbweaver",
            "kingdom": "Animalia",
            "family": "Araneidae",
            "genus": "Araneus",
        },
    }), encoding="utf-8")

    taxa, _ = load_taxonomy(path)
    prompts = taxon_prompts(taxa[0])

    assert taxa[0].lineage == ["Animalia", "Araneidae", "Araneus", "Araneus diadematus"]
    assert "Cross orbweaver" in prompts[0]
    assert "genus Araneus" in prompts[1]


def test_loads_tree_of_life_taxonomy_without_reordering_embedding_rows(tmp_path):
    path = tmp_path / "taxonomy.json"
    path.write_text(json.dumps([
        [[
            "Animalia",
            "Chordata",
            "Aves",
            "Passeriformes",
            "Laniidae",
            "Lanius",
            "cabanisi",
        ], "Long-tailed Fiscal"],
        [[
            "Animalia",
            "Echinodermata",
            "Asteroidea",
            "Forcipulatida",
            "Asteriidae",
            "Pisaster",
            "ochraceus",
        ], "Ochre Sea Star"],
    ]), encoding="utf-8")

    taxa, version = load_taxonomy(path)

    assert version.startswith("tol200m-")
    assert [taxon.taxon_id for taxon in taxa] == ["tol-0", "tol-1"]
    assert taxa[0].scientific_name == "Lanius cabanisi"
    assert taxa[0].common_name == "Long-tailed Fiscal"
    assert taxa[1].scientific_name == "Pisaster ochraceus"
