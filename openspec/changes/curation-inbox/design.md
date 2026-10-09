## Context

Today-first refinement: persist a photo's month/day from its recorded date, falling back to the primary filename, with each finding row. At query time, rank matching photos ahead of other rows before pagination and offer `focus=today`. Calculate the local current day only at request time; scans remain date-independent, so rollover needs no new scan. Include missing photo tags and absent city/location text as manual-review gaps. Preserve whole-album critical-tag scope and all existing filters.

See proposal.md for motivation and release scope. The existing admin index links Walk, Album Editor, Assets, and Critical-tag coverage. `auditCriticalTags` counts matching media once and computes a median among covered albums. Visited validation detects spelling candidates, ambiguous/unmapped regions, and duplicate aliases using local boundary files. Its current output is aggregated display text, not a record of editable XML sources.

Album XML contains `photo_city`, optional `photo_loc`, `photo_desc`, and `search`; there is no neighbourhood field. Visited place parsing uses library context and heuristics, so a parsed place is not necessarily independently verified. The Album Editor supports album deep links, bulk selection, generated XML, and explicit saving, but not an initial exact-item selection or conditional writes. `writeAlbum` already replaces XML via a temporary file and rename.

The Next.js route-handler guide installed in `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` was consulted: runtime filesystem reads can stay dynamic, and heavy background work should live outside request handling. `.history/` is already ignored. The local `launchd.plist(5)` manual confirms calendar jobs coalesce missed sleep intervals on wake; interval timers alone can miss those firings.

## Goals / Non-Goals

**Goals:** Separate analysis from presentation; preserve exact source provenance; make expensive scans resumable and review fast; enforce the explicit-save boundary throughout the review flow.

**Non-Goals:** See proposal.md. In particular, a background-worker design does not imply v1 model execution or geographically verified neighbourhood boundaries. No scheduler is installed by creating this plan.

## Decisions

### 1. Place-first metadata MVP

Default to all available local galleries; gallery and album remain optional filters. Derive country/region using existing per-gallery parsing context, not a new combined context that could change interpretations. Group by country, region, city, then recorded location label when available. Do not invent hierarchy levels from ambiguous comma-separated strings: preserve raw text and use an Unclassified place group when necessary. Use Unknown location for records with no usable city or location text. Existing neighbourhood names in `photo_loc` are searchable as recorded labels; do not label every `photo_loc` as a verified neighbourhood.

Search case-insensitively and accent-insensitively across these recorded/derived labels, with distinct choices qualified by their parent place. Query parameters preserve place/category/gallery/album filters and pagination. A stable row anchor preserves return position. Filtering never changes the population used to calculate critical-tag coverage.

Alternative: require a gallery first. Rejected because the user explicitly wants to start from a place across their library. Reverse geocoding is deferred to avoid adding an external service or unsupported geography claims.

### 2. Findings carry identity, evidence, and editable provenance

Use three detector families:

- Description: absent or whitespace-only raw `photo_desc` creates an opportunity for each photo item. Videos are excluded from this v1 detector.
- Critical tags: reuse existing global-across-galleries coverage semantics and median of positively covered albums. With no configured tags, report the detector as unconfigured and produce no tag findings. Emit one album finding for zero coverage or below-median positive coverage; these are opportunities, not invalid metadata.
- Location: reuse existing alias/spelling and boundary matching rules. Preserve per-item source references even when warnings concern multiple spellings. Unsupported countries alone are not findings; unavailable boundary files are scan coverage failures, not invalid locations. Inspect items regardless of usable photo dates rather than depending on the year-filtered Visited display aggregate.

A finding stores detector/version, category, source gallery/album/item ID and primary filename, original field values, source digest, place labels, reason, evidence, suggestion candidates, and last checked time. XML occurrences remain separate even if multiple albums reference the same media file. Findings for one occurrence become a single row with multiple badges; album-level tag findings remain separate cards and never imply every photo lacks an important tag.

Album cards match a place filter when at least one album item matches, retaining their whole-album scope and labeling multi-place albums. Counts distinguish findings, affected photos, and affected albums. Default order is location review first, then tag opportunities, then descriptions, with stable source identity tie-breakers.

Only offer a stageable correction when the original XML field and exact proposed replacement are unambiguous. Otherwise offer candidates and evidence for manual editing. No generated prose or invented confidence percentages. Extract reusable structured validation without changing public Visited behavior.

Alternative: store warning strings only. Rejected because strings cannot safely identify the source field or detect stale suggestions.

### 3. Standalone scanner with local snapshot generations

Add `scripts/curation-scan.ts` using the existing TypeScript runtime. It discovers the configured gallery inventory and album XML directly through filesystem-safe loaders; it must not rely on Next cache or build-time page data for fresh source reads. Share pure detectors with the app under `src/lib/curation/`.

Persist rebuildable state in `.history/curation/`, never in `public/`: versioned scan generations, per-album shards/checkpoints, run metadata, and an atomically replaced current-generation pointer. Keep the current and previous complete generations; clean older complete generations only after publication, and bound operational logs. Failed/resumable staging state remains separate from completed results. This avoids a new database dependency while supporting a bounded writer and paginated reads; whole-library findings must not be serialized into each page response.

Each run inventories sources, computes content digests, and fingerprints detector versions, relevant configuration, and boundary data. Incremental mode reuses unchanged analysis but recalculates global aggregates and every affected per-gallery place dependency. Tag configuration changes invalidate tag results; boundary changes invalidate location results. Full mode rereads all sources and recomputes every detector. Reconcile removed albums only after a successful inventory; an unreadable gallery must not be mistaken for deletion. Validate source digests again before publishing a generation; changed sources are retried or leave the run incomplete, not silently presented as current.

Use bounded concurrency (initial implementation: one album read/write at a time) and checkpoint completed albums. The synthetic 10,002-photo fixture completes in under a second on the development Mac; start with serial I/O to limit filesystem pressure. A run lock with owner token and verifiable process identity prevents overlapping CLI, scheduled, and manual workers. Never reclaim a lock solely because a heartbeat expired while the Mac slept. A new process resumes reusable checkpoints after proving the owner has exited; changed sources/configuration invalidate affected checkpoints.

On failure, retain the last complete snapshot with failure/coverage details. With no complete snapshot, show an incomplete first scan rather than zero findings. Rechecks publish only when the affected scope and its dependent aggregates are verified; otherwise retain previous results and mark the scope stale. Opening or accepting a finding never resolves it.

Alternative: scan on each page request. Rejected because expensive work would block browsing. SQLite can be revisited if measured snapshot query costs justify it; it is not required for this single-owner initial design.

### 4. Schedule only on the owner's awake Mac

Provide a user LaunchAgent template and explicit install/uninstall documentation, with no root daemon, cloud job, wake assertion, or `caffeinate`. Use `StartCalendarInterval` every hour at minute 15 and `ProcessType=Background`. These are adjustable defaults, not a required fixed user schedule. Each invocation runs incremental analysis unless no successful full scan exists in the preceding seven days, in which case it runs full analysis. A delayed invocation performs one catch-up run, not a backlog of missed runs. The agent operates during the logged-in user session and needs neither browser nor Next.js server.

Use absolute project and Node/TypeScript-runner paths resolved during setup because launchd does not load shell/nvm startup configuration. Validate the runtime, repository, configuration, and write access before installation. Document reinstalling after project/runtime moves. Scheduling is opt-in at implementation setup; neither build nor page load installs it.

Manual Scan now (incremental by default, full available) and Recheck enqueue local requests and invoke the same detached worker with fixed executable/argument construction in a supported local Node host. The POST returns a run identifier promptly. Requests during an active run coalesce into a bounded follow-up request, upgrading to full when needed. Worker startup errors are visible. No heavy scan runs inside a Next request or requires polling to stay alive. The scheduler also consumes pending requests.

Alternative: traditional cron. Calendar-based launchd handles missed sleep times more usefully and provides an appropriate per-user lifecycle.

### 5. Review in the existing editor with explicit acceptance and save

Add exact-item query identity to `/admin/album` alongside existing gallery/album parameters. Resolve item ID plus filename after loading XML; reject missing or ambiguous matches with a visible notice instead of selecting a different photo. Preserve an allowlisted local `/admin/curation` return URL and row anchor. Opening a finding selects only that source occurrence and clears any prior bulk selection.

Pass a finding ID, not arbitrary XML or an executable action, in the link. The editor loads current source data and retrieves the indexed suggestion. Display old/new value and evidence. Explicit Accept suggestion stages one field on the addressed item without invoking the bulk update path or generating/saving XML automatically. Manual edits, Generate XML, and Save to XML retain their established roles.

Add a source revision digest to editor reads and an optional expected-revision precondition to saves. Inbox review sessions require that precondition. Check it immediately before replacement under the same per-album write lock used by all application XML writers; a mismatch returns a conflict and leaves edits available for review. Revalidate the suggestion source before staging as well. Legacy callers without a revision retain existing behavior, while using the shared write lock. Uncoordinated external filesystem writes cannot be made transactional by an application lock; detect digest changes at the final check and document that concurrent external editing is unsupported.

After a successful explicit save, queue a scoped recheck and retain the finding as awaiting verification until publication confirms it is resolved. Returning without saving leaves it open. Preserve the inbox query/anchor even if the original row disappears; fall back to its place group.

Alternative: an inbox auto-fix action. Rejected by the user's no-automatic-repairs requirement and because the existing editor already provides review and persistence.

### 6. Local admin delivery and compatibility

Use runtime, no-store responses for inbox findings and scan status, with validated filters, bounded page sizes, and explicit not-configured/running/complete/incomplete/failed states. Enable scan controls and private index access only in explicitly configured local-admin mode; omit them on hosted deployments. Local mutation routes must reject cross-origin requests and unconfigured hosts. Do not copy the index into public static output or extend MCP access.

Preserve the existing Critical-tag coverage page, XML schema, media paths, public query parameters, Visited map navigation, and classifier review boundary. The new admin route has its own filter contract.

## Risks / Trade-offs

- Recorded location strings are inconsistent -> Preserve raw labels and provenance, qualify same-named places, and expose uncertainty rather than inventing neighbourhood geography.
- All-gallery results can be noisy -> Category/place filters, grouped photo rows, and explicit opportunity labels; persistent dismissal is a later feature.
- Cross-album/global dependencies can invalidate incremental work -> Fingerprint configuration and shared geography context and test incremental/full equivalence.
- Sleep, crashes, and missing sources can leave stale results -> Checkpoints, owner-verified locking, last-good snapshot retention, and visible coverage/timestamps.
- Manual workers require a persistent local Node environment -> Explicit local setup, fixed executable paths, visible launch failures, and CLI fallback.
- Snapshot shards trade database querying for simpler operations -> Bounded reads and pagination with a synthetic large-library validation before considering new storage dependencies.

## Migration Plan

1. Introduce the scanner and derived store without changing XML; verify a manual full scan with synthetic fixtures and the configured local library.
2. Add the inbox and editor integration behind local-admin configuration. Empty state guides the user to run the first scan.
3. Provide scheduler setup as a separate opt-in operation after manual verification. Document schedule customization, sleep behavior, logs, and recovery.
4. Roll back by unloading the LaunchAgent and disabling local inbox configuration. Derived `.history/curation/` data can be rebuilt; no XML migration or media rollback is needed. Explicitly saved user edits remain normal album edits.
