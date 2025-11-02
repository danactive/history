import React from 'react'
import { renderHook, act } from '@testing-library/react'
import useMapFilter from '../useMapFilter'

// Mock useSearch so filtering is identity (we control items directly)
jest.mock('../useSearch', () => ({
  __esModule: true,
  default: ({ items, setMemoryIndex }: any) => ({
    filtered: items,
    keyword: '',
    searchBox: <div data-testid="search-box" />,
    setVisibleCount: jest.fn(),
  }),
}))

// Minimal Item shape
type TestItem = {
  id: string
  filename: string
  coordinates?: [number, number]
  coordinateAccuracy?: number
  thumbPath?: string
  caption?: string
  album?: string
  gallery?: string
  persons?: { dob?: string; full: string }[]
}

const makeItem = (id: string, coords: [number, number] = [0, 0]): TestItem => ({
  id,
  filename: `${id}.jpg`,
  coordinates: coords,
  thumbPath: `/thumbs/${id}.jpg`,
  caption: `Caption ${id}`,
})

describe('Viewed persistence across map/keyword filtering', () => {
  test('viewedList persists when items change (keyword filter simulation)', () => {
    const itemsA = [makeItem('1'), makeItem('2')]
    const { result, rerender } = renderHook(
      ({ items }) => useMapFilter({ items, indexedKeywords: [] }),
      { initialProps: { items: itemsA } },
    )

    // First item auto-marked viewed by useMemory effect
    expect(result.current.viewedList.has('1')).toBe(true)

    // Manually mark second item
    act(() => {
      result.current.setViewed(1)
    })
    expect(result.current.viewedList.has('2')).toBe(true)

    // Simulate keyword narrowing: only item 2 remains
    const itemsB = [makeItem('2')]
    rerender({ items: itemsB })

    // Item 1 should still be remembered (even though not in filtered list)
    expect(result.current.viewedList.has('1')).toBe(true)
    expect(result.current.viewedList.has('2')).toBe(true)

    // Re-expand items (keyword cleared)
    rerender({ items: itemsA })
    expect(result.current.viewedList.has('1')).toBe(true)
    expect(result.current.viewedList.has('2')).toBe(true)
  })

  test('viewedList unaffected by map filter toggles and bounds changes', () => {
    const items = [
      makeItem('1', [10, 10]),
      makeItem('2', [20, 20]),
      makeItem('3', [30, 30]),
    ]
    const { result } = renderHook(
      ({ items }) => useMapFilter({ items, indexedKeywords: [] }),
      { initialProps: { items } },
    )

    // Auto-mark first item
    expect(result.current.viewedList.has('1')).toBe(true)

    // Mark item 2
    act(() => {
      result.current.setViewed(1)
    })
    expect(result.current.viewedList.has('2')).toBe(true)

    // Enable map filter
    act(() => {
      result.current.handleToggleMapFilter()
    })
    expect(result.current.mapFilterEnabled).toBe(true)

    // Provide bounds that include only item 3 (exclude 1 & 2)
    act(() => {
      result.current.handleBoundsChange([[25, 25], [35, 35]])
    })
    // Current visible itemsToShow should only have id '3'
    expect(result.current.itemsToShow.map(i => i.id)).toEqual(['3'])

    // ViewedList should still contain 1 & 2
    expect(result.current.viewedList.has('1')).toBe(true)
    expect(result.current.viewedList.has('2')).toBe(true)

    // Mark item 3 now
    act(() => {
      result.current.setViewed(0) // index 0 in current filtered (item 3)
    })
    expect(result.current.viewedList.has('3')).toBe(true)

    // Disable map filter
    act(() => {
      result.current.handleToggleMapFilter()
    })
    expect(result.current.mapFilterEnabled).toBe(false)

    // All items visible again
    expect(result.current.itemsToShow.map(i => i.id).sort()).toEqual(['1', '2', '3'])

    // All viewed remain
    expect(['1', '2', '3'].every(id => result.current.viewedList.has(id))).toBe(true)
  })

  test('repeated setViewed calls do not duplicate or clear entries', () => {
    const items = [makeItem('A'), makeItem('B')]
    const { result } = renderHook(
      ({ items }) => useMapFilter({ items, indexedKeywords: [] }),
      { initialProps: { items } },
    )
    // Auto mark first
    expect(result.current.viewedList.size).toBe(1)

    act(() => {
      result.current.setViewed(0) // same first item
      result.current.setViewed(0)
      result.current.setViewed(1) // second item
      result.current.setViewed(1)
    })
    expect(result.current.viewedList.size).toBe(2)
    expect(result.current.viewedList.has('A')).toBe(true)
    expect(result.current.viewedList.has('B')).toBe(true)
  })
})
