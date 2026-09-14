import { describe, expect, test } from 'vitest'

import {
  buildPersonsRouteSearchParams,
  hasInvalidPersonsRouteAge,
  getAgeFromPersonsRouteSearchParams,
  getQueryFromPersonsRouteSearchParams,
  getPersonFromPersonsRouteSearchParams,
  parsePersonsRouteFilters,
} from '../persons-route-filters'

describe('persons route filters', () => {
  test('preserves compound expressions when no independent control owns their terms', () => {
    const query = '(person:Alice || person:Bob) && age:21'
    const filters = parsePersonsRouteFilters({ query })
    const params = buildPersonsRouteSearchParams('bbox=0%2C0%2C30%2C30&select=example.jpg', filters)
    expect(params.get('query')).toBe(query)
    expect(params.get('bbox')).toBe('0,0,30,30')
    expect(params.get('select')).toBe('example.jpg')
  })

  test.each(['-1', 'invalid'])('normalizes invalid age %s while retaining a valid person and bounds', (age) => {
    const filters = parsePersonsRouteFilters({ query: `person:Alice && age:${age}` })
    const params = buildPersonsRouteSearchParams('bbox=0%2C0%2C30%2C30', filters)
    expect(params.get('query')).toBe('person:Alice')
    expect(params.get('bbox')).toBe('0,0,30,30')
  })
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

  test('treats age zero as a valid Persons filter', () => {
    expect(parsePersonsRouteFilters({ query: 'person:"Example Person" && age:0' })).toEqual({
      query: 'person:"Example Person" && age:0',
      selectedAge: 0,
      selectedPerson: 'Example Person',
    })
    expect(hasInvalidPersonsRouteAge({ query: 'person:"Example Person" && age:0' })).toBe(false)
    expect(hasInvalidPersonsRouteAge({ query: 'person:"Example Person" && age:21' })).toBe(false)
    expect(hasInvalidPersonsRouteAge({ query: 'person:"Example Person" && age:unknown' })).toBe(false)
    expect(hasInvalidPersonsRouteAge({ query: 'person:"Example Person" && age:-1' })).toBe(true)

    expect(buildPersonsRouteSearchParams('query=person%3A%22Example+Person%22+%26%26+age%3A0&select=example.jpg', {
      query: 'person:"Example Person" && age:0',
      selectedAge: 0,
      selectedPerson: 'Example Person',
    }).toString()).toBe('query=person%3A%22Example+Person%22+%26%26+age%3A0&select=example.jpg')
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
