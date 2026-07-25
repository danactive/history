import config from '../../models/config'
import type { IndexedKeywords, Item, VisitedPlace } from '../../types/common'
import { splitIndexedKeywords } from '../domains/keywords'
import { buildPersonCountsFromItems, buildPersonOptions, type PersonCount, type PersonOption } from '../domains/persons'
import indexKeywords from '../search'
import { buildVisitedDataFromItems, formatVisitedPlace } from '../visited'

type FilterMetadataItem = Pick<Item, 'city' | 'filename' | 'photoDate' | 'search'> & {
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

export function buildLocationOptions(items: Array<Pick<Item, 'city' | 'filename' | 'photoDate'>>): LocationOption[] {
  const visitedData = buildVisitedDataFromItems(items)

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
  const { indexedKeywords } = indexKeywords(items)
  const locationOptions = buildLocationOptions(items.map((item) => ({
    city: item.city,
    filename: item.filename,
    photoDate: item.photoDate ?? null,
  })))
  const locationValues = new Set(locationOptions.map(option => option.value))
  const personCounts = buildPersonCountsFromItems(items, items.length)
  const personOptions = buildPersonOptions(personCounts)
  const personValues = personOptions.map(option => option.value)
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
