import fs from 'node:fs/promises'

import type { Gallery, GalleryAlbum, Item } from '../types/common'

type CriticalTagAuditInput = {
  gallery: Gallery;
  album: GalleryAlbum;
  items: Array<Pick<Item, 'search'>>;
}

export type CriticalTagAlbum = CriticalTagAuditInput & {
  criticalMediaCount: number;
  isBelowMedian: boolean;
}

export type CriticalTagAudit = {
  albums: CriticalTagAlbum[];
  criticalTags: string[];
  medianCriticalMediaCount: number;
  albumsWithoutCriticalTags: CriticalTagAlbum[];
  albumsBelowMedian: CriticalTagAlbum[];
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase()
}

function getCriticalTagsFromConfig(config: unknown): string[] {
  if (typeof config !== 'object' || config === null || !('critical-tags' in config)) {
    return []
  }

  const criticalTags = config['critical-tags']
  if (!Array.isArray(criticalTags)) {
    return []
  }

  return [...new Set(criticalTags.filter((tag): tag is string => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean))]
}

function isErrorWithCode(error: unknown): error is { code: string } {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && typeof error.code === 'string'
}

export function parseSearchTags(search: Item['search']): string[] {
  if (!search) return []
  return search.split(',').map(tag => tag.trim()).filter(Boolean)
}

export function getMedian(values: number[]): number {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

export function auditCriticalTags(
  albums: CriticalTagAuditInput[],
  configuredCriticalTags: string[],
): CriticalTagAudit {
  const criticalTags = [...new Set(configuredCriticalTags.map(tag => tag.trim()).filter(Boolean))]
  const criticalTagLookup = new Set(criticalTags.map(normalizeTag))

  const auditedAlbums = albums.map((album) => {
    let criticalMediaCount = 0

    album.items.forEach(({ search }) => {
      const mediaTags = new Set(parseSearchTags(search).map(normalizeTag))

      if ([...mediaTags].some(tag => criticalTagLookup.has(tag))) {
        criticalMediaCount += 1
      }
    })

    return {
      ...album,
      criticalMediaCount,
      isBelowMedian: false,
    }
  })

  // Missing coverage is reported separately. Excluding it here keeps the median useful for
  // prioritizing albums that have critical tags but are still comparatively under-tagged.
  const medianCriticalMediaCount = getMedian(
    auditedAlbums
      .filter(album => album.criticalMediaCount > 0)
      .map(album => album.criticalMediaCount),
  )
  const withMedianFlag = auditedAlbums.map(album => ({
    ...album,
    isBelowMedian: album.criticalMediaCount > 0 && album.criticalMediaCount < medianCriticalMediaCount,
  }))
  const sortedAlbums = withMedianFlag.sort((a, b) => (
    a.criticalMediaCount - b.criticalMediaCount
    || a.gallery.localeCompare(b.gallery)
    || a.album.name.localeCompare(b.album.name)
  ))

  return {
    albums: sortedAlbums,
    criticalTags,
    medianCriticalMediaCount,
    albumsWithoutCriticalTags: sortedAlbums.filter(album => album.criticalMediaCount === 0),
    albumsBelowMedian: sortedAlbums.filter(album => album.isBelowMedian),
  }
}

export async function getConfiguredCriticalTags(): Promise<string[]> {
  try {
    const content = await fs.readFile('config.local.json', 'utf8')
    const config: unknown = JSON.parse(content)
    return getCriticalTagsFromConfig(config)
  } catch (error) {
    if (isErrorWithCode(error) && error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}
