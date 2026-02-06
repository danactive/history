import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import useMapFilter from '../useMapFilter'

// Mock useSearch so filtering is identity
vi.mock('../useSearch', () => ({
  __esModule: true,
  default: ({ items }: any) => ({
    filtered: items,
    keyword: '',
    searchBox: <div data-testid="search-box" />,
    setVisibleCount: vi.fn(),
    setDisplayedItems: vi.fn(),
  }),
}))

import type { ServerSideAllItem } from '../../types/common'

const makeItem = (id: string, coords: [number, number] = [0, 0]): ServerSideAllItem => ({
  id,
  filename: [`${id}.jpg`],
  corpus: 'corpus',
  photoDate: null,
  city: 'City',
  location: null,
  caption: `Caption ${id}`,
  description: null,
  search: null,
  persons: null,
  title: `Title ${id}`,
  coordinates: coords,
  coordinateAccuracy: 20,
  thumbPath: `/thumbs/${id}.jpg`,
  photoPath: `/photos/${id}.jpg`,
  mediaPath: `/photos/${id}.jpg`,
  videoPaths: null,
  reference: null,
  album: 'album',
  gallery: 'demo',
})

describe('Viewed persistence across map/keyword filtering', () => {
  test('viewedList persists when items change', () => {
    const itemsA = [makeItem('1'), makeItem('2')]
    const { result, rerender } = renderHook(
      ({ items }) => useMapFilter({ items, indexedKeywords: [] }),
      { initialProps: { items: itemsA } },
    )
    expect(result.current.viewedList.has('1')).toBe(true)
    act(() => { result.current.setViewed(1) })
    expect(result.current.viewedList.has('2')).toBe(true)
    const itemsB = [makeItem('2')]
    rerender({ items: itemsB })
    expect(result.current.viewedList.has('1')).toBe(true)
    expect(result.current.viewedList.has('2')).toBe(true)
    rerender({ items: itemsA })
    expect(result.current.viewedList.has('1')).toBe(true)
    expect(result.current.viewedList.has('2')).toBe(true)
  })

  test('viewedList unaffected by map filter toggles and bounds changes', () => {
    const items = [makeItem('1', [10, 10]), makeItem('2', [20, 20]), makeItem('3', [30, 30])]
    const { result } = renderHook(
      ({ items }) => useMapFilter({ items, indexedKeywords: [] }),
      { initialProps: { items } },
    )
    expect(result.current.viewedList.has('1')).toBe(true)
    act(() => { result.current.setViewed(1) })
    expect(result.current.viewedList.has('2')).toBe(true)
    act(() => { result.current.handleToggleMapFilter() })
    expect(result.current.mapFilterEnabled).toBe(true)
    act(() => { result.current.handleBoundsChange([[25, 25], [35, 35]]) })
    expect(result.current.itemsToShow.map(i => i.id)).toEqual(['3'])
    expect(result.current.viewedList.has('1')).toBe(true)
    expect(result.current.viewedList.has('2')).toBe(true)
    act(() => { result.current.setViewed(0) })
    expect(result.current.viewedList.has('3')).toBe(true)
    act(() => { result.current.handleToggleMapFilter() })
    expect(result.current.mapFilterEnabled).toBe(false)
    expect(result.current.itemsToShow.map(i => i.id).sort()).toEqual(['1', '2', '3'])
    expect(['1', '2', '3'].every(id => result.current.viewedList.has(id))).toBe(true)
  })

  test('repeated setViewed calls do not duplicate entries', () => {
    const items = [makeItem('A'), makeItem('B')]
    const { result } = renderHook(
      ({ items }) => useMapFilter({ items, indexedKeywords: [] }),
      { initialProps: { items } },
    )
    expect(result.current.viewedList.size).toBe(1)
    act(() => {
      result.current.setViewed(0)
      result.current.setViewed(0)
      result.current.setViewed(1)
      result.current.setViewed(1)
    })
    expect(result.current.viewedList.size).toBe(2)
    expect(result.current.viewedList.has('A')).toBe(true)
    expect(result.current.viewedList.has('B')).toBe(true)
  })
})
