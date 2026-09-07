# Private R2 media deployment

History remains local-first. During local development, `photo` and `thumb`
paths continue to read from `public/galleries`; Walk, resize, renaming,
thumbnail framing, XML editing, originals, videos, and the classifier do not
use R2.

The deployed experience instead serves only XML-listed display photos and
thumbnails through the private `/media/<opaque-id>?v=<version>` Worker route.
Originals and videos are never included in the R2 manifest.

## Required Cloudflare setup

1. Complete Cloudflare's R2 subscription checkout. R2 has included monthly
   usage, but this checkout is still required; it is not unlimited free
   storage.
2. Create a dedicated private R2 **Standard** bucket. Do not enable an `r2.dev`
   URL or a public custom domain. Do not use Infrequent Access storage.
3. Create a least-privilege R2 API token for the preparation host, scoped to
   this bucket. Keep its credentials in the deployment secret store, never in
   `.env` committed to the repository.
4. Copy `workers/media/wrangler.template.jsonc` to an untracked
   `workers/media/wrangler.jsonc`, replace the bucket placeholder, and deploy
   it with `workers_dev: false`. Bind the bucket only as `HISTORY_MEDIA`.
5. Route the Worker only at `https://<history-host>/media/*`. Create a
   Cloudflare Access application for the History host and media route, with an
   allow-list policy for the intended private audience. Configure the Worker
   route to **fail closed** when its Workers Free daily request limit is
   exhausted. The worker has no public `workers.dev` endpoint.
6. Prevent a direct application origin from bypassing Cloudflare Access (for
   example, by using a Cloudflare Tunnel or an origin firewall). Test a direct
   R2 URL, a direct origin URL, and an unauthenticated `/media/...` request;
   each must return no image bytes.

Cloudflare Access performs authentication before the Worker. The Worker checks
that an Access assertion is present, resolves only an ID already in the
manifest, and performs exactly one R2 object read for a successful request.
It never redirects to R2 or returns an R2 URL, credential, or signed URL.

## Preparing display derivatives

### Map the Cloudflare dashboard values

After creating the Cloudflare account and R2 bucket, the values shown in the
Dashboard map to History's variables as follows:

| Cloudflare value | History variable | Notes |
| --- | --- | --- |
| Account ID | `HISTORY_R2_ACCOUNT_ID` | The account identifier shown in the Dashboard. It is not a secret. |
| Bucket name | `HISTORY_R2_BUCKET` | The exact name of the dedicated private **Standard** R2 bucket. |
| R2 S3 API Access Key ID | `HISTORY_R2_ACCESS_KEY_ID` | From **R2 object storage → Overview → Manage API Tokens**, choose **Create Account API token**. It is not the Cloudflare global API key or a normal dashboard API token. |
| R2 S3 API Secret Access Key | `HISTORY_R2_SECRET_ACCESS_KEY` | Copy it when the token is created; Cloudflare does not show it again. Keep it out of Git, shell history where practical, and chat. |
| R2 S3 API endpoint | `HISTORY_R2_ENDPOINT` (optional) | History derives `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` from the Account ID, so this normally does not need to be set. |

For the preparation machine, create an **Account API token** through this R2
screen. It is account-owned, so it is suitable for this deployment credential
and remains valid if an individual user's account access changes. The Cloudflare
user creating it needs the **Super Administrator** role.

1. Select **Create Account API token**.
2. Set **Permission** to **Object Read & Write**.
3. Set the scope to **Apply to specific buckets only**, then select the one
   private History bucket.
4. Create the token, then copy its **Access Key ID** into
   `HISTORY_R2_ACCESS_KEY_ID` and its one-time **Secret Access Key** into
   `HISTORY_R2_SECRET_ACCESS_KEY`.

Cloudflare also permits a **User API token**, but it inherits the creator's
permissions and becomes inactive if that user is removed from the account. Use
one only for a short-lived personal/manual setup where that lifecycle is
intentional. Neither token type is the Cloudflare global API key. The S3 API
credential is deliberately separate from the Worker's R2 binding.

### First preparation run

Run this on the machine that has the local History gallery tree. Replace only
the `...` placeholders with the values above:

```sh
HISTORY_R2_STORAGE_CLASS=Standard \
HISTORY_R2_ACCOUNT_ID=... \
HISTORY_R2_ACCESS_KEY_ID=... \
HISTORY_R2_SECRET_ACCESS_KEY=... \
HISTORY_R2_BUCKET=... \
npm run prepare-media
```

The command constructs the S3 endpoint from `HISTORY_R2_ACCOUNT_ID`. If the
Dashboard gives you a non-default endpoint, add
`HISTORY_R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com` to the
same command. Do not use the public `r2.dev` endpoint.

Use `npm run prepare-media -- --dry-run` to scan local XML-listed display
derivatives and report the projected storage and operation budget without
requiring credentials or mutating R2.

Preparation writes the deployment manifest to
`src/generated/private-media-manifest.json` and its private operation ledger to
`.history/private-media-operation-ledger.json`. The latter is gitignored.
The manifest is an implementation artifact: it contains opaque IDs and private
object keys, and must be available to both the Next build and the Worker build.
Run preparation again after a local thumbnail edit; it uploads and verifies the
new derivative before replacing the manifest. Local sources are never deleted.

## Free-tier guardrails

- R2 Standard is limited by History to an 8 GiB remote-media allocation,
  leaving headroom inside Cloudflare's 10 GB-month included Standard allowance.
- Preparation stops before an upload if current plus replacement versions would
  exceed 8 GiB, 900,000 Class A operations, or 900,000 Class B operations in
  its billing-period ledger. It retains the previous manifest on failure.
- The Workers Free route is capped by Cloudflare at 100,000 requests per day;
  fail-closed mode prevents a request-limit overrun from falling through to an
  unprotected origin. The Worker code itself returns `private, no-store` so an
  image optimizer or shared cache cannot become a second delivery path.
- Review the Cloudflare billing dashboard and configure budget alerts. The
  safeguards cover this dedicated History bucket and Worker path, not unrelated
  activity in the same Cloudflare account.

## Building and rolling back

For the deployed build, make the generated manifest available and set:

```sh
HISTORY_MEDIA_MODE=private
```

Without that setting, including local development and a normal local build,
History keeps its existing direct local media paths and does not need R2
credentials. In private mode a missing manifest entry fails rather than
silently emitting a public `/galleries/...` path.

To roll back, remove `HISTORY_MEDIA_MODE=private` and deploy the previous
application build while retaining the private bucket for investigation. This
does not change XML, Walk, local originals, local derivatives, or local media.

This is access control, not browser DRM: an authenticated person can still
save pixels delivered to their browser.
