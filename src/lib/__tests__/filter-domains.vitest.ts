import { describe, expect, test } from 'vitest'

import {
  filterSearchOnlyPersonCounts,
  hasPersonLikeCasing,
  isSearchOnlyPersonCandidate,
  isTagKeyword,
  splitIndexedKeywords,
} from '../domains/keywords'
import {
  buildPersonCountsFromItems,
  buildPersonOptions,
  filterPersonsItems,
} from '../domains/persons'
import {
  filterItemsByVisitedPlace,
  filterItemsByVisitedPlaceFromCities,
  getVisitedPlaceFromSearchParams,
} from '../domains/visited'
import { addYearToSearch, getItemYearFromFilename, isYearToken } from '../domains/years'

describe('visited domain', () => {
  test('parses country and region from search params', () => {
    expect(getVisitedPlaceFromSearchParams({ visitedCountry: 'Canada', visitedRegion: 'BC' })).toEqual({
      country: 'Canada',
      region: 'BC',
    })
    expect(getVisitedPlaceFromSearchParams({ visitedCountry: 'Canada' })).toEqual({
      country: 'Canada',
      region: null,
    })
    expect(getVisitedPlaceFromSearchParams({ visitedCountry: '' })).toBeNull()
    expect(getVisitedPlaceFromSearchParams({ visitedCountry: ['Canada'] })).toBeNull()
  })

  test('filters items by exact visited scope', () => {
    const items = [
      { id: '1', visitedPlace: { country: 'Canada', region: 'BC' } },
      { id: '2', visitedPlace: { country: 'Canada', region: 'ON' } },
      { id: '3', visitedPlace: { country: 'USA', region: 'WA' } },
    ]

    expect(filterItemsByVisitedPlace(items, { country: 'Canada', region: 'BC' }).map(item => item.id)).toEqual(['1'])
    expect(filterItemsByVisitedPlace(items, { country: 'Canada', region: null }).map(item => item.id)).toEqual(['1', '2'])
  })

  test('filters city-based items by visited scope without a visitedPlace field', () => {
    const items = [
      { id: '1', city: 'Vancouver, BC, Canada' },
      { id: '2', city: 'Victoria, BC' },
      { id: '3', city: 'Toronto, ON, Canada' },
    ]

    expect(filterItemsByVisitedPlaceFromCities(items, { country: 'Canada', region: 'BC' }).map(item => item.id)).toEqual(['1', '2'])
    expect(filterItemsByVisitedPlaceFromCities(items, { country: 'Canada', region: null }).map(item => item.id)).toEqual(['1', '2', '3'])
  })
})

describe('years domain', () => {
  test('recognizes exact four-digit year tokens', () => {
    expect(isYearToken('2024')).toBe(true)
    expect(isYearToken(' 2024 ')).toBe(true)
    expect(isYearToken('24')).toBe(false)
    expect(isYearToken('2024-07')).toBe(false)
  })

  test('extracts year from photoDate before falling back to filename', () => {
    expect(getItemYearFromFilename({ filename: '1987-01-01-01.jpg', photoDate: null })).toBe('1987')
    expect(getItemYearFromFilename({ filename: '1987-01-01-01.jpg', photoDate: '2024-07-18' })).toBe('2024')
    expect(getItemYearFromFilename({ filename: 'photo.jpg', photoDate: null })).toBe('')
  })

  test('adds years to search strings only when available', () => {
    expect(addYearToSearch('Taylor Example', { filename: '1987-01-01-01.jpg', photoDate: null })).toBe('Taylor Example, 1987')
    expect(addYearToSearch('Taylor Example', { filename: 'photo.jpg', photoDate: null })).toBe('Taylor Example')
  })
})

describe('keywords domain', () => {
  test('recognizes tags by caret suffix and people by casing rules', () => {
    expect(isTagKeyword('concert^')).toBe(true)
    expect(isTagKeyword('concert')).toBe(false)
    expect(hasPersonLikeCasing('Taylor Example')).toBe(true)
    expect(hasPersonLikeCasing('memory')).toBe(false)
  })

  test('filters search-only person candidates using shared token rules', () => {
    expect(isSearchOnlyPersonCandidate('Taylor Example', { reservedValues: ['Example City'] })).toBe(true)
    expect(isSearchOnlyPersonCandidate('concert^')).toBe(false)
    expect(isSearchOnlyPersonCandidate('2024')).toBe(false)
    expect(isSearchOnlyPersonCandidate('Example City', { reservedValues: ['Example City'] })).toBe(false)

    expect(filterSearchOnlyPersonCounts([
      { name: 'Taylor Example', count: 2 },
      { name: 'concert^', count: 2 },
      { name: '2024', count: 1 },
      { name: 'Example City', count: 3 },
    ], { reservedValues: ['Example City'] })).toEqual([
      { name: 'Taylor Example', count: 2 },
    ])
  })

  test('splits indexed keywords into years, tags, and unreserved others', () => {
    const split = splitIndexedKeywords([
      { label: '2024 (2)', value: '2024' },
      { label: 'concert^ (2)', value: 'concert^' },
      { label: 'Taylor Example (2)', value: 'Taylor Example' },
      { label: 'Exampleland (2)', value: 'Exampleland' },
    ], ['Exampleland'])

    expect(split.yearOptions.map(option => option.value)).toEqual(['2024'])
    expect(split.tagOptions.map(option => option.value)).toEqual(['concert^'])
    expect(split.otherOptions.map(option => option.value)).toEqual(['Taylor Example'])
  })
})

describe('persons domain', () => {
  test('builds person counts and options from person-bearing items', () => {
    const counts = buildPersonCountsFromItems([
      { persons: [{ full: 'Taylor Example' }, { full: 'Jordan Sample' }] },
      { persons: [{ full: 'Taylor Example' }] },
      { persons: null },
    ], 10)

    expect(counts).toEqual([
      { name: 'Taylor Example', count: 2 },
      { name: 'Jordan Sample', count: 1 },
    ])
    expect(buildPersonOptions(counts)).toEqual([
      { label: 'Taylor Example (2)', value: 'Taylor Example', count: 2 },
      { label: 'Jordan Sample (1)', value: 'Jordan Sample', count: 1 },
    ])
  })

  test('filters person items by selected person and age', () => {
    const items = [
      {
        id: '1',
        filename: '2021-02-01-01.jpg',
        photoDate: '2021-02-01',
        persons: [{ full: 'Taylor Example', dob: '2000-01-01' }],
      },
      {
        id: '2',
        filename: '2021-02-01-02.jpg',
        photoDate: '2021-02-01',
        persons: [{ full: 'Jordan Sample', dob: null }],
      },
    ] as any

    expect(filterPersonsItems(items, null, 'Taylor Example').map(item => item.id)).toEqual(['1'])
    expect(filterPersonsItems(items, 'unknown', null).map(item => item.id)).toEqual(['2'])
    expect(filterPersonsItems(items, 21, 'Taylor Example').map(item => item.id)).toEqual(['1'])
  })
})
