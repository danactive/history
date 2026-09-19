The candidate has been reconciled with this change. Acceptance evidence and command results are recorded in [verification.md](verification.md).

## 1. Boundary data and matching

- [x] 1.1 Reconcile the three local boundary assets and provenance with the design; verify 47 Japanese, 51 US, and 13 Canadian features, unique IDs, and closed polygon rings with the focused boundary tests.
- [x] 1.2 Reconcile region normalization, canonical-name precedence, alias deduplication, and unmapped-name reporting; verify accents, postal/ISO codes, Japanese suffixes, Washington versus DC, unknown cities, and zero matches in automated tests.

- [x] 1.3 Add local full names, abbreviations, and one interior label anchor per division; verify 111 unique anchors, point-in-polygon containment, unambiguous labels, and curated island/dateline cases.

## 2. Page integration and scrolling

- [x] 2.1 Reconcile the server list/client wrapper integration and shared Mapbox token; verify original order, years, counts, and filter hrefs are preserved, and galleries without supported countries render no panel.
- [x] 2.2 Reconcile reading-line selection, scroll restoration, resize handling, and listener cleanup; add component coverage for forward/backward scrolling, skipped headings, unsupported sections, and initial restored positions, with all assertions passing.
- [x] 2.3 Reconcile the desktop sticky-right layout and remove the candidate's mobile CSS breakpoint and mobile-specific reading-line branch; verify the map stays to the right, the list scrolls, and controls remain usable when resizing the desktop window.

- [x] 2.4 Add the subtle active-country list marker and accessible current-state annotation; test forward/backward scrolling keeps the marker and map summary aligned without altering links, and manual panning leaves selection unchanged.

## 3. Map rendering and reliability

- [x] 3.1 Explicitly configure Globe for both online and local vector-only styles with a low initial overview zoom and replace country fitting with pan-only camera updates; verify the current user-selected zoom and zero bearing/pitch persist throughout Canada–USA–Japan transitions and desktop resize, and inspect northern-area distortion and Hawaii/Alaska coverage.
- [x] 3.2 Load and retain all three countries' sources and visited layers independently of active selection; test that panning never removes other overlays, revisiting does not refetch successful data, and delayed responses add only their own source without moving the camera or changing the active summary.
- [x] 3.3 Verify independent loading and failure behavior with one rejected boundary request and basemap network errors; ensure successful overlays remain, boundary failures identify unavailable coverage, basemap failures enter vector-only mode, and list links remain usable.
- [x] 3.4 Provide accessible manual zoom controls and drag panning while disabling wheel zoom, pitch, and rotation; verify wheel scrolling moves the page, keyboard-activated zoom controls work, subsequent automatic pans preserve manually selected zoom, and reduced motion disables pan animation.

- [x] 3.5 Add a local vector-only style and offline/connectivity lifecycle handling; test cold offline load with the local app reachable, browser offline events, failed basemap requests while nominally online, and reconnection. Add an accessible Basemap toggle and test that manual off overrides reconnection, no remote rendering-resource requests occur while vector-only, and camera/overlays remain unchanged.
- [x] 3.6 Render centered labels for every division using local/system fonts, abbreviations, and short leader lines when abbreviated text still collides; verify full-name hover/focus access, labels for unvisited divisions, offline rendering, and all three countries' labels persisting while panning. Test collision detection, stable displacement, leader-line endpoints, and horizon occlusion so far-side labels and focus targets disappear and reappear correctly; visually inspect dense Japanese prefectures and northeastern US states at overview and manual detail zooms.

- [x] 3.7 Add visited/total coverage summaries and distinct fill/outline treatment; test denominators 47/51/13, explicit DC/territory wording, deduplicated aliases, unmatched names, and loading/failure states that do not fabricate a zero.

## 4. Integration verification

- [x] 4.1 Run `rtk npx vitest run src/components/VisitedMap/regions.vitest.ts src/lib/__tests__/visited.vitest.ts` plus any new component tests, and record passing results or concrete failures.
- [x] 4.2 Run `rtk npm run lint:ci`, `rtk npm run typecheck`, and `rtk npm run build`; record results and distinguish existing unrelated failures from regressions.
- [x] 4.3 Review the final diff for XML/media/query compatibility and run `rtk git diff --check` plus `rtk proxy openspec validate visited-region-map --strict`; record acceptance evidence and any explicitly deferred work before archiving.


## 5. Follow-up refinements

- [x] 5.1 Enable mouse-wheel and double-click zoom while preserving automatic pan-only navigation and locked pitch/rotation.
- [x] 5.2 Remove basemap-style readiness races from local label rendering; verify repeated toggles preserve the label overlay.
- [x] 5.3 Add all 32 Mexican divisions, interior anchors, aliases, coverage, accented-country selection, and offline rendering; run focused tests, lint, typecheck, build, and strict OpenSpec validation.


## 6. Location validation

- [x] 6.1 Add review-only warnings for country typos, duplicate country/region names, ambiguous matches, and unmapped supported regions, with loading/failure states.
- [x] 6.2 Combine map visits across canonical country aliases while preserving original list/filter data; test suggestions never paint guessed matches and duplicates count once.
- [x] 6.3 Run focused tests, lint, typecheck/build, browser review, and strict OpenSpec validation.


## 7. Italy and Türkiye

- [x] 7.1 Add ready-made Italy regions and Türkiye provinces to the existing local vector pipeline, with aliases, interior labels, attribution, coverage, validation, and offline behavior.
- [x] 7.2 Verify complete datasets (20/81), matching and deduplication, browser selection/rendering, focused tests, lint, typecheck/build, and strict OpenSpec validation.
