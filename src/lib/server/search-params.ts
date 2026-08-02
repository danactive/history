import { getMonthDayFromSearchParams, type TodaySearchParams } from '../monthDay'
import {
  parsePersonsRouteFilters,
  type PersonsRouteSearchParams,
} from '../persons-route-filters'

export type TodayRouteSearchParams = TodaySearchParams
/**
 * Routes may receive arbitrary query-string keys. Only `query` is consumed by
 * the canonical search system; other keys are intentionally ignored.
 */
export type QuerySearchParams = Record<string, string | string[] | undefined> & {
  query?: string | string[]
}
export type PersonDetailsSearchParams = {
  person?: string | string[]
}

export function getQueryFromSearchParams(searchParams?: QuerySearchParams) {
  return typeof searchParams?.query === 'string' ? searchParams.query.trim() : ''
}

export function parseTodayRouteSearchParams(searchParams?: TodayRouteSearchParams) {
  return {
    monthDay: getMonthDayFromSearchParams(searchParams),
  }
}

export function parsePersonsRouteSearchParams(searchParams?: PersonsRouteSearchParams) {
  const filters = parsePersonsRouteFilters(searchParams)
  return {
    selectedAge: filters.selectedAge,
    selectedPerson: filters.selectedPerson,
  }
}

export function parsePersonSearchParams(searchParams?: PersonDetailsSearchParams) {
  return {
    person: typeof searchParams?.person === 'string' ? searchParams.person.trim() || null : null,
  }
}

export type {
  PersonsRouteSearchParams as PersonsSearchParams,
  TodaySearchParams,
}
