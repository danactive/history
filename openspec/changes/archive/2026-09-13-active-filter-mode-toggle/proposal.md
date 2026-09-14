## Why

The active-filter row displays AND or OR but provides no direct way to change it. Users need to switch between matching all terms and matching any term using pointer or keyboard input across shared search pages.

## What Changes

- Make the AND/OR indicator a button that switches to the opposite mode and updates results and the canonical query URL.
- Support normal Tab focus and Enter/Space activation with a visible focus indicator and an accessible current-mode/action label.
- Apply this through shared search controls on gallery, all-photos, persons, album, and today pages.
- Preserve quoted term values and avoid offering a global toggle for mixed/grouped expressions or single terms.
- Keep the Person details link available when a flat query identifies one person, in either AND or OR mode.

## Capabilities

### New Capabilities

- `active-filter-mode`: Reversible, keyboard-accessible AND/OR switching in shared active-filter controls.

### Modified Capabilities

None. The separate persons-page change continues to define the underlying page behavior.

## Impact

Shared `Search/Controls`, `useSearch`, active-query parsing, and regression tests. No XML metadata, filesystem media, MCP, classifier, or dependency changes. Existing query submission behavior, including resetting photo selection on a changed query, remains in effect.

Non-goals: global keyboard shortcuts, unrelated administration keyboard workflows, a nested query editor, or rewriting the operators inside grouped expressions. Examples and tests use demo/synthetic data only. This change records implementation already authorized and started before the request to add OpenSpec documentation.
