## Why

The calendar shows which dates have photos but gives no indication of how many. Reusing the map cluster colour scale will let people spot dates with more photos at a glance and connect the calendar to the existing visual language.

## What Changes

- Count gallery items by month/day across all years, matching the existing Today destination's item population and date resolution.
- Fill each populated date's square with the shared map cluster colour for its count, using thresholds scaled to the gallery’s busiest date.
- Keep zero-count dates neutral and non-interactive; preserve all 366 dates and existing Today links.
- Explain the scale with a compact labelled legend and expose exact counts on hover and keyboard focus and in accessible link names.
- Apply this to the shared gallery calendar route, including `/demo/calendar`.

## Capabilities

### New Capabilities

- `calendar-photo-density`: Calendar date counts, map-aligned colour bands, and accessible density presentation.

### Modified Capabilities

None.

## Impact

- Affects `src/lib/calendar.ts`, `app/[gallery]/calendar/page.tsx`, its CSS module, and focused calendar tests. Reuses `src/components/SlippyMap/marker-theme.ts` as the palette source.
- Keeps server rendering and the existing gallery cache policy. No new services or dependencies are needed.
- No changes to XML metadata, filesystem media, MCP tools, or the optional classifier.
- Non-goals: view/like analytics, year selection, search filters, map clustering or palette changes, new date semantics, and gallery layout redesign.
