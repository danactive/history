import { access, constants, open } from 'node:fs/promises'
import { cacheLife } from 'next/cache'

import { getAllPageItems } from '../get-all-items'
import {
  getVideoPaths,
  rasterAssetKinds,
  rasterPath,
  type RasterAssetKind,
} from '../paths'
import config from '../../models/config'
import utilsFactory from '../utils'
import type { Gallery, ServerSideAllItem } from '../../types/common'
import { generatedGalleries } from '../../types/generated'
import { getPrimaryFilename } from '../../utils'

export type AssetKind = RasterAssetKind | 'video'
export const assetKinds: readonly AssetKind[] = [...rasterAssetKinds, 'video']

export type AssetDimensions = {
  width: number;
  height: number;
}

type AssetVariant = {
  kind: AssetKind;
  label: string;
  src: string;
}

export type AssetDescriptor = AssetVariant & {
  available: boolean;
  dimensions: AssetDimensions | null;
}

export type AssetStripItem = {
  gallery: Gallery;
  filename: string;
  assets: AssetDescriptor[];
}

export type AssetStripAddress = Pick<AssetStripItem, 'gallery' | 'filename'> & {
  /** Compact captions calculated from known asset configuration during static rendering. */
  assetDimensionCaptions?: Array<string | null>;
}

export type AssetBatchResponse = {
  error?: string;
  items?: AssetStripItem[];
}

const labels: Record<AssetKind, string> = {
  original: 'Original',
  photo: 'Photo',
  thumb: 'Thumb',
  video: 'Video',
}

const utils = utilsFactory()

/**
 * Builds the one canonical variant order used by the admin asset audit.
 */
export function buildAssetVariants(item: Pick<ServerSideAllItem,
  'filename' | 'gallery' | 'mediaPath' | 'photoPath'>): AssetVariant[] {
  const variants: AssetVariant[] = rasterAssetKinds.map(kind => ({
    kind,
    label: labels[kind],
    src: rasterPath(item.filename, item.gallery, kind),
  }))

  if (item.mediaPath !== item.photoPath) {
    const [videoSrc] = getVideoPaths(item.filename, item.gallery)
    if (videoSrc) {
      variants.push({ kind: 'video', label: labels.video, src: videoSrc })
    }
  }

  return variants
}

function asDimensions(width: number | undefined, height: number | undefined): AssetDimensions | null {
  return width && height ? { width, height } : null
}

function dimensionsCaption(dimensions: AssetDimensions | null): string | null {
  return dimensions ? `${dimensions.width} × ${dimensions.height} px` : null
}

function buildAssetDimensionCaptions(item: Pick<ServerSideAllItem,
  'mediaPath' | 'photoPath'>): Array<string | null> {
  const captions = [
    null,
    null,
    dimensionsCaption(config.resizeDimensions.thumb),
  ]

  if (item.mediaPath !== item.photoPath) {
    captions.push(dimensionsCaption(config.defaultDimensions.video))
  }

  return captions
}

/**
 * Reads just enough of a JPEG's header to identify its intrinsic dimensions.
 * This keeps the all-assets page from decoding or loading full originals.
 */
function parseJpegDimensions(content: Buffer): AssetDimensions | null {
  if (content.length < 4 || content[0] !== 0xff || content[1] !== 0xd8) return null

  let offset = 2
  while (offset + 9 <= content.length) {
    if (content[offset] !== 0xff) {
      offset++
      continue
    }

    while (content[offset] === 0xff) offset++
    const marker = content[offset]
    offset++
    if (marker === undefined || marker === 0xd9 || marker === 0xda) break
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
    if (offset + 2 > content.length) break

    const length = content.readUInt16BE(offset)
    if (length < 2 || offset + length > content.length) break
    const isStartOfFrame = (marker >= 0xc0 && marker <= 0xc3)
      || (marker >= 0xc5 && marker <= 0xc7)
      || (marker >= 0xc9 && marker <= 0xcb)
      || (marker >= 0xcd && marker <= 0xcf)
    if (isStartOfFrame && length >= 8) {
      return asDimensions(content.readUInt16BE(offset + 5), content.readUInt16BE(offset + 3))
    }

    offset += length
  }

  return null
}

async function readJpegDimensions(filePath: string): Promise<AssetDimensions | null> {
  const handle = await open(filePath, 'r')
  try {
    const content = Buffer.alloc(128 * 1024)
    const { bytesRead } = await handle.read(content, 0, content.length, 0)
    return parseJpegDimensions(content.subarray(0, bytesRead))
  } finally {
    await handle.close()
  }
}

async function getAssetMetadata(
  asset: AssetVariant,
): Promise<Pick<AssetDescriptor, 'available' | 'dimensions'>> {
  const filePath = utils.safePublicPath(asset.src)

  try {
    await access(filePath, constants.R_OK)
    if (asset.kind === 'video') {
      return { available: true, dimensions: config.defaultDimensions.video }
    }

    return { available: true, dimensions: await readJpegDimensions(filePath) }
  } catch {
    return { available: false, dimensions: null }
  }
}

async function getAssetStripItem(item: ServerSideAllItem): Promise<AssetStripItem> {
  'use cache'

  cacheLife('max')
  const variants = buildAssetVariants(item)
  const assets = await Promise.all(variants.map(async (asset): Promise<AssetDescriptor> => ({
    ...asset,
    ...await getAssetMetadata(asset),
  })))

  return {
    gallery: item.gallery,
    filename: getPrimaryFilename(item.filename),
    assets,
  }
}

/**
 * Loads the compact, static address index for every asset strip. Captions are
 * derived from existing build metadata; file checks happen only when the
 * nearby descriptor batch is requested.
 */
export async function getAllAssetStripAddresses(): Promise<AssetStripAddress[]> {
  const itemGroups = await Promise.all(generatedGalleries.map(async gallery => {
    const { items } = await getAllPageItems(gallery)
    return items
  }))

  const items = itemGroups.flat()
  return items.map(item => ({
    gallery: item.gallery,
    filename: getPrimaryFilename(item.filename),
    assetDimensionCaptions: buildAssetDimensionCaptions(item),
  }))
}

/**
 * Builds a bounded batch of vertical asset stacks for the horizontal client
 * scroller, avoiding an oversized server payload for the complete history.
 */
export async function getAssetStripItemsRange(start: number, end: number): Promise<AssetStripItem[]> {
  const itemGroups = await Promise.all(generatedGalleries.map(async gallery => {
    const { items } = await getAllPageItems(gallery)
    return items
  }))

  return Promise.all(itemGroups.flat().slice(start, end).map(getAssetStripItem))
}
