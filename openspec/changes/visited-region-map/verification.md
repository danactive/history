# Implementation verification

Verified September 17, 2026.

## Automated checks

- `rtk npx vitest run src/components/VisitedMap/ src/lib/__tests__/visited.vitest.ts`: 28 tests pass across five files.
- `rtk npm run lint:ci`: passes.
- `rtk npm run typecheck`: passes.
- `rtk npm run build`: passes, including all 130 generated pages. The existing `libheif-js` dynamic-require warning comes through the unrelated HEIF API import chain.
- `rtk git diff --check`: passes.
- `rtk proxy openspec validate visited-region-map --strict`: passes.

Boundary tests check all 111 divisions, closed rings, unique IDs/abbreviations, interior anchors, Alaska/Hawaii/Hokkaido/Okinawa placement, aliases and canonical precedence, unknown names, deduplication, and coverage wording.

Component and hook tests cover restored reading positions, forward/backward selection and skipped unsupported countries, active annotations and unchanged links, absent panels, cleanup, independent delayed fetches and failures, successful-data caching, aborts, cold offline initialization, reconnect and manual preference, basemap failure fallback, resource-free local style, persistent sources, pan-only camera arguments, reduced motion, collision layout, deterministic placement, anchor endpoints, full-name focus targets, and horizon removal/restoration.

## Browser review

Reviewed the running `/dan/visited` page at a 1280 × 720 desktop viewport. The right panel stays anchored while the left list scrolls, including wheel input over the map. Canada, USA, and Japan selection updates the marker and summary. Coverage is respectively 6/13, 8/51, and 30/47 for this gallery. Manual zoom and keyboard activation work; subsequent country transitions retain that zoom. Alaska and Hawaii appear at the shared overview. Inspected the northeastern US and Japanese prefectures at overview and manually enlarged scales.

The Basemap switch removes tiles while preserving local outlines, visited fills, labels, and the camera. The online and vector-only maps both use explicit Globe. Browser error logs were empty. Horizon review caught labels projected beyond the visible surface; the final implementation additionally checks the surface normal against camera altitude and removes hidden labels and their focus targets.

At overview scales, dense regions necessarily use abbreviations and displaced labels with leader lines. Full names remain available by hover/focus; deliberate zoom reveals more detail. Offline connectivity and failure scenarios are covered with deterministic hook/component tests; live browser review exercised the same local style through the Basemap switch.

## Compatibility and scope

Final diff review confirms country/region order, years, counts, and existing filter href construction are preserved. No XML, media, query parsing, or album-map projection behavior changes. The only shared album-map change extracts its existing public token into a common module. This change remains unarchived for review; no implementation tasks are deferred.


## September 18 follow-up: Mexico, mouse zoom, and basemap labels

All three follow-up tasks are complete. Mouse-wheel and double-click zoom are enabled; mouse zoom events over DOM labels are forwarded to the map so labels do not create dead spots. Scrolling over the left list still selects countries and preserves manual zoom. This supersedes the original wheel-over-map page-scroll behavior above.

Removed the style-ready state/effect gate around local labels. It could clear readiness after a style-loaded event had already fired. Labels now remain mounted across online/local style swaps and continue updating from map renders. Browser checks at overview and mouse-selected zoom confirmed labels persist when Basemap is switched off and on, with camera and page position preserved. Mouse-wheel zoom over a label enlarged the map without scrolling the document.

Mexico adds 32 divisions, with Mexico City separate from State of Mexico, interior anchors and ISO abbreviations, country matching for Mexico/México, and the same persistent/offline source lifecycle as Canada. The gallery shows 6 of 32 visited; Costa Maya and Cozumel remain explicitly unmapped rather than inferred as state visits. Boundary tests now cover all 143 divisions.

Follow-up validation: 29 tests pass across five files; lint, typecheck, production build, strict OpenSpec validation, and diff whitespace checks pass. The build retains the existing unrelated HEIF dependency warning described above. No follow-up work is deferred.


## Location validation follow-up

Added a validation section below the visit list with a top-of-list jump link. It flags likely supported-country typos, unmapped/ambiguous supported regions, duplicate normalized names, and duplicate region aliases. Name suggestions do not paint inferred visits or mutate XML. Exact repeated visit names continue to aggregate upstream. Duplicate canonical country entries now contribute all of their regions to map coverage instead of using only the first entry.

Boundary loading is shared between validation and the map; galleries with no supported countries do not fetch geometry just to validate country names. Unsupported countries are not errors; validation explicitly describes its scope and reports loading/failures separately.

34 focused tests pass across six files, including typo suggestions, alias duplicates, country alias merging, no inferred highlighting, and unavailable validation. Lint, typecheck, and production build pass (existing HEIF warning remains). Browser review confirmed the section displays two current gallery warnings for Costa Maya and Cozumel with country context and preserves the sticky map. Strict OpenSpec and diff checks pass.


## Italy and Türkiye follow-up

Added 20 Italian regions from ready-made ISTAT GeoJSON (geojson-italy release 2026.1) and 81 Turkish provinces from Natural Earth 5.1.2. Source geometries are preserved; the standard-library import script adapts properties only. No geometry libraries or application dependencies were installed. Both countries use the existing source/layer, label, offline, scrolling, and validation paths.

Tests now verify all 244 administrative divisions, unique IDs/abbreviations, closed rings, interior label anchors, Italian/English aliases, Turkish accents and province suffixes, country aliases, duplicate prevention, and six independent cached requests. All 36 focused tests pass; lint, typecheck, build, strict OpenSpec validation, and diff checks pass. The build has the existing unrelated HEIF warning.

Browser review of the current gallery shows Italy at 6/20 visited and Türkiye at 15/81 visited. Province aliases Trabzon/Trabzon province count once; Aegean region remains unmapped. Both sets of labels/vectors persist with Basemap off, alongside existing countries. ISTAT and Natural Earth attribution remains visible in vector-only mode. No tasks deferred.
