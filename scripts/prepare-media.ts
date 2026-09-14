import { createHash, createHmac, randomUUID } from 'node:crypto'
import { createReadStream, existsSync } from 'node:fs'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadEnvFile } from 'node:process'
import { pathToFileURL } from 'node:url'
import xml2js from 'xml2js'

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
const defaultResumeManifestPath = '.history/private-media-resume-manifest.json'
const defaultEnvironmentPath = '.env'

/**
 * Loads local deployment defaults without replacing values inherited from the
 * calling shell. It intentionally does nothing for injected test environments.
 */
export function loadPrepareMediaEnvironment(
  env: NodeJS.ProcessEnv = process.env,
  environmentPath = defaultEnvironmentPath,
) {
  if (env !== process.env || !existsSync(environmentPath)) return false
  const inherited = new Map(Object.entries(env))
  loadEnvFile(environmentPath)
  for (const [name, value] of inherited) env[name] = value
  return true
}

function sha256(content: Uint8Array | string) {
  return createHash('sha256').update(content).digest('hex')
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error)
  const code = typeof (error as NodeJS.ErrnoException).code === 'string'
    ? ` [${(error as NodeJS.ErrnoException).code}]`
    : ''
  const cause = (error as Error & { cause?: unknown }).cause
  return `${error.message}${code}${cause === undefined ? '' : `; cause: ${describeError(cause)}`}`
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

function canonicalQuery(query?: URLSearchParams) {
  if (!query) return ''
  return [...query.entries()]
    .map(([name, value]) => [encodeURIComponent(name), encodeURIComponent(value)] as const)
    .sort(([leftName, leftValue], [rightName, rightValue]) => (
      leftName === rightName ? leftValue.localeCompare(rightValue) : leftName.localeCompare(rightName)
    ))
    .map(([name, value]) => `${name}=${value}`)
    .join('&')
}

type R2StorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint?: string;
}

export type R2MediaObject = {
  key: string;
  bytes: number;
  sha256: string;
}

export type R2DuplicateMediaGroup = {
  sha256: string;
  bytes: number;
  keys: string[];
}

function asArray<T>(value: T | T[] | undefined) {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function mediaObjectFromKey(key: string, bytes: unknown): R2MediaObject | null {
  const match = /^media\/[A-Za-z0-9_-]{16,128}\/([a-f0-9]{64})\.jpg$/.exec(key)
  const parsedBytes = Number(bytes)
  if (!match || !Number.isSafeInteger(parsedBytes) || parsedBytes < 0) return null
  return { key, bytes: parsedBytes, sha256: match[1] }
}

export function findDuplicateR2MediaObjects(objects: R2MediaObject[]) {
  const bySha256 = new Map<string, R2MediaObject[]>()
  for (const object of objects) {
    const group = bySha256.get(object.sha256) ?? []
    group.push(object)
    bySha256.set(object.sha256, group)
  }

  const duplicateGroups: R2DuplicateMediaGroup[] = [...bySha256.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([sha256, group]) => ({
      sha256,
      bytes: group.reduce((total, object) => total + object.bytes, 0),
      keys: group.map(object => object.key).sort(),
    }))
    .sort((left, right) => left.sha256.localeCompare(right.sha256))

  return {
    objectCount: objects.length,
    totalBytes: objects.reduce((total, object) => total + object.bytes, 0),
    duplicateGroupCount: duplicateGroups.length,
    duplicateObjectCount: duplicateGroups.reduce((total, group) => total + group.keys.length - 1, 0),
    duplicateBytes: duplicateGroups.reduce((total, group) => total + group.bytes - (group.bytes / group.keys.length), 0),
    duplicateGroups,
  }
}

/** Minimal SigV4 R2 client for media preparation and read-only auditing. */
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

  private async request(input: {
    method: 'GET' | 'HEAD' | 'PUT';
    key?: string;
    query?: URLSearchParams;
    content?: Uint8Array;
    contentSha256?: string;
  }) {
    const { method, key, query, content, contentSha256 } = input
    const now = new Date()
    const timestamp = awsTimestamp(now)
    const objectPath = key === undefined
      ? `/${encodeURIComponent(this.config.bucket)}`
      : `/${encodeURIComponent(this.config.bucket)}/${encodeObjectKey(key)}`
    const url = new URL(objectPath, this.endpoint)
    const encodedQuery = canonicalQuery(query)
    url.search = encodedQuery
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
      encodedQuery,
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
    let response: Response
    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: authorization,
          'x-amz-content-sha256': payloadHash,
          'x-amz-date': timestamp.full,
          ...(contentSha256 ? { 'x-amz-meta-history-sha256': contentSha256, 'Content-Type': 'image/jpeg' } : {}),
        },
        body: content ? Buffer.from(content) : undefined,
      })
    } catch (error) {
      const message = [
        `R2 ${method} ${key ?? `${this.config.bucket} object listing`} could not reach ${url.origin}:`,
        describeError(error),
      ].join(' ')
      throw new Error(message, { cause: error })
    }
    if (response.status === 404 && method === 'HEAD') return response
    if (!response.ok) {
      const body = (await response.text()).trim()
      const detail = body === '' ? '' : `: ${body.slice(0, 1_000)}`
      const target = key ?? `${this.config.bucket} object listing`
      throw new Error(
        `R2 ${method} ${target} failed at ${url.origin}: HTTP ${response.status} ${response.statusText}${detail}`,
      )
    }
    return response
  }

  async head(key: string): Promise<PrivateMediaObjectMetadata | null> {
    const response = await this.request({ method: 'HEAD', key })
    if (response.status === 404) return null
    const length = response.headers.get('content-length')
    if (length === null || !Number.isSafeInteger(Number(length))) throw new Error(`R2 HEAD ${key} returned an invalid content length`)
    return { bytes: Number(length), sha256: response.headers.get('x-amz-meta-history-sha256') }
  }

  async put({ key, content, sha256: contentSha256 }: { key: string; content: Uint8Array; sha256: string }) {
    await this.request({ method: 'PUT', key, content, contentSha256 })
  }

  async listMediaObjects(onPage?: (page: number, objectCount: number) => void): Promise<R2MediaObject[]> {
    const objects: R2MediaObject[] = []
    let continuationToken: string | undefined
    let page = 0
    do {
      const query = new URLSearchParams({ 'list-type': '2', prefix: 'media/' })
      if (continuationToken) query.set('continuation-token', continuationToken)
      const response = await this.request({ method: 'GET', query })
      const parsed = await new xml2js.Parser({ explicitArray: false }).parseStringPromise(await response.text())
      const result = parsed.ListBucketResult as {
        Contents?: { Key?: string; Size?: string } | Array<{ Key?: string; Size?: string }>;
        IsTruncated?: string;
        NextContinuationToken?: string;
      } | undefined
      if (!result) throw new Error('R2 object listing returned an invalid XML response')
      for (const content of asArray(result.Contents)) {
        if (typeof content.Key !== 'string') continue
        const object = mediaObjectFromKey(content.Key, content.Size)
        if (!object) throw new Error(`R2 object listing returned an invalid private media key: ${content.Key}`)
        objects.push(object)
      }
      page++
      onPage?.(page, objects.length)
      continuationToken = result.IsTruncated === 'true' ? result.NextContinuationToken : undefined
      if (result.IsTruncated === 'true' && !continuationToken) {
        throw new Error('R2 object listing is truncated without a continuation token')
      }
    } while (continuationToken)
    return objects
  }
}

function asAlbums(value: XmlGalleryAlbum | XmlGalleryAlbum[]) {
  return Array.isArray(value) ? value : [value]
}

function asItems(value: XmlItem | XmlItem[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

type DisplayDerivativeCollectionProgress = {
  phase: 'gallery' | 'checkpoint' | 'complete';
  derivativeCount: number;
  gallery?: string;
  galleryCurrent?: number;
  galleryTotal?: number;
}

export async function collectDisplayDerivatives(
  onProgress?: (progress: DisplayDerivativeCollectionProgress) => void,
): Promise<PreparedPrivateMediaAsset[]> {
  const { galleries } = await getGalleries()
  const assets = new Map<string, PreparedPrivateMediaAsset>()

  for (const [galleryIndex, gallery] of galleries.entries()) {
    onProgress?.({
      phase: 'gallery',
      gallery,
      galleryCurrent: galleryIndex + 1,
      galleryTotal: galleries.length,
      derivativeCount: assets.size,
    })
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
          if (assets.size === 1 || assets.size % 100 === 0) {
            onProgress?.({ phase: 'checkpoint', derivativeCount: assets.size })
          }
        }
      }
    }
  }

  onProgress?.({ phase: 'complete', derivativeCount: assets.size })
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
  const loadedEnvironment = loadPrepareMediaEnvironment(env)
  if (loadedEnvironment) console.log('Loaded private-media configuration defaults from .env.')
  const dryRun = args.includes('--dry-run')
  const audit = args.includes('--audit')
  if (args.some(arg => arg !== '--dry-run' && arg !== '--audit') || (dryRun && audit)) {
    throw new Error('Usage: npm run prepare-media -- [--dry-run | --audit]')
  }
  const manifestPath = env.HISTORY_MEDIA_MANIFEST_PATH ?? defaultManifestPath
  const ledgerPath = env.HISTORY_MEDIA_OPERATION_LEDGER_PATH ?? defaultLedgerPath
  const resumeManifestPath = env.HISTORY_MEDIA_RESUME_MANIFEST_PATH ?? defaultResumeManifestPath
  const r2Config = dryRun ? null : requiredR2Config(env)
  const r2Store = r2Config ? new R2ObjectStore(r2Config) : null
  const store = r2Store ?? {
    head: async () => null,
    put: async () => undefined,
  }

  if (r2Store && r2Config) {
    console.log(
      `R2 target: ${r2Store.endpoint.origin} (bucket ${r2Config.bucket})`,
    )
  } else {
    console.log('Dry run: no R2 requests or files will be written.')
  }
  if (audit) {
    if (!r2Store) throw new Error('R2 configuration is required for --audit')
    console.log('Auditing private R2 media objects; this performs no writes...')
    const objects = await r2Store.listMediaObjects((page, objectCount) => {
      console.log(`Listed R2 page ${page}: ${objectCount} private media objects found so far...`)
    })
    console.log(JSON.stringify({ audit: true, ...findDuplicateR2MediaObjects(objects) }, null, 2))
    return
  }
  console.log('Scanning local XML-listed display derivatives...')
  const assets = await collectDisplayDerivatives(progress => {
    if (progress.phase === 'gallery') {
      const status = [
        `Scanning gallery ${progress.galleryCurrent}/${progress.galleryTotal}: ${progress.gallery}`,
        `(${progress.derivativeCount} derivatives found so far)`,
      ].join(' ')
      console.log(status)
    } else if (progress.phase === 'checkpoint') {
      console.log(`Scanned ${progress.derivativeCount} unique display derivatives...`)
    } else {
      console.log(`Scan complete: ${progress.derivativeCount} unique display derivatives.`)
    }
  })
  console.log(`Reading manifest ${manifestPath}, operation ledger ${ledgerPath}, and resume journal...`)
  const previous = await readJsonIfExists<PrivateMediaManifest>(manifestPath)
  const ledger = await readJsonIfExists<PrivateMediaOperationLedger>(ledgerPath)
  const resume = await readJsonIfExists<PrivateMediaManifest>(resumeManifestPath)
  if (resume) console.log(`Resuming stable media IDs from ${resumeManifestPath}.`)

  console.log('Validating the manifest and free-tier budget...')
  const result = await preparePrivateMedia({
    assets,
    previousManifest: previous ? parsePrivateMediaManifest(previous) : null,
    resumeManifest: resume ? parsePrivateMediaManifest(resume) : null,
    ledger,
    store,
    idFactory: () => randomUUID().replace(/-/g, ''),
    dryRun,
    onProgress: progress => {
      const asset = `${progress.gallery}/${progress.filename} (${progress.variant})`
      if (progress.phase === 'checking') {
        console.log(`Checking R2 object ${progress.current}/${progress.total}: ${asset}`)
      } else if (progress.phase === 'uploading') {
        console.log(`Uploading R2 object ${progress.current}/${progress.total}: ${asset}`)
      } else if (progress.phase === 'verifying') {
        console.log(`Verifying R2 object ${progress.current}/${progress.total}: ${asset}`)
      } else {
        console.log(`Already uploaded ${progress.current}/${progress.total}: ${asset}`)
      }
    },
    onPlan: async manifest => {
      console.log(`Saving retry-safe media plan to ${resumeManifestPath} before R2 requests...`)
      await writeJsonAtomically(resumeManifestPath, manifest)
    },
  })

  if (!dryRun) {
    console.log('Writing the verified media manifest and operation ledger...')
    await writeJsonAtomically(manifestPath, result.manifest)
    await writeJsonAtomically(ledgerPath, result.nextLedger)
    await rm(resumeManifestPath, { force: true })
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
    console.error(`prepare-media failed: ${describeError(error)}`)
    process.exitCode = 1
  })
}
