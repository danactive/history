import { createHash } from 'node:crypto'
import type { Gallery } from '../types/common'
import {
  createPrivateMediaEntry,
  createPrivateMediaIdentity,
  emptyPrivateMediaManifest,
  parsePrivateMediaManifest,
  privateMediaIdentityKey,
  privateMediaSchemaVersion,
  type PrivateMediaEntry,
  type PrivateMediaManifest,
} from './private-media'

export const historyMediaStorageBudgetBytes = 8 * 1024 * 1024 * 1024
export const historyMediaPreparationOperationBudget = 900_000

export type PrivateMediaOperationLedger = {
  billingPeriod: string;
  classA: number;
  classB: number;
}

export type PreparedPrivateMediaAsset = {
  gallery: Gallery;
  filename: string;
  variant: 'photo' | 'thumb';
  bytes: number;
  content: Uint8Array | (() => Promise<Uint8Array>);
  sha256: string;
}

export type PrivateMediaObjectMetadata = {
  bytes: number;
  sha256: string | null;
}

export type PrivateMediaObjectStore = {
  head: (key: string) => Promise<PrivateMediaObjectMetadata | null>;
  put: (input: { key: string; content: Uint8Array; sha256: string }) => Promise<void>;
}

export type PrivateMediaPreparationResult = {
  manifest: PrivateMediaManifest;
  nextLedger: PrivateMediaOperationLedger;
  projectedPeakBytes: number;
  projectedOperations: Pick<PrivateMediaOperationLedger, 'classA' | 'classB'>;
  uploadedObjectKeys: string[];
  staleObjectKeys: string[];
}

function currentBillingPeriod(now: Date): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

function currentLedger(ledger: PrivateMediaOperationLedger | null | undefined, now: Date): PrivateMediaOperationLedger {
  const billingPeriod = currentBillingPeriod(now)
  if (!ledger || ledger.billingPeriod !== billingPeriod) return { billingPeriod, classA: 0, classB: 0 }
  if (!Number.isSafeInteger(ledger.classA) || !Number.isSafeInteger(ledger.classB) || ledger.classA < 0 || ledger.classB < 0) {
    throw new Error('Private media operation ledger is invalid')
  }
  return ledger
}

function toDesiredEntries(
  assets: PreparedPrivateMediaAsset[],
  previousManifest: PrivateMediaManifest,
  idFactory: () => string,
) {
  const previousByIdentity = new Map(previousManifest.entries.map(entry => [privateMediaIdentityKey(entry), entry]))
  const desiredByIdentity = new Map<string, { entry: PrivateMediaEntry; asset: PreparedPrivateMediaAsset }>()

  for (const asset of assets) {
    if (!/^[a-f0-9]{64}$/.test(asset.sha256)) throw new Error(`Invalid SHA-256 for ${asset.gallery}/${asset.filename}`)
    if (!Number.isSafeInteger(asset.bytes) || asset.bytes < 0) throw new Error(`Invalid byte length for ${asset.gallery}/${asset.filename}`)
    const identity = createPrivateMediaIdentity(asset.gallery, asset.filename, asset.variant)
    const identityKey = privateMediaIdentityKey(identity)
    const previous = previousByIdentity.get(identityKey)
    const entry = createPrivateMediaEntry(identity, {
      id: previous?.id ?? idFactory(),
      version: asset.sha256,
      sha256: asset.sha256,
      bytes: asset.bytes,
    })
    const alreadyDesired = desiredByIdentity.get(identityKey)
    if (alreadyDesired && alreadyDesired.entry.sha256 !== entry.sha256) {
      throw new Error(`Conflicting duplicate private media derivative: ${identityKey}`)
    }
    desiredByIdentity.set(identityKey, { entry, asset })
  }

  return [...desiredByIdentity.values()].sort((left, right) => (
    privateMediaIdentityKey(left.entry).localeCompare(privateMediaIdentityKey(right.entry))
  ))
}

function projectedPeakBytes(previousManifest: PrivateMediaManifest, desiredEntries: Array<{ entry: PrivateMediaEntry }>) {
  const previousByIdentity = new Map(previousManifest.entries.map(entry => [privateMediaIdentityKey(entry), entry]))
  const currentBytes = previousManifest.entries.reduce((total, entry) => total + entry.bytes, 0)
  const additionalVersionBytes = desiredEntries.reduce((total, { entry }) => {
    const previous = previousByIdentity.get(privateMediaIdentityKey(entry))
    return total + ((previous?.version === entry.version) ? 0 : entry.bytes)
  }, 0)
  return currentBytes + additionalVersionBytes
}

function assertBudget(
  ledger: PrivateMediaOperationLedger,
  projected: Pick<PrivateMediaOperationLedger, 'classA' | 'classB'>,
  peakBytes: number,
) {
  if (peakBytes > historyMediaStorageBudgetBytes) {
    throw new Error(`Private media storage budget exceeded: ${peakBytes} bytes projected, ${historyMediaStorageBudgetBytes} allowed`)
  }
  if (ledger.classA + projected.classA > historyMediaPreparationOperationBudget) {
    throw new Error('Private media Class A preparation-operation budget exceeded')
  }
  if (ledger.classB + projected.classB > historyMediaPreparationOperationBudget) {
    throw new Error('Private media Class B preparation-operation budget exceeded')
  }
}

function manifestChanged(previous: PrivateMediaManifest, nextEntries: PrivateMediaEntry[]) {
  if (previous.entries.length !== nextEntries.length) return true
  return previous.entries.some((entry, index) => JSON.stringify(entry) !== JSON.stringify(nextEntries[index]))
}

async function getVerifiedAssetContent(asset: PreparedPrivateMediaAsset) {
  const content = typeof asset.content === 'function' ? await asset.content() : asset.content
  const contentSha256 = createHash('sha256').update(content).digest('hex')
  if (content.byteLength !== asset.bytes || contentSha256 !== asset.sha256) {
    throw new Error(`Local derivative changed during private media preparation: ${asset.gallery}/${asset.filename}`)
  }
  return content
}

/**
 * Uploads and verifies display derivatives before returning a publishable
 * manifest. The caller owns durable manifest and ledger writes so a failed
 * upload cannot replace a previously published manifest.
 */
export async function preparePrivateMedia(input: {
  assets: PreparedPrivateMediaAsset[];
  previousManifest?: PrivateMediaManifest | null;
  ledger?: PrivateMediaOperationLedger | null;
  store: PrivateMediaObjectStore;
  idFactory: () => string;
  now?: Date;
  dryRun?: boolean;
}): Promise<PrivateMediaPreparationResult> {
  const now = input.now ?? new Date()
  const previousManifest = input.previousManifest ? parsePrivateMediaManifest(input.previousManifest) : emptyPrivateMediaManifest
  const ledger = currentLedger(input.ledger, now)
  const desired = toDesiredEntries(input.assets, previousManifest, input.idFactory)
  const projectedPeak = projectedPeakBytes(previousManifest, desired)

  // Each object may need a HEAD, PUT, and verification HEAD. Reserve the
  // worst case before making the first remote mutation.
  const projectedOperations = {
    classA: desired.length,
    classB: desired.length * 2,
  }
  assertBudget(ledger, projectedOperations, projectedPeak)

  const entries = desired.map(({ entry }) => entry)
  const staleObjectKeys = previousManifest.entries
    .filter(previous => !entries.some(entry => entry.objectKey === previous.objectKey))
    .map(entry => entry.objectKey)
  const changed = manifestChanged(previousManifest, entries)
  const manifest: PrivateMediaManifest = {
    schemaVersion: privateMediaSchemaVersion,
    generatedAt: changed ? now.toISOString() : previousManifest.generatedAt,
    entries,
  }

  if (input.dryRun) {
    return {
      manifest,
      nextLedger: {
        billingPeriod: ledger.billingPeriod,
        classA: ledger.classA + projectedOperations.classA,
        classB: ledger.classB + projectedOperations.classB,
      },
      projectedPeakBytes: projectedPeak,
      projectedOperations,
      uploadedObjectKeys: [],
      staleObjectKeys,
    }
  }

  let classA = 0
  let classB = 0
  const uploadedObjectKeys: string[] = []
  for (const { entry, asset } of desired) {
    const existing = await input.store.head(entry.objectKey)
    classB++
    const matches = existing?.bytes === entry.bytes && existing.sha256 === entry.sha256
    if (!matches) {
      const content = await getVerifiedAssetContent(asset)
      await input.store.put({ key: entry.objectKey, content, sha256: entry.sha256 })
      classA++
      const verified = await input.store.head(entry.objectKey)
      classB++
      if (verified?.bytes !== entry.bytes || verified.sha256 !== entry.sha256) {
        throw new Error(`Private media object verification failed: ${entry.objectKey}`)
      }
      uploadedObjectKeys.push(entry.objectKey)
    }
  }

  return {
    manifest,
    nextLedger: {
      billingPeriod: ledger.billingPeriod,
      classA: ledger.classA + classA,
      classB: ledger.classB + classB,
    },
    projectedPeakBytes: projectedPeak,
    projectedOperations,
    uploadedObjectKeys,
    staleObjectKeys,
  }
}
