import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('../useMapFilter', () => ({
  __esModule: true,
  default: ({ items }: { items: any[] }) => ({
    refImageGallery: { current: null },
    memoryIndex: 0,
    setMemoryIndex: vi.fn(),
    memoryHtml: null,
    viewedList: new Set<string>(),
    keyword: '',
    searchBox: null,
    mapFilterEnabled: false,
    handleToggleMapFilter: vi.fn(),
    handleBoundsChange: vi.fn(),
    itemsToShow: items,
    isClearing: false,
    clearCoordinates: vi.fn(),
  }),
}))

vi.mock('../useMemory', () => ({
  __esModule: true,
  default: () => ({
    memoryHtml: null,
    setViewed: vi.fn(),
  }),
}))

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ServerSideAllItem } from '../../types/common'
import usePersonsFilter from '../usePersonsFilter'

function makeItem(id: string, personName: string, dob: string, photoDate: string): ServerSideAllItem {
  return {
    corpus: 'test-corpus',
    id,
    filename: `${photoDate}-50.jpg`,
    photoDate,
    city: '',
    location: null,
    caption: '',
    description: null,
    search: null,
    persons: [{ full: personName, dob }],
    title: '',
    coordinates: null,
    coordinateAccuracy: 0,
    thumbPath: '',
    photoPath: '',
    mediaPath: '',
    videoPaths: null,
    reference: null,
  }
}

function makeUnknownDobItem(id: string, personName: string, photoDate: string): ServerSideAllItem {
  return {
    corpus: 'test-corpus',
    id,
    filename: `${photoDate}-50.jpg`,
    photoDate,
    city: '',
    location: null,
    caption: '',
    description: null,
    search: null,
    persons: [{ full: personName, dob: null }],
    title: '',
    coordinates: null,
    coordinateAccuracy: 0,
    thumbPath: '',
    photoPath: '',
    mediaPath: '',
    videoPaths: null,
    reference: null,
  }
}

describe('usePersonsFilter URL sync', () => {
  let query = new URLSearchParams()
  const searchParamsMock = {
    get: (key: string) => query.get(key),
    toString: () => query.toString(),
  }
  const replace = vi.fn((url: string) => {
    const q = url.split('?')[1] ?? ''
    query = new URLSearchParams(q)
  })

  beforeEach(() => {
    query = new URLSearchParams()
    replace.mockClear()
    vi.mocked(usePathname).mockReturnValue('/demo/persons')
    vi.mocked(useRouter).mockReturnValue({ replace } as any)
    vi.mocked(useSearchParams).mockImplementation(() => searchParamsMock as any)
  })

  test('reads age/person from URL on load', () => {
    query = new URLSearchParams('age=21&person=Alice')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({ items, indexedKeywords: [] }))
    expect(result.current.selectedAge).toBe(21)
    expect(result.current.selectedPerson).toBe('Alice')
  })

  test('keeps person when age is cleared', () => {
    query = new URLSearchParams('age=21&person=Alice')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const { result } = renderHook(() => usePersonsFilter({ items, indexedKeywords: [] }))

    act(() => {
      result.current.setSelectedAge(null)
    })

    expect(result.current.selectedAge).toBeNull()
    expect(result.current.selectedPerson).toBe('Alice')
    expect(replace).toHaveBeenCalledWith('/demo/persons?person=Alice', { scroll: false })
  })

  test('supports unknown age filter from URL', () => {
    query = new URLSearchParams('age=unknown')
    const items = [makeUnknownDobItem('1', 'Mystery', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({ items, indexedKeywords: [] }))
    expect(result.current.selectedAge).toBe('unknown')
    expect(result.current.ageFiltered).toHaveLength(1)
  })
})

