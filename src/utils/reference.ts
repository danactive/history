import type { ItemReferenceSource, XmlItem } from '../types/common'

export function buildReferenceUrl(source: ItemReferenceSource, name: string): string | null {
  const baseUrls: Record<ItemReferenceSource, string> = {
    facebook: 'https://www.facebook.com/',
    google: 'https://www.google.com/search?q=',
    instagram: 'https://www.instagram.com/',
    wikipedia: 'https://en.wikipedia.org/wiki/',
    youtube: 'https://www.youtube.com/watch?v=',
  }

  return baseUrls[source] + name
}

export function transformReference(ref: XmlItem['ref']): [string, string] | null {
  if (!ref) {
    return null
  }
  if ('name' in ref && 'source' in ref) {
    const url = buildReferenceUrl(ref.source, ref.name)
    if (!url) return null
    return [url, ref.name]
  }
  return null
}
