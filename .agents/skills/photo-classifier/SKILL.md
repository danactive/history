---
name: photo-classifier
description: Operate, test, troubleshoot, or safely evolve History's offline organism and architectural-style photo classifiers and their dark Album Editor workflow.
---

# Photo Classifier

Use this skill for History's offline photo classifiers and Album Editor integration. Inspect the
current files, model manifests, and runtime state before describing commands or changing behavior.

## Preserve the product behavior

- History has one Python API on port 8080. It serves `POST /scores`, specialist routes
  `POST /classify/organism` and `POST /classify/architecture`, and the Album Editor route
  `POST /classify/photo`. Never introduce or instruct the user to run a second Python server.
- `make ai-api` is the only Python server start command. `make build-ai-api` rebuilds its image but
  does not start another service.
- The Album Editor has one **Classify photo** button. It calls the combined route; the user does not
  choose a specialist.
- The combined route exposes up to four ranked review results. If one specialist identifies the
  photo, use its ranked results; otherwise alternate eligible organism and architecture results.
  Never sort BioCLIP and SigLIP scores against each other because their similarity scales differ.
  Preserve `strong`, `possible`, and `weak` labels and keep clearly gated-out specialists hidden.
- Keep inference offline. Runtime loads only checksum-verified local bundles and must not contact
  Hugging Face. Fail closed if a model, tokenizer, taxonomy, checksum, or embedding is unavailable.
- Similarities are retrieval scores, not probabilities. Never render them as percentages.
- A suggestion never edits metadata automatically. Only **Add Desc** appends the accepted
  scientific name or architectural style to the pending XML description.
- History is always dark. Reuse its existing neutral text, link, field, and solid primary-button
  styles; do not add light surfaces or brown warning text.

## Agent commands versus user instructions

Repository agents prefix shell commands with `rtk` as required by project instructions. Do not
expose `rtk` in instructions to a human user; it is an agent wrapper, not part of the application
workflow.

Before asking the user to do setup, inspect what is already ready. When the task authorizes it,
check the local bundles, tests, build, and `/health` yourself instead of giving the user a setup
checklist.

## Explain how a user tests the feature

Lead with the Album Editor interaction:

1. Confirm the existing Python API is running. If it is not, the single user-facing command is
   `make ai-api`. Mention `make build-ai-api` only after Python code or dependencies changed.
2. Confirm the Next development app is running; it is not another Python service. Read `nextPort`
   from `config.json` rather than guessing the URL.
3. Open `/admin/album`, choose a gallery and album, and select a photo.
4. Click **Classify photo**.
5. Up to four organism or architectural-style results appear with their match strength. If both
   specialists are plausible, their results are balanced rather than cross-model score-sorted.

Use meaningful manual checks:

- A known organism photo such as the long-tailed fiscal or ochre sea star.
- A clear building facade whose architectural family is known, such as Gothic.
- An ambiguous architectural detail that should be suppressed.
- A non-organism, non-architecture photo that should produce no suggestions.

For automated organism accuracy, use the real offline fixtures in
`public/test/fixtures/classifier`. `Long-tailed_fiscal_Lanius_cabanisi.jpg` must identify
`Lanius cabanisi`, and `Ochre_sea_star.jpg` must identify `Pisaster ochraceus`. Do not replace them
with mocked scores.

The Marine Building doorway is a deliberately difficult architecture regression fixture: the
close-up can visually resemble Art Nouveau even though the building is Art Deco. Conflicting styles
may appear for review but must not be labeled `strong`. Clear Gothic testing should verify the
requested family, not merely that some architecture label appears.

After **Add Desc**, verify the accepted value appears once in `photo_desc` and remains a pending
edit until the user generates XML.

## Operate and verify internally

Check local model assets before downloading:

```sh
rtk ls models/imageomics_bioclip-2
rtk ls models/google_siglip2-base-patch16-224
```

Use only the existing manifest downloader when a bundle is absent or invalid:

```sh
rtk make load-bioclip2
rtk make load-architecture-classifier
```

The manifests pin repository IDs, immutable revisions, complete artifact lists, and SHA-256 values.
Do not use ad hoc model downloads.

Build and test the unified Python service:

```sh
rtk make build-test
rtk make test
```

Verify the application integration:

```sh
rtk npm run lint:ci
rtk npm run test:ci
rtk npm run build
rtk git diff --check
```

For model, loader, dependency, or taxonomy changes, prove the built service initializes with Docker
networking disabled and both large data directories mounted read-only. Health must report the
pinned BioCLIP, TreeOfLife, and SigLIP 2 revisions, the taxonomy identities, candidate/style counts,
and selected devices. Architecture may report `not_loaded` until its first request because it is
lazy-loaded.

## Evolve or calibrate it

- `apps/api/main.py` owns the unified lifespan, health response, and explicit routes.
- `apps/api/classify.py` validates requests and invokes the organism engine.
- `apps/api/classifier_engine.py` owns BioCLIP retrieval, organism gating, and abstention.
- `apps/api/architecture.py` invokes the lazy architecture engine.
- `apps/api/architecture_engine.py` verifies SigLIP 2, embeds the versioned architecture taxonomy,
  scores broad families and styles, gates non-architecture images, and abstains.
- `apps/api/architecture_taxonomy.json` owns canonical styles, prompt ensembles, families, and
  human review cues. Review cues tell the user what to verify; they are not detected features.
- `apps/api/photo_classify.py` combines up to four results without cross-model score sorting.
- `apps/load-weights/manifests` pins both classifier bundles and the TreeOfLife species index.
- `app/api/admin/classify/route.ts` reads the original with a resized fallback and forwards it once
  to `/classify/photo`.
- `src/components/AdminAlbum/Photo.tsx` renders the one-button dark workflow, and
  `AdminAlbumClient.tsx` applies an accepted description value.

Keep `CLASSIFIER_*` and `ARCHITECTURE_*` thresholds conservative and configurable. Change them only
after evaluating real clear examples, close confusers, difficult crops, and negative images. Match
strength communicates abstention; showing a weak candidate for manual review must never promote it
to a strong identification.

Photo date and location are reported as available but do not alter ranking. A photo date is not a
building construction date, and an existing description must not be passed to a visual classifier
because it can leak the answer.

## Troubleshoot by invariant

- **Connection refused:** one `ai-api` container serves port 8080; never start a classifier on 8081.
- **Container-name conflict:** `make ai-api` replaces a stopped or outdated named container and
  exits successfully when the current `ai-api:latest` image is already running. Do not tell the
  user to run separate Docker cleanup commands.
- **HTTP 503:** inspect the affected specialist in `/health`; never bypass readiness or checksums.
- **Slow first architecture request:** SigLIP 2 is lazy-loaded and verifies a large Safetensors file.
- **Implausible organism:** inspect family agreement, margin, and status; cross-family disagreement
  must be suppressed by the combined route.
- **Implausible architecture:** inspect the architecture gate, absolute similarity, family margin,
  and crop agreement. Do not force a metadata label onto an ambiguous visual detail.
- **Unexpected candidate order:** preserve each specialist's ranking and balance the streams; never
  sort organism and architecture similarities together.
- **Incorrect colors:** inspect the rendered Album Editor under its Joy dark provider and reuse
  existing neutral/primary styles.
- **Original image missing:** retain the resized fallback and keep paths behind `safePublicPath`.
