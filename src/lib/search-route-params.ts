import type { VisitedPlace } from '../types/common'

type SearchParamsLike = {
  get?: (key: string) => string | null
  toString?: () => string
} | null | undefined

export function createSearchRouteParams(searchParams?: SearchParamsLike) {
  const serializedParams = typeof searchParams?.toString === 'function'
    ? searchParams.toString()
    : ''
  const params = serializedParams && serializedParams !== '[object Object]'
    ? new URLSearchParams(serializedParams)
    : new URLSearchParams()

  if (params.size > 0) {
    return params
  }

  ['keyword', 'tag', 'year', 'person', 'select', 'visitedCountry', 'visitedRegion'].forEach((key) => {
    const value = searchParams?.get?.(key)
    if (value) {
      params.set(key, value)
    }
  })

  return params
}

export function buildSearchRoutePath({
  pathname,
  baseSearchParams,
  keyword,
  tag,
  year,
  person,
  select,
  visitedPlace,
}: {
  pathname: string
  baseSearchParams: SearchParamsLike
  keyword: string
  tag?: string | null
  year?: string | null
  person?: string | null
  select?: string | null
  visitedPlace?: VisitedPlace | null
}) {
  const params = createSearchRouteParams(baseSearchParams)

  if (keyword) {
    params.set('keyword', keyword)
  } else {
    params.delete('keyword')
  }

  if (tag !== undefined) {
    if (tag) {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }
  }

  if (year !== undefined) {
    if (year) {
      params.set('year', year)
    } else {
      params.delete('year')
    }
  }

  if (person !== undefined) {
    if (person) {
      params.set('person', person)
    } else {
      params.delete('person')
    }
  }

  if (select) {
    params.set('select', select)
  } else {
    params.delete('select')
  }

  if (visitedPlace === null) {
    params.delete('visitedCountry')
    params.delete('visitedRegion')
  } else if (visitedPlace) {
    params.set('visitedCountry', visitedPlace.country)
    if (visitedPlace.region) {
      params.set('visitedRegion', visitedPlace.region)
    } else {
      params.delete('visitedRegion')
    }
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function buildClearedSearchRoutePath({
  pathname,
  baseSearchParams,
  select,
  extraQueryParamsToClear = [],
}: {
  pathname: string
  baseSearchParams: SearchParamsLike
  select?: string | null
  extraQueryParamsToClear?: string[]
}) {
  const params = createSearchRouteParams(baseSearchParams)
  params.delete('keyword')
  params.delete('tag')
  params.delete('year')
  params.delete('visitedCountry')
  params.delete('visitedRegion')
  extraQueryParamsToClear.forEach((key) => {
    params.delete(key)
  })

  if (select) {
    params.set('select', select)
  } else {
    params.delete('select')
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
