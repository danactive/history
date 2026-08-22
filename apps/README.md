# Python API quick start

The History app uses one local FastAPI service for all photo-analysis functions:

- `POST /scores` provides aesthetic scores and editing insights.
- `POST /classify/organism` provides offline BioCLIP 2 organism diagnostics.
- `POST /classify/architecture` provides offline architectural-style diagnostics.
- `POST /classify/photo` returns up to four balanced organism or architecture results for review.

Both accept raw JPEG or PNG bytes and run on `http://localhost:8080`.

## First-time model setup

Download and verify the pinned BioCLIP 2 bundle if it is not already present:

```sh
make load-bioclip2
make load-architecture-classifier
```

The immutable model and TreeOfLife-200M species-index revisions, required artifacts, and SHA-256
values are defined in `apps/load-weights/manifests`. Runtime inference remains offline.

## Build and run

```sh
make build-ai-api
make ai-api
```

Only `make ai-api` is needed to serve every Python feature. Its Docker target mounts the verified
TreeOfLife-200M species index and SigLIP 2 bundle read-only.

Check classifier readiness:

```sh
curl http://localhost:8080/health
```

A ready response reports BioCLIP details and the lazy architecture classifier. Architecture changes
from `not_loaded` to `ok` after its first request.

## Exercise the routes

```sh
curl -X POST -H "Content-Type: image/jpeg" --data-binary @public/sample.jpg http://localhost:8080/scores
```

```sh
curl -X POST -H "Content-Type: image/jpeg" --data-binary @public/sample.jpg http://localhost:8080/classify/photo
```

Classifier similarities are retrieval scores, not probabilities. The combined route omits
uncertain candidates instead of presenting a poor organism or architectural-style guess.
