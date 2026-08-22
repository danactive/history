# History photo-analysis API

This FastAPI application serves the aesthetic scorer, offline BioCLIP 2 organism classifier, and
offline SigLIP 2 architectural-style classifier from one Python process on port 8080.

## Endpoints

- `GET /health` reports readiness, pinned revisions, taxonomy identities, candidate counts, and
  devices for both classifiers. Architecture reports `not_loaded` until its first request.
- `POST /scores` accepts raw image bytes and returns aesthetic metrics and editing tips.
- `POST /classify/organism` returns reviewable organism suggestions with
  `identified`, `uncertain`, or `not_organism` status.
- `POST /classify/architecture` returns architectural-style diagnostics with `identified`,
  `uncertain`, or `not_architecture` status.
- `POST /classify/photo` invokes both specialists and returns up to four balanced review results for
  the Album Editor without comparing scores across the two model spaces.

Optional classification metadata is supplied through `X-Photo-Date`, `X-Photo-Latitude`,
`X-Photo-Longitude`, `X-Photo-City`, and `X-Photo-Location`. Metadata availability is reported but
does not currently alter ranking.

## Classifier model

BioCLIP 2 loads from `models/imageomics_bioclip-2` with Hugging Face and Transformers offline modes
enabled. Species retrieval uses BioCLIP's official 867,455-entry TreeOfLife-200M text-embedding
index mounted read-only from `models/imageomics_TreeOfLife-200M`. Model, taxonomy, and embedding
checksums are verified before initialization.

Similarity values are not calibrated probabilities. A species is presented as identified only
when similarity, margin, crop agreement, and top-two family agreement all pass. Genus agreement is
reported for diagnosis but is not a veto between plausible species in the same family.

SigLIP 2 loads lazily from `models/google_siglip2-base-patch16-224`. Its complete model, processor,
and tokenizer bundle is checksum-verified before use. Architecture must pass the architecture gate,
absolute similarity, family margin, and crop agreement. Close or ambiguous details retain weak or
possible labels in the combined response.

## Commands

From the repository root:

```sh
make build-ai-api
make ai-api
```

Run the unified Python tests with:

```sh
make build-test
make test
```

The Python suite performs real offline regression inference on the long-tailed fiscal and ochre sea
star fixtures and verifies that ambiguous architecture and non-architecture images are suppressed.
