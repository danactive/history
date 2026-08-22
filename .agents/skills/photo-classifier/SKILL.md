---
name: photo-classifier
description: Operate, test, troubleshoot, or safely evolve History's offline BioCLIP 2 organism classifier and its dark admin photo-identification workflow.
---

# Photo Classifier

Use this skill for the offline BioCLIP classifier and its Album Editor integration. Inspect current
files and configuration before describing commands or changing behavior.

## Preserve the product behavior

- History has one Python API on port 8080. It serves both `POST /scores` and `POST /classify`.
  Never introduce or instruct the user to run a second classifier web server.
- `make ai-api` is the only Python server start command. `make build-ai-api` rebuilds its Docker
  image but does not start another service.
- Keep inference offline. Runtime loads the verified safetensors model from
  `models/imageomics_bioclip-2` and the official TreeOfLife-200M species index from
  `models/imageomics_TreeOfLife-200M`; it must not contact Hugging Face.
- Fail closed if model, checksum, taxonomy, or embeddings are unavailable. Never use random or
  partially loaded weights.
- Similarities are retrieval scores, not probabilities. Never render them as percentages.
- Species output is a suggestion for review, not an automatic metadata edit. Only **Add keyword**
  applies a scientific name to the pending XML search field.
- History is always dark. Reuse its existing dark text, link, field, and solid primary-button
  styles; visually verify new result states against the real Album Editor.

## Agent commands versus user instructions

Repository agents prefix their own shell commands with `rtk` as required by project instructions.
Do not expose `rtk` in instructions to a human user; it is an agent execution wrapper, not part of
the application workflow.

Before asking the user to do setup, check what is already ready. When authorized by the task, the
agent should inspect the local model bundle, run tests/builds, check `/health`, and diagnose failures
itself. Do not turn those internal checks into a long list of user chores.

## Explain how a user tests the feature

When asked how to see or test the classifier, lead with the Album Editor interaction:

1. Confirm the existing Python API is running. If it is not, the single user-facing command is
   `make ai-api`. Mention `make build-ai-api` only when the image has not been built or code and
   dependencies changed.
2. Confirm the existing Next development app is running; do not imply it is another Python service.
   Read `nextPort` from `config.json` rather than guessing the URL.
3. Open `/admin/album`, choose a gallery and album, and select a photo.
4. Click **Classify organism** in the photo panel.
5. Explain the visible outcome and what evidence would make the test pass or fail.

The user should see one of these states:

- **Best-supported suggestion — verify before adding** only when score, margin, crop, and top-two
  family agreement all pass. Genus agreement is diagnostic, not a veto.
- **Uncertain — review the leading suggestions** when evidence is weak or taxa disagree.
- **No clear organism detected** for a non-organism result.

Use at least three meaningful manual checks when validating behavior:

- A known organism photo whose expected family or genus is known.
- A difficult organism photo where plausible candidates may disagree.
- A non-organism photo such as a building or landscape.

For automated accuracy work, use the real offline fixtures in `public/test/fixtures/classifier`.
`Long-tailed_fiscal_Lanius_cabanisi.jpg` must identify `Lanius cabanisi`, and
`Ochre_sea_star.jpg` must identify `Pisaster ochraceus`. Do not replace these with mocked scores.

For each check, compare the biological relationship between leading candidates, not just their
numeric order. If the top candidates belong to different families—such as a stork and a duck—the
result must be `uncertain`, must not say “likely identification,” and must not label the first result
as a strong match. Wrong candidates becoming less confident is safer but does not count as improved
species accuracy; record the example for later evaluation and calibration.

The **Add keyword** control must use the same solid primary styling as existing admin actions. After
clicking it, verify the scientific name appears once in the search keywords and remains a pending
edit until the user generates XML.

## Operate and verify internally

Check the seven-file local model bundle before downloading:

```sh
rtk ls models/imageomics_bioclip-2
```

Use the existing manifest downloader only when the bundle is absent or invalid:

```sh
rtk make load-bioclip2
```

The manifest pins the repository, immutable revision, artifact list, and SHA-256 values. Do not use
an ad hoc model download.

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

For loader, dependency, or taxonomy changes, build `ai-api` and prove it initializes with Docker
networking disabled while mounting `models/imageomics_TreeOfLife-200M` read-only. A ready health
response must include both pinned revisions, the taxonomy digest, `candidateCount: 867455`, and the
selected device.

## Evolve or calibrate it

- `apps/api/main.py` owns the unified FastAPI lifespan and routes.
- `apps/api/classify.py` validates image requests and invokes the shared classifier engine.
- `apps/api/classifier_engine.py` owns checksum verification, memory-mapped species embeddings,
  image crops, retrieval, organism gating, and abstention.
- `apps/api/taxonomy.py` owns taxonomy loading, lineages, and prompts.
- `apps/load-weights/manifests/bioclip-2.json` pins the model bundle.
- `apps/load-weights/manifests/treeoflife-200m-bioclip2.json` pins the official species index.
- `app/api/admin/classify/route.ts` safely reads the original image with a resized fallback and
  forwards it to the Python API.
- `src/components/AdminAlbum/Photo.tsx` renders results, and `AdminAlbumClient.tsx` applies an
  accepted scientific name to pending XML edits.

Keep default thresholds conservative and configurable through `CLASSIFIER_*`. Change them only
after evaluating a labeled set containing correct organisms, visually similar taxa, difficult
crops, non-organisms, and known failure cases. Prefer `uncertain` to false certainty.

Photo date and location are currently reported as available but do not affect ranking. Do not claim
geographic or seasonal reranking until implemented and evaluated.

## Troubleshoot by invariant

- **Connection refused:** the single `ai-api` container should serve port 8080; do not start a
  classifier container on 8081.
- **HTTP 503:** inspect the health error for weights, checksum, taxonomy, or species-index failure. Do not
  bypass readiness.
- **Slow start:** checksum verification and memory mapping cover a multi-gigabyte official index;
  confirm the read-only species-index mount is present.
- **Implausible suggestions:** inspect top-two family agreement, margin, and status. Cross-family
  disagreement must abstain; do not reinterpret similarity as confidence.
- **Incorrect light colors:** verify the Joy provider is in dark mode and inspect the rendered page,
  not only component source.
- **Original image missing:** retain the resized fallback and keep file access behind
  `safePublicPath`.
