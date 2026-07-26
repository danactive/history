import { describe, expect, test } from 'vitest'

import {
  buildPersonsRouteSearchParams,
  getAgeFromPersonsRouteSearchParams,
  getKeywordFromPersonsRouteSearchParams,
  getPersonFromPersonsRouteSearchParams,
  parsePersonsRouteFilters,
} from '../persons-route-filters'

describe('persons route filters', () => {
  test('parses keyword, person, age, and visited filters together', () => {
    expect(parsePersonsRouteFilters({
      keyword: '  Alice  ',
      person: ' Alice ',
      age: '21',
      visitedCountry: 'Canada',
      visitedRegion: 'BC',
    })).toEqual({
      keyword: 'Alice',
      selectedAge: 21,
      selectedPerson: 'Alice',
      visitedPlace: { country: 'Canada', region: 'BC' },
    })
  })

  test('normalizes empty and invalid values', () => {
    expect(getKeywordFromPersonsRouteSearchParams({ keyword: '  ' })).toBe('')
    expect(getPersonFromPersonsRouteSearchParams({ person: ['Alice'] })).toBeNull()
    expect(getAgeFromPersonsRouteSearchParams({ age: 'nope' })).toBeNull()
  })

  test('serializes canonical persons route filters while preserving unrelated params', () => {
    const params = buildPersonsRouteSearchParams('select=alice.jpg&foo=bar', {
      keyword: 'Alice',
      selectedAge: 'unknown',
      selectedPerson: 'Alice',
      visitedPlace: { country: 'Canada', region: null },
    })

    expect(params.toString()).toBe('select=alice.jpg&foo=bar&age=unknown&person=Alice&visitedCountry=Canada')
  })

  test('removes cleared canonical params', () => {
    const params = buildPersonsRouteSearchParams(
      'keyword=Alice&age=21&person=Alice&visitedCountry=Canada&visitedRegion=BC&select=alice.jpg',
      {
        keyword: '',
        selectedAge: null,
        selectedPerson: null,
        visitedPlace: null,
      },
    )

    expect(params.toString()).toBe('select=alice.jpg')
  })
})
