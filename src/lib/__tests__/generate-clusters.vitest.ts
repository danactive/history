import { describe, test, expect } from 'vitest'
import { getLabelForResolution } from '../generate-clusters'
import type { Item } from '../../types/common'

const baseItem = (overrides: Partial<Item> = {}): Item => ({
  id: 'x',
  filename: ['x.jpg'],
  photoDate: '2023-01-01',
  city: '',
  location: '',
  caption: '',
  description: null,
  search: null,
  persons: [],
  title: 't',
  coordinates: [10, 20],
  coordinateAccuracy: 10,
  thumbPath: '/thumb/x.jpg',
  photoPath: '/photo/x.jpg',
  mediaPath: '/photo/x.jpg',
  videoPaths: null,
  reference: null,
  ...overrides,
})

describe('getLabelForResolution', () => {
  test('10km/5km prefer city', () => {
    const item = baseItem({ city: 'CityA', location: 'LocA', caption: 'CapA' })
    expect(getLabelForResolution(item, '10km')).toBe('CityA')
    expect(getLabelForResolution(item, '5km')).toBe('CityA')
  })

  test('1.5km prefers location, falls back to city', () => {
    const withLoc = baseItem({ city: 'CityA', location: 'LocA' })
    expect(getLabelForResolution(withLoc, '1.5km')).toBe('LocA')

    const noLoc = baseItem({ city: 'CityA', location: '' })
    expect(getLabelForResolution(noLoc, '1.5km')).toBe('CityA')
  })

  test('300m/100m prefer location then caption, then city is not used', () => {
    const withLoc = baseItem({ location: 'LocA', caption: 'CapA', city: 'CityA' })
    expect(getLabelForResolution(withLoc, '300m')).toBe('LocA')
    expect(getLabelForResolution(withLoc, '100m')).toBe('LocA')

    const withCaption = baseItem({ location: '', caption: 'CapA', city: 'CityA' })
    expect(getLabelForResolution(withCaption, '300m')).toBe('CapA')
    expect(getLabelForResolution(withCaption, '100m')).toBe('CapA')
  })

  test('handles missing fields gracefully', () => {
    const empty = baseItem({ city: '', location: '', caption: '' })
    expect(getLabelForResolution(empty, '10km')).toBe('')
    expect(getLabelForResolution(empty, '5km')).toBe('')
    expect(getLabelForResolution(empty, '1.5km')).toBe('')
    expect(getLabelForResolution(empty, '300m')).toBe('')
    expect(getLabelForResolution(empty, '100m')).toBe('')
  })

  test('Province, country', () => {
    const empty = baseItem({ city: 'Building, City, Province, Canada', location: null, caption: 'Building' })
    expect(getLabelForResolution(empty, '10km')).toBe('Province, Canada')
    expect(getLabelForResolution(empty, '5km')).toBe('Province, Canada')
    expect(getLabelForResolution(empty, '1.5km')).toBe('Province, Canada')
    expect(getLabelForResolution(empty, '300m')).toBe('Building')
    expect(getLabelForResolution(empty, '100m')).toBe('Building')
  })
})
