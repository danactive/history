# Python API quick start

The History app uses one local FastAPI service for both photo-analysis functions:

- `POST /scores` provides aesthetic scores and editing insights.
- `POST /classify` provides offline BioCLIP 2 organism suggestions.

Both accept raw JPEG or PNG bytes and run on `http://localhost:8080`.

## First-time model setup

Download and verify the pinned BioCLIP 2 bundle if it is not already present:

```sh
make load-bioclip2
```

The immutable model and TreeOfLife-200M species-index revisions, required artifacts, and SHA-256
values are defined in `apps/load-weights/manifests`. Runtime inference remains offline.

## Build and run

```sh
make build-ai-api
make ai-api
```

Only `make ai-api` is needed to serve both Python features. Its Docker target mounts the verified
TreeOfLife-200M species index read-only.

Check that BioCLIP initialized successfully:

```sh
curl http://localhost:8080/health
```

A ready response reports `status: ok`, the pinned model and species-index revisions, taxonomy
digest, and `candidateCount: 867455`.

## Exercise the routes

```sh
curl -X POST -H "Content-Type: image/jpeg" --data-binary @public/sample.jpg http://localhost:8080/scores
```

```sh
curl -X POST -H "Content-Type: image/jpeg" --data-binary @public/sample.jpg http://localhost:8080/classify
```

Classifier similarities are retrieval scores, not probabilities. Species suggestions are marked
`identified` only when the score thresholds pass and the two leading taxa agree at family level;
otherwise the API abstains with `uncertain`.
