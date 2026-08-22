import type { PersonAgeFilterValue } from './domains/persons'
import { getConjunctiveFilterTerms, replaceConjunctiveFilterTerms } from './filter-query'

export type PersonsRouteSearchParams = {
  query?: string | string[]
  bbox?: string | string[]
}

export type PersonsRouteFilters = {
  query?: string
  selectedAge: PersonAgeFilterValue
  selectedPerson: string | null
}

function getTrimmedParamValue(value?: string | string[]) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseAge(value: string): PersonAgeFilterValue {
  if (!value) return null
  if (value === 'unknown') return 'unknown'
  if (!/^\d+$/.test(value)) return null
  const age = Number.parseInt(value, 10)
  return Number.isNaN(age) ? null : age
}

export function getQueryFromPersonsRouteSearchParams(searchParams?: PersonsRouteSearchParams) {
  return getTrimmedParamValue(searchParams?.query)
}

export function getPersonFromPersonsRouteSearchParams(searchParams?: PersonsRouteSearchParams) {
  const query = getQueryFromPersonsRouteSearchParams(searchParams)
  if (query) return getConjunctiveFilterTerms(query).get('person') ?? null
  return null
}

export function getAgeFromPersonsRouteSearchParams(searchParams?: PersonsRouteSearchParams): PersonAgeFilterValue {
  const query = getQueryFromPersonsRouteSearchParams(searchParams)
  if (query) return parseAge(getConjunctiveFilterTerms(query).get('age') ?? '')
  return null
}

export function hasInvalidPersonsRouteAge(searchParams?: PersonsRouteSearchParams) {
  const query = getQueryFromPersonsRouteSearchParams(searchParams)
  const age = query ? getConjunctiveFilterTerms(query).get('age') : undefined
  if (!age || age === 'unknown') return false
  return parseAge(age) === null
}

export function parsePersonsRouteFilters(searchParams?: PersonsRouteSearchParams): PersonsRouteFilters {
  const query = getQueryFromPersonsRouteSearchParams(searchParams)
  return {
    query,
    selectedAge: getAgeFromPersonsRouteSearchParams(searchParams),
    selectedPerson: getPersonFromPersonsRouteSearchParams(searchParams),
  }
}

export function buildPersonsRouteSearchParams(
  baseSearchParams: string | URLSearchParams,
  filters: PersonsRouteFilters,
) {
  const params = new URLSearchParams(
    typeof baseSearchParams === 'string' ? baseSearchParams : baseSearchParams.toString(),
  )
  ;['keyword', 'tag', 'year', 'person', 'age', 'visitedCountry', 'visitedRegion'].forEach((key) => params.delete(key))

  const query = replaceConjunctiveFilterTerms(filters.query ?? '', {
    person: filters.selectedPerson,
    age: filters.selectedAge === null ? null : String(filters.selectedAge),
  })
  if (query) params.set('query', query)
  else params.delete('query')

  return params
}
