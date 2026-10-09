## Why

History already detects important-tag gaps and location naming problems, but fixing them requires visiting separate tools and choosing albums in advance. A place-first Curation Inbox across the local library will turn those checks into a review workflow, with expensive analysis performed in the background while the owner's Mac is awake.

## What Changes

- Prioritize photos matching today's month/day across years, offer a Today-only view, and expose missing photo tags and missing place text as review opportunities.

- Add `/admin/curation` with all locally configured galleries included by default, place search and grouping, optional gallery/album filters, and an Unknown location group.
- Surface missing descriptions, existing critical-tag coverage opportunities, and location naming findings with evidence and suggested corrections where supported.
- Reuse existing city/location labels for neighbourhood discovery; distinguish recorded location text from verified administrative geography.
- Link each finding to its exact album/photo in the Album Editor, retain inbox navigation context, and stage a suggested value only after explicit acceptance. XML changes still require explicit saving.
- Build a local persisted scan index with incremental and full scans, progress, failure reporting, resumable checkpoints, and protection against overlapping jobs and stale suggestions.
- Provide a macOS user LaunchAgent setup for scheduled scanning while awake, without waking the Mac or requiring an open browser/Next.js server. Add manual scan and recheck actions.
- Preserve the standalone Critical-tag coverage page and public viewing/query behavior.

Non-goals for this first release: automatic repairs, filesystem media audits or regeneration, R2 verification, reverse geocoding or new neighbourhood boundary datasets, AI-written descriptions, classifier batch execution, visual similarity analysis, persistent snoozing/dismissal, public viewer features, and MCP tools. The scan architecture permits later heavier detectors; v1 runs comprehensive metadata analysis rather than introducing unrelated analysis services.

## Capabilities

### New Capabilities

- `curation-inbox`: Cross-gallery, place-first metadata findings, contextual editor navigation, and explicitly reviewed suggestions.
- `curation-scanning`: Local scheduled and manual analysis, durable results, scan lifecycle, and fresh-data verification.

### Modified Capabilities

None. Existing public filtering and Visited behavior remain unchanged.

## Impact

- Admin navigation and a new inbox page/API; Album Editor deep links, suggestion staging, and conditional saving for inbox edits.
- Reuse or extract pure logic from `src/lib/critical-tags.ts`, `src/lib/visited-core.ts`, and `src/components/VisitedMap/validation-core.ts`; preserve their existing consumers and tests.
- Add a standalone TypeScript scan entry point, local index under ignored `.history/curation/`, and documented opt-in macOS scheduling setup.
- Album XML remains authoritative with its existing schema and canonical filenames. The scanner writes only derived local state; accepted edits use the existing XML persistence flow. Original and generated media are untouched.
- No new remote service or cloud scheduler. Private findings are never stored under `public/` or included in build-generated viewer data. Existing MCP and optional classifier behavior do not change.
