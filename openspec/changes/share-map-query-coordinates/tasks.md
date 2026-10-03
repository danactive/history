## 1. Correct filter ownership

- [x] 1.1 Gate camera restoration and debounced publication on valid enabled filter state; cover unfiltered movement and standalone camera URLs with hook and SlippyMap tests.
- [x] 1.2 Remove all four geographic parameters on disable, chip removal, and Clear all; verify no stale debounce resurrects them and unrelated parameters survive.
- [x] 1.3 Simplify the hook to one photo-filter mode and router publication path; remove unfiltered SplitViewer camera overrides while retaining filtered restoration and server refresh behavior.

## 2. Exclude Visited

- [x] 2.1 Remove Visited query integration and restore existing country camera behavior; verify geographic query values neither restore the camera nor cause URL writes.

## 3. Verify corrected behavior

- [x] 3.1 Run focused and full tests, lint, typecheck, production build, and OpenSpec validation; record current results in verification.md.
