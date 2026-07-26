import { describe, expect, test } from 'vitest'

import {
  buildClearedSearchRoutePath,
  buildSearchRoutePath,
  createSearchRouteParams,
} from '../search-route-params'

describe('search route params', () => {
  test('creates params from serialized search params', () => {
    const params = createSearchRouteParams({
      toString: () => 'keyword=Alice&visitedCountry=Canada',
    })

    expect(params.toString()).toBe('keyword=Alice&visitedCountry=Canada')
  })

  test('falls back to get() when toString is not usable', () => {
    const params = createSearchRouteParams({
      toString: () => '[object Object]',
      get: (key) => (key === 'keyword' ? 'Alice' : null),
    })

    expect(params.toString()).toBe('keyword=Alice')
  })

  test('builds search route paths with keyword, select, and visited state', () => {
    const path = buildSearchRoutePath({
      pathname: '/demo/all',
      baseSearchParams: { toString: () => 'foo=bar' },
      keyword: 'Alice',
      select: 'alice.jpg',
      visitedPlace: { country: 'Canada', region: 'BC' },
    })

    expect(path).toBe('/demo/all?foo=bar&keyword=Alice&select=alice.jpg&visitedCountry=Canada&visitedRegion=BC')
  })

  test('clears visited filters while preserving keyword when requested', () => {
    const path = buildSearchRoutePath({
      pathname: '/demo/all',
      baseSearchParams: { toString: () => 'keyword=Alice&visitedCountry=Canada&visitedRegion=BC' },
      keyword: 'Alice',
      select: 'alice.jpg',
      visitedPlace: null,
    })

    expect(path).toBe('/demo/all?keyword=Alice&select=alice.jpg')
  })

  test('builds clear-all paths while preserving unrelated params', () => {
    const path = buildClearedSearchRoutePath({
      pathname: '/demo/persons',
      baseSearchParams: { toString: () => 'keyword=Alice&age=21&person=Alice&foo=bar' },
      select: 'alice.jpg',
      extraQueryParamsToClear: ['age', 'person'],
    })

    expect(path).toBe('/demo/persons?foo=bar&select=alice.jpg')
  })
})
