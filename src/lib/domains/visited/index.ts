import type { Item, VisitedPlace } from '../../../types/common'
import {
  buildVisitedDataFromItems,
  buildVisitedKeywordOptions,
  buildVisitedRegionCountryIndex,
  formatVisitedPlace,
  formatVisitedYears,
  getVisitedPlace,
  matchesVisitedPlace,
} from '../../visited-core'

export type VisitedSearchParams = {
  visitedCountry?: string | string[]
  visitedRegion?: string | string[]
}

export function getVisitedPlaceFromSearchParams(searchParams?: VisitedSearchParams): VisitedPlace | null {
  const country = typeof searchParams?.visitedCountry === 'string' ? searchParams.visitedCountry.trim() : ''
  const region = typeof searchParams?.visitedRegion === 'string' ? searchParams.visitedRegion.trim() : ''

  if (!country) {
    return null
  }

  return {
    country,
    region: region || null,
  }
}

export function filterItemsByVisitedPlace<ItemType extends { visitedPlace?: VisitedPlace | null }>(
  items: ItemType[],
  visitedPlace: VisitedPlace,
) {
  return items.filter(item => matchesVisitedPlace(item.visitedPlace ?? null, visitedPlace))
}

export function filterItemsByVisitedPlaceFromCities<ItemType extends Pick<Item, 'city'>>(
  items: ItemType[],
  visitedPlace: VisitedPlace,
) {
  const regionCountryIndex = buildVisitedRegionCountryIndex(items)
  return items.filter((item) => matchesVisitedPlace(getVisitedPlace(item, regionCountryIndex), visitedPlace))
}

export {
  buildVisitedDataFromItems,
  buildVisitedKeywordOptions,
  buildVisitedRegionCountryIndex,
  formatVisitedPlace,
  formatVisitedYears,
  getVisitedPlace,
  matchesVisitedPlace,
}

export type { CountryVisit, RegionVisit, VisitedRegionCountryIndex } from '../../visited-core'
