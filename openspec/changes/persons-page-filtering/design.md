## Context

See proposal.md for motivation and specs/persons-page/spec.md for the observable contract. This design spans server data preparation, URL state, shared search/map state, and persons-derived data, so a design artifact is warranted despite the small count-restoration fix.

`getPersonsPageData` constructs a menu baseline by removing independently addressable conjunctive person/age terms from the query while preserving other predicates. It supplies broader `initialBaseScopeItems` for person/age/map-scoped requests and an initial age summary. `usePersonsDerivedData` derives menu counts and final results. `usePersonsRouteState` coordinates local selections with canonical URLs. Shared search and map hooks own geographic/query filtering and the viewer's displayed override.

The prior bug arose because `usePersonsFilter` fed `useMapFilter.itemsToShow` back into derivation after publishing its filtered output through `setDisplayedItems`. When a cleared route stopped supplying a broader server scope, the old displayed subset could become the new baseline. The current workspace already contains the fix: `useMapFilter` exposes query/map-filtered `visibleItems`, and `usePersonsFilter` consumes that value for derivation. The cached-display regression test is also present. Earlier verification passed 47 relevant hook tests and TypeScript and restored the baseline person and photo counts in the browser. These are recorded prior results, not a claim that all scenarios in this broader specification have been verified.

## Goals / Non-Goals

**Goals:** Maintain one-way data flow from source scope to derived results; preserve independent menu scopes; verify that URL transitions and all clear entry points converge on the same results.

**Non-Goals:** Replace the shared search parser, route architecture, selection coordinator, or media pipeline. No schema or data migration is required. This planning pass changes documentation only.

## Decisions

### Keep filter input separate from displayed output

Use query/map-filtered `visibleItems` as the fallback input to persons derivation, retaining `initialBaseScopeItems` when supplied. Continue publishing the final person/age result to the shared viewer and summary through `setDisplayedItems`.

This preserves shared viewer behavior while preventing results from becoming their own filter source. Clearing the viewer override as a side effect was considered, but would couple correctness to effect ordering and each clear entry point. Always serializing the full gallery baseline was also considered, but adds data transfer and obscures remaining search/map constraints.

### Preserve distinct menu scopes

The person menu uses the baseline plus selected age, excluding the explicit selected-person constraint. The age menu uses the baseline plus selected person, excluding the selected age. The final result applies both. Photo totals count items; age buckets deduplicate each photo within an age. Do not sum overlapping age/person counts to infer photo totals.

Using the final result for both menus would remove alternative choices and recreate the narrowing problem. Use existing helpers rather than duplicate matching rules in components. Preserve shared parser handling of compound boolean expressions; only independently addressable conjunctive terms are owned by the page controls.

### Preserve the URL contract and verify transition boundaries

Retain `query`, `bbox`, and the current route helpers. The installed Next.js `useSearchParams` guide documents that navigation updates page search parameters; client selections can temporarily precede server props. Server-summary reuse must remain conditional on matching scope. Completed URL navigation must be reflected in the controls even when the user cleared a filter through shared search rather than a persons dropdown.

A separate person/age URL model would duplicate state and break current bookmarks. For any uncovered reset defect, use one coherent update for clearing person and age together; verify that sequential setters cannot restore a stale value. This is a targeted acceptance check, not a declaration that the broader reset flow has already passed.

### Validate with deterministic fixtures and a real page sequence

Use synthetic people/photos for automated regression coverage, including a stale viewer subset surviving while server props widen. Verify person-only clearing with age/search/map constraints, clear-all, both-filter reset, and direct URL restoration. Use the existing hook, route, and scope test suites. Manually repeat the synthetic person-selection sequence against a synthetic demo gallery, recording its baseline dynamically.

Use synthetic names, dates, counts, and gallery identifiers in committed fixtures, examples, and verification notes. Do not copy personal information from a private gallery. Avoid hard-coding private-gallery counts into automated tests: gallery content can change independently of page correctness. Existing mocks can hide shared-hook feedback, so include the stale displayed subset explicitly and retain a browser check.

## Risks / Trade-offs

- [Server scope can lag local selection or map changes] → Check transitions as well as settled results; ensure broader cached scope does not bypass the current geographic/query constraint.
- [All-clear, chip removal, and dropdown clearing use different entry points] → Cover each path and repeated cycles with an unchanged baseline.
- [Compound boolean queries do not always expose an independent person/age term] → Preserve the shared query parser's meaning and test compatibility rather than rewriting expressions indiscriminately.
- [Photo totals and appearance totals are easy to confuse] → Assert separate menu and result counts with multi-person photos.
- [The existing fix covers a narrower case than this page contract] → Keep remaining verification tasks unchecked; implement only confirmed gaps during a separately requested apply phase.

## Migration Plan

No data migration or new dependency is needed. Review the existing fix, complete focused validation and any confirmed corrections during apply, and ship through the normal app release. If rollback is necessary, revert only the relevant hook changes; no XML or media restoration is needed. Sync/archive the specification through the normal OpenSpec workflow after acceptance verification.

## Implementation outcome

Apply completed the planned scope corrections: the server baseline retains photos outside initial map bounds, client derivation applies current bounds, and a separate unbounded total restores the summary when map filtering is cleared. The combined reset now updates both filters in one navigation. Selected zero-result options remain registered in the dropdowns, preventing the UI library from silently removing them. Compound-query normalization preserves terms not owned by independent controls. See verification.md for automated and synthetic browser evidence.
