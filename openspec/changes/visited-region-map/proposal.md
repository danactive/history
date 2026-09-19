## Why

The visited page lists countries and regions but needs geographic context to show travel coverage. A map that follows the reader through Japan, USA, Canada, and Mexico makes visited prefectures, states, and provinces visible alongside the existing history.

## What Changes

- Add a Mapbox panel anchored to the right on desktop while the country list scrolls.
- Pan to a supported country when its heading approaches the top of the reading area; keep zoom, bearing, and pitch unchanged in either scroll direction.
- Keep vector outlines and visited fills for Japan, USA, Canada, and Mexico present together throughout navigation. The active heading changes the camera center and country summary, not overlay visibility.
- Use Mapbox Globe, matching the album maps, with a shared initial overview zoom. Keep automatic movement pan-only while allowing deliberate manual zoom for inspecting smaller regions; disable rotation.
- In offline mode, omit Mapbox basemap tiles and render local vectors and labels on a plain background; preserve automatic pan-only navigation and manual zoom.
- Label every prefecture, state, province, and territory at its visual center where possible; use abbreviations and then short leader lines to resolve collisions.
- Show visited coverage totals (for example, “30 of 47 prefectures visited”) and unmapped names for the active country; distinguish visited coverage by both fill and outline.
- Indicate the active country in the scrolling list with a subtle visual marker.
- Add a Basemap toggle so users can select vector-only display online; automatic offline fallback still takes priority.
- Respect reduced motion and retain list access when map resources fail.
- Ship local administrative boundary files for Japan, USA (including DC), and Canada (including territories).

This is a desktop web app; the map remains a right-side panel.

Non-goals: mobile layouts or mobile-specific behavior, worldwide administrative coverage, editing visit metadata, inferring states from city names, changing search URLs, region-click navigation, or replacing the existing photo map.

## Capabilities

### New Capabilities

- `visited-region-map`: Scroll-synchronized administrative coverage map on the gallery visited page.

### Modified Capabilities

None. The existing main specs cover persons and active filter modes; neither contract changes.

## Impact

- Visited route layout, a client-side map component, scroll selection, boundary matching, and local GeoJSON assets.
- Reuse installed `react-map-gl` / `mapbox-gl` and the existing public Mapbox token. Online basemap delivery uses Mapbox; offline rendering uses only local geometry, label data, and fonts, with no remote tile/style/glyph dependency. Boundary matching stays local and needs no premium boundaries service.
- Preserve country ordering, years, photo counts, and existing filter links. No changes to album XML, original media, MCP interfaces, or the optional classifier.
- A candidate implementation already exists in the working tree from the preceding request. This change records its intended behavior and remaining acceptance verification; creating these planning artifacts does not modify or approve that code.
