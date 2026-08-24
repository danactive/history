# Photo-analysis service

`apps/` contains History's optional local AI subsystem. It is deliberately separate from Next.js
so the gallery remains usable without large Python dependencies or model assets, while the Album
Editor can request richer insights when the service is running.

## One service, several capabilities

The `apps/api/` FastAPI application owns every Python photo-analysis feature and listens on port
8080. It accepts image bytes rather than filesystem paths and provides:

| Route | Responsibility |
| --- | --- |
| `GET /health` | Reports model readiness, pinned revisions, taxonomy identities, and devices. |
| `POST /scores` | Returns aesthetic measurements and editing insights. |
| `POST /classify/organism` | Retrieves organism candidates with BioCLIP 2. |
| `POST /classify/architecture` | Retrieves architectural styles with SigLIP 2. |
| `POST /classify/photo` | Chooses and balances reviewable results from both specialists. |

The Album Editor calls the combined route through the Next.js endpoint in
`app/api/admin/classify/route.ts`. There is one user-facing **Classify photo** action and one Python
server; organism and architecture classification are specialists inside that service, not
separate applications.

## Offline model boundary

Classifier inference uses only verified files under the ignored repository-level `models/`
directory. `apps/load-weights/` contains the pinned manifests and downloader that populate those
directories. Runtime network access is not a fallback: a missing model, tokenizer, taxonomy, or
checksum is surfaced as a readiness failure.

The service is advisory. Similarities are retrieval scores rather than probabilities, clearly
gated-out suggestions are hidden by the combined route, and results do not update album XML
automatically. The user must choose **Add Desc** and complete the existing XML-generation workflow.

## Where to continue

- Read [apps/api/README.md](api/README.md) for the API contract, classifier behavior, and source
  layout.
- Read [apps/load-weights/README.md](load-weights/README.md) for the asset and integrity model.
- Use the [photo-classifier agent skill](../.agents/skills/photo-classifier/SKILL.md) for fresh-clone
  setup, downloads, builds, startup, testing, calibration work, and troubleshooting.
