## Purpose

Deliver History's existing display photos and thumbnails from private object
storage through an authenticated History URL without changing XML filenames or
the local-first administration workflow.

## ADDED Requirements

### Requirement: Canonical display-variant mapping

For every synchronized existing display photo and thumbnail, the system SHALL
map the canonical gallery, stored filename, and variant identity to one
History media identifier and one private object key. The mapping SHALL be
generated as part of media preparation for deployment and SHALL contain a
version that changes when the synchronized object content changes. The mapping
SHALL not create entries for original-media variants.

#### Scenario: Mapping an existing display photo

- **WHEN** media preparation processes the `photo` variant of an existing
  XML-listed filename in a gallery
- **THEN** it creates a manifest entry with a History media identifier, private
  object key, and content version for that variant

#### Scenario: Excluding an original image

- **WHEN** media preparation encounters an `original` variant
- **THEN** it does not create a normal-viewer manifest entry for that variant

#### Scenario: Updating changed derivative content

- **WHEN** an already mapped display photo or thumbnail has changed locally
- **THEN** the next media preparation records a new content version for that
  variant without changing its XML filename

### Requirement: Authenticated display-media delivery

The system SHALL deliver a mapped display photo or thumbnail only through a
History-owned authenticated media URL. The delivery boundary SHALL resolve the
History media identifier internally and SHALL not disclose a storage-provider
object URL, storage credential, or signed download URL to the client.

#### Scenario: Authenticated image request

- **WHEN** an authenticated History user requests a mapped photo or thumbnail
- **THEN** the system returns that mapped image from the private media store

#### Scenario: Unauthenticated image request

- **WHEN** a request lacks valid History authentication
- **THEN** the system denies the request without returning image bytes

#### Scenario: Unknown media identifier

- **WHEN** an authenticated user requests a media identifier that is absent
  from the manifest
- **THEN** the system returns a not-found response without querying an
  arbitrary object key

### Requirement: Shared non-admin display-media resolution

All non-admin History pages and MCP display-media links SHALL use the shared
media resolver for mapped photo and thumbnail variants. Their rendered URLs
SHALL be History-owned media URLs rather than direct
`/galleries/<gallery>/media/photos/...` or
`/galleries/<gallery>/media/thumbs/...` paths.

#### Scenario: Rendering a collection thumbnail

- **WHEN** a non-admin collection, search, map, people, calendar, or album
  view renders an item's thumbnail
- **THEN** it uses the item's resolved History media URL

#### Scenario: Viewing a selected display photo

- **WHEN** a non-admin viewer displays an image item
- **THEN** it uses the resolved History media URL for that item's display-photo
  variant

#### Scenario: Publishing an MCP display-media link

- **WHEN** an MCP response includes a mapped display photo or thumbnail link
- **THEN** it uses the same resolved History media URL as the application

### Requirement: Deployment-aware display-media resolution

The shared display-media resolver SHALL retain the current local filesystem
URLs for `photo` and `thumb` variants during local development. In a deployed
environment, it SHALL resolve a manifest-mapped display variant to the
authenticated History media URL. It SHALL not resolve originals or videos to
R2 under either mode.

#### Scenario: Running History locally

- **WHEN** a developer runs History without the deployed media configuration
- **THEN** non-admin and local administrative workflows read their existing
  local media paths without R2 credentials, upload activity, or an
  authentication edge

#### Scenario: Viewing History after deployment

- **WHEN** a deployed History page resolves a mapped photo or thumbnail
- **THEN** it receives the authenticated History media URL rather than a local
  `/galleries/...` path

### Requirement: Free-tier-bounded cloud media

The deployed media service SHALL use only R2 Standard storage and reserve at
most 8 GB for History-managed remote media, including the projected peak while
replacing changed derivatives. Media preparation SHALL calculate that peak and
its owned R2 operation use before mutating remote media. It SHALL abort without
publishing a new manifest when the 8 GB storage allocation, 900,000 Class A
preparation-operation allocation, or 900,000 Class B preparation-operation
allocation for the billing period would be exceeded.

The authenticated media route SHALL run within the Workers Free request limit,
perform no more than one R2 object read for one admitted image request, and be
configured to fail closed. No other History runtime path SHALL possess direct
private-bucket access. Deployment documentation SHALL state that R2 requires
subscription checkout and that $0 billed usage depends on remaining within
Cloudflare's current free allowances.

#### Scenario: A sync would exceed the remote storage allocation

- **WHEN** preparation projects that the current objects plus required new
  versions would exceed 8 GB
- **THEN** it stops before uploading or publishing the new manifest, reports
  the projected amount, and leaves the previous deployed media unchanged

#### Scenario: A preparation operation budget is exhausted

- **WHEN** preparation would exceed either of its billing-period operation
  allocations
- **THEN** it stops before the operation that would exceed the allocation and
  reports the relevant operation class and remaining allowance

#### Scenario: The free Worker request limit is reached

- **WHEN** the authenticated media route reaches its Workers Free daily request
  limit
- **THEN** the route fails closed and returns no image bytes instead of
  bypassing the authenticated media boundary

### Requirement: Local-first administrative workflow preservation

Album XML filenames, local originals, local derivative generation, and Walk
SHALL remain operational independently of private media delivery. This change
SHALL not add object-storage synchronization, credentials, or controls to
Walk. Thumbnail framing SHALL continue to write its generated thumbnail to the
local derivative tree; a later media preparation run publishes the changed
thumbnail.

#### Scenario: Editing an existing thumbnail locally

- **WHEN** an administrator saves a thumbnail crop through the existing
  workflow
- **THEN** the local thumbnail is updated and no object-storage request is made
  by Walk or thumbnail framing

#### Scenario: Browsing files in Walk

- **WHEN** an administrator uses any existing Walk page or action
- **THEN** its current local filesystem behavior remains unchanged and it does
  not expose an R2 synchronization action
