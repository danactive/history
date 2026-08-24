# Offline model downloader

This directory provides the reproducible installation boundary for History's offline classifier
assets. Model weights are intentionally excluded from Git, so a fresh clone contains the download
logic and integrity metadata but not several gigabytes of runtime files.

## Why this exists

Hugging Face repositories can change, contain duplicate checkpoints, or include files that are not
needed at runtime. History avoids an unpinned `from_pretrained` download by defining exactly what a
classifier release needs:

- the upstream repository and immutable revision;
- the complete runtime file list;
- the destination below the repository-level `models/` directory; and
- a SHA-256 checksum for every installed file.

`hugging-offline.py` downloads into a staging area, verifies each file, and only then installs the
bundle. The API later verifies the same local assets and runs with Hugging Face and Transformers
offline modes enabled.

## Managed bundles

| Manifest | Installed bundle | Used by |
| --- | --- | --- |
| `manifests/bioclip-2.json` | `models/imageomics_bioclip-2` | Organism image embeddings. |
| `manifests/treeoflife-200m-bioclip2.json` | `models/imageomics_TreeOfLife-200M` | Species taxonomy and text embeddings. |
| `manifests/siglip2-base-patch16-224.json` | `models/google_siglip2-base-patch16-224` | Architectural-style embeddings. |

The current repositories are public, so the required classifier bundles support anonymous
downloads. A Hugging Face login is not part of the normal fresh-clone path. Learned aesthetic
assets are optional and are not part of this manifest-pinned classifier set.

## Directory responsibilities

- `Dockerfile` creates a small, isolated download environment.
- `hugging-offline.py` performs staged downloads and checksum verification.
- `manifests/` records immutable upstream identities and required files.
- Repository-level `weights.log` captures completed extraction details from the Make workflow.
- Repository-level `models/` holds the installed, ignored runtime bundles.

Do not replace this flow with ad hoc CLI downloads or floating revisions. When changing a model,
review the application files it actually loads, pin the upstream commit, checksum every required
artifact, and prove the resulting API can initialize without network access.

Use the [photo-classifier agent skill](../../.agents/skills/photo-classifier/SKILL.md) for exact
download targets, disk requirements, first-time setup, verification, and safe recovery from an
interrupted extraction.
