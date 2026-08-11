import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const useSearchParamsMock = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useSearchParams: useSearchParamsMock,
}))

import useSelectGalleryItemFromUrl from '../useSelectGalleryItemFromUrl'

describe('useSelectGalleryItemFromUrl', () => {
  beforeEach(() => {
    useSearchParamsMock.mockReset()
  })

  test('selects the matching item immediately when present in the current list', () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'select' ? 'two.jpg' : null),
    })

    const slideToIndex = vi.fn()
    const setMemoryIndex = vi.fn()
    const setViewed = vi.fn()

    renderHook(() => useSelectGalleryItemFromUrl({
      items: [{ filename: 'one.jpg' }, { filename: 'two.jpg' }],
      refImageGallery: { current: { getCurrentIndex: () => 0, slideToIndex } },
      setMemoryIndex,
      setViewed,
    }))

    expect(slideToIndex).toHaveBeenCalledWith(1)
    expect(setMemoryIndex).toHaveBeenCalledWith(1)
    expect(setViewed).toHaveBeenCalledWith(1)
  })

  test('defers selection when requested', async () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'select' ? 'two.jpg' : null),
    })

    const slideToIndex = vi.fn()
    const setMemoryIndex = vi.fn()
    const setViewed = vi.fn()

    renderHook(() => useSelectGalleryItemFromUrl({
      items: [{ filename: 'one.jpg' }, { filename: 'two.jpg' }],
      refImageGallery: { current: { getCurrentIndex: () => 0, slideToIndex } },
      setMemoryIndex,
      setViewed,
      defer: true,
    }))

    expect(slideToIndex).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(slideToIndex).toHaveBeenCalledWith(1)
      expect(setMemoryIndex).toHaveBeenCalledWith(1)
      expect(setViewed).toHaveBeenCalledWith(1)
    })
  })

  test('does nothing when the gallery is already at the selected index', () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'select' ? 'two.jpg' : null),
    })

    const slideToIndex = vi.fn()
    const setMemoryIndex = vi.fn()
    const setViewed = vi.fn()

    renderHook(() => useSelectGalleryItemFromUrl({
      items: [{ filename: 'one.jpg' }, { filename: 'two.jpg' }],
      refImageGallery: { current: { getCurrentIndex: () => 1, slideToIndex } },
      setMemoryIndex,
      setViewed,
    }))

    expect(slideToIndex).not.toHaveBeenCalled()
    expect(setMemoryIndex).not.toHaveBeenCalled()
    expect(setViewed).not.toHaveBeenCalled()
  })

  test('does not reapply a URL selection after subsequent gallery state renders', () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'select' ? 'two.jpg' : null),
    })

    const items = [{ filename: 'one.jpg' }, { filename: 'two.jpg' }, { filename: 'three.jpg' }]
    const slideToIndex = vi.fn()
    const setMemoryIndex = vi.fn()
    const setViewed = vi.fn()
    const refImageGallery = { current: { getCurrentIndex: () => 0, slideToIndex } }

    const { rerender } = renderHook(({ renderRevision }) => useSelectGalleryItemFromUrl({
      items,
      refImageGallery,
      setMemoryIndex,
      setViewed: (index) => setViewed(index, renderRevision),
    }), { initialProps: { renderRevision: 0 } })

    expect(slideToIndex).toHaveBeenCalledTimes(1)
    expect(slideToIndex).toHaveBeenCalledWith(1)

    rerender({ renderRevision: 1 })

    expect(slideToIndex).toHaveBeenCalledTimes(1)
    expect(setMemoryIndex).toHaveBeenCalledTimes(1)
    expect(setViewed).toHaveBeenCalledTimes(1)
  })
})
