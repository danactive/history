import type { IndexedKeywords, Item } from '../types/common'
import { filterSearchOnlyPersonCounts, splitIndexedKeywords } from './domains/keywords'
import { buildPersonCountsFromItems, buildPersonOptions, type PersonCount, type PersonOption } from './domains/persons/metadata'
import indexKeywords from './search'
import { classifySearchSelection } from './search-submit-intent'

type FilterMetadataItem = Partial<Pick<Item, 'city' | 'filename' | 'photoDate' | 'search'>> & {
  persons?: { full: string }[] | null
}

export type FilterMetadataCoreResult = {
  indexedKeywords: IndexedKeywords[]
  personCounts: PersonCount[]
  personOptions: PersonOption[]
  yearOptions: IndexedKeywords[]
  tagOptions: IndexedKeywords[]
}

function getIndexedKeywordCount(option: IndexedKeywords) {
  const match = option.label.match(/\((\d+)\)$/)
  return match ? Number(match[1]) : 0
}

function mergePersonCounts(personCounts: PersonCount[], searchOnlyPersonCounts: PersonCount[]) {
  const counts = new Map<string, number>()

  personCounts.forEach(({ name, count }) => counts.set(name, count))
  searchOnlyPersonCounts.forEach(({ name, count }) => {
    counts.set(name, Math.max(counts.get(name) ?? 0, count))
  })

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([name, count]) => ({ name, count }))
}

function classifyKeywordOption(option: IndexedKeywords, personValues: Set<string>): IndexedKeywords {
  const classification = classifySearchSelection({
    selectedOption: option,
    inputValue: option.value,
    knownPeople: [...personValues],
  })

  return classification.kind === 'noop' || classification.kind === 'visited'
    ? { ...option, filterKind: 'keyword' }
    : { ...option, filterKind: classification.kind }
}

/**
 * Builds search metadata from already-available location options.  Keeping this
 * separate from filesystem-backed visited data allows map-scoped search UI to
 * rebuild its counts in the browser.
 */
export function buildFilterMetadataFromLocations<ItemType extends FilterMetadataItem>(
  items: ItemType[],
  locationOptions: IndexedKeywords[],
): FilterMetadataCoreResult {
  const { indexedKeywords: rawIndexedKeywords } = indexKeywords(items)
  const visitedLocationOptions = locationOptions.filter(option => Boolean(option.visitedPlace))
  const locationValues = new Set(visitedLocationOptions.map(option => option.value))
  const itemPersonCounts = buildPersonCountsFromItems(items, items.length)
  const itemPersonValues = itemPersonCounts.map(({ name }) => name)
  const searchOnlyPersonCounts = filterSearchOnlyPersonCounts(
    rawIndexedKeywords.map(option => ({
      name: option.value,
      count: getIndexedKeywordCount(option),
    })),
    {
      knownPeople: itemPersonValues,
      minWordCount: 3,
      reservedValues: locationValues,
    },
  )
  const personCounts = mergePersonCounts(itemPersonCounts, searchOnlyPersonCounts)
  const personOptions = buildPersonOptions(personCounts)
  const personValues = new Set(personOptions.map(option => option.value))
  const indexedKeywords = [
    ...visitedLocationOptions,
    ...rawIndexedKeywords
      .filter(option => !locationValues.has(option.value))
      .map(option => classifyKeywordOption(option, personValues)),
  ]
  const { yearOptions, tagOptions } = splitIndexedKeywords(indexedKeywords, [...locationValues, ...personValues])

  return {
    indexedKeywords,
    personCounts,
    personOptions,
    yearOptions,
    tagOptions,
  }
}
