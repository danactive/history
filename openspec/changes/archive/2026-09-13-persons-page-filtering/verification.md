## Implementation

- Retained the separation between shared search input and the displayed person-filtered result.
- Kept the server menu baseline geographically unbounded, applying current map bounds during client derivation so map movement and clearing can restore eligible photos.
- Carried the unbounded gallery total separately from the initial map total, correcting the summary after map clearing.
- Added a single age/person reset operation that preserves remaining query terms and bounds.
- Preserved selected zero-result age/person options in the dropdowns rather than silently clearing them. Empty combinations remain visible until explicitly reset.
- Preserved compound boolean queries during URL normalization and forwarded existing search facet metadata to the shared controls.

## Automated evidence

The persons hook, real shared-hook integration, scope, age-summary, route-filter, and server-data tests cover:

- Stale displayed subsets across server-scope widening; repeated Clear and person-chip removal.
- Clear all with map/person/age filters; All persons with retained age and bounds; one-step combined reset with remaining country/bounds.
- Current map movement, map disabling, and unbounded summary restoration before navigation.
- Multi-person photo counts, unknown ages, per-photo age deduplication, name tie-breaking, and photos without people.
- Same-person age matching, stable zero-result selections, URL/history restoration, invalid ages, preserved parameters, compound queries, and tag/person distinction.
- Filtered thumbnail selection through the shared selection coordinator.

Final validation on 2026-09-12:

- `rtk npm run test:ci`: 98 test files, 629 tests passed.
- `rtk npm run lint:ci`: passed.
- `rtk npx tsc --noEmit`: passed; the production build's TypeScript check also passed.
- `rtk npm run build`: passed, including 130 generated pages. The HEIC dependency (`libheif-js` through `heic-convert`) emitted a dynamic-require warning unrelated to the persons-page changes.
- `rtk git diff --check`: passed.
- `rtk openspec validate persons-page-filtering --strict`: passed.

## Browser evidence

Verified on the local demo persons page with temporary, entirely synthetic metadata: 6 photos, 3 named people, and 2 photos for Casey Example. No private-gallery names, dates, or counts are recorded here.

- Shared Clear restored 6 photos and 3 people.
- Person-chip removal restored the same baseline on the next selection cycle.
- All persons retained all 3 options and restored the baseline on a subsequent cycle.
- Within a smaller map scope, All persons preserved the bounds and restored 3 photos and 2 people, excluding the synthetic person outside the bounds.
- Clearing the map restored the summary to 6 of 6 and all 3 people.
- A zero-result person/age combination remained selected. Reset age/person filters removed both terms in one navigation while retaining country and bbox; 3 photos and 2 people returned.
- Clicking the filtered Tavern thumbnail selected its matching filename in the viewer.
- Clear all followed by another select/All persons cycle again restored 6 of 6 and 3 people.

The original demo XML and the temporarily bypassed gallery cache implementation were restored byte-for-byte from backups. Their final working-tree contents match HEAD, and temporary demo XML was removed from the staging area. No media files were changed.

An initial full-suite run during the temporary fixture substitution failed four storytelling assertions that depend on the original demo names. After restoring the original fixture, the complete suite passed. This was verification setup interference, not a product regression.

## Remaining work

No acceptance scenarios are intentionally deferred. Sync/archive is a separate workflow and has not been performed.
