import { getVisitedPlaceFromSearchParams, type VisitedSearchParams } from '../domains/visited'
import { getMonthDayFromSearchParams, type TodaySearchParams } from '../monthDay'
import {
  getAgeFromSearchParams,
  getPersonFromSearchParams,
  type PersonsSearchParams,
} from '../persons-page'

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

export function parsePersonsRouteSearchParams(searchParams?: PersonsSearchParams) {
  return {
    selectedAge: getAgeFromSearchParams(searchParams),
    selectedPerson: getPersonFromSearchParams(searchParams),
    visitedPlace: getVisitedPlaceFromSearchParams(searchParams),
  }
}

export function parsePersonSearchParams(searchParams?: PersonsSearchParams) {
  return {
    person: getPersonFromSearchParams(searchParams),
  }
}

export type {
  PersonsSearchParams,
  TodaySearchParams,
  VisitedSearchParams,
}
