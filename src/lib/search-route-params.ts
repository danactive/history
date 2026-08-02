type SearchParamsLike = {
  get?: (key: string) => string | null
  toString?: () => string
} | null | undefined

const retiredFilterKeys = ['keyword', 'tag', 'year', 'person', 'age', 'visitedCountry', 'visitedRegion']

export function createSearchRouteParams(searchParams?: SearchParamsLike) {
  const serializedParams = typeof searchParams?.toString === 'function'
    ? searchParams.toString()
    : ''
  const params = serializedParams && serializedParams !== '[object Object]'
    ? new URLSearchParams(serializedParams)
    : new URLSearchParams()

  if (params.size > 0) return params

  ;['query', 'select'].forEach((key) => {
    const value = searchParams?.get?.(key)
    if (value) params.set(key, value)
  })

  return params
}

export function buildSearchRoutePath({
  pathname,
  baseSearchParams,
  query,
  select,
}: {
  pathname: string
  baseSearchParams: SearchParamsLike
  query: string
  select?: string | null
}) {
  const params = createSearchRouteParams(baseSearchParams)
  retiredFilterKeys.forEach((key) => params.delete(key))

  if (query) params.set('query', query)
  else params.delete('query')

  if (select) params.set('select', select)
  else params.delete('select')

  const serialized = params.toString()
  return serialized ? `${pathname}?${serialized}` : pathname
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
  params.delete('query')
  retiredFilterKeys.forEach((key) => params.delete(key))
  extraQueryParamsToClear.forEach((key) => params.delete(key))

  if (select) params.set('select', select)
  else params.delete('select')

  const serialized = params.toString()
  return serialized ? `${pathname}?${serialized}` : pathname
}
