# Download annotations from the pinned iNaturalist 2021 source documented in the project README.
# Validation annotations are sufficient because they include the complete category taxonomy.

import argparse
import json
from pathlib import Path


parser = argparse.ArgumentParser(description="Generate the enriched iNaturalist taxonomy")
parser.add_argument("--input", default="train.json", help="iNaturalist 2021 annotation JSON")
parser.add_argument("--output-dir", default="apps/api", help="Destination directory")
args = parser.parse_args()

with open(args.input, "r", encoding="utf-8") as file:
    data = json.load(file)

output_dir = Path(args.output_dir)
output_dir.mkdir(parents=True, exist_ok=True)

taxonomy_fields = (
    "name",
    "common_name",
    "supercategory",
    "kingdom",
    "phylum",
    "class",
    "order",
    "family",
    "genus",
    "specific_epithet",
)
taxonomy = {
    str(category["id"]): {
        field: category.get(field)
        for field in taxonomy_fields
        if category.get(field)
    }
    for category in data["categories"]
}

taxonomy_output_path = output_dir / "inat21_taxonomy.json"
with taxonomy_output_path.open("w", encoding="utf-8") as out:
    json.dump(taxonomy, out, indent=2)

print(f"Saved {len(taxonomy)} enriched taxa to {taxonomy_output_path}")
