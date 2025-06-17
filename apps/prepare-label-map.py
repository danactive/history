# Download to local Train Annotations from https://github.com/visipedia/inat_comp/tree/7ce1be23fb21e2d964328093adc2bf50505b48e6/2021
# Execute this script to extract `train.json`
# docker run --rm -v $(pwd):/app -w /app python:3.11-slim python apps/prepare-label-map.py

import json

with open("train.json", "r") as file:
    data = json.load(file)

# This creates a map from class index (as string) to taxonomic label
index_to_label = {
    str(category["id"]): category["name"]
    for category in data["categories"]
}

output_path = "apps/api/inat21_class_index.json"
with open(output_path, "w") as out:
    json.dump(index_to_label, out, indent=2)

print(f"Saved {len(index_to_label)} categories to {output_path}")
