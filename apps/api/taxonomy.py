from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
from typing import Any


@dataclass(frozen=True, slots=True)
class Taxon:
    taxon_id: str
    scientific_name: str
    common_name: str | None = None
    kingdom: str | None = None
    phylum: str | None = None
    class_name: str | None = None
    order: str | None = None
    family: str | None = None
    genus: str | None = None

    @property
    def resolved_genus(self) -> str | None:
        if self.genus:
            return self.genus
        parts = self.scientific_name.split()
        return parts[0] if len(parts) >= 2 else None

    @property
    def lineage(self) -> list[str]:
        values = [
            self.kingdom,
            self.phylum,
            self.class_name,
            self.order,
            self.family,
            self.resolved_genus,
            self.scientific_name,
        ]
        lineage: list[str] = []
        for value in values:
            if value and value not in lineage:
                lineage.append(value)
        return lineage


def _optional_string(value: Any) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def _taxon_from_value(taxon_id: str, value: Any) -> Taxon:
    if isinstance(value, str):
        return Taxon(taxon_id=taxon_id, scientific_name=value)
    if not isinstance(value, dict):
        raise ValueError(f"Unsupported taxonomy entry for {taxon_id}")

    scientific_name = _optional_string(value.get("scientific_name") or value.get("name"))
    if not scientific_name:
        raise ValueError(f"Taxonomy entry {taxon_id} is missing a scientific name")

    return Taxon(
        taxon_id=taxon_id,
        scientific_name=scientific_name,
        common_name=_optional_string(value.get("common_name")),
        kingdom=_optional_string(value.get("kingdom")),
        phylum=_optional_string(value.get("phylum")),
        class_name=_optional_string(value.get("class") or value.get("class_name")),
        order=_optional_string(value.get("order")),
        family=_optional_string(value.get("family")),
        genus=_optional_string(value.get("genus")),
    )


def _taxon_from_tree_of_life(index: int, value: Any) -> Taxon:
    if not isinstance(value, list) or len(value) != 2 or not isinstance(value[0], list):
        raise ValueError(f"Unsupported TreeOfLife taxonomy entry at index {index}")

    ranks = value[0]
    if len(ranks) != 7:
        raise ValueError(f"TreeOfLife taxonomy entry {index} must contain seven ranks")

    kingdom, phylum, class_name, order, family, genus, species = [
        _optional_string(rank) for rank in ranks
    ]
    if not species:
        raise ValueError(f"TreeOfLife taxonomy entry {index} is missing a species")

    if genus and not species.casefold().startswith(f"{genus} ".casefold()):
        scientific_name = f"{genus} {species}"
    else:
        scientific_name = species

    return Taxon(
        taxon_id=f"tol-{index}",
        scientific_name=scientific_name,
        common_name=_optional_string(value[1]),
        kingdom=kingdom,
        phylum=phylum,
        class_name=class_name,
        order=order,
        family=family,
        genus=genus,
    )


def _sort_key(taxon: Taxon) -> tuple[int, int | str]:
    try:
        return (0, int(taxon.taxon_id))
    except ValueError:
        return (1, taxon.taxon_id)


def load_taxonomy(path: Path) -> tuple[list[Taxon], str]:
    raw_bytes = path.read_bytes()
    raw = json.loads(raw_bytes)

    if isinstance(raw, dict):
        taxa = [_taxon_from_value(str(taxon_id), value) for taxon_id, value in raw.items()]
        taxa.sort(key=_sort_key)
        version_prefix = "inat21"
    elif isinstance(raw, list):
        if raw and isinstance(raw[0], list):
            taxa = [_taxon_from_tree_of_life(index, value) for index, value in enumerate(raw)]
            version_prefix = "tol200m"
        else:
            taxa = [
                _taxon_from_value(str(value.get("id", index)), value)
                for index, value in enumerate(raw)
            ]
            taxa.sort(key=_sort_key)
            version_prefix = "taxonomy"
    else:
        raise ValueError("Taxonomy must be a JSON object or array")

    if not taxa:
        raise ValueError("Taxonomy is empty")

    digest = hashlib.sha256(raw_bytes).hexdigest()
    return taxa, f"{version_prefix}-{digest[:12]}"


def taxon_prompts(taxon: Taxon) -> tuple[str, str]:
    common_name = f", commonly called {taxon.common_name}" if taxon.common_name else ""
    genus = f", in the genus {taxon.resolved_genus}" if taxon.resolved_genus else ""
    return (
        f"a biological photograph of {taxon.scientific_name}{common_name}",
        f"a photograph of the species {taxon.scientific_name}{genus}",
    )
