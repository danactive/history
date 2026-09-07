## Why

History currently gives every page direct `/galleries/...` URLs for files under
`public`. A known original JPEG URL can therefore be requested without a
History-specific authorization boundary. The application needs private,
authenticated delivery for its existing display photos and thumbnails while
preserving its local-first source library and established Walk workflow.

## What Changes

- Add a deployment-time media manifest that maps History's canonical
  gallery/filename/variant identity to an opaque private R2 object key and a
  History-owned media identifier.
- Add an authenticated History media-delivery boundary for mapped display
  photos and thumbnails. It resolves a History media identifier to a private
  R2 object without exposing R2 credentials, object URLs, or download tokens.
- Constrain the deployed media service to Cloudflare's free allowances: use
  R2 Standard only, keep a deliberately lower History storage allocation, and
  fail a media-preparation run before it would exceed its owned storage or
  operation budgets. The production media route remains on Workers Free and
  fails closed when that route's free request limit is exhausted.
- Change non-admin image consumers to use the shared media resolver so their
  existing thumbnail and display-photo rendering flows receive authenticated
  History media URLs rather than direct `/galleries/...` URLs.
- Keep album XML filenames canonical and unchanged. Keep original files local
  and out of the normal viewer media manifest and delivery path.
- Preserve Walk unchanged: this change adds no R2 controls, synchronization,
  or behavior to Walk.

## Capabilities

### New Capabilities

- `private-media-delivery`: Maps existing display-photo and thumbnail variants
  to private object storage and delivers them only through an authenticated
  History media boundary.

### Modified Capabilities

- None.

## Impact

- Affected areas: shared raster path construction, server-side item assembly,
  non-admin image rendering, deployment/media-build tooling, and media-route
  tests.
- XML remains the source of gallery filenames; no XML schema or stored filename
  value changes. Local originals and local thumbnail-framing writes remain in
  place.
- R2 requires an account subscription checkout even when included usage results
  in a $0 invoice. The change therefore targets zero billed usage within
  documented free allowances; it does not describe R2 as unlimited storage or
  promise that unrelated account activity cannot incur charges.
- The optional classifier retains its review-only behavior and continues to
  operate on local paths; it does not receive R2 credentials or write to R2.
- MCP media payloads must use the same History-owned resolved media URLs for
  mapped display variants. Video delivery, cloud backup of originals, and
  changes to Walk are out of scope.
- This is access control, not DRM: an authenticated viewer can still save image
  bytes delivered to their own browser.
