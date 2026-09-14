import { getItemYearFromFilename, isYearToken } from './domains/years'
import {
  buildVisitedRegionCountryIndex,
  getVisitedPlace,
  matchesVisitedPlace,
} from './visited-core'
import type { IndexedKeywords, VisitedPlace } from '../types/common'
import { matchCorpus, normalizeSearchValue } from '../utils/search'

export type QueryMode = 'AND' | 'OR' | null
export type ParsedKeywordQuery = {
  mode: QueryMode
  tokens: string[]
  isAdvanced: boolean
}

type SearchableItem = {
  corpus: string
  city?: string
  year?: string | null
  photoDate?: string | null
  search?: string | null
  visitedPlace?: VisitedPlace | null
}

type FilenameItem = SearchableItem & {
  filename: string | string[]
}

export function parseKeywordQuery(rawKeyword: string): ParsedKeywordQuery {
  const keyword = rawKeyword.trim()
  if (!keyword) return { mode: null, tokens: [], isAdvanced: false }

  const operators = keyword.replace(/"(?:\\.|[^"\\])*"/g, value => ' '.repeat(value.length))
  const hasAnd = operators.includes('&&')
  const hasOr = operators.includes('||')
  const hasGrouping = operators.includes('(') || operators.includes(')')
  const splitTerms = (separator: string) => {
    const tokens: string[] = []
    let start = 0
    let end = operators.indexOf(separator)
    while (end !== -1) {
      tokens.push(keyword.slice(start, end).trim())
      start = end + separator.length
      end = operators.indexOf(separator, start)
    }
    tokens.push(keyword.slice(start).trim())
    return tokens.filter(Boolean)
  }

  if (hasGrouping || (hasAnd && hasOr)) {
    return { mode: null, tokens: [keyword], isAdvanced: true }
  }

  if (hasAnd) {
    const tokens = splitTerms('&&')
    return tokens.length > 0
      ? { mode: 'AND', tokens, isAdvanced: false }
      : { mode: null, tokens: [keyword], isAdvanced: true }
  }

  if (hasOr) {
    const tokens = splitTerms('||')
    return tokens.length > 0
      ? { mode: 'OR', tokens, isAdvanced: false }
      : { mode: null, tokens: [keyword], isAdvanced: true }
  }

  return { mode: null, tokens: [keyword], isAdvanced: false }
}

function hasFilename(item: SearchableItem): item is FilenameItem {
  return 'filename' in item && Boolean(item.filename)
}

function hasExactSearchToken(item: SearchableItem, keyword: string) {
  if (!item.search) {
    return false
  }

  const normalizedKeyword = normalizeSearchValue(keyword)
  return item.search
    .split(',')
    .some((token) => normalizeSearchValue(token) === normalizedKeyword)
}

function getExactSearchYear(item: SearchableItem): string {
  if (hasFilename(item)) {
    return getItemYearFromFilename({
      filename: item.filename,
      photoDate: item.photoDate ?? null,
    })
  }

  const year = item.year?.trim() ?? ''
  return isYearToken(year) ? year : ''
}

export function filterByVisitedPlace<ItemType extends SearchableItem>(items: ItemType[], visitedPlace: VisitedPlace | null) {
  if (!visitedPlace) return items

  const regionCountryIndex = buildVisitedRegionCountryIndex(
    items.filter((item): item is ItemType & Required<Pick<SearchableItem, 'city'>> => typeof item.city === 'string'),
  )

  return items.filter((item) => {
    const itemVisitedPlace = item.visitedPlace ?? (typeof item.city === 'string'
      ? getVisitedPlace({ city: item.city }, regionCountryIndex)
      : null)

    return matchesVisitedPlace(itemVisitedPlace, visitedPlace)
  })
}

export function filterByKeyword<ItemType extends SearchableItem>({
  items,
  keyword,
  indexedKeywords = [],
}: {
  items: ItemType[]
  keyword: string
  indexedKeywords?: IndexedKeywords[]
}) {
  if (!keyword) return items

  const parsedKeyword = parseKeywordQuery(keyword)
  const exactIndexedKeywordValues = new Set(
    indexedKeywords.map((option) => normalizeSearchValue(option.value)),
  )

  if (!parsedKeyword.isAdvanced && parsedKeyword.mode === null && parsedKeyword.tokens.length === 1) {
    const [singleToken] = parsedKeyword.tokens
    if (isYearToken(singleToken)) {
      return items.filter((item) => {
        const exactYear = getExactSearchYear(item)
        return exactYear ? exactYear === singleToken : matchCorpus(item.corpus, keyword)
      })
    }

    if (exactIndexedKeywordValues.has(normalizeSearchValue(singleToken))) {
      return items.filter((item) => hasExactSearchToken(item, singleToken))
    }
  }

  return items.filter((item) => matchCorpus(item.corpus, keyword))
}
