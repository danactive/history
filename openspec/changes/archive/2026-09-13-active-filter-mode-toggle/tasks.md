## 1. Shared mode control

- [x] 1.1 Replace the static mode indicator with a native non-submit button, including current-mode/action labeling and focus-visible styling. Verify pointer activation and native Tab/Enter/Space behavior in the demo browser.
- [x] 1.2 Toggle the parsed root operator through the existing query action, preserving terms and bounds. Verify AND/OR round trips with route-parameterized useSearch tests across gallery, all, persons, album, and today paths.
- [x] 1.3 Preserve quoted operator literals during active-query parsing and mode changes; leave grouped and single-term queries without a global toggle. Verify quoted round trips and ineligible-query tests.

## 2. Verification

- [x] 2.1 Run `rtk npm run test:ci`: 98 files and 637 tests passed. Browser verification on the demo persons page confirmed Tab focus, Enter to OR (5 photos), and Space back to AND (2 photos).
- [x] 2.2 Run `rtk npx tsc --noEmit`, `rtk npm run lint:ci`, and `rtk git diff --check`; all passed.
- [x] 2.3 Validate this change with `rtk openspec validate active-filter-mode-toggle --strict` and verify that all four artifacts exist.

## 3. Person details regression

- [x] 3.1 Resolve a unique person from flat AND and OR queries without changing result filtering. Verified round trips across shared pages, direct OR loading with no results, and multiple-person ambiguity. All 644 tests passed; the 67 useSearch tests also passed after correcting test prop types. Typecheck, lint, diff checks, and strict OpenSpec validation passed.
