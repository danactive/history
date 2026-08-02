import {
  filterItemsByQuery,
  parseFilterQuery,
  type FilterQueryContext,
  type FilterQueryItem,
} from './filter-query'
import { parseKeywordQuery } from './search-filtering'

type ParsedActiveQuery = {
  mode: 'AND' | 'OR' | null
  tokens: string[]
  isAdvanced: boolean
}

export type ActiveFacetCounts = {
  advancedQueryCount: number | null
  tokenCounts: number[]
}

/**
 * Counts active query facets without changing their expression or route.
 *
 * AND facets are counted cumulatively in their written order. That makes each
 * chip show the scope remaining after it is applied, while OR branches remain
 * independent alternatives.
 */
export function getActiveFacetCounts<ItemType extends FilterQueryItem>({
  items,
  query,
  context,
  parsedQuery,
}: {
  items: ItemType[]
  query: string
  context: FilterQueryContext
  parsedQuery: ParsedActiveQuery
}): ActiveFacetCounts {
  if (parsedQuery.isAdvanced) {
    return {
      advancedQueryCount: filterItemsByQuery(items, parseFilterQuery(query, context)).length,
      tokenCounts: [],
    }
  }

  if (parsedQuery.mode === 'AND') {
    return {
      advancedQueryCount: null,
      tokenCounts: parsedQuery.tokens.map((_, index) => (
        filterItemsByQuery(
          items,
          parseFilterQuery(parsedQuery.tokens.slice(0, index + 1).join(' && '), context),
        ).length
      )),
    }
  }

  return {
    advancedQueryCount: null,
    tokenCounts: parsedQuery.tokens.map(token => (
      filterItemsByQuery(items, parseFilterQuery(token, context)).length
    )),
  }
}

export function getInitialActiveFacetCounts<ItemType extends FilterQueryItem>({
  items,
  query,
  context,
}: {
  items: ItemType[]
  query?: string
  context: FilterQueryContext
}) {
  const normalizedQuery = query ?? ''

  return getActiveFacetCounts({
    items,
    query: normalizedQuery,
    context,
    parsedQuery: parseKeywordQuery(normalizedQuery),
  })
}
