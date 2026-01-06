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
  it('Initializes input value from URL keyword param', () => {
    const keyword = 'best'
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
    } as any)

    vi.mocked(usePathname).mockReturnValue('/dan/japan2025_taiwan')

    const items = [{ corpus: 'best sunset' }, { corpus: 'good morning' }, { corpus: 'best food' }]

    // Use a wrapper component to check the input value
    function TestComponent() {
      const search = useSearch({ items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    // Verify the input field has the URL keyword value
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('best')

    // Verify keyword is displayed
    expect(container.textContent).toMatch(/for "best"/)
  })

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
  it('Automatically updates visible count when URL keyword changes', () => {
    // Start with "apple banana" keyword
    const initialKeyword = 'apple banana'
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? initialKeyword : null),
    } as any)

    vi.mocked(usePathname).mockReturnValue('/search')

    const items = [
      { corpus: 'apple banana smoothie' },
      { corpus: 'apple pie with cream' },
      { corpus: 'orange juice and grapes' },
      { corpus: 'cherry tart dessert' },
    ]
    
    const { result, rerender } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    // Initial state: only 1 item matches "apple banana"
    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.keyword).toBe(initialKeyword)

    // Check that searchBox contains the correct count
    const { container } = render(<div>{result.current.searchBox}</div>)
    expect(container.textContent).toMatch(/Search results 1 of 4/)
    expect(container.textContent).toMatch(/for "apple banana"/)

    // Simulate URL change to "orange"
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? 'orange' : null),
    } as any)

    // Trigger re-render
    rerender()

    // Should now filter to 1 item matching "orange"
    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0].corpus).toBe('orange juice and grapes')
    expect(result.current.keyword).toBe('orange')

    // Render again to check the updated searchBox
    const { container: updatedContainer } = render(<div>{result.current.searchBox}</div>)
    expect(updatedContainer.textContent).toMatch(/Search results 1 of 4/)
    expect(updatedContainer.textContent).toMatch(/for "orange"/)
  })
  it('Space-separated words are treated as implicit AND', () => {
    const keyword = 'Moose Jaw'
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(usePathname).mockReturnValue('/search')

    const items = [
      { corpus: 'Moose Jaw, Saskatchewan' },
      { corpus: 'Moose Lake in Wisconsin' },
      { corpus: 'Jaw-dropping scenery' },
      { corpus: 'Elk and deer in the mountains' },
    ]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    // Should match only items containing BOTH "Moose" AND "Jaw"
    expect(result.current.filtered).toStrictEqual([items[0]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('Complex query with parentheses and caret', () => {
    const keyword = 'Apple && Banana && (best^ || highlight^)'
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(usePathname).mockReturnValue('/search')

    const items = [
      { corpus: 'Apple and Banana at the best^ party' },
      { corpus: 'Apple and Bañana highlight^ reel' },
      { corpus: 'Apple only' },
      { corpus: 'Banana only' },
      { corpus: 'best party' },
      { corpus: 'Apple and Banana best party' }, // no caret, shouldn't match
    ]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    // Should match items that have "Apple" AND "Banana" AND ("best^" OR "highlight^")
    // Note: caret is significant, so "best" won't match "best^"
    expect(result.current.filtered).toStrictEqual([items[0], items[1]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('Multiple AND with parentheses OR', () => {
    const keyword = 'photo && (sunset || sunrise)'
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    } as any)

    vi.mocked(usePathname).mockReturnValue('/search')

    const items = [
      { corpus: 'photo of sunset at beach' },
      { corpus: 'photo of sunrise in mountains' },
      { corpus: 'photo of landscape' },
      { corpus: 'beautiful sunset view' },
    ]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    // Should match items that have "photo" AND ("sunset" OR "sunrise")
    expect(result.current.filtered).toStrictEqual([items[0], items[1]])
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
