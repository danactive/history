## Why

History is filesystem-backed: album XML stores local filenames, and shared
helpers turn those names into the direct gallery URLs consumed by pages and
administrative tools. That behavior is already implemented, but it is
cross-cutting enough to deserve a precise baseline before any future path or
media work is considered.

## What Changes

- Record the existing filename-based derivation of original, photo, thumbnail,
  and video locations as History's current behavior.
- Record that helper outputs are direct paths under
  `/galleries/<gallery>/media/...`, not proxied or signed media URLs.
- Record the existing non-admin rendering flow and the separate administrative
  XML and local thumbnail-framing workflow.
- Add explicit local persistence for generated Album-editor XML while retaining
  the editor's exportable XML output.
- Audit the present tests and add focused regression coverage for the
  established behavior and the new XML-save workflow.
- Make no resolver, data-model, filesystem-layout, media-access-control, or
  rendering-behavior change.

## Capabilities

### New Capabilities

- `media-variant-boundaries`: Captures the current filename-to-media-path,
  direct-rendering, and local administrative-media behavior.

### Modified Capabilities

- None.

## Impact

- Affected areas: current path helpers, album/item construction, public
  rendering consumers, the admin Album and Assets flows, thumbnail framing,
  the admin XML route, and their tests.
- Album XML remains the source of filenames. The editor can explicitly replace
  an existing album XML file with its generated XML; the XML schema and stored
  filename values do not otherwise change.
- Existing public URL paths, MCP media payloads, and classifier behavior do
  not change.
- This documents existing direct-file serving. It does not establish
  authentication or authorization semantics for a known static media URL.
