import type { IndexedKeywords, Item, VisitedPlace } from '../../types/common'
import { buildFilterMetadataFromLocations, type FilterMetadataCoreResult } from '../filter-metadata-core'
import { buildVisitedDataFromItems, formatVisitedPlace, isSearchableVisitedRegion } from '../visited'

type FilterMetadataItem = Partial<Pick<Item, 'city' | 'filename' | 'photoDate' | 'search'>> & {
  persons?: { full: string }[] | null
}

export type LocationOption = IndexedKeywords & {
  visitedPlace: VisitedPlace
  count: number
}

export type FilterMetadataResult = FilterMetadataCoreResult & {
  locationOptions: LocationOption[]
}

export type ServerPageFilterMetadata = Omit<FilterMetadataResult, 'indexedKeywords'>

type LocationMetadataItem = Pick<Item, 'city' | 'filename' | 'photoDate'>

function hasLocationMetadata(item: Partial<LocationMetadataItem>): item is LocationMetadataItem {
  return typeof item.city === 'string' && Boolean(item.filename)
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
        .filter(isSearchableVisitedRegion)
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
  const locationOptions = buildLocationOptions(items.map((item) => ({
    city: item.city,
    filename: item.filename,
    photoDate: item.photoDate ?? null,
  })))
  return {
    locationOptions,
    ...buildFilterMetadataFromLocations(items, locationOptions),
  }
}
