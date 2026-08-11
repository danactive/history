import { describe, expect, test } from 'vitest'

import { parseMapBounds, serializeMapBounds } from '../map-filter-query'

describe('map bounds query', () => {
  test('parses valid southwest and northeast coordinates', () => {
    expect(parseMapBounds('-123.1234567,49.1,-122.9,49.2')).toEqual([
      [-123.1234567, 49.1],
      [-122.9, 49.2],
    ])
  })

  test('rejects malformed, out-of-range, and reversed bounds', () => {
    expect(parseMapBounds('')).toBeNull()
    expect(parseMapBounds('-123,49,-122')).toBeNull()
    expect(parseMapBounds('-181,49,-122,50')).toBeNull()
    expect(parseMapBounds('-122,49,-123,50')).toBeNull()
    expect(parseMapBounds('-123,51,-122,50')).toBeNull()
  })

  test('serializes bounds with stable URL precision', () => {
    expect(serializeMapBounds([
      [-123.1234567, 49.1],
      [-122.9, 49.2],
    ])).toBe('-123.123457,49.1,-122.9,49.2')
  })
})
