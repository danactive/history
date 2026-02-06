import { describe, expect, test } from 'vitest'

import { parseDMS, parseLatInput } from '../Fields'

const toDecimal = (degrees: number, minutes: number, seconds: number) => (
  degrees + (minutes / 60) + (seconds / 3600)
)

describe('parseDMS', () => {
  test('parses standard DMS with direction', () => {
    const value = parseDMS('50° 22\' 51.51" N')
    expect(value).not.toBeNull()
    expect(value).toBeCloseTo(toDecimal(50, 22, 51.51), 6)
  })

  test('parses compact DMS without spaces', () => {
    const value = parseDMS('50°22\'51.51"N')
    expect(value).not.toBeNull()
    expect(value).toBeCloseTo(toDecimal(50, 22, 51.51), 6)
  })

  test('parses DMS with spaces and no symbols', () => {
    const value = parseDMS('50 22 51.51 N')
    expect(value).not.toBeNull()
    expect(value).toBeCloseTo(toDecimal(50, 22, 51.51), 6)
  })

  test('negates for south and west', () => {
    const south = parseDMS('12° 30\' 0" S')
    const west = parseDMS('120° 0\' 30" W')
    expect(south).toBeCloseTo(-toDecimal(12, 30, 0), 6)
    expect(west).toBeCloseTo(-toDecimal(120, 0, 30), 6)
  })

  test('parses DMS with prime symbols for lat/lon pair', () => {
    const lat = parseDMS('50°45′42″N')
    const lon = parseDMS('111°29′06″W')
    expect(lat).toBeCloseTo(toDecimal(50, 45, 42), 6)
    expect(lon).toBeCloseTo(-toDecimal(111, 29, 6), 6)
  })

  test('returns null for invalid input', () => {
    expect(parseDMS('not a coordinate')).toBeNull()
  })
})

describe('parseLatInput', () => {
  test('parses comma-delimited decimal lat,lon', () => {
    const geo = parseLatInput('50.75, -111.485', { lat: '', lon: '', accuracy: '3' })
    expect(geo).toEqual({ lat: '50.75', lon: '-111.485', accuracy: '3' })
  })

  test('parses single number latitude and preserves longitude', () => {
    const geo = parseLatInput('12.34', { lat: '0', lon: '99', accuracy: '5' })
    expect(geo).toEqual({ lat: '12.34', lon: '99', accuracy: '5' })
  })

  test('parses DMS lat/lon pair without comma', () => {
    const geo = parseLatInput('50°45′42″N 111°29′06″W', { lat: '', lon: '', accuracy: '' })
    expect(geo).toEqual({
      lat: (50 + (45 / 60) + (42 / 3600)).toString(),
      lon: (-(111 + (29 / 60) + (6 / 3600))).toString(),
      accuracy: '',
    })
  })
})
