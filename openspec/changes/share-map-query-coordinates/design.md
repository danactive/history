## Context

Photo maps already read bbox on the server and enable filtering from a valid bbox. The initial implementation incorrectly published camera state during ordinary browsing and on Visited; the user explicitly corrected this scope on 2026-10-02. This design supersedes that always-on behavior.

## Goals / Non-Goals

**Goals:** Share an enabled photo map filter, debounce settled movements, and preserve correct server results when moving beyond previous bounds.

**Non-Goals:** Persist unfiltered camera positions, integrate Visited, or replace ordinary photo-selection camera follow.

## Decisions

### Filter owns geographic URL state

Valid `bbox` remains the URL signal that Map Filter is enabled. Only then consume optional `longitude`, `latitude`, and `zoom`. Complete finite decimal coordinate pairs are required, longitude in [-180, 180], latitude in [-90, 90]; zero is valid. Duplicate/invalid pairs are ignored together. Zoom uses [0, 22] or the destination default. Serialize coordinates to six decimals and zoom to three.

On filter enable, capture and publish current camera and canonical bounds immediately. While enabled, cancel the prior timer at movement start and publish a settled snapshot after 300 ms. When off, do not schedule timers, update query parameters, or restore camera-only links. Unfiltered selection and panning retain their normal behavior.

### Simpler restoration and navigation

useMapQuery is photo-filter-specific; remove its alternate Visited mode, unfiltered camera restoration, and camera-only native-history write path. On load or external URL navigation, restore only valid filtered state: explicit center/zoom takes camera precedence; otherwise fit the saved bbox. Preserve exact saved bbox through restoration and resize. Keep the SplitViewer map-ready guard for filtered restoration; remove the separate unfiltered camera ownership override.

All geographic publications use router.replace with scroll:false, keeping the camera and bbox atomic and refreshing server data. Preserve unrelated parameters and hashes. Suppress redundant writes and self-acknowledgement camera feedback; retain cancellation and acknowledgement handling for overlapping server responses.

### Disable and clear

Disabling the toggle or removing the map chip immediately cancels pending work and removes bbox, longitude, latitude, and zoom. Clear all performs the same deletion in its single combined search navigation. No saved camera remains to override normal photo selection after clear. Hidden maps still clear their geographic query state through the parent filter owner.

### Visited remains independent

Remove useMapQuery and movement publication from VisitedMap. Its existing country defaults, reading-line navigation, and map controls do not read or modify geographic URL parameters. An incoming query string is left untouched, but never applied to this map.

### Compatible bounds

Retain bbox order west,south,east,north and six-decimal precision. Normalize world-copy longitudes and latitude limits. World-spanning or dateline-crossing views retain the existing single-interval model using [-180, 180]. Use identical canonical bounds locally and on the server.

## Risks / Trade-offs

- Bounding server responses can omit photos in later areas → router replacement refreshes data on settled filter changes.
- Debounced updates can race clearing or navigation → cancel before navigation/clear, reject stale callbacks, and track own response acknowledgements.
- Different aspect ratios show different visible bounds → preserve the saved filter bbox on restoration and resize.
- Old camera-only links no longer restore camera position → intentional correction; filtered bbox links remain supported.

## Migration Plan

No data migration. Remove the unintended Visited integration and restrict URL handling to enabled photo filters. Existing bbox bookmarks remain valid; standalone camera parameters are ignored.
