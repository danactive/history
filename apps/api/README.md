# History photo-analysis API

This FastAPI application serves the aesthetic scorer and offline BioCLIP 2 classifier from one
Python process on port 8080.

## Endpoints

- `GET /health` reports whether BioCLIP is ready, including the model revision, taxonomy digest,
  candidate count, and device. It returns HTTP 503 when classification is unavailable.
- `POST /scores` accepts raw image bytes and returns aesthetic metrics and editing tips.
- `POST /classify` accepts raw image bytes and returns reviewable organism suggestions with
  `identified`, `uncertain`, or `not_organism` status.

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
star fixtures in `public/test/fixtures/classifier`.
