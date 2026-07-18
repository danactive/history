import React from 'react'
import { renderHook, render, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type SearchParamValues = Record<string, string | null | undefined>

// Mocks MUST be hoisted before imports
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@mui/joy', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  Chip: ({ children }: React.HTMLAttributes<HTMLSpanElement>) => <span>{children}</span>,
  Stack: ({ children }: React.HTMLAttributes<HTMLDivElement>) => <div>{children}</div>,
}))

vi.mock('../../components/ComboBox', () => ({
  __esModule: true,
  default: ({ options, onChange, inputValue, onInputChange }: any) => (
    <div>
      <input value={inputValue ?? ''} onChange={(event) => onInputChange?.(event.target.value)} />
      {options.map((option: any) => (
        <button key={option.label} type="button" onClick={() => onChange(option)}>
          {option.label}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('../useBookmark', () => ({
  __esModule: true,
  default: () => ({
    BookmarkButton: () => null,
  }),
}))

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import useSearch from '../useSearch'

function createSearchParams(values: SearchParamValues = {}) {
  return {
    get: (key: string) => values[key] ?? null,
    toString: () => {
      const params = new URLSearchParams()
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })
      return params.toString()
    },
  }
}

function mockNavigation({
  pathname = '/search',
  params = {},
  push = vi.fn(),
  replace = vi.fn(),
}: {
  pathname?: string
  params?: SearchParamValues
  push?: ReturnType<typeof vi.fn>
  replace?: ReturnType<typeof vi.fn>
} = {}) {
  vi.mocked(useSearchParams).mockReturnValue(createSearchParams(params) as any)
  vi.mocked(useRouter).mockReturnValue({ push, replace } as any)
  vi.mocked(usePathname).mockReturnValue(pathname)

  return { push, replace }
}

beforeEach(() => {
  vi.resetAllMocks()
  mockNavigation()
})

const mockItem = { filename: 'test.jpg' }
describe('Query string', () => {
  describe('Router not ready', () => {
    it('Blank', () => {
      mockNavigation({ params: { keyword: '' } })

      const items = [{ ...mockItem, corpus: 'apple' }, { ...mockItem, corpus: 'banana' }, { ...mockItem, corpus: 'cherry' }]
      const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

      expect(result.current.filtered).toBe(items)
      expect(result.current.keyword).toBe('')
    })
  })

  describe('Keyword filtering', () => {
    it('First keyword partial', () => {
      mockNavigation({ params: { keyword: 'app' } })

      const items = [{ ...mockItem, corpus: 'apple' }, { ...mockItem, corpus: 'banana' }, { ...mockItem, corpus: 'cherry' }]
      const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

      expect(result.current.filtered).toEqual([{ ...mockItem, corpus: 'apple' }]) // Only "apple" matches "app"
      expect(result.current.keyword).toBe('app')
    })
  })
})

describe('Router ready', () => {
  it('Initializes input value from URL keyword param', () => {
    const keyword = 'best'
    mockNavigation({ pathname: '/dan/japan2025_taiwan', params: { keyword } })

    const items = [{ ...mockItem, corpus: 'best sunset' }, { ...mockItem, corpus: 'good morning' }, { ...mockItem, corpus: 'best food' }]

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
    mockNavigation({ params: { keyword } })

    const items = [{ ...mockItem, corpus: 'apple' }, { ...mockItem, corpus: 'banana' }, { ...mockItem, corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[0]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('International', () => {
    const keyword = 'ban'
    mockNavigation({ params: { keyword } })

    const items = [{ ...mockItem, corpus: 'apple' }, { ...mockItem, corpus: 'bañana' }, { ...mockItem, corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('Or operator', () => {
    const keyword = 'ban||che'
    mockNavigation({ params: { keyword } })

    const items = [{ ...mockItem, corpus: 'apple' }, { ...mockItem, corpus: 'bañana' }, { ...mockItem, corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1], items[2]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('And operator', () => {
    const keyword = 'ban&&che'
    mockNavigation({ params: { keyword } })

    const items = [{ ...mockItem, corpus: 'ban' }, { ...mockItem, corpus: 'cherished bañana' }, { ...mockItem, corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })
  it('Automatically updates visible count when URL keyword changes', () => {
    // Start with "apple banana" keyword
    const initialKeyword = 'apple banana'
    mockNavigation({ params: { keyword: initialKeyword } })

    const items = [
      { ...mockItem, corpus: 'apple banana smoothie' },
      { ...mockItem, corpus: 'apple pie with cream' },
      { ...mockItem, corpus: 'orange juice and grapes' },
      { ...mockItem, corpus: 'cherry tart dessert' },
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
    mockNavigation({ params: { keyword: 'orange' } })

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
    mockNavigation({ params: { keyword } })

    const items = [
      { ...mockItem, corpus: 'Moose Jaw, Saskatchewan' },
      { ...mockItem, corpus: 'Moose Lake in Wisconsin' },
      { ...mockItem, corpus: 'Jaw-dropping scenery' },
      { ...mockItem, corpus: 'Elk and deer in the mountains' },
    ]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    // Should match only items containing BOTH "Moose" AND "Jaw"
    expect(result.current.filtered).toStrictEqual([items[0]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('Complex query with parentheses and caret', () => {
    const keyword = 'Apple && Banana && (best^ || highlight^)'
    mockNavigation({ params: { keyword } })

    const items = [
      { ...mockItem, corpus: 'Apple and Banana at the best^ party' },
      { ...mockItem, corpus: 'Apple and Bañana highlight^ reel' },
      { ...mockItem, corpus: 'Apple only' },
      { ...mockItem, corpus: 'Banana only' },
      { ...mockItem, corpus: 'best party' },
      { ...mockItem, corpus: 'Apple and Banana best party' }, // no caret, shouldn't match
    ]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    // Should match items that have "Apple" AND "Banana" AND ("best^" OR "highlight^")
    // Note: caret is significant, so "best" won't match "best^"
    expect(result.current.filtered).toStrictEqual([items[0], items[1]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('Multiple AND with parentheses OR', () => {
    const keyword = 'photo && (sunset || sunrise)'
    mockNavigation({ params: { keyword } })

    const items = [
      { ...mockItem, corpus: 'photo of sunset at beach' },
      { ...mockItem, corpus: 'photo of sunrise in mountains' },
      { ...mockItem, corpus: 'photo of landscape' },
      { ...mockItem, corpus: 'beautiful sunset view' },
    ]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    // Should match items that have "photo" AND ("sunset" OR "sunrise")
    expect(result.current.filtered).toStrictEqual([items[0], items[1]])
    expect(result.current.keyword).toBe(keyword)
  })
})

describe('Clear button functionality', () => {
  it('Clear button clears input value and keyword', async () => {
    const keyword = 'apple'
    const { replace: mockReplace } = mockNavigation({ params: { keyword } })

    const items = [
      { ...mockItem, corpus: 'apple', filename: 'apple.jpg' },
      { ...mockItem, corpus: 'banana', filename: 'banana.jpg' },
      { ...mockItem, corpus: 'cherry', filename: 'cherry.jpg' },
    ]

    // Use a wrapper component to access the hook
    function TestComponent() {
      const search = useSearch({ items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    // Verify keyword is displayed in the DOM
    expect(container.textContent).toMatch(/for "apple"/)

    // Find the Clear button by title attribute
    const clearButton = container.querySelector('button[title="Clear search and view adjacent photos"]') as HTMLButtonElement

    // Mock the search params to return empty after clearing
    mockNavigation({ params: {}, replace: mockReplace })

    fireEvent.click(clearButton)

    // Verify router.replace was called
    expect(mockReplace).toHaveBeenCalledWith('/search?select=apple.jpg')

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
    const keyword = 'ban'
    const { replace: mockReplace } = mockNavigation({ pathname: '/gallery/photos', params: { keyword } })

    const items = [
      { corpus: 'apple', filename: 'apple.jpg' },
      { corpus: 'banana', filename: 'banana.jpg' },
      { corpus: 'cherry', filename: 'cherry.jpg' },
      { corpus: 'banana split', filename: 'banana-split.jpg' },
    ]

    // Use a wrapper component to access the hook and set visible count
    function TestComponent() {
      const search = useSearch({ items, indexedKeywords: [] })

      // Simulate setting visible count and displayed items based on filtered results
      const { filtered, setVisibleCount, setDisplayedItems } = search
      React.useEffect(() => {
        setVisibleCount(filtered.length)
        setDisplayedItems(filtered)
      }, [filtered, setVisibleCount, setDisplayedItems])

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
    const clearButton = container.querySelector('button[title="Clear search and view adjacent photos"]') as HTMLButtonElement

    // Mock the search params to return empty after clearing
    mockNavigation({ pathname: '/gallery/photos', params: {}, replace: mockReplace })

    fireEvent.click(clearButton)

    // Verify URL was cleared (router.replace called with path only, no keyword)
    expect(mockReplace).toHaveBeenCalledWith('/gallery/photos?select=banana.jpg')

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

  it('filters items from visited query params without using a keyword', () => {
    mockNavigation({ params: { visitedCountry: 'Portugal', visitedRegion: 'Lisbon' } })

    const items = [
      { corpus: 'city walk', city: 'Lisbon, Portugal', filename: '2024-01-01-01.jpg', photoDate: null },
      { corpus: 'other city', city: 'Porto, Portugal', filename: '2024-01-02-01.jpg', photoDate: null },
    ]

    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.keyword).toBe('')
    expect(result.current.filtered).toEqual([items[0]])
  })

  it('writes visited query params when a geography option is selected', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/gallery/all', params: {} })

    const items = [
      { corpus: 'Portugal', city: 'Lisbon, Portugal', filename: '2024-01-01-01.jpg', photoDate: null },
      { corpus: 'Portugal', city: 'Lisbon, Portugal', filename: '2024-01-02-01.jpg', photoDate: null },
      { corpus: 'Portugal', city: 'Lisbon, Portugal', filename: '2024-01-03-01.jpg', photoDate: null },
      { corpus: 'Portugal', city: 'Lisbon, Portugal', filename: '2024-01-04-01.jpg', photoDate: null },
    ]

    function TestComponent() {
      const search = useSearch({
        items,
        indexedKeywords: [{ label: 'Portugal (1)', value: 'Portugal' }],
      })
      return <div>{search.searchBox}</div>
    }

    const { getByText, container } = render(<TestComponent />)
    fireEvent.click(getByText('Lisbon, Portugal (4)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/gallery/all?visitedCountry=Portugal&visitedRegion=Lisbon')
  })

  it('shows Clear for a visited filter and clears visited params while keeping the selected media in place', async () => {
    const { replace: mockReplace } = mockNavigation({
      pathname: '/gallery/all',
      params: { visitedCountry: 'Portugal', visitedRegion: 'Lisbon' },
    })

    const items = [
      { corpus: 'Portugal', city: 'Lisbon, Portugal', filename: 'lisbon.jpg', photoDate: null },
      { corpus: 'Portugal', city: 'Porto, Portugal', filename: 'porto.jpg', photoDate: null },
    ]

    function TestComponent() {
      const search = useSearch({ items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    expect(container.textContent).toContain('Lisbon, Portugal')

    const clearButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Clear') as HTMLButtonElement
    expect(clearButton).toBeTruthy()

    mockNavigation({ pathname: '/gallery/all', params: {}, replace: mockReplace })

    fireEvent.click(clearButton)

    expect(mockReplace).toHaveBeenCalledWith('/gallery/all?select=lisbon.jpg')

    await waitFor(() => {
      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  it('clearing the visited chip preserves the keyword query and selected media', async () => {
    const { replace: mockReplace } = mockNavigation({
      pathname: '/dan/all',
      params: {
        visitedCountry: 'Uzbekistan',
        visitedRegion: 'Tashkent to Andijan',
        keyword: 'Harpy eagle',
      },
    })

    const items = [
      { corpus: 'Harpy eagle in Uzbekistan', city: 'Tashkent to Andijan, Uzbekistan', filename: 'harpy-eagle.jpg', photoDate: null },
      { corpus: 'Harpy eagle elsewhere', city: 'Lima, Peru', filename: 'other.jpg', photoDate: null },
    ]

    function TestComponent() {
      const search = useSearch({ items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    const visitedClearButton = container.querySelector('button[title="Clear visited filter Tashkent to Andijan, Uzbekistan"]') as HTMLButtonElement
    expect(visitedClearButton).toBeTruthy()

    mockNavigation({
      pathname: '/dan/all',
      params: { keyword: 'Harpy eagle' },
      replace: mockReplace,
    })

    fireEvent.click(visitedClearButton)

    expect(mockReplace).toHaveBeenCalledWith('/dan/all?keyword=Harpy+eagle&select=harpy-eagle.jpg')

    await waitFor(() => {
      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('Harpy eagle')
    })

    expect(container.textContent).toMatch(/for "Harpy eagle"/)
  })

  it('clearing the visited chip with zero search results does not crash and clears visited params', () => {
    const { replace: mockReplace } = mockNavigation({
      pathname: '/gallery/all',
      params: {
        visitedCountry: 'Portugal',
        visitedRegion: 'Lisbon',
        keyword: 'nomatch',
      },
    })

    const items = [
      { corpus: 'Portugal', city: 'Lisbon, Portugal', filename: 'lisbon.jpg', photoDate: null },
      { corpus: 'Portugal', city: 'Porto, Portugal', filename: 'porto.jpg', photoDate: null },
    ]

    function TestComponent() {
      const search = useSearch({ items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    expect(container.textContent).toMatch(/Search results 0 of 2/)

    const visitedClearButton = container.querySelector('button[title="Clear visited filter Lisbon, Portugal"]') as HTMLButtonElement
    expect(visitedClearButton).toBeTruthy()

    mockNavigation({
      pathname: '/gallery/all',
      params: { keyword: 'nomatch' },
      replace: mockReplace,
    })

    fireEvent.click(visitedClearButton)

    expect(mockReplace).toHaveBeenCalledWith('/gallery/all?keyword=nomatch&select=lisbon.jpg')
  })
})
