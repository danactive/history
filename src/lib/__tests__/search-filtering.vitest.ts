import { describe, expect, test } from 'vitest'

import { filterByKeyword, filterByVisitedPlace, parseKeywordQuery } from '../search-filtering'

const mockItem = { filename: 'test.jpg' }

describe('search filtering', () => {
  test('parses simple AND chains', () => {
    expect(parseKeywordQuery('apple&&banana&&cherry')).toEqual({
      mode: 'AND',
      tokens: ['apple', 'banana', 'cherry'],
      isAdvanced: false,
    })
  })

  test('filters exact indexed tokens using search fields', () => {
    const items = [
      { ...mockItem, corpus: 'Alice near Bob', search: 'Alice, Bob' },
      { ...mockItem, corpus: 'Alicea somewhere else', search: 'Alicea' },
    ]

    expect(filterByKeyword({
      items,
      keyword: 'Alice',
      indexedKeywords: [{ label: 'Alice (1)', value: 'Alice' }],
    })).toEqual([items[0]])
  })

  test('filters year tokens using exact year fields before corpus fallback', () => {
    const items = [
      { corpus: 'Birds, 2024', year: '2024', search: 'Birds, 2024' },
      { corpus: 'Birds, 2023', year: '2023', search: 'Birds, 2023' },
      { corpus: 'Misc 2024 mention', search: 'Misc 2024 mention' },
    ]

    expect(filterByKeyword({ items, keyword: '2024', indexedKeywords: [] })).toEqual([
      items[0],
      items[2],
    ])
  })

  test('filters by visited place using derived city metadata when needed', () => {
    const items = [
      { corpus: 'city walk', city: 'Lisbon, Portugal', filename: '2024-01-01-01.jpg', photoDate: null },
      { corpus: 'other city', city: 'Porto, Portugal', filename: '2024-01-02-01.jpg', photoDate: null },
    ]

    expect(filterByVisitedPlace(items, { country: 'Portugal', region: 'Lisbon' })).toEqual([items[0]])
  })
})
