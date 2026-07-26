import { filterAllItemsByVisitedPlace } from './all'
import { getAgeSummaryPerson } from './persons-filter-scopes'
import { formatVisitedPlace, getVisitedPlaceFromSearchParams } from './domains/visited'
import {
  getAgeFromPersonsRouteSearchParams,
  getPersonFromPersonsRouteSearchParams,
  type PersonsRouteSearchParams,
} from './persons-route-filters'
import { filterPersonsItems, getPersonsData } from './persons'
import indexKeywords from './search'
import type { Persons } from '../types/pages'
import { buildAgeSummary } from '../utils/person-age'
import type { Gallery } from '../types/common'

export type AgeFilterValue = number | 'unknown' | null

export type PersonsSearchParams = PersonsRouteSearchParams

export function getPersonFromSearchParams(searchParams?: PersonsSearchParams) {
  return getPersonFromPersonsRouteSearchParams(searchParams)
}

export function getAgeFromSearchParams(searchParams?: PersonsSearchParams): AgeFilterValue {
  return getAgeFromPersonsRouteSearchParams(searchParams)
}

export async function getPersonsPageData({
  gallery,
  selectedAge,
  selectedPerson,
  searchParams,
}: {
  gallery: Gallery
  selectedAge: AgeFilterValue
  selectedPerson: string | null
  searchParams?: PersonsSearchParams
}): Promise<Persons.ItemData> {
  const visitedPlace = getVisitedPlaceFromSearchParams(searchParams)
  const personsData = await getPersonsData({ gallery })
  const visitedScopedItems = visitedPlace
    ? filterAllItemsByVisitedPlace(personsData.items, visitedPlace)
    : personsData.items
  const ageSummaryPerson = getAgeSummaryPerson(selectedAge, selectedPerson)
  const summaryItems = filterPersonsItems(visitedScopedItems, null, ageSummaryPerson)
  const personScopeItems = selectedAge !== null && selectedPerson
    ? filterPersonsItems(visitedScopedItems, null, selectedPerson)
    : undefined
  const ageScopeItems = selectedAge !== null
    ? filterPersonsItems(visitedScopedItems, selectedAge, null)
    : undefined
  const visibleItems = filterPersonsItems(visitedScopedItems, selectedAge, selectedPerson)
  const hasServerScope = visitedPlace !== null || selectedAge !== null || selectedPerson !== null
  const indexedKeywords = hasServerScope ? indexKeywords(visibleItems).indexedKeywords : personsData.indexedKeywords
  const initialAgeSummary = buildAgeSummary(summaryItems, ageSummaryPerson)

  return {
    gallery,
    items: visibleItems,
    totalItemCount: personsData.items.length,
    indexedKeywords,
    initialAgeSummary,
    initialBaseScopeItems: selectedAge === null && selectedPerson ? visitedScopedItems : undefined,
    initialAgeScopeItems: selectedAge !== null && selectedPerson ? ageScopeItems : undefined,
    initialPersonScopeItems: personScopeItems,
    visitedPlace: visitedPlace ?? null,
    visitedFilterLabel: visitedPlace ? formatVisitedPlace(visitedPlace) : null,
  }
}
