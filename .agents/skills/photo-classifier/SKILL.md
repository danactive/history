---
name: photo-classifier
description: Set up, operate, test, troubleshoot, or safely evolve History's offline organism and architectural-style photo classifiers and dark Album Editor workflow.
---

# Photo Classifier

Use this skill as the canonical runbook for History's photo-analysis service. Repository README
files explain the system and its components, while detailed setup and operating instructions live
here so fragile model procedures have one source of truth. Inspect the repository, local assets,
and running services before taking action.

## Preserve the product behavior

- History has one Python API on port 8080. It serves `POST /scores`, specialist routes
  `POST /classify/organism` and `POST /classify/architecture`, and the Album Editor route
  `POST /classify/photo`. Never introduce or instruct the user to run a second Python server.
- `make ai-api` is the only Python server start command. `make build-ai-api` builds its image but
  does not start another service. `npm run dev` starts only Next.js on the configured Next port.
- The Album Editor has one **Classify photo** button. It calls the combined route; the user does not
  choose a specialist.
- The combined route exposes up to four ranked review results. If one specialist identifies the
  photo, use its ranked results; otherwise alternate eligible organism and architecture results.
  Never sort BioCLIP and SigLIP scores against each other because their similarity scales differ.
  Preserve `strong`, `possible`, and `weak` labels and keep clearly gated-out specialists hidden.
- Keep inference offline. Runtime loads checksum-verified local bundles and must not contact
  Hugging Face. Fail closed if a classifier model, tokenizer, taxonomy, checksum, or embedding is
  unavailable.
- Similarities are retrieval scores, not probabilities. Never render them as percentages.
- A result never edits metadata automatically. Only **Add Desc** appends a user-selected scientific
  name or architectural style to the pending XML description.
- History is always dark. Reuse its neutral text, link, field, and solid primary-button styles; do
  not add light surfaces or brown warning text.

## Fresh clone requirements

Run setup from the repository root. A fresh checkout needs:

- Node.js 24.13.0 from `.nvmrc` and npm 11, matching `package.json`.
- Docker Desktop or Docker Engine running and available to the current user.
- GNU Make and enough disk space for models, Hugging Face cache, and Docker layers.
- About 5.6 GB for the required classifier assets. Recommend at least 12 GB free because the
  downloader cache and Docker images duplicate some data.

The `models/` directory is intentionally ignored by Git. A clone contains manifests and downloader
code, but no classifier weights. The current BioCLIP 2, TreeOfLife-200M, and SigLIP 2 repositories
are public; their manifest-based downloads do not require a Hugging Face account. The downloader
may log that `huggingface-cli whoami` failed and still complete an anonymous public download. Do not
make `make login` part of the normal setup.

Required assets:

| Purpose | Download target | Local path | Approximate size |
| --- | --- | --- | ---: |
| Organism vision model | `make load-bioclip2` | `models/imageomics_bioclip-2` | 1.6 GB |
| Organism species index | `make load-bioclip2` | `models/imageomics_TreeOfLife-200M` | 2.6 GB |
| Architecture vision-language model | `make load-architecture-classifier` | `models/google_siglip2-base-patch16-224` | 1.4 GB |

Each manifest in `apps/load-weights/manifests` pins the repository ID, immutable revision, complete
runtime file list, and SHA-256 values. `apps/load-weights/hugging-offline.py` stages each file,
verifies its checksum, and only then installs it under `models/`.

The learned aesthetic assets are optional and are not part of the reproducible classifier setup.
When `models/rsinema_aesthetic-scorer` or `models/openai_clip-vit-base-patch32` is absent,
`POST /scores` uses its local heuristic fallback. The legacy `make load-aesthetic-scorer` path is
not manifest-pinned; do not describe it as a required or reproducible fresh-clone step.

## Fresh clone setup for a user

After cloning and entering the repository:

```sh
nvm use
npm ci
make load-bioclip2
make load-architecture-classifier
make build-ai-api
make ai-api
```

Keep `make ai-api` attached in its terminal. It starts the one Python service on port 8080. On a
fresh checkout, BioCLIP initialization can take tens of seconds. The SigLIP 2 architecture model is
lazy-loaded on the first architecture or combined classification request.

In a second terminal, start Next.js:

```sh
npm run dev
```

Read `nextPort` from `config.json`; the current default is 3030. Do not claim that `npm run dev`
also starts Python.

Confirm Python readiness:

```sh
curl http://localhost:8080/health
```

The organism classifier must report `ok`. Architecture may report `not_loaded` until its first
request, then must report `ok`. A 503 is a setup or integrity failure, not permission to bypass
model verification.

## Explain how a user sees and tests it

1. Confirm the existing Python API and Next.js app are running.
2. Open `/admin/album`, choose a gallery and album, and select a photo.
3. Click **Classify photo**.
4. Up to four organism or architectural-style results appear with their match strength. If both
   specialists are plausible, their results are balanced rather than cross-model score-sorted.
5. Review a result, then use **Add Desc** to append it once to the pending `photo_desc` value.
6. Generate XML through the existing Album Editor workflow to persist pending edits.

Use meaningful manual checks:

- A known organism photo such as the long-tailed fiscal or ochre sea star.
- A clear building facade whose architectural family is known, such as Gothic.
- An ambiguous architectural detail that should remain possible or weak.
- A non-organism, non-architecture photo that should gate out both specialists.

The real organism fixtures are in `public/test/fixtures/classifier`.
`Long-tailed_fiscal_Lanius_cabanisi.jpg` must rank `Lanius cabanisi` first, and
`Ochre_sea_star.jpg` must rank `Pisaster ochraceus` first. Do not replace those regression tests
with mocked scores.

The Marine Building doorway is deliberately difficult: its close-up can resemble Art Nouveau even
though the building is Art Deco. Conflicting styles may appear for review but must not be labeled
`strong`. A clear Gothic test must verify the requested family, not merely any architecture label.

## Agent operation

Repository agents prefix shell commands with `rtk` as required by project instructions. Never show
`rtk` in human setup instructions; it is an agent wrapper, not an application dependency.

Before downloading, inspect the three required directories and their manifest checksums rather than
assuming they are absent:

```sh
rtk ls models/imageomics_bioclip-2
rtk ls models/imageomics_TreeOfLife-200M
rtk ls models/google_siglip2-base-patch16-224
```

When the task authorizes setup or repair, use only the existing downloader:

```sh
rtk make load-bioclip2
rtk make load-architecture-classifier
```

Do not use ad hoc `huggingface-cli download`, Python downloads, floating revisions, or hand-copied
weights. If a required file or checksum is wrong, rerun its manifest target.

`make ai-api` is idempotent: it replaces a stopped or outdated named `ai-api` container and exits
successfully when the current `ai-api:latest` image is already running. Do not tell the user to run
separate cleanup commands for an `ai-api` name conflict.

## Downloader failure recovery

The download targets use temporary named containers:

- `extract-model` for BioCLIP 2 and TreeOfLife-200M.
- `extract-architecture-model` for SigLIP 2.

If a download is interrupted, its temporary container can remain and make the retry report a name
conflict. Inspect the exact container and its log before removing anything. Remove only that known
temporary extraction container, then rerun the same Make target. Do not delete `models/`, the
Hugging Face cache, or unrelated containers as generic cleanup.

The downloader copies its detailed output to `weights.log` after a completed extraction. A failed
Docker run may require `docker logs <exact-extraction-container>` because the Make recipe stops
before copying the log. Check available disk space, network access during this one-time download,
the immutable revision, and the first failed checksum or filename.

## Build and verify

After Python code or dependencies change, rebuild the one image:

```sh
rtk make build-ai-api
```

Build and run the unified Python test image:

```sh
rtk make build-test
rtk make test
```

The Python suite performs real inference on the long-tailed fiscal and ochre sea star, tests
architecture ambiguity and non-architecture gating, and covers the combined four-result response.

Verify the Next.js integration:

```sh
rtk npm run lint:ci
rtk npm run test:ci
rtk npx tsc --noEmit
rtk npm run build
rtk git diff --check
```

For model, loader, dependency, or taxonomy changes, additionally prove the built service initializes
with Docker networking disabled. Mount the local CLIP cache, SigLIP 2 directory, and TreeOfLife
directory read-only. Both classifiers must initialize without downloading. Health must report the
pinned model revisions, taxonomy identities, candidate/style counts, and selected devices.

## Classifier design

- BioCLIP 2 retrieves organisms against the official 867,455-entry TreeOfLife-200M species index.
  Its gate distinguishes plausible organisms from people, buildings, vehicles, food, and empty
  landscapes. Identification uses similarity, margin, family agreement, and crop agreement.
- SigLIP 2 is a general vision-language model used as a zero-shot architecture classifier. It
  embeds prompt ensembles for the versioned 29-style taxonomy, scores style families, gates
  non-architecture images, and applies similarity, margin, and crop-agreement thresholds.
- Photo date and location are reported as available but do not alter ranking. A photo date is not a
  building construction date, and an existing description must not be passed into a visual model
  because it can leak the answer.
- Match strength communicates abstention. Showing a weak candidate for manual review must never
  promote it to a strong identification.

## Implementation map

- `apps/api/main.py`: unified lifespan, health response, and explicit routes.
- `apps/api/classify.py`: request validation and organism-engine invocation.
- `apps/api/classifier_engine.py`: BioCLIP retrieval, organism gating, and abstention.
- `apps/api/architecture.py`: lazy architecture-engine invocation.
- `apps/api/architecture_engine.py`: SigLIP verification, prompt embeddings, hierarchy, gating, and
  abstention.
- `apps/api/architecture_taxonomy.json`: canonical styles, prompt ensembles, families, and human
  review cues. Review cues tell the user what to inspect; they are not detected features.
- `apps/api/photo_classify.py`: up to four combined results without cross-model score sorting.
- `apps/load-weights/manifests`: pinned classifier bundles and TreeOfLife species index.
- `app/api/admin/classify/route.ts`: safe original-image loading, resized fallback, and one forward
  to `/classify/photo`.
- `src/components/AdminAlbum/Photo.tsx`: one-button dark workflow and ranked-result display.
- `src/components/AdminAlbum/AdminAlbumClient.tsx`: pending description edits.

## Troubleshoot by invariant

- **Connection refused:** the one `ai-api` container serves port 8080; never start another Python
  classifier on 8081.
- **Inline “not running” message:** run `make ai-api`. If code or dependencies changed since the
  image was built, run `make build-ai-api` first.
- **Out-of-date API message:** rebuild with `make build-ai-api`, then use `make ai-api`; its target
  replaces the stale named container.
- **HTTP 503:** inspect `/health` and the affected specialist; never bypass readiness or checksums.
- **Slow first architecture request:** SigLIP 2 is lazy-loaded and verifies a large Safetensors
  checkpoint before embedding the taxonomy.
- **Implausible organism:** inspect the organism gate, family agreement, margin, and status.
- **Implausible architecture:** inspect the architecture gate, absolute similarity, family margin,
  and crop agreement. Do not force metadata labels onto ambiguous visual details.
- **Unexpected candidate order:** preserve each specialist's ranking and balance the streams; never
  sort organism and architecture similarities together.
- **Incorrect colors:** inspect the Album Editor under its Joy dark provider and reuse existing
  neutral/primary styles.
- **Original image missing:** retain the resized fallback and keep paths behind `safePublicPath`.
