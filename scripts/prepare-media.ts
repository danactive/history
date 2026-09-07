import { createHash, createHmac, randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import getGalleries from '../src/lib/galleries'
import { rasterPath } from '../src/lib/paths'
import {
  parsePrivateMediaManifest,
  type PrivateMediaManifest,
} from '../src/lib/private-media'
import {
  preparePrivateMedia,
  type PreparedPrivateMediaAsset,
  type PrivateMediaObjectMetadata,
  type PrivateMediaObjectStore,
  type PrivateMediaOperationLedger,
} from '../src/lib/private-media-preparation'
import { readAlbum, readGallery } from '../src/lib/xml'
import type { XmlGalleryAlbum, XmlItem } from '../src/types/common'

const defaultManifestPath = 'src/generated/private-media-manifest.json'
const defaultLedgerPath = '.history/private-media-operation-ledger.json'

function sha256(content: Uint8Array | string) {
  return createHash('sha256').update(content).digest('hex')
}

async function hashFile(sourcePath: string) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(sourcePath)) {
    hash.update(chunk)
  }
  return hash.digest('hex')
}

function hmac(key: Uint8Array | string, value: string) {
  return createHmac('sha256', key).update(value).digest()
}

function awsTimestamp(now: Date) {
  const compact = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  return { full: compact, date: compact.slice(0, 8) }
}

function encodeObjectKey(key: string) {
  return key.split('/').map(segment => encodeURIComponent(segment)).join('/')
}

type R2StorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint?: string;
}

/** Minimal SigV4 R2 client: media preparation needs only HEAD and PUT. */
export class R2ObjectStore implements PrivateMediaObjectStore {
  readonly endpoint: URL

  constructor(private readonly config: R2StorageConfig) {
    this.endpoint = new URL(config.endpoint ?? `https://${config.accountId}.r2.cloudflarestorage.com`)
  }

  private signingKey(date: string) {
    const dateKey = hmac(`AWS4${this.config.secretAccessKey}`, date)
    const regionKey = hmac(dateKey, 'auto')
    const serviceKey = hmac(regionKey, 's3')
    return hmac(serviceKey, 'aws4_request')
  }

  private async request(method: 'HEAD' | 'PUT', key: string, content?: Uint8Array, contentSha256?: string) {
    const now = new Date()
    const timestamp = awsTimestamp(now)
    const url = new URL(`/${encodeURIComponent(this.config.bucket)}/${encodeObjectKey(key)}`, this.endpoint)
    const payloadHash = contentSha256 ?? sha256('')
    const headersToSign = {
      host: url.host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': timestamp.full,
      ...(contentSha256 ? { 'content-type': 'image/jpeg', 'x-amz-meta-history-sha256': contentSha256 } : {}),
    }
    const sortedHeaderEntries = Object.entries(headersToSign).sort(([left], [right]) => left.localeCompare(right))
    const canonicalHeaders = sortedHeaderEntries.map(([name, value]) => `${name}:${value}`).join('\n')
    const signedHeaders = sortedHeaderEntries.map(([name]) => name).join(';')
    const canonicalRequest = [
      method,
      url.pathname,
      '',
      `${canonicalHeaders}\n`,
      signedHeaders,
      payloadHash,
    ].join('\n')
    const credentialScope = `${timestamp.date}/auto/s3/aws4_request`
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timestamp.full,
      credentialScope,
      sha256(canonicalRequest),
    ].join('\n')
    const signature = createHmac('sha256', this.signingKey(timestamp.date)).update(stringToSign).digest('hex')
    const authorization = [
      `AWS4-HMAC-SHA256 Credential=${this.config.accessKeyId}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ')
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: authorization,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': timestamp.full,
        ...(contentSha256 ? { 'x-amz-meta-history-sha256': contentSha256, 'Content-Type': 'image/jpeg' } : {}),
      },
      body: content ? Buffer.from(content) : undefined,
    })
    if (response.status === 404 && method === 'HEAD') return response
    if (!response.ok) throw new Error(`R2 ${method} ${key} failed: ${response.status} ${await response.text()}`)
    return response
  }

  async head(key: string): Promise<PrivateMediaObjectMetadata | null> {
    const response = await this.request('HEAD', key)
    if (response.status === 404) return null
    const length = response.headers.get('content-length')
    if (length === null || !Number.isSafeInteger(Number(length))) throw new Error(`R2 HEAD ${key} returned an invalid content length`)
    return { bytes: Number(length), sha256: response.headers.get('x-amz-meta-history-sha256') }
  }

  async put({ key, content, sha256: contentSha256 }: { key: string; content: Uint8Array; sha256: string }) {
    await this.request('PUT', key, content, contentSha256)
  }
}

function asAlbums(value: XmlGalleryAlbum | XmlGalleryAlbum[]) {
  return Array.isArray(value) ? value : [value]
}

function asItems(value: XmlItem | XmlItem[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export async function collectDisplayDerivatives(): Promise<PreparedPrivateMediaAsset[]> {
  const { galleries } = await getGalleries()
  const assets = new Map<string, PreparedPrivateMediaAsset>()

  for (const gallery of galleries) {
    const galleryXml = await readGallery(gallery)
    for (const album of asAlbums(galleryXml.gallery.album)) {
      const albumXml = await readAlbum(gallery, album.albumName)
      for (const item of asItems(albumXml.album.item)) {
        if (item.type === 'video') continue
        for (const variant of ['photo', 'thumb'] as const) {
          const publicPath = rasterPath(item.filename, gallery, variant)
          const sourcePath = path.join('public', publicPath)
          const metadata = await stat(sourcePath)
          const asset: PreparedPrivateMediaAsset = {
            gallery,
            filename: Array.isArray(item.filename) ? item.filename[0] ?? '' : item.filename,
            variant,
            bytes: metadata.size,
            content: async () => new Uint8Array(await readFile(sourcePath)),
            sha256: await hashFile(sourcePath),
          }
          const key = `${asset.gallery}\u0000${asset.filename}\u0000${asset.variant}`
          const existing = assets.get(key)
          if (existing && existing.sha256 !== asset.sha256) {
            throw new Error(`XML-listed derivative resolves to conflicting content: ${key}`)
          }
          assets.set(key, asset)
        }
      }
    }
  }

  return [...assets.values()]
}

async function readJsonIfExists<T>(destination: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(destination, 'utf8')) as T
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

async function writeJsonAtomically(destination: string, value: unknown) {
  await mkdir(path.dirname(destination), { recursive: true })
  const temporaryPath = `${destination}.${randomUUID()}.tmp`
  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
    await rename(temporaryPath, destination)
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined)
    throw error
  }
}

function requiredR2Config(env: NodeJS.ProcessEnv): R2StorageConfig {
  if (env.HISTORY_R2_STORAGE_CLASS !== 'Standard') {
    throw new Error('HISTORY_R2_STORAGE_CLASS must be Standard; Infrequent Access is outside the free tier')
  }
  const required = ['HISTORY_R2_ACCOUNT_ID', 'HISTORY_R2_ACCESS_KEY_ID', 'HISTORY_R2_SECRET_ACCESS_KEY', 'HISTORY_R2_BUCKET'] as const
  const missing = required.filter(key => env[key] === undefined || env[key] === '')
  if (missing.length > 0) throw new Error(`Missing R2 configuration: ${missing.join(', ')}`)
  return {
    accountId: env.HISTORY_R2_ACCOUNT_ID as string,
    accessKeyId: env.HISTORY_R2_ACCESS_KEY_ID as string,
    secretAccessKey: env.HISTORY_R2_SECRET_ACCESS_KEY as string,
    bucket: env.HISTORY_R2_BUCKET as string,
    endpoint: env.HISTORY_R2_ENDPOINT,
  }
}

export async function main(args = process.argv.slice(2), env = process.env) {
  const dryRun = args.includes('--dry-run')
  if (args.some(arg => arg !== '--dry-run')) throw new Error('Usage: npm run prepare-media -- [--dry-run]')
  const manifestPath = env.HISTORY_MEDIA_MANIFEST_PATH ?? defaultManifestPath
  const ledgerPath = env.HISTORY_MEDIA_OPERATION_LEDGER_PATH ?? defaultLedgerPath
  const assets = await collectDisplayDerivatives()
  const previous = await readJsonIfExists<PrivateMediaManifest>(manifestPath)
  const ledger = await readJsonIfExists<PrivateMediaOperationLedger>(ledgerPath)
  const store = dryRun
    ? { head: async () => null, put: async () => undefined }
    : new R2ObjectStore(requiredR2Config(env))

  const result = await preparePrivateMedia({
    assets,
    previousManifest: previous ? parsePrivateMediaManifest(previous) : null,
    ledger,
    store,
    idFactory: () => randomUUID().replace(/-/g, ''),
    dryRun,
  })

  if (!dryRun) {
    await writeJsonAtomically(manifestPath, result.manifest)
    await writeJsonAtomically(ledgerPath, result.nextLedger)
  }

  console.log(JSON.stringify({
    dryRun,
    derivativeCount: assets.length,
    uploadedObjectCount: result.uploadedObjectKeys.length,
    staleObjectCount: result.staleObjectKeys.length,
    projectedPeakBytes: result.projectedPeakBytes,
    projectedOperations: result.projectedOperations,
    remainingStorageBytes: (8 * 1024 * 1024 * 1024) - result.projectedPeakBytes,
  }, null, 2))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
