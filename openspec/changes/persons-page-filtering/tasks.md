## 1. Confirm the existing count-restoration implementation

- [x] 1.1 Verify the already-present `visibleItems` input separation and cached-display regression test without reimplementing them; run `rtk npx vitest run src/hooks/__tests__/usePersonsFilter.vitest.tsx src/hooks/__tests__/useMemoryAndMapFilter.vitest.tsx` and confirm clearing restores the full synthetic baseline.

## 2. Complete page-contract coverage

- [x] 2.1 Extend existing persons scope and age-summary tests only for missing contract cases: photos without people, multi-person photos, per-photo age deduplication, same-person age matching, unknown ages, and menu ordering. Correct confirmed mismatches and verify with `rtk npx vitest run src/lib/__tests__/persons-filter-scopes.vitest.ts src/lib/__tests__/persons-age-summary.vitest.ts src/hooks/__tests__/usePersonsFilter.vitest.tsx`.
- [x] 2.2 Cover repeated clear-all, person-chip removal, All persons with retained age/query/bounds, and the combined empty-state reset across delayed URL/server updates. Correct any stale selection or scope retention found; verify final counts, selections, and URLs in the persons hook and shared search tests using `rtk npx vitest run src/hooks/__tests__/usePersonsFilter.vitest.tsx src/hooks/__tests__/useSearch.vitest.tsx`.
- [x] 2.3 Verify direct URL restoration, invalid-age normalization, unrelated parameter preservation, structured tags versus people, and compound-query compatibility. Add missing assertions and correct confirmed gaps; run `rtk npx vitest run src/lib/__tests__/persons-route-filters.vitest.ts src/lib/__tests__/persons-page.vitest.ts src/hooks/__tests__/usePersonsFilter.vitest.tsx`.

## 3. Validate integrated behavior

- [x] 3.1 On `http://localhost:3030/demo/persons` with synthetic fixture data, record baseline counts, select Casey Example, and clear through shared Clear, person-chip removal, and All persons in repeated cycles. Verify restoration to the unchanged baseline, map-constrained clearing, and matching thumbnail/viewer selection; record observations in this change's verification notes.
- [x] 3.2 Run `rtk npm run lint:ci`, `rtk npx tsc --noEmit`, and `rtk git diff --check`; if apply changes runtime code, also run `rtk npm run test:ci` and `rtk npm run build`. Record pass/fail outcomes and any pre-existing blockers separately from the persons-page changes.
- [x] 3.3 Validate the completed change with `rtk openspec validate persons-page-filtering --strict`, record any intentionally deferred acceptance work, and confirm all required page scenarios have evidence before requesting the normal sync/archive workflow.
