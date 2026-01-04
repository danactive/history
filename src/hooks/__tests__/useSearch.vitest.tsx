import React from 'react'
import { renderHook, render, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mocks MUST be hoisted before imports
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import useSearch from '../useSearch'

describe('Query string', () => {
  describe('Router not ready', () => {
    it('Blank', () => {
      vi.mocked(useSearchParams).mockReturnValue({
        get: (key: string) => (key === 'keyword' ? '' : null),
      } as any)

      vi.mocked(usePathname).mockReturnValue('/search')

      const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]
      const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

      expect(result.current.filtered).toBe(items)
      expect(result.current.keyword).toBe('')
    })
  })

  describe('Keyword filtering', () => {
    it('First keyword partial', () => {
      vi.mocked(useSearchParams).mockReturnValue({
        get: (key: string) => (key === 'keyword' ? 'app' : null),
      } as any)

      vi.mocked(usePathname).mockReturnValue('/search')

      const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]
      const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

      expect(result.current.filtered).toEqual([{ corpus: 'apple' }]) // Only "apple" matches "app"
      expect(result.current.keyword).toBe('app')
    })
  })
})

describe('Router ready', () => {
  it('First keyword partial', () => {
    const keyword = 'app'
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(usePathname).mockReturnValue('/search')

    const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[0]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('International', () => {
    const keyword = 'ban'
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(usePathname).mockReturnValue('/search')

    const items = [{ corpus: 'apple' }, { corpus: 'bañana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('Or operator', () => {
    const keyword = 'ban||che'
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(usePathname).mockReturnValue('/search')

    const items = [{ corpus: 'apple' }, { corpus: 'bañana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1], items[2]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('And operator', () => {
    const keyword = 'ban&&che'
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(usePathname).mockReturnValue('/search')

    const items = [{ corpus: 'ban' }, { corpus: 'cherished bañana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })
})

describe('Clear button functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Clear button clears input value and keyword', async () => {
    const mockReplace = vi.fn()
    const keyword = 'apple'

    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: mockReplace,
    } as any)

    vi.mocked(usePathname).mockReturnValue('/search')

    const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]

    // Use a wrapper component to access the hook
    function TestComponent() {
      const search = useSearch({ items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    // Verify keyword is displayed in the DOM
    expect(container.textContent).toMatch(/for "apple"/)

    // Find the Clear button by title attribute
    const clearButton = container.querySelector('button[title="Clear search"]') as HTMLButtonElement

    // Mock the search params to return empty after clearing
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? '' : null),
    } as any)

    fireEvent.click(clearButton)

    // Verify router.replace was called
    expect(mockReplace).toHaveBeenCalledWith('/search')

    // Check that the input field value is cleared
    await waitFor(() => {
      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('')
    })

    // Verify the keyword label is gone
    await waitFor(() => {
      expect(container.textContent).not.toMatch(/for "apple"/)
    })
  })

  it('Clear button clears URL, updates search count, and clears input', async () => {
    const mockReplace = vi.fn()
    const keyword = 'ban'

    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: mockReplace,
    } as any)

    vi.mocked(usePathname).mockReturnValue('/gallery/photos')

    const items = [
      { corpus: 'apple' },
      { corpus: 'banana' },
      { corpus: 'cherry' },
      { corpus: 'banana split' },
    ]

    // Use a wrapper component to access the hook and set visible count
    function TestComponent() {
      const search = useSearch({ items, indexedKeywords: [] })

      // Simulate setting visible count based on filtered results
      const { filtered, setVisibleCount } = search
      React.useEffect(() => {
        setVisibleCount(filtered.length)
      }, [filtered, setVisibleCount])

      return <div>{search.searchBox}</div>
    }

    const { container, rerender } = render(<TestComponent />)

    // Wait for the visible count to be updated
    await waitFor(() => {
      expect(container.textContent).toMatch(/Search results 2 of 4/)
    })

    // Verify keyword is displayed
    expect(container.textContent).toMatch(/for "ban"/)

    // Find the Clear button
    const clearButton = container.querySelector('button[title="Clear search"]') as HTMLButtonElement

    // Mock the search params to return empty after clearing
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? '' : null),
    } as any)

    fireEvent.click(clearButton)

    // Verify URL was cleared (router.replace called with path only, no keyword)
    expect(mockReplace).toHaveBeenCalledWith('/gallery/photos')

    // Re-render to reflect the cleared state
    rerender(<TestComponent />)

    // Verify search count is reset to show all items
    await waitFor(() => {
      expect(container.textContent).toMatch(/Search results 4 of 4/)
    })

    // Verify the keyword label is gone
    expect(container.textContent).not.toMatch(/for "ban"/)

    // Verify input field is cleared
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('')
  })
})
