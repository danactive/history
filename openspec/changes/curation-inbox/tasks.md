## 1. Source model and metadata detectors

- [x] 1.1 Add typed finding, source revision, place label, suggestion, and scan-status models under `src/lib/curation/`; verify schema tests reject malformed records and distinguish repeated filenames across albums.
- [x] 1.2 Add fresh filesystem inventory/loading for configured gallery and album XML, preserving raw source fields and per-item provenance without Next.js caches; verify fixtures cover new, removed, malformed, unreadable, and date-less albums/items.
- [x] 1.3 Build place search/grouping from existing per-gallery interpretation plus recorded city/location text; verify case/accent matching, parent-qualified duplicate names, Unknown location, and unclassified labels without invented neighbourhoods.
- [x] 1.4 Implement missing-photo-description and critical-tag detectors using existing coverage semantics; verify whitespace, video exclusion, absent tag configuration, unique counts, zero coverage, and positive-only median with synthetic fixtures.
- [x] 1.5 Extract/reuse structured location validation and map warnings back to precise XML occurrences; verify typo candidates, duplicate aliases, ambiguous regions, unsupported countries, unavailable boundaries, and missing dates while existing Visited validation tests still pass.
- [x] 1.6 Generate evidence-backed, stageable field replacements only when the target is unambiguous; verify uncertain source components produce manual-review candidates and no detector writes XML or media.

## 2. Durable scan engine

- [x] 2.1 Implement versioned per-album shards, run metadata, checkpoints, atomic snapshot publication, and bounded old-generation/log cleanup under `.history/curation/`; verify interrupted writes preserve the last complete generation and incompatible derived state can be rebuilt.
- [x] 2.2 Implement full and incremental scans with source/configuration/detector/boundary fingerprints and dependency invalidation; verify identical findings between incremental and full scans after album edits, tag changes, geography-context changes, and confirmed removals.
- [x] 2.3 Add bounded concurrency and resumable checkpoints; verify changed sources are invalidated on resume and a source changed during analysis is retried or reported incomplete before publication.
- [x] 2.4 Add process-identity-aware exclusive ownership and coalesced follow-up requests; verify concurrent manual/scheduled runs cannot publish simultaneously, a full request is retained, and simulated sleep does not cause lock theft.
- [x] 2.5 Add scoped rechecks with dependent aggregate refresh; verify a successful fix resolves only after publication, an unreadable gallery is not removed, and failed first/later runs report coverage accurately.
- [x] 2.6 Add `scripts/curation-scan.ts` and package entry points for incremental, full, scheduled-due, status, and scoped recheck operations; verify operation without Next.js, classifier, or network and compare XML/media hashes before and after fixture scans.

## 3. macOS scheduling and local controls

- [x] 3.1 Provide a configurable user LaunchAgent template with hourly calendar triggers, background priority, absolute runtime/project paths, and weekly-full due selection; verify template linting and tests for overdue full scans and coalesced catch-up selection without wake assertions.
- [x] 3.2 Add setup validation and install/uninstall instructions covering the logged-in session, runtime moves, logs, sleep, resume, and rollback; verify documented commands with a temporary test agent when explicitly authorized, and never install an agent during build or page load.
- [x] 3.3 Add validated local-admin runtime configuration and protected no-store status/findings endpoints with bounded pagination; verify disabled/hosted mode exposes neither private index nor execution controls and malformed inputs are rejected.
- [x] 3.4 Add scan/recheck POST endpoints that promptly enqueue and start the shared detached local worker using fixed executable arguments; verify cross-origin rejection, startup errors, returned run identifiers, and progress continuing after the browser closes.

## 4. Inbox presentation

- [x] 4.1 Add `/admin/curation` and its admin navigation entry in the existing dark style; verify first-run, running, complete, incomplete, failed, and unconfigured-detector states with component tests.
- [x] 4.2 Add place/category search, optional gallery/album filters, URL state, and paginated place-grouped results across all galleries by default; verify no required gallery selection, matching across galleries, and refresh/back navigation restore the chosen view.
- [x] 4.3 Render grouped item findings, distinct album opportunities, thumbnails/fallbacks, evidence, scope labels, and correctly labeled counts; verify two findings on one photo, repeated media across albums, and multi-place album opportunities without filter-dependent median changes.
- [x] 4.4 Add Scan now mode selection, Recheck, progress, coverage failures, and last-successful timestamps; verify opening/filtering the inbox does not start analysis and failures never appear as a clean library.

## 5. Editor review and explicit persistence

- [x] 5.1 Extend Album Editor links with exact source identity, finding ID, and an allowlisted inbox return URL/anchor; verify item selection after async load, cleared bulk selection, missing/ambiguous targets, and compatibility with album-only links.
- [x] 5.2 Display original/proposed values and evidence with explicit Accept suggestion; verify acceptance stages only one addressed field, preserves unrelated pending edits, and never generates/saves XML or mutates other selected items.
- [x] 5.3 Add revision digests on editor reads and optional expected-revision saves, required for inbox review sessions, with a shared per-album application write lock; verify stale staging/save conflicts retain drafts and newer XML, atomic replacement remains intact, and legacy callers remain compatible.
- [x] 5.4 Queue verification after successful explicit saves and restore inbox filters/position on return; verify unsaved visits stay open, successful saves remain awaiting verification until rechecked, and resolved rows fall back to their place group.

## 6. Integrated verification and delivery

- [x] 6.1 Add a synthetic multi-gallery end-to-end review flow covering place search, suggestion acceptance, explicit save, verification, and return navigation; verify source/XML fidelity, no automatic repairs, and preserved public Visited/filter behavior.
- [x] 6.2 Exercise a large synthetic library and worker failure/resume cycle; record scan duration, peak memory, and inbox response behavior, confirming bounded page payloads and absence of request-time full scans.
- [ ] 6.3 Verify the scheduler's awake/sleep/wake behavior on macOS using a temporary fixture-backed agent with explicit authorization; record skipped manual checks honestly, validate coalesced wake catch-up, and unload the test agent afterward.
- [x] 6.4 Run focused Vitest suites, then `rtk npm run lint:ci`, `rtk npm run test:ci`, `rtk npm run typecheck`, and `rtk npm run build`; record outcomes and ensure generated public output contains no private scan index.
- [x] 6.5 Document local setup, initial full scan, configurable scheduling, review/save semantics, raw neighbourhood-label limitations, concurrent external-edit limitations, and rollback; verify documentation matches actual commands and run `rtk openspec validate curation-inbox --strict`.

Verification results and the outstanding live scheduler check are recorded in [verification.md](verification.md).
