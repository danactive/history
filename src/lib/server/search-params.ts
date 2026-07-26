import { getVisitedPlaceFromSearchParams, type VisitedSearchParams } from '../domains/visited'
import { getMonthDayFromSearchParams, type TodaySearchParams } from '../monthDay'
import {
  parsePersonsRouteFilters,
  type PersonsRouteSearchParams,
} from '../persons-route-filters'

export type TodayRouteSearchParams = TodaySearchParams & VisitedSearchParams

export function parseVisitedSearchParams(searchParams?: VisitedSearchParams) {
  return {
    visitedPlace: getVisitedPlaceFromSearchParams(searchParams),
  }
}

export function parseTodayRouteSearchParams(searchParams?: TodayRouteSearchParams) {
  return {
    monthDay: getMonthDayFromSearchParams(searchParams),
    visitedPlace: getVisitedPlaceFromSearchParams(searchParams),
  }
}

export function parsePersonsRouteSearchParams(searchParams?: PersonsRouteSearchParams) {
  const filters = parsePersonsRouteFilters(searchParams)
  return {
    selectedAge: filters.selectedAge,
    selectedPerson: filters.selectedPerson,
    visitedPlace: filters.visitedPlace,
  }
}

export function parsePersonSearchParams(searchParams?: PersonsRouteSearchParams) {
  const filters = parsePersonsRouteFilters(searchParams)
  return {
    person: filters.selectedPerson,
  }
}

export type {
  PersonsRouteSearchParams as PersonsSearchParams,
  TodaySearchParams,
  VisitedSearchParams,
}
