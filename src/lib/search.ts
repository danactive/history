import type { GalleryAlbum, IndexedKeywords, Item } from '../types/common'

/**
 * Index search keywords from search xml element and dedupe
 *
 * @param {object[]} items photos, albums, galleries any item that may be searched
 * @param {string} items.search keyword
 * @returns {{ indexedKeywords }}
 */
function indexKeywords(items: { search: Item['search'] | GalleryAlbum['search'] }[]) {
  const summedKeywords = items.reduce((out, item) => {
    item.search?.split(', ').forEach((val) => {

      out[val] = (out[val] || 0) + 1
    })
    return out
  }, {} as Record<string, number>)

  function isNum(n: string) {
    return Number.isFinite(Number(n))
  }

  const sortedKeywords = Object.entries(summedKeywords).sort(([nameA, numA], [nameB, numB]) => {
    if (numB - numA !== 0) {
      return numB - numA
    }

    if (isNum(nameA) && isNum(nameB)) {
      return Number(nameB) - Number(nameA)
    }

    return nameA.localeCompare(nameB)
  })

  const indexedKeywords: IndexedKeywords[] = sortedKeywords.map(([key, count]) => ({
    label: `${key} (${count})`,
    value: key,
  }))

  // prepare for combo box in useSearch custom hook
  return {
    indexedKeywords,
  }
}

export default indexKeywords

export function addGeographyToSearch(item: Item) {
  const hasComma = item.city.lastIndexOf(',') !== -1
  const country = hasComma ? item.city.substring(item.city.lastIndexOf(', ') + 1).trim() : item.city.trim()

  return item.search === null ? country : `${item.search}, ${country}`
}
