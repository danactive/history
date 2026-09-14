## Context

See proposal.md for motivation. Shared Search/Controls is rendered by useSearch directly and through useMapFilter. The same control reaches gallery, all, persons, album, and today views. Previously the mode was a static Chip. The query parser already exposes a boolean expression tree and the search controller already handles canonical query updates.

## Goals / Non-Goals

Goals: one reusable control, native keyboard operation, and preservation of term values and existing route semantics. Non-goals: page-specific handlers, global keyboard shortcuts, and editing nested operators.

## Decisions

- Use a native button through the existing Joy Button component with `type="button"`, an explicit accessible name, tooltip, and focus-visible outline. Native Enter/Space behavior avoids duplicate activation from custom key listeners. A clickable non-button Chip would require additional keyboard semantics.
- Toggle the root boolean operator of an eligible flat parsed expression, then format it and pass it to the existing query update action. Do not replace operator strings globally: quoted values can contain the same characters.
- Make active-query token splitting ignore operators and parentheses inside quoted strings. Keep grouped and mixed expressions on the existing advanced-query path. Do not add a separate mode URL parameter.
- Leave route navigation, map bounds preservation, and photo-selection reset with the existing search controller. Server-scoped pages can show their old count briefly until the wider response arrives; settled results must match the new mode.

## Risks / Trade-offs

Person details resolution inspects person terms in the parsed flat query independently of its root operator. A single distinct person keeps the same details destination through AND/OR changes and direct OR URL loads, including zero-result searches. Multiple distinct people do not imply a unique details destination. This does not change conjunctive facet selection or filtering semantics.

- [Shared controls affect multiple routes] → Parameterize regression tests over the supported route shapes and verify real browser keyboard behavior.
- [Quoted operators can be mistaken for structural operators] → Test round-trip AND/OR switching with a quoted literal.
- [Keyboard activation can accidentally submit the form] → Use a native non-submit button without duplicate key handlers.

## Verification

Browser verification on the demo persons page: Tab focused the mode BUTTON; Enter changed AND to OR and settled results widened from 2 to 5 photos; Space restored AND and 2 photos. The button remained focused. Tests use synthetic terms only. Automated results are recorded in tasks.md.

No data migration or dependency change is required. Rollback consists of reverting the shared control, hook callback, and quote-aware token parsing changes together.
