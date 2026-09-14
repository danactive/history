## Context

See [proposal.md](proposal.md) for the motivation. History currently derives
`photoPath`, `thumbPath`, `originalPath`, and video paths from XML filenames.
The album model places those direct `/galleries/...` values in every item, so
the existing non-admin rendering surfaces share that data without sharing an
access boundary. The administration flow and optional classifier use the same
local gallery tree for filesystem work.

## Goals / Non-Goals

**Goals:**

- Map existing display-photo and thumbnail derivatives to private Cloudflare R2
  objects during a separate deployment media-preparation step.
- Give non-admin page data and MCP display links one authenticated,
  History-owned URL form.
- Keep the deployed service within Cloudflare free-plan limits through an
  explicit storage and operation budget, rather than treating R2 as unlimited
  free storage.
- Preserve XML filenames, local originals, local derivative generation, Walk,
  thumbnail framing, and classifier operation.
- Prevent ordinary image requests from revealing an R2 endpoint, R2 key,
  signed URL, or R2 credential.

**Non-Goals:**

- Do not add R2 actions, status, credentials, or synchronization to Walk.
- Do not move originals or videos to R2, change XML schema, or replace the
  local source library.
- Do not build a DRM system or prevent an authenticated user from saving an
  image their browser receives.
- Do not change the classifier's local review workflow or permit it to write
  metadata automatically.

## Decisions

### Preserve filenames as canonical local identity

The manifest input is the existing gallery, stored XML filename, and raster
variant (`photo` or `thumb`). It records an opaque media identifier, private
R2 object key, content type, and content version. XML continues to identify
media; neither R2 keys nor public delivery URLs are written into XML.

This retains local-first compatibility and makes filename rename or derivative
regeneration a media-preparation concern instead of a data migration. A direct
filename-to-R2-path scheme was rejected because object keys and public URLs
would become application contracts and leak implementation details.

### Prepare media separately from Walk and application build execution

A dedicated deploy-time media-preparation command uploads changed display
photos and thumbnails, then emits the manifest consumed by the application
build and media delivery service. It runs before a production build when local
derivatives are available; a normal local `next build` does not require R2
credentials or an upload.

Before its first R2 request, preparation atomically writes a private local
resume manifest. If a connection failure interrupts the run, that journal
retains the generated opaque IDs and object keys without replacing the active
deployment manifest. The next run reuses them and checks existing remote
objects before uploading. It clears the journal only after the verified
deployment manifest and operation ledger are written. This preserves retry
idempotency even during an initial migration, when no active manifest yet
exists.

This satisfies build-time mapping without coupling user-facing Walk actions to
cloud state. Integrating preparation into Walk was rejected because Walk must
remain a local filesystem tool. Uploading all objects from each application
build was rejected because production builders may not contain the source
library and repeated builds should not mutate storage.

### Use a private R2 binding behind an authenticated media edge

The R2 bucket has no public development URL or public custom-domain access. A
History media edge uses an R2 binding and a Cloudflare Access-authenticated
request boundary. It validates authentication before manifest lookup and
object retrieval, returns only the selected object's media response, and never
redirects to R2 or emits a signed GET URL. Shared edge caching occurs only
after the authentication boundary.

Cloudflare Access is selected because History currently has no application
account/session implementation and the intended small private audience fits
its free tier. A browser session can still retrieve an image it is authorized
to view; the boundary prevents unauthenticated retrieval rather than claiming
copy prevention.

### Bound the deployment to free-plan allowances

The deployment uses R2 Standard only. It reserves an 8 GB History allocation
inside R2's 10 GB-month included Standard-storage allowance. The lower limit
leaves headroom for manifest overhead and a safe old-and-new derivative overlap
while an updated version is published. Media preparation projects its peak
remote storage before beginning any mutation and aborts with the existing
manifest intact if that allocation would be exceeded. Originals and videos are
not candidates for this allocation.

The preparation tool keeps a billing-period ledger for its own R2 operations
and stops before either its Class A or Class B preparation budget reaches
900,000 operations. The media delivery Worker runs on Workers Free, performs at
most one R2 object read for an admitted media request, and has its route set to
fail closed. The Workers Free 100,000-request daily ceiling consequently
prevents a traffic spike from bypassing the authentication boundary and bounds
that route to at most 3.1 million R2 reads in a 31-day billing period. R2
credentials are limited to the preparation tool and the Worker binding, so no
other application path may consume the private bucket's allowance.

R2 setup still requires Cloudflare's subscription checkout flow. A $0 invoice
depends on staying inside the provider's current free allowances; it is not a
provider-enforced spending cap. Deployment preflight therefore reports the
selected R2 storage class, configured Cloudflare plan, current History budget
usage, and the remaining allowance before publishing media. Budget alerts and
the Cloudflare billing dashboard remain operator safeguards for activity outside
this change.

### Resolve display paths once at item construction

Production `photoPath` and `thumbPath` resolve through the manifest to a
same-origin History media URL. Since album transformation and client-item
construction already populate these fields, Album, All, Persons, search, map,
calendar, storytelling, and MCP flows inherit the new delivery form without
each component gaining R2 logic. Local development uses the current direct
filesystem URL mode so local workflows stay usable without cloud credentials.

The implementation must ensure protected URLs work with the configured image
component and do not create a public optimizer cache path. Original and video
paths are deliberately outside this resolver change.

### Keep local administration independent, publish derivatives later

Walk, resize, HEIF conversion, filename renaming, thumbnail framing, XML
editing, and classifier reads continue to operate on local files. A thumbnail
edited locally becomes cloud-visible only after the standalone media
preparation command runs again. The admin's direct original-image affordance
remains behind the deployment-wide Access boundary and is not added to the
R2 normal-viewer manifest.

## Risks / Trade-offs

- [A public origin can bypass the edge boundary] → Route the deployed History
  origin through Cloudflare Access and restrict direct origin access with a
  Tunnel or firewall before enabling private media delivery.
- [Manifest and bucket drift] → Upload first, write the manifest last, verify
  content hashes/counts, and fail preparation for a missing referenced object.
- [A protected image optimization path could become a cache bypass] → Use a
  same-origin authenticated URL and test the exact browser/image-component
  request path before rollout.
- [The display derivatives grow beyond the free allocation] → Abort
  preparation before remote mutation, retain the current deployed manifest, and
  keep all source media local until the operator reduces the subset or approves
  a different storage decision.
- [Traffic or preparation activity consumes allowance unexpectedly] → Use a
  dedicated private bucket, bounded preparation ledger, one-read media route,
  Workers Free fail-closed mode, and preflight usage reporting; do not permit an
  alternate R2 access path.
- [Filename renames leave stale objects] → Treat stale object cleanup as a
  recoverable post-sync lifecycle operation; never delete local source media.
- [Authenticated browser users can save a displayed image] → Document that
  access control prevents unauthenticated retrieval, not client-side copying.

## Migration Plan

1. Configure private R2 Standard, Cloudflare Access, a Workers Free
   fail-closed route, and an origin that cannot bypass the Access boundary.
   Record the R2 subscription checkout and zero-billed-usage constraints;
   verify direct R2 and direct-origin media requests fail.
2. Implement and run media preparation against a copy of existing display
   photos and thumbnails; verify manifest entries, object checksums,
   missing-object failures, and storage/operation-budget aborts.
3. Deploy the authenticated media edge and production resolver while retaining
   local-development direct paths; verify all non-admin image surfaces and MCP
   links use History media URLs.
4. Re-run preparation after a local thumbnail edit; verify the new version
   becomes visible only after preparation completes.
5. Roll back by restoring the direct local resolver mode and prior deployment;
   leave local source media and the private R2 bucket intact for investigation.
