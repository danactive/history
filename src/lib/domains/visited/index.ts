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
