## Context

History already resolves media from local album XML and files. The XML reader
uses an item filename with its gallery to produce photo, thumbnail, and
playable-media paths. The existing raster helpers derive public paths under
`public/galleries/<gallery>/media/{originals,photos,thumbs}/<year>/`; video
paths use the sibling `videos` directory. Those paths are served directly as
`/galleries/...` URLs.

Non-admin pages render the paths selected by their current view. Thumbnail
consumers commonly use the existing image component, while full-size media uses
the direct gallery URLs. The admin Album editor currently reads the local XML
and generates exportable XML from edits, but has no persistence path. The
Walk-selected thumbnail-framing workflow reads the local resized photo and uses
Sharp to write a cropped local thumbnail.

See [proposal.md](proposal.md) and
[media-variant-boundaries spec](specs/media-variant-boundaries/spec.md).

## Goals / Non-Goals

**Goals:**

- Capture the current filename-to-path conventions and their public URL output.
- Trace the existing public rendering and administrative local-file flows.
- Verify the baseline with focused tests before future media work depends on it.
- Persist only explicitly saved, generated Album-editor XML to its matching
  local album file.

**Non-Goals:**

- Introduce a new path resolver or replace `photoPath`, `thumbPath`, or
  `originalPath`.
- Change XML schema, stored filenames, derivative folders, dimensions, Sharp
  processing, video behavior, or page rendering.
- Add authentication, authorization, signing, proxying, or an access policy for
  static files in `public/galleries`.
- Autosave editor changes, save a hand-edited export payload, create versioned
  XML backups, or expose XML persistence on a public page.

## Decisions

### Treat the existing helpers as the current resolution mechanism

The current `photoPath`, `thumbPath`, `originalPath`, raster-path, and
video-path helpers are the baseline implementation. Album filenames remain the
canonical identifiers from which they derive output. This change documents and
tests those helpers rather than introducing another abstraction.

Alternative considered: add a resolver now. The task is to understand the
current implementation, so a new abstraction would mix discovery with a
behavioral change and is not selected.

### Preserve the direct URL and local filesystem distinction

The same gallery tree is exposed to the application as direct relative URLs and
is available locally to administrative server-side operations. Public rendering
uses URLs. Administrative file operations, including asset inspection and
thumbnail framing, use filesystem paths and do not write through HTTP URLs.

Alternative considered: make all consumers use one local-path API. That would
misrepresent browser rendering and is outside this baseline effort.

### Save a generated XML snapshot only after an explicit action

The Album editor will continue to generate an exportable XML snapshot in the
UI. A separate Save XML action will send that exact snapshot to the selected
album route; generation itself will not write a file. This preserves the
existing export workflow and makes persistence a deliberate administrative
operation.

Alternative considered: have Save regenerate from the current edits. That
could write content the administrator did not inspect, so it is not selected.

### Validate and atomically replace only the selected album XML

The XML route will accept an XML string only for a valid gallery and album
filename, parse it to ensure it is a well-formed album document, then write a
temporary sibling file and rename it into place. It will return a client error
without writing for malformed input and a server error if a filesystem action
fails. The writer is intentionally scoped to existing album XML files beneath
the selected gallery; it will not accept arbitrary local paths.

Alternative considered: write the request body directly with `writeFile`.
That risks a partially written metadata file if the process fails mid-write,
so it is not selected.

### Preserve surface-specific rendering without asserting new access policy

Components continue to choose the established thumbnail, photo, or video path
for their present purpose. The fact that a helper produces a direct path does
not add, remove, or imply static-file access control. The plan verifies what
the application emits and uses; it does not make a security claim about a URL
known outside the application.

### Prefer baseline tests over refactors

Existing path, album, resize, thumbnail-framing, admin-assets, component, and
MCP tests are the first evidence source. Add a focused regression test only
where a documented current behavior lacks coverage; do not change runtime
behavior merely to fit the documentation.

## Risks / Trade-offs

- [Documentation can drift from helper behavior] → Verify representative image,
  non-JPEG, no-year-prefix, and video filenames with focused tests.
- [Public URL handling and local filesystem writes can be conflated] → Keep
  browser-rendering and admin-write scenarios separate in the spec and tests.
- [Direct public paths can be mistaken for an authorization policy] → State
  explicitly that no access-control behavior is introduced or evaluated.
- [A malformed or stale editor export can overwrite metadata] → Validate the
  XML before writing, retain the generated output on failure, and make saving
  a separate explicit action.
- [An interrupted write can corrupt local metadata] → Use a temporary sibling
  file and atomic rename rather than writing the destination in place.
- [A broad audit can turn into a redesign] → Keep implementation limited to
  persistence of the current generated XML; defer resolver or media-path
  refactors to a separate change.

## Migration Plan

1. Inspect and record current helper, rendering, and administrative-flow
   behavior.
2. Add the validated administrative XML save route and the editor's explicit
   save action without changing generated XML output or media paths.
3. Run focused route, editor, and baseline tests.
4. Roll back by reverting the route and editor changes; the existing XML stays
   intact unless an administrator has already chosen to save a new snapshot.
