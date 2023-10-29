import type { GalleryAlbum, Item } from '../types/common'

/**
 * Index search keywords from search xml element and dedupe
 *
 * @param {Object[]} items
 * @param {string} items.search
 * @returns {{ indexedKeywords }}
 */
function indexKeywords(items: { search: Item['search'] | GalleryAlbum['search'] }[]) {
  const summedKeywords = items.reduce((out, item) => {
    item.search?.split(', ').forEach((val) => {
      // eslint-disable-next-line no-param-reassign
      out[val] = (out[val] || 0) + 1
    })
    return out
  }, {} as Record<string, number>)

  const sortedKeywords = Object.fromEntries(
    Object.entries(summedKeywords).sort(([, a], [, b]) => {
      if (b < a) return -1
      if (a < b) return 1
      return 0
    }),
  )

  // prepare for react-select in useSearch custom hook
  return {
    indexedKeywords: Object.keys(sortedKeywords).map((key) => ({
      label: `${key} (${sortedKeywords[key]})`,
      value: key,
    })),
  }
}

export default indexKeywords

export function addGeographyToSearch(item: Item) {
  const hasComma = item.city.lastIndexOf(',') !== -1
  const country = hasComma ? item.city.substring(item.city.lastIndexOf(', ') + 1).trim() : item.city.trim()

  return item.search === null ? country : `${item.search}, ${country}`
}
