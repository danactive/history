import { describe, expect, it, test } from 'vitest'

import {
  buildClearedSearchRoutePath,
  buildSearchRoutePath,
  createSearchRouteParams,
} from '../search-route-params'

describe('search route params', () => {
  test('creates params from serialized search params', () => {
    const params = createSearchRouteParams({ toString: () => 'query=country%3ACanada' })

    expect(params.toString()).toBe('query=country%3ACanada')
  })

  test('falls back to get() when toString is not usable', () => {
    const params = createSearchRouteParams({
      toString: () => '[object Object]',
      get: (key) => (key === 'query' ? 'country:Canada' : null),
    })

    expect(params.toString()).toBe('query=country%3ACanada')
  })

  test('builds canonical query paths and clears retired filter params', () => {
    const path = buildSearchRoutePath({
      pathname: '/demo/all',
      baseSearchParams: { toString: () => 'keyword=Alice&tag=best%5E&visitedCountry=Canada&foo=bar&bbox=-123.1%2C49.1%2C-122.9%2C49.3' },
      query: 'country:Canada && tag:best^',
      select: 'alice.jpg',
    })

    expect(path).toBe('/demo/all?foo=bar&bbox=-123.1%2C49.1%2C-122.9%2C49.3&query=country%3ACanada+%26%26+tag%3Abest%5E&select=alice.jpg')
  })

  test('builds clear-all paths while preserving unrelated params', () => {
    const path = buildClearedSearchRoutePath({
      pathname: '/demo/persons',
      baseSearchParams: { toString: () => 'query=country%3ACanada&age=21&bbox=1%2C2%2C3%2C4&foo=bar' },
      select: 'alice.jpg',
      extraQueryParamsToClear: ['age'],
    })

    expect(path).toBe('/demo/persons?foo=bar&select=alice.jpg')
  })
})

it.each(['/demo', '/demo/all', '/demo/sample', '/demo/persons', '/demo/today'])(
  'preserves active camera values during editing and removes them on clear on %s', pathname => {
    const baseSearchParams = new URLSearchParams('longitude=0&latitude=10&zoom=8&bbox=1,2,3,4')
    const edited = buildSearchRoutePath({ pathname, baseSearchParams, query: 'keyword:bird || keyword:tree' })
    const cleared = buildClearedSearchRoutePath({ pathname, baseSearchParams })
    for (const path of [edited]) {
      const url = new URL(path, 'https://example.test')
      expect(url.pathname).toBe(pathname)
      expect(url.searchParams.get('longitude')).toBe('0')
      expect(url.searchParams.get('latitude')).toBe('10')
      expect(url.searchParams.get('zoom')).toBe('8')
    }
    for (const key of ['bbox', 'longitude', 'latitude', 'zoom']) {
      expect(new URL(cleared, 'https://example.test').searchParams.has(key)).toBe(false)
    }
  },
)
