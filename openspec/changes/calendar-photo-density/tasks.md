## 1. Calendar counts and shared colour mapping

- [x] 1.1 Update `src/lib/calendar.ts` to return cached gallery-scoped month/day counts and carry `photoCount` into all 366 calendar dates; verify cross-album, cross-year, empty-gallery, gallery isolation, and February 29 cases in `src/lib/__tests__/calendar.vitest.ts`, including parity with Today date resolution and item population.
- [x] 1.2 Add a pure density presentation helper that consumes the shared map colours with gallery-relative thresholds for nonzero fills and legend ranges, with a neutral zero state and contrasting text; verify counts immediately below and at every threshold, the top band, and at least 4.5:1 text contrast for each palette colour in focused Vitest coverage.

## 2. Calendar presentation

- [x] 2.1 Update `app/[gallery]/calendar/page.tsx` to consume counts, render the legend and all-years explanation, and expose exact counts on hover/focus and in accessible link names; add focused rendering coverage for singular/plural counts, zero-count non-links, blank slots, legend ranges, and unchanged encoded gallery Today URLs.
- [x] 2.2 Update the calendar CSS module to render square density tiles with scoped foregrounds and hover/focus/visited styles that retain the fill; verify all colour bands, keyboard focus, count-label visibility, and responsive layout in light/dark themes at desktop and narrow mobile widths.

## 3. Integration verification

- [x] 3.1 Run focused calendar/presentation Vitest tests, `rtk npm run lint:ci`, `rtk npm run typecheck`, and `rtk npm run build`; record outcomes and any environmental blockers in the change before marking this task complete.
- [x] 3.2 Verify `/demo/calendar` in the browser: compare representative date counts with their unfiltered Today destinations, follow a date link, and confirm neutral empty dates, readable legend, keyboard access, and no horizontal overflow; capture the resulting calendar for review.
- [x] 3.3 Run `rtk proxy openspec validate calendar-photo-density --strict` and `rtk git diff --check`; confirm changes stay within the planned calendar/palette-consumption scope and leave metadata and media untouched.

## Verification results

- Focused calendar, density/rendering, and Today suites: 24 tests passed.
- Repository lint, typecheck, production build, strict OpenSpec validation, and diff whitespace checks passed.
- Build reported the existing `libheif-js` dynamic-require warning in the HEIF administration import chain.
- Browser: desktop and 375px mobile demo calendar checked; no horizontal overflow, neutral empty dates, wrapping legend, and keyboard count labels verified. January 4 and February 8 each opened Today with one matching item. A transient navigation error after the production build cleared on reload.
- All seven bands checked on light and dark surfaces using a temporary CSS fixture, then removed. Automated tests verify text contrast of at least 4.5:1 for every band.
- Review screenshot saved outside the repository. Examples and verification notes use only the demo gallery; no personal gallery metadata or original media was changed.

## Dynamic scale follow-up

- [x] Derive the top band from the gallery maximum, rounded down to two significant digits, and distribute distinct thresholds across the range. Keep legend and tiles on the same scale; cover empty and small galleries, rounding, threshold boundaries, and foreground contrast in focused tests.

- Dynamic-scale verification: 14 focused tests, typecheck, lint, strict OpenSpec validation, and diff checks passed. Demo browser legend correctly shows `1+` for its maximum of one photo per date.
