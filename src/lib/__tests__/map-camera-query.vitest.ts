import { describe, expect, it } from 'vitest'
import { normalizeMapBounds, parseMapCamera, writeMapCamera } from '../map-camera-query'
import { parseMapBounds, serializeMapBounds } from '../map-filter-query'
import { filterItemsByMapBounds } from '../map-filtering'

describe('portable map coordinates', () => {
  it('accepts zero and defaults invalid or missing zoom independently', () => {
    expect(parseMapCamera(new URLSearchParams('longitude=0&latitude=0'), 4)).toEqual({ longitude: 0, latitude: 0, zoom: 4 })
    for (const zoom of ['NaN', '23', '-1', '', '3&zoom=4']) {
      expect(parseMapCamera(new URLSearchParams(`longitude=180&latitude=-90&zoom=${zoom}`), 4)?.zoom).toBe(4)
    }
    expect(parseMapCamera(new URLSearchParams('longitude=-180&latitude=90&zoom=22'), 4)?.zoom).toBe(22)
  })
  it.each([
    'longitude=1', 'zoom=5', 'longitude=&latitude=0', 'longitude=0&latitude=NaN',
    'longitude=181&latitude=0', 'longitude=0&latitude=-91', 'longitude=1&longitude=2&latitude=3',
    'longitude=0x10&latitude=1', 'longitude=Infinity&latitude=0',
  ])('ignores invalid center %s', query => {
    expect(parseMapCamera(new URLSearchParams(query), 4)).toBeNull()
  })
  it('serializes wrapped and rounded values without negative zero', () => {
    const params = new URLSearchParams('query=hello')
    writeMapCamera(params, { longitude: 483.123456789, latitude: -0.00000001, zoom: 12.123456 })
    expect(params.get('longitude')).toBe('123.123457')
    expect(params.get('latitude')).toBe('0')
    expect(params.get('zoom')).toBe('12.123')
    expect(params.get('query')).toBe('hello')
  })
  it.each([
    { input: [[10, 20], [30, 40]], expected: [[10, 20], [30, 40]] },
    { input: [[370, 20], [390, 40]], expected: [[10, 20], [30, 40]] },
    { input: [[170, -95], [190, 95]], expected: [[-180, -90], [180, 90]] },
    { input: [[-300, -50], [300, 50]], expected: [[-180, -50], [180, 50]] },
  ])('normalizes $input for matching local and shared results', ({ input, expected }) => {
    const bounds = normalizeMapBounds(input as [[number, number], [number, number]])
    expect(bounds).toEqual(expected)
    const items = [{ coordinates: [20, 30] as [number, number] }, { coordinates: [-175, 0] as [number, number] }]
    expect(filterItemsByMapBounds(items, true, bounds)).toEqual(filterItemsByMapBounds(items, true, parseMapBounds(serializeMapBounds(bounds))))
  })
})
