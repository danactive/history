# History photo-analysis API

This directory implements the unified FastAPI service used by History's Album Editor. Aesthetic
analysis, BioCLIP 2 organism retrieval, SigLIP 2 architectural-style retrieval, and the combined
photo-classification policy all run in the same process on port 8080.

## API contract

Classification routes accept raw JPEG or PNG bytes. The Next.js integration loads the original
image when available, falls back to the resized copy, and forwards one request to
`POST /classify/photo`.

| Route | Result |
| --- | --- |
| `GET /health` | Readiness plus model revision, taxonomy, candidate-count, and device diagnostics. |
| `POST /scores` | Aesthetic metrics and editing suggestions. |
| `POST /classify/organism` | Ranked organism diagnostics and an organism-specific status. |
| `POST /classify/architecture` | Ranked style diagnostics and an architecture-specific status. |
| `POST /classify/photo` | Up to four review results suitable for the Album Editor. |

Optional context can be sent through `X-Photo-Date`, `X-Photo-Latitude`, `X-Photo-Longitude`,
`X-Photo-City`, and `X-Photo-Location`. The API reports whether that context was available, but it
does not currently alter visual ranking. In particular, a photo date is not treated as a building
construction date, and an existing description is not fed back into either visual classifier.

## Result policy

Organism and architecture similarities come from different embedding spaces. They are retrieval
scores—not calibrated probabilities—and must never be converted to percentages or sorted against
one another.

Each specialist can identify, abstain as uncertain, or reject the image as outside its domain. The
combined route applies those specialist decisions and returns at most four reviewable results:

- If one specialist identifies the image, its ranking is preserved.
- If both specialists remain plausible, eligible results are alternated rather than cross-model
  score-sorted.
- Clearly gated-out results are omitted instead of forcing a label.
- Match strength remains `strong`, `possible`, or `weak` to communicate review confidence.

No route mutates album metadata. The UI presents candidates and leaves the final description edit
to the user.

## Models

The organism engine uses BioCLIP 2 with the official TreeOfLife-200M text-embedding index. It
retrieves against 867,455 species and evaluates similarity, margin, family agreement, and crop
agreement before presenting an identification.

The architecture engine uses SigLIP 2 as a zero-shot classifier over a versioned 29-style taxonomy.
Prompt ensembles, style families, an architecture gate, family margin, and crop agreement help it
distinguish a recognizable style from an ambiguous detail or non-building image. It loads lazily
on the first architecture or combined request.

All required model, tokenizer, taxonomy, and embedding files are local and checksum-verified.
Runtime initialization uses offline modes and fails closed rather than downloading missing files.
The aesthetic endpoint can use its local heuristic fallback when its optional learned assets are
absent.

## Source map

| File | Responsibility |
| --- | --- |
| `main.py` | Application lifespan, health diagnostics, and public routes. |
| `aesthetic.py` | Aesthetic measurements, scorer integration, and fallback. |
| `classify.py` | Organism request validation and engine invocation. |
| `classifier_engine.py` | BioCLIP retrieval, gating, ranking, and abstention. |
| `taxonomy.py` | Organism taxonomy and scientific-name handling. |
| `architecture.py` | Lazy architecture-engine boundary. |
| `architecture_engine.py` | SigLIP prompts, embeddings, gating, ranking, and abstention. |
| `architecture_taxonomy.json` | Canonical architectural styles, families, prompts, and review cues. |
| `photo_classify.py` | Combined selection policy and four-result response. |
| `start.py` | Service process entry point. |

## Verification philosophy

The Python suite includes real offline inference against the long-tailed fiscal and ochre sea star
fixtures, plus architecture ambiguity, non-architecture gating, API integrity, and combined-result
coverage. Model or taxonomy changes should be evaluated as classifier changes—not accepted only
because unit mocks or route-shape tests pass.

Use the [photo-classifier agent skill](../../.agents/skills/photo-classifier/SKILL.md) for the exact
asset setup, build and run commands, health expectations, regression procedure, offline proof, and
troubleshooting sequence.
