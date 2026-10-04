## Context

See proposal.md for motivation. The calendar page and source currently expose available dates as links with no counts. `src/lib/calendar.ts` collapses album item dates into a set; `CalendarDay` carries only `hasPhotos`. The calendar and Today both use `getOrderedAlbumItems` and `getItemMonthDay`, so preserving those sources keeps the counts consistent. The shared route is server rendered under Suspense. Its CSS currently makes date links circular.

`src/components/SlippyMap/marker-theme.ts` already owns seven interval stops used by Mapbox layers. No calendar capability exists in the main specifications. The installed Next.js `use-cache` documentation confirms cached functions must be async and serializable arguments participate in cache keys.

## Goals / Non-Goals

**Goals:** Compute counts in one server-side traversal, share palette definitions, and add accessible square fills without disrupting route contracts.

**Non-Goals:** Client-side gallery loading, new analytics storage, changes to date parsing or Today filtering, and refactoring unrelated map presentation.

## Decisions

1. Replace the availability-only calendar loader with a gallery-scoped cached count record keyed by `MM-DD`. Retain `applyGalleryItemsCachePolicy(gallery)` and resolve each item through `getItemMonthDay`; add `photoCount` to calendar days and derive availability from count > 0. Update the sole page consumer and existing tests together. A separate per-date query would unnecessarily repeat album reads. A new photo-only filter would disagree with the existing Today item population, which includes videos; retain the current product term “photos”.

2. Reuse the colours in `mapMarkerClusterStops` while deriving calendar thresholds from the maximum `photoCount` across all 366 days. Round the maximum down to two significant digits (exact below 100); the top band starts there. Use up to seven evenly spaced integer thresholds from one to the rounded maximum. If that maximum is below seven, use that many bands, sampling palette colours evenly including both endpoints; a maximum of one uses the last colour. Empty galleries have no populated bands. Generate labels and tile styles from the same bands once per render. This replaces the original fixed thresholds at the user's request; map thresholds remain unchanged.

3. Render a square date tile in the existing table cell, with a small corner radius and consistent dimensions for populated and empty dates. Feed the resolved fill and contrasting black/white foreground through per-tile CSS variables. Replace the current hover background with an outline/underline treatment that preserves density; explicitly prevent visited link styling from obscuring the scale. Keep the existing responsive month grid.

4. Render a wrapping legend from the same bands, including “0”, and explain “Photos by date across all years”. Include exact counts with singular/plural wording in link accessible names. Use a CSS-revealed, non-interactive count label on hover and focus rather than relying solely on native title tooltips, which do not reliably show on keyboard focus. Keep the label within the viewport and avoid clipping it in the month table. No client state is required.

## Risks / Trade-offs

- Gallery-relative colours cannot be compared as absolute counts across galleries → explain scaling in the introduction and retain exact count ranges in the legend.
- Adjacent map reds are similar and not strictly ordered by perceived darkness → retain palette fidelity, explain numeric bands, and expose counts without requiring colour interpretation.
- Global link styling or theme colours could reduce contrast → scope tile foreground, fill, and interaction styles; verify light/dark modes and all seven bands.
- Counting differently from Today could mislead users → share item/date sources and test cross-year, cross-album, and leap-day fixtures against destination semantics.

## Migration Plan

Deploy as an ordinary application change after focused tests, type checking, lint, build, and browser verification. No data migration or new dependency is needed. Reverting the calendar implementation restores availability-only rendering without modifying stored data.
