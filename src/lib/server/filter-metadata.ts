import config from '../../models/config'
import type { IndexedKeywords, Item, VisitedPlace } from '../../types/common'
import { filterSearchOnlyPersonCounts, splitIndexedKeywords } from '../domains/keywords'
import { buildPersonCountsFromItems, buildPersonOptions, type PersonCount, type PersonOption } from '../domains/persons'
import indexKeywords from '../search'
import { classifySearchSelection } from '../search-submit-intent'
import { buildVisitedDataFromItems, formatVisitedPlace } from '../visited'

type FilterMetadataItem = Partial<Pick<Item, 'city' | 'filename' | 'photoDate' | 'search'>> & {
  persons?: { full: string }[] | null
}

export type LocationOption = {
  label: string
  value: string
  visitedPlace: VisitedPlace
  count: number
}

export type FilterMetadataResult = {
  indexedKeywords: IndexedKeywords[]
  locationOptions: LocationOption[]
  personCounts: PersonCount[]
  personOptions: PersonOption[]
  yearOptions: IndexedKeywords[]
  tagOptions: IndexedKeywords[]
}

export type ServerPageFilterMetadata = Omit<FilterMetadataResult, 'indexedKeywords'>

type LocationMetadataItem = Pick<Item, 'city' | 'filename' | 'photoDate'>

function hasLocationMetadata(item: Partial<LocationMetadataItem>): item is LocationMetadataItem {
  return typeof item.city === 'string' && Boolean(item.filename)
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

export function buildLocationOptions(items: Array<Partial<LocationMetadataItem>>): LocationOption[] {
  const visitedData = buildVisitedDataFromItems(items.filter(hasLocationMetadata))

  return visitedData
    .flatMap((country) => {
      const countryOption = {
        label: `${country.country} (${country.count})`,
        value: country.filter.country,
        visitedPlace: country.filter,
        count: country.count,
      }
      const regionOptions = country.regions
        .filter(region => region.count >= config.visitedRegionSearchMinCount)
        .map((region) => ({
          label: `${formatVisitedPlace(region.filter)} (${region.count})`,
          value: formatVisitedPlace(region.filter),
          visitedPlace: region.filter,
          count: region.count,
        }))

      return [countryOption, ...regionOptions]
    })
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
}

export function buildFilterMetadata<ItemType extends FilterMetadataItem>(items: ItemType[]): FilterMetadataResult {
  const { indexedKeywords: rawIndexedKeywords } = indexKeywords(items)
  const locationOptions = buildLocationOptions(items.map((item) => ({
    city: item.city,
    filename: item.filename,
    photoDate: item.photoDate ?? null,
  })))
  const locationValues = new Set(locationOptions.map(option => option.value))
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
  const indexedKeywords = rawIndexedKeywords.map(option => classifyKeywordOption(option, personValues))
  const { yearOptions, tagOptions } = splitIndexedKeywords(indexedKeywords, [...locationValues, ...personValues])

  return {
    indexedKeywords,
    locationOptions,
    personCounts,
    personOptions,
    yearOptions,
    tagOptions,
  }
}
