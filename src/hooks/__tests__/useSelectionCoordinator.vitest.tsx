import { createRef } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ImageGalleryRef } from 'react-image-gallery'

import useSelectionCoordinator from '../useSelectionCoordinator'
import type { Item } from '../../types/common'

const items: Item[] = [
  {
    id: 'one', caption: 'One', filename: 'one.jpg', photoDate: null, city: '',
    location: null, description: null, search: null, persons: null, title: 'One',
    coordinates: [-123, 49], coordinateAccuracy: 10, thumbPath: '/one-thumb.jpg',
    photoPath: '/one.jpg', mediaPath: '/one.jpg', videoPaths: null, reference: null,
  },
  {
    id: 'two', caption: 'Two', filename: 'two.jpg', photoDate: null, city: '',
    location: null, description: null, search: null, persons: null, title: 'Two',
    coordinates: [-124, 50], coordinateAccuracy: 10, thumbPath: '/two-thumb.jpg',
    photoPath: '/two.jpg', mediaPath: '/two.jpg', videoPaths: null, reference: null,
  },
]

describe('useSelectionCoordinator', () => {
  it('publishes one ID-based selection before syncing legacy gallery and UI state', () => {
    const refImageGallery = createRef<ImageGalleryRef>()
    const events: string[] = []
    const slideToIndex = vi.fn(() => events.push('gallery'))
    Object.assign(refImageGallery, { current: { getCurrentIndex: () => 0, slideToIndex } })
    const setMemoryIndex = vi.fn(() => events.push('memory'))
    const setViewed = vi.fn(() => events.push('viewed'))
    const { result } = renderHook(() => useSelectionCoordinator({
      items,
      refImageGallery,
      setMemoryIndex,
      setViewed,
    }))
    const listener = vi.fn(() => events.push('observer'))
    result.current.subscribe(listener)

    act(() => result.current.selectIndex(1, { origin: 'thumbnail' }))

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      item: items[1], index: 1, revision: 1, origin: 'thumbnail', cameraIntent: 'follow',
    }))
    expect(slideToIndex).toHaveBeenCalledWith(1)
    expect(setMemoryIndex).toHaveBeenCalledWith(1)
    expect(setViewed).toHaveBeenCalledWith(1)
    expect(events).toEqual(['observer', 'gallery', 'memory', 'viewed'])
  })

  it('retains the selected ID when filtering changes indices', () => {
    const refImageGallery = createRef<ImageGalleryRef>()
    const setMemoryIndex = vi.fn()
    const setViewed = vi.fn()
    const { result, rerender } = renderHook(
      ({ visibleItems }) => useSelectionCoordinator({
        items: visibleItems,
        refImageGallery,
        setMemoryIndex,
        setViewed,
      }),
      { initialProps: { visibleItems: items } },
    )

    act(() => result.current.selectId('two', { origin: 'thumbnail' }))
    rerender({ visibleItems: [items[1]] })

    expect(result.current.getSnapshot()).toEqual(expect.objectContaining({ item: items[1], index: 0 }))
  })
})
