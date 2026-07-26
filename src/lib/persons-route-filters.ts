import type { VisitedPlace } from '../types/common'
import type { PersonAgeFilterValue } from './domains/persons'
import { getVisitedPlaceFromSearchParams, type VisitedSearchParams } from './domains/visited'

export type PersonsRouteSearchParams = {
  keyword?: string | string[]
  age?: string | string[]
  person?: string | string[]
} & VisitedSearchParams

export type PersonsRouteFilters = {
  keyword: string
  selectedAge: PersonAgeFilterValue
  selectedPerson: string | null
  visitedPlace: VisitedPlace | null
}

export function normalizePersonsRouteFilters(filters: PersonsRouteFilters): PersonsRouteFilters {
  if (!filters.selectedPerson || filters.keyword !== filters.selectedPerson) {
    return filters
  }

  return {
    ...filters,
    keyword: '',
  }
}

function getTrimmedParamValue(value?: string | string[]) {
  return typeof value === 'string' ? value.trim() : ''
}

export function getKeywordFromPersonsRouteSearchParams(searchParams?: PersonsRouteSearchParams) {
  return getTrimmedParamValue(searchParams?.keyword)
}

export function getPersonFromPersonsRouteSearchParams(searchParams?: PersonsRouteSearchParams) {
  const person = getTrimmedParamValue(searchParams?.person)
  return person || null
}

export function getAgeFromPersonsRouteSearchParams(searchParams?: PersonsRouteSearchParams): PersonAgeFilterValue {
  const ageValue = getTrimmedParamValue(searchParams?.age)
  if (!ageValue) {
    return null
  }

  if (ageValue === 'unknown') {
    return 'unknown'
  }

  const age = Number.parseInt(ageValue, 10)
  return Number.isNaN(age) ? null : age
}

export function parsePersonsRouteFilters(searchParams?: PersonsRouteSearchParams): PersonsRouteFilters {
  return {
    keyword: getKeywordFromPersonsRouteSearchParams(searchParams),
    selectedAge: getAgeFromPersonsRouteSearchParams(searchParams),
    selectedPerson: getPersonFromPersonsRouteSearchParams(searchParams),
    visitedPlace: getVisitedPlaceFromSearchParams(searchParams),
  }
}

export function buildPersonsRouteSearchParams(
  baseSearchParams: string | URLSearchParams,
  filters: PersonsRouteFilters,
) {
  const normalizedFilters = normalizePersonsRouteFilters(filters)
  const params = new URLSearchParams(
    typeof baseSearchParams === 'string'
      ? baseSearchParams
      : baseSearchParams.toString(),
  )

  if (normalizedFilters.keyword) params.set('keyword', normalizedFilters.keyword)
  else params.delete('keyword')

  if (normalizedFilters.selectedAge === null) params.delete('age')
  else params.set('age', normalizedFilters.selectedAge === 'unknown' ? 'unknown' : String(normalizedFilters.selectedAge))

  if (normalizedFilters.selectedPerson) params.set('person', normalizedFilters.selectedPerson)
  else params.delete('person')

  if (normalizedFilters.visitedPlace) {
    params.set('visitedCountry', normalizedFilters.visitedPlace.country)
    if (normalizedFilters.visitedPlace.region) params.set('visitedRegion', normalizedFilters.visitedPlace.region)
    else params.delete('visitedRegion')
  } else {
    params.delete('visitedCountry')
    params.delete('visitedRegion')
  }

  return params
}
