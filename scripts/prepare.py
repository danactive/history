# Download to local Train Annotations from https://github.com/visipedia/inat_comp/tree/7ce1be23fb21e2d964328093adc2bf50505b48e6/2021
# Extract to get `train.json`
# docker run --rm -v $(pwd):/app -w /app python:3.11-slim python scripts/prepare.py

import json

with open("train.json", "r") as file:
    data = json.load(file)

# This creates a map from class index (as string) to taxonomic label
index_to_label = {
    str(category["id"]): category["name"]
    for category in data["categories"]
}

# Save to JSON file
with open("inat21_class_index.json", "w") as out:
    json.dump(index_to_label, out, indent=2)

print(f"Saved {len(index_to_label)} categories to inat21_class_index.json")
