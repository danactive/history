# Verification — corrected filter-only scope

Verified 2026-10-02 after the user corrected the original always-on camera behavior. This record supersedes the earlier verification of that behavior.

## Results

- Focused hook, SlippyMap, VisitedMap, and search-route suites: 28 tests passed.
- `rtk npm run test:ci`: 106 files, 708 tests passed.
- `rtk npm run lint:ci`: passed.
- `rtk npm run typecheck`: passed.
- `rtk npm run build`: passed, all 130 pages generated. The existing libheif-js dynamic-require warning remains nonfatal.
- `rtk git diff --check`: passed.
- `rtk proxy openspec validate share-map-query-coordinates --strict`: passed.

## Regression coverage

- With Map Filter off, movement creates no timer or URL write; standalone camera parameters neither restore the map nor enable filtering.
- Enabled filters still capture bounds immediately, publish after the 300 ms debounce, refresh through router replacement, and preserve unrelated query parameters and the hash.
- Disable and Clear all remove bbox, longitude, latitude, and zoom; later movement and stale timers cannot recreate them.
- Legacy bbox restoration, resize suppression, navigation cancellation, and overlapping server acknowledgements remain covered.
- Visited opens at its country default even with geographic query parameters, follows subsequent country changes, and performs no geographic URL publication.
- Search route builders preserve active filter coordinates during editing and remove them on clear.

The camera hook now serves photo filters only. The Visited integration, unfiltered camera override, fallback camera restoration, and camera-only native-history publication path have been removed. No browser/manual verification was rerun for this correction; the automated component and lifecycle regressions exercise the corrected behavior.
