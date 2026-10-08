# Curation Inbox verification — 2026-10-07

- Repository checks: lint and TypeScript passed; Vitest passed 744 tests in 112 files; production build passed. The existing libheif dynamic-require warning remains.
- The production preview was inspected at `/admin/curation`: all-gallery place search, exact-photo editor selection after loading, and return to the filtered inbox with row position restored. No owner-library XML was saved during preview checks.
- `npm run curation:verify`: 10,002 photos, 102 albums, two galleries; full scan 274 ms; result query 66 ms; 30-row response 25,860 bytes; peak process RSS 227 MiB; complete fixture workflow 1,192 ms. These are local synthetic measurements, not production performance guarantees.
- The fixture workflow stages a suggestion without writing, explicitly generates/saves XML, rejects a stale second save, keeps the finding open until verification, resolves only the edited occurrence, preserves media bytes, and resumes after a simulated interruption.
- Recovery tests cover corrupt snapshots/checkpoints, dead lock owners and recovery gates, live owners with old timestamps, source changes before publication, source/configuration/boundary invalidation, and failed coverage preserving the previous snapshot.
- API/worker tests cover disabled local mode, foreign origins, malformed queries/scopes, fixed detached process arguments, early boot failure, run identifiers, and reads that never start scans.
- Schedule preparation succeeded and `plutil -lint` passed. No LaunchAgent was installed. Actual logged-in-session installation, awake firing, sleep/wake coalescing, and unloading remain unverified (task 6.3). The implementation uses calendar launchd scheduling and never requests machine wake or prevents sleep.
- Private derived data is under ignored `.history/curation/`; it is not a public asset or a prerendered findings payload. No classifier, geocoder, or network is used by the scanner.
