# active-filter-mode Specification

## Purpose

Let users switch shared active filters between matching all terms and matching any term with consistent pointer and keyboard interaction across search pages.

## Requirements

### Requirement: Preserve person details across modes
A flat query naming one distinct person SHALL expose the same Person details link in both AND and OR mode, including when loaded directly from its URL or when no photos match. A query naming multiple distinct people SHALL NOT infer a unique person for this link.

#### Scenario: Person details survives a mode change
- **WHEN** `person:"Casey Example" && keyword:apple` changes to OR and back
- **THEN** the details link continues to target Casey Example while photo results follow the selected operator
- **AND** loading the OR URL directly exposes the same link

#### Scenario: Multiple people are ambiguous
- **WHEN** the query is `person:"Casey Example" || person:"Robin Example"` without a separately selected details person
- **THEN** no unique Person details link is inferred

### Requirement: Reversible mode switching
For a flat multi-term query displaying AND or OR, the active-filter row SHALL expose that mode as a button. Activating it SHALL switch AND to OR or OR to AND, preserve each term, update the search input and URL, and recompute results without a separate Filter submission.

#### Scenario: Match any instead of all
- **WHEN** the user taps AND for `keyword:apple && keyword:banana`
- **THEN** the query becomes `keyword:apple || keyword:banana`, the button displays OR, and results include either term
- **AND** tapping OR restores the original conjunction

### Requirement: Keyboard and accessible operation
The mode button SHALL participate in normal Tab order, show a visible keyboard focus indicator, and activate exactly once on Enter or Space. Its accessible name SHALL identify the current mode and the opposite mode available on activation. Activation SHALL NOT submit the surrounding search form as a separate action.

#### Scenario: Toggle without a pointer
- **WHEN** the user tabs to AND and presses Enter
- **THEN** the mode changes to OR
- **AND** pressing Space on the focused button changes it back to AND

### Requirement: Consistent availability across shared search pages
Gallery, all-photos, persons, album, and today pages SHALL use the same mode-button behavior whenever their shared active-filter row has an eligible query. Map bounds and unrelated URL parameters SHALL survive mode switching. Photo-selection reset SHALL follow existing query-submission behavior.

#### Scenario: Toggle a bounded query
- **WHEN** a user switches AND to OR on a persons page with a bbox parameter
- **THEN** the bbox remains applied and the resulting URL uses OR
- **AND** the same query operation on another shared search page stays on that page

### Requirement: Preserve query structure and literal values
Quoted operators SHALL remain literal text when switching modes. Single-term queries and grouped or mixed boolean expressions SHALL NOT offer a misleading global mode button.

#### Scenario: Literal operator inside a value
- **WHEN** AND is activated for `keyword:"rock && roll" && keyword:music`
- **THEN** the query becomes `keyword:"rock && roll" || keyword:music`
- **AND** the user can switch back without altering the quoted value

#### Scenario: Grouped query
- **WHEN** the active query is `(keyword:apple || keyword:banana) && keyword:music`
- **THEN** the existing advanced-query controls remain available and no global AND/OR toggle is shown
