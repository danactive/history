## 1. Define private media preparation

- [x] 1.1 Add a typed canonical identity and manifest format for existing `photo` and `thumb` derivatives; verify unit tests cover JPEG normalization, gallery separation, version changes, and exclusion of `original` variants.
- [x] 1.2 Implement a standalone media-preparation command that uploads changed display derivatives and writes the manifest only after all referenced R2 objects verify; verify it is idempotent and reports missing local derivatives without modifying XML or Walk.
- [x] 1.3 Add a media-preparation budget ledger and preflight that projects peak R2 Standard storage plus Class A and Class B operations before mutation; enforce the 8 GB / 900,000-operation caps and verify every over-budget failure leaves remote objects and the manifest unchanged.
- [x] 1.4 Add deployment configuration and documented environment validation for private R2 credentials, the manifest artifact, R2 Standard storage, the required subscription checkout, and free-allowance monitoring; verify a normal local `npm run build` requires neither R2 credentials nor uploads.

## 2. Deliver authenticated media

- [x] 2.1 Create the authenticated History media edge backed by a private R2 binding and manifest lookup; verify authenticated requests return the selected content type, unknown identifiers return not found, and arbitrary R2 keys cannot be requested.
- [ ] 2.2 Configure and document Cloudflare Access plus direct-origin restriction for the History and media routes; verify unauthenticated requests, direct R2 URLs, and direct origin media access do not return image bytes.
- [ ] 2.3 Configure the media route on Workers Free in fail-closed mode and restrict it to one R2 object read per admitted image request; verify the provider's free request ceiling cannot bypass authentication or reach an alternate origin.
- [x] 2.4 Configure safe authenticated caching headers and image-component handling; verify a cached display image still requires authentication and no optimizer/proxy URL bypasses the media boundary.

## 3. Resolve non-admin display paths

- [x] 3.1 Add a deployment-aware media resolver that changes only mapped production `photoPath` and `thumbPath` values to History-owned media URLs while preserving local-development direct-path behavior; verify focused path and album-model tests cover both modes and confirm originals/videos never resolve through R2.
- [x] 3.2 Apply the resolver at shared album, gallery, and client-item construction points; verify Album, All, Persons, search, map, calendar, and storytelling components render resolved display URLs without adding R2 logic per component.
- [x] 3.3 Update MCP display-media link construction to use the shared resolver; verify MCP unit and integration tests retain existing payload behavior apart from the resolved display URL.

## 4. Preserve and publish local administration

- [x] 4.1 Confirm Walk, resize, rename, HEIF conversion, local XML editing, thumbnail framing, and classifier tests remain unchanged by R2 integration; verify no Walk route or request includes R2 credentials, sync controls, or object-storage calls.
- [ ] 4.2 Run media preparation after a local thumbnail-framing edit; verify the changed thumbnail appears under a new manifest version only after preparation and the original/local source remains untouched.

## 5. Validate rollout and compatibility

- [ ] 5.1 Perform a staging migration of existing display photos and thumbnails; verify manifest/object counts and checksums, render every major non-admin image surface, record that originals and videos were not uploaded, and capture the resulting storage/operation budget report.
- [x] 5.2 Run `npm run lint:ci`, `npm run test:ci`, `npm run typecheck`, and `npm run build`; verify all relevant checks pass.
- [ ] 5.3 Validate the rollback switch from authenticated delivery to local direct-path mode in staging; verify XML filenames, Walk behavior, and local media remain intact.
