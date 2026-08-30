import type { AssetStripAddress } from '../../lib/admin/assets'
import { generatedGallerySchema } from '../../types/generated'

export function assetStripHash({ gallery, filename }: AssetStripAddress) {
  return `#${encodeURIComponent(gallery)}/${encodeURIComponent(filename)}`
}

export function parseAssetStripHash(hash: string): AssetStripAddress | null {
  const segments = hash.startsWith('#') ? hash.slice(1).split('/') : []
  if (segments.length !== 2 || !segments[0] || !segments[1]) return null

  try {
    const parsedGallery = generatedGallerySchema.safeParse(decodeURIComponent(segments[0]))
    if (!parsedGallery.success) return null

    return {
      gallery: parsedGallery.data,
      filename: decodeURIComponent(segments[1]),
    }
  } catch {
    return null
  }
}

export function assetStripKey({ gallery, filename }: AssetStripAddress) {
  return `${gallery}\u0000${filename}`
}
