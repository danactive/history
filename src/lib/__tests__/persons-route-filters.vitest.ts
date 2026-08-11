import { describe, expect, test } from 'vitest'

import {
  buildPersonsRouteSearchParams,
  getAgeFromPersonsRouteSearchParams,
  getQueryFromPersonsRouteSearchParams,
  getPersonFromPersonsRouteSearchParams,
  parsePersonsRouteFilters,
} from '../persons-route-filters'

describe('persons route filters', () => {
  test('parses person and age from a canonical conjunctive query', () => {
    expect(parsePersonsRouteFilters({
      query: 'country:Canada && region:BC && person:"Alice Example" && age:21',
    })).toEqual({
      query: 'country:Canada && region:BC && person:"Alice Example" && age:21',
      selectedAge: 21,
      selectedPerson: 'Alice Example',
    })
  })

  test('returns no selected person or age for an OR expression', () => {
    expect(getQueryFromPersonsRouteSearchParams({ query: 'person:Alice || person:Bob' })).toBe('person:Alice || person:Bob')
    expect(getPersonFromPersonsRouteSearchParams({ query: 'person:Alice || person:Bob' })).toBeNull()
    expect(getAgeFromPersonsRouteSearchParams({ query: 'person:Alice || person:Bob' })).toBeNull()
  })

  test('serializes age and person controls into the canonical query while preserving unrelated params', () => {
    const params = buildPersonsRouteSearchParams('select=alice.jpg&foo=bar', {
      query: 'country:Canada',
      selectedAge: 'unknown',
      selectedPerson: 'Alice',
    })

    expect(params.toString()).toBe('select=alice.jpg&foo=bar&query=country%3ACanada+%26%26+person%3AAlice+%26%26+age%3Aunknown')
  })

  test('removes cleared person and age terms', () => {
    const params = buildPersonsRouteSearchParams(
      'query=country%3ACanada+%26%26+person%3AAlice+%26%26+age%3A21&select=alice.jpg',
      {
        query: 'country:Canada && person:Alice && age:21',
        selectedAge: null,
        selectedPerson: null,
      },
    )

    expect(params.toString()).toBe('query=country%3ACanada&select=alice.jpg')
  })

  test('replaces a single person term when adding an age control', () => {
    const params = buildPersonsRouteSearchParams('query=person%3AAlice', {
      query: 'person:Alice',
      selectedAge: 21,
      selectedPerson: 'Alice',
    })

    expect(params.toString()).toBe('query=person%3AAlice+%26%26+age%3A21')
  })
})
