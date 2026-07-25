import { filterAllItemsByVisitedPlace } from './all'
import { formatVisitedPlace, getVisitedPlaceFromSearchParams, type VisitedSearchParams } from './domains/visited'
import { filterPersonsItems, getPersonsData } from './persons'
import indexKeywords from './search'
import type { Persons } from '../types/pages'
import { buildAgeSummary } from '../utils/person-age'
import type { Gallery } from '../types/common'

export type AgeFilterValue = number | 'unknown' | null

export type PersonsSearchParams = {
  age?: string | string[]
  person?: string | string[]
} & VisitedSearchParams

export function getPersonFromSearchParams(searchParams?: PersonsSearchParams) {
  const person = typeof searchParams?.person === 'string' ? searchParams.person.trim() : ''
  return person || null
}

export function getAgeFromSearchParams(searchParams?: PersonsSearchParams): AgeFilterValue {
  const ageValue = typeof searchParams?.age === 'string' ? searchParams.age.trim() : ''
  if (!ageValue) {
    return null
  }

  if (ageValue === 'unknown') {
    return 'unknown'
  }

  const age = Number.parseInt(ageValue, 10)
  return Number.isNaN(age) ? null : age
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
  const serverScopedPerson = selectedAge === null ? selectedPerson : null
  const summaryItems = filterPersonsItems(visitedScopedItems, null, serverScopedPerson)
  const items = summaryItems
  const hasServerScope = visitedPlace !== null || selectedAge !== null || selectedPerson !== null
  const indexedKeywords = hasServerScope ? indexKeywords(items).indexedKeywords : personsData.indexedKeywords
  const initialAgeSummary = buildAgeSummary(summaryItems)

  return {
    gallery,
    items,
    totalItemCount: personsData.items.length,
    indexedKeywords,
    initialAgeSummary,
    visitedPlace: visitedPlace ?? null,
    visitedFilterLabel: visitedPlace ? formatVisitedPlace(visitedPlace) : null,
  }
}
