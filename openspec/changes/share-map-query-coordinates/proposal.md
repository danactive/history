## Why

Photo map filtering must be shareable without adding geographic query parameters during ordinary browsing. Only an enabled Map Filter owns geographic URL state.

## What Changes

- When Map Filter is enabled, publish `bbox`, `longitude`, `latitude`, and `zoom` together on photo map pages.
- Update those parameters 300 ms after movement settles, replacing history and refreshing bounded server results.
- Restore filtered links, including legacy bbox-only links. Camera-only parameters do not enable filtering or override normal photo navigation.
- Disabling Map Filter, removing its chip, or Clear all removes all four geographic parameters and cancels pending updates.
- The Visited page has no geographic URL integration: its country navigation and camera remain independent of the query string.
- Non-goals: always-on camera persistence, changes to Visited, automatic propagation through navigation links, new filter models, metadata or media changes.

## Capabilities

### New Capabilities

- `shared-map-query`: Shareable geographic state exclusively for enabled photo map filters.

### Modified Capabilities

None.

## Impact

Photo map query helpers, useMapQuery, SlippyMap, filter/search clear actions, and their tests. The initial Visited integration is removed. No new dependencies, XML, filesystem media, MCP, or classifier changes.
