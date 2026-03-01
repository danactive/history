# Apps Quick Start (Python API)

This folder contains the Python API used by the app.

## Routes you likely want

- `POST /scores`
- `POST /classify`

Both accept raw image bytes (`image/jpeg` or `image/png`).

## Start the API (recommended via Docker)

From repo root:

```sh
make build-ai-api
make ai-api
```

API runs at:

```txt
http://localhost:8080
```

## Test the two routes

Use any local image file (example: `public/sample.jpg`).

```sh
curl -X POST -H "Content-Type: image/jpeg" --data-binary @public/sample.jpg http://localhost:8080/scores
```

```sh
curl -X POST -H "Content-Type: image/jpeg" --data-binary @public/sample.jpg http://localhost:8080/classify
```

## Optional: run without Docker

```sh
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:main_py_app --host 0.0.0.0 --port 8080
```

