## 1. Verify filename-to-path behavior

- [x] 1.1 Inventory the current `photoPath`, `thumbPath`, `originalPath`, raster-path, and video-path consumers; verify the recorded paths, filename normalization, and year-folder rules match the implementation.
- [x] 1.2 Run or extend focused path and album-model tests for JPEG, non-JPEG, no-year-prefix, and video filenames; verify every asserted URL remains the current direct `/galleries/...` output.
- [x] 1.3 Confirm the existing MCP media payload and non-admin item construction retain their current URL fields; verify the relevant storytelling and item-model tests pass without changing payload behavior.

## 2. Verify rendering and administrative flows

- [x] 2.1 Inspect non-admin thumbnail, image, and video rendering consumers; verify thumbnails use the existing image-rendering flow and selected full media keeps its direct gallery URL.
- [x] 2.2 Implement a validated, atomic local XML persistence operation for the selected gallery and album; verify valid generated XML replaces only that album file and malformed input leaves it unchanged.
- [x] 2.3 Add a separate Album-editor Save XML action that preserves Generate XML as an export-only operation; verify success and failure state plus the exact PUT payload in component tests.
- [x] 2.4 Verify the Assets audit, thumbnail-framing, and resize flows retain their local-file behavior and current gallery URL convention; run their focused tests.

## 3. Validate the completed change

- [x] 3.1 Run the focused XML route, editor, path, thumbnail-framing, and resize tests; verify generation remains exportable, XML saves are explicit and validated, and no media-path behavior changes.
- [x] 3.2 Run npm run lint:ci, npm run test:ci, npm run typecheck, and npm run build; verify the completed implementation passes all applicable checks.
