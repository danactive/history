## Why

The persons page needs an explicit contract for its person and age menus, shared search, map scope, and displayed counts. Selecting Casey Example and clearing the search exposed a feedback loop that could retain a reduced person count; the existing fix should be captured as a regression requirement.

## What Changes

- Specify `/{gallery}/persons` browsing, person and age filtering, count meanings, URL state, map scope, and viewer consistency.
- Require clearing a person selection to restore the full remaining scope, regardless of the previous displayed result or route transition timing.
- Preserve the existing canonical `query` and `bbox` URL contract and contextual person-details navigation.
- Document the already-present filter-input fix and define focused verification for the broader page contract.

## Capabilities

### New Capabilities

- `persons-page`: Gallery-scoped photo browsing with contextual person/age menus, consistent search and map filtering, and reversible filter selection. This is the first specification of an existing page, including the count restoration bug fix.

### Modified Capabilities

None. There is no existing main persons-page specification.

## Impact

The implementation surface is `app/[gallery]/persons/page.tsx`, the persons page data/scoping helpers, `PersonsClient`, `FilterControls`, and the persons/search/map hooks and their tests. The current workspace already exposes `visibleItems` from `useMapFilter` and uses it as the persons derivation input; this proposal does not claim that work is still unimplemented.

No new dependency, endpoint, XML schema, filesystem media change, MCP change, or optional classifier change is required.

Non-goals: person record editing, face recognition, classifier integration, person-details page redesign, gallery data cleanup, pagination, and a general search or map redesign. All example names and counts are synthetic test data, not private-gallery observations or fixed product limits.
