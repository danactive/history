import { renderHook, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import useMapFilter from '../useMapFilter'
import useMemory from '../useMemory'
import { filterItemsByMapBounds } from '../../lib/map-filtering'

const useSearchMock = vi.hoisted(() => vi.fn())
const setDisplayedItemsMock = vi.hoisted(() => vi.fn())
const navigationMock = vi.hoisted(() => ({
  pathname: '/demo/all',
  searchParams: new URLSearchParams(),
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigationMock.pathname,
  useRouter: () => ({ replace: navigationMock.replace }),
  useSearchParams: () => navigationMock.searchParams,
}))

// Mock useSearch so tests can control filtered results and inspect callbacks.
vi.mock('../useSearch', () => ({
  __esModule: true,
  default: useSearchMock,
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
  visitedPlace: null,
})

describe('Viewed persistence across map/keyword filtering', () => {
  beforeEach(() => {
    navigationMock.pathname = '/demo/all'
    navigationMock.searchParams = new URLSearchParams()
    navigationMock.replace.mockReset()
    setDisplayedItemsMock.mockReset()
    useSearchMock.mockImplementation(({ items, mapFilterEnabled, mapBounds }: any) => ({
      filtered: items,
      visibleItems: filterItemsByMapBounds(items, mapFilterEnabled, mapBounds),
      keyword: '',
      searchBox: <div data-testid="search-box" />,
      setDisplayedItems: setDisplayedItemsMock,
    }))
  })

  test('viewedList persists when items change', () => {
    const itemsA = [makeItem('1'), makeItem('2')]
    const { result, rerender } = renderHook(
      ({ items }) => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }),
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
      ({ items }) => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }),
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

  test('restores an enabled map filter from a GeoJSON bbox URL parameter', () => {
    navigationMock.searchParams = new URLSearchParams('query=tag%3Abest%5E&bbox=15%2C15%2C25%2C25')
    const items = [makeItem('1', [10, 10]), makeItem('2', [20, 20]), makeItem('3', [30, 30])]

    const { result } = renderHook(() => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    expect(result.current.mapFilterEnabled).toBe(true)
    expect(result.current.mapBounds).toEqual([[15, 15], [25, 25]])
    expect(result.current.itemsToShow.map(item => item.id)).toEqual(['2'])
    expect(navigationMock.replace).not.toHaveBeenCalled()
  })

  test('keeps map movement out of router navigation', () => {
    navigationMock.searchParams = new URLSearchParams('query=tag%3Abest%5E&select=two.jpg')
    const items = [makeItem('1', [10, 10]), makeItem('2', [20, 20])]
    const { result } = renderHook(() => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    act(() => { result.current.handleToggleMapFilter() })
    act(() => { result.current.handleBoundsChange([[14, 14], [24, 24]]) })
    act(() => { result.current.handleBoundsChange([[15.1234567, 15], [25, 25]]) })

    expect(result.current.mapBounds).toEqual([[15.1234567, 15], [25, 25]])
    expect(navigationMock.replace).not.toHaveBeenCalled()
  })

  test('repeated setViewed calls do not duplicate entries', () => {
    const items = [makeItem('A'), makeItem('B')]
    const { result } = renderHook(
      ({ items }) => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }),
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

  test('selectById uses the visible map-filtered list when possible', () => {
    const items = [makeItem('1', [10, 10]), makeItem('2', [20, 20]), makeItem('3', [30, 30])]
    const { result } = renderHook(
      ({ items }) => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }),
      { initialProps: { items } },
    )

    act(() => { result.current.handleToggleMapFilter() })
    act(() => { result.current.handleBoundsChange([[25, 25], [35, 35]]) })
    act(() => { result.current.selectById('3') })

    expect(result.current.memoryIndex).toBe(0)
    expect(result.current.itemsToShow.map(i => i.id)).toEqual(['3'])
  })

  test('selectById falls back to the filtered list when the item is outside map bounds', () => {
    const items = [makeItem('1', [10, 10]), makeItem('2', [20, 20]), makeItem('3', [30, 30])]
    const { result } = renderHook(
      ({ items }) => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }),
      { initialProps: { items } },
    )

    act(() => { result.current.handleToggleMapFilter() })
    act(() => { result.current.handleBoundsChange([[25, 25], [35, 35]]) })
    act(() => { result.current.selectById('2') })

    expect(result.current.memoryIndex).toBe(1)
    expect(result.current.itemsToShow.map(i => i.id)).toEqual(['3'])
  })

  test('onClearMapFilter disables map filtering and preserves clear coordinates', async () => {
    navigationMock.searchParams = new URLSearchParams('query=tag%3Abest%5E&bbox=15%2C15%2C25%2C25')
    const items = [makeItem('1', [10, 10]), makeItem('2', [20, 20])]
    let latestArgs: any
    useSearchMock.mockImplementation((args: any) => {
      latestArgs = args
      return {
        filtered: args.items,
        visibleItems: filterItemsByMapBounds(args.items, args.mapFilterEnabled, args.mapBounds),
        keyword: '',
        searchBox: <div data-testid="search-box" />,
        setDisplayedItems: setDisplayedItemsMock,
      }
    })

    const { result } = renderHook(
      ({ items }) => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }),
      { initialProps: { items } },
    )

    act(() => { result.current.handleToggleMapFilter() })
    act(() => { latestArgs.onClearMapFilter?.([123, 45]) })

    expect(result.current.mapFilterEnabled).toBe(false)
    expect(result.current.clearCoordinates).toEqual([123, 45])
    expect(result.current.isClearing).toBe(true)
    expect(navigationMock.replace).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(result.current.isClearing).toBe(false)
      expect(result.current.clearCoordinates).toBeNull()
    })
  })

  test('derives itemsToShow from the map-filtered search result without a synchronization effect', () => {
    const items = [makeItem('1', [10, 10]), makeItem('2', [20, 20]), makeItem('3', [30, 30])]
    const { result } = renderHook(
      ({ items }) => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }),
      { initialProps: { items } },
    )

    expect(result.current.itemsToShow).toEqual(items)
    expect(setDisplayedItemsMock).not.toHaveBeenCalled()

    act(() => { result.current.handleToggleMapFilter() })
    act(() => { result.current.handleBoundsChange([[15, 15], [25, 25]]) })

    expect(result.current.itemsToShow).toEqual([items[1]])
    expect(setDisplayedItemsMock).not.toHaveBeenCalled()
  })

  test('passes the photo summary label into useSearch by default', () => {
    const items = [makeItem('1')]

    renderHook(() => useMapFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    expect(useSearchMock).toHaveBeenCalledWith(expect.objectContaining({
      summaryLabel: 'Photos',
    }))
  })

  test('replaces stale memory details when autoInitialView is disabled and the current item is filtered out', () => {
    const itemsA = [makeItem('1'), makeItem('2')]
    const itemsB = [makeItem('2')]
    const refImageGallery = { current: { getCurrentIndex: () => 0 } }

    const { result, rerender } = renderHook(
      ({ items }) => useMemory(items, refImageGallery as any, { autoInitialView: false }),
      { initialProps: { items: itemsA } },
    )

    act(() => {
      result.current.setViewed(0)
    })

    rerender({ items: itemsB })

    expect(result.current.memoryHtml?.props.children[0].props.children).toBe('Title 2')
    expect(result.current.memoryHtml?.props.children[2].props.children).toBe('2.jpg')
  })
})
