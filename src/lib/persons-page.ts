import {
  getAgeFromPersonsRouteSearchParams,
  getPersonFromPersonsRouteSearchParams,
  type PersonsRouteSearchParams,
} from './persons-route-filters'
import { filterPersonsItems, getPersonsData } from './persons'
import {
  filterItemsByQuery,
  getConjunctiveFilterTerms,
  getFilterQueryContext,
  parseFilterQuery,
  replaceConjunctiveFilterTerms,
  type FilterQueryContext,
} from './filter-query'
import { buildFilterMetadata } from './server/filter-metadata'
import { filterItemsByMapBounds, type Bounds } from './map-filtering'
import type { Persons } from '../types/pages'
import { buildAgeSummary } from '../utils/person-age'
import type { Gallery } from '../types/common'
import { getInitialActiveFacetCounts } from './active-facets'

export type AgeFilterValue = number | 'unknown' | null

export type PersonsSearchParams = PersonsRouteSearchParams

export function getPersonFromSearchParams(searchParams?: PersonsSearchParams) {
  return getPersonFromPersonsRouteSearchParams(searchParams)
}

export function getAgeFromSearchParams(searchParams?: PersonsSearchParams): AgeFilterValue {
  return getAgeFromPersonsRouteSearchParams(searchParams)
}

export function getPersonsMenuBaseQuery(query: string, context: FilterQueryContext) {
  const terms = getConjunctiveFilterTerms(query, context)
  if (!terms.has('age') && !terms.has('person')) {
    return query
  }

  return replaceConjunctiveFilterTerms(query, { age: null, person: null }, context)
}

export async function getPersonsPageData({
  gallery,
  selectedAge,
  selectedPerson,
  searchParams,
  mapBounds,
}: {
  gallery: Gallery
  selectedAge: AgeFilterValue
  selectedPerson: string | null
  searchParams?: PersonsSearchParams
  mapBounds?: Bounds | null
}): Promise<Persons.ItemData> {
  const personsData = await getPersonsData({ gallery })
  const query = typeof searchParams?.query === 'string' ? searchParams.query : ''
  const baseMetadata = buildFilterMetadata(personsData.items)
  const queryContext = getFilterQueryContext(baseMetadata)
  const activeFacetCounts = getInitialActiveFacetCounts({
    items: mapBounds ? filterItemsByMapBounds(personsData.items, true, mapBounds) : personsData.items,
    query,
    context: queryContext,
  })
  const menuBaseQuery = getPersonsMenuBaseQuery(query, queryContext)
  const menuBaseItems = menuBaseQuery
    ? filterItemsByQuery(personsData.items, parseFilterQuery(menuBaseQuery, queryContext))
    : personsData.items
  const menuScopeItems = mapBounds
    ? filterItemsByMapBounds(menuBaseItems, true, mapBounds)
    : menuBaseItems
  const ageSummaryItems = filterPersonsItems(menuScopeItems, null, selectedPerson)
  const visibleItems = filterPersonsItems(menuBaseItems, selectedAge, selectedPerson)
  const hasServerScope = Boolean(query) || selectedAge !== null || selectedPerson !== null
  const scopedFilterMetadata = hasServerScope ? buildFilterMetadata(visibleItems) : null
  const indexedKeywords = scopedFilterMetadata?.indexedKeywords ?? personsData.indexedKeywords
  const personOptions = scopedFilterMetadata?.personOptions ?? personsData.personOptions
  const tagOptions = scopedFilterMetadata?.tagOptions ?? personsData.tagOptions
  const initialAgeSummary = buildAgeSummary(ageSummaryItems, selectedPerson)

  return {
    gallery,
    items: visibleItems,
    totalItemCount: mapBounds
      ? filterItemsByMapBounds(personsData.items, true, mapBounds).length
      : personsData.items.length,
    indexedKeywords,
    personOptions,
    tagOptions,
    initialAgeSummary,
    initialBaseScopeItems: selectedAge !== null || selectedPerson !== null || mapBounds
      ? menuScopeItems
      : undefined,
    activeFacetCounts,
  }
}
