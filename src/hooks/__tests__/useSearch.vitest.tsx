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
      <input
        value={inputValue ?? ''}
        onChange={(event) => {
          onInputChange?.(event.target.value, 'input')
          onInputChange?.('', 'reset')
        }}
      />
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

vi.mock('../../components/Link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import Link from '../../components/Link'
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
  const queryTerms = [
    params.visitedCountry ? `country:${params.visitedCountry}` : '',
    params.visitedRegion ? `region:${params.visitedRegion}` : '',
    params.person ? `person:"${params.person}"` : '',
    params.tag ? `tag:${params.tag}` : '',
    params.year ? `year:${params.year}` : '',
    params.keyword ?? '',
  ].filter(Boolean)
  const canonicalParams = params.query ? params : {
    ...params,
    query: queryTerms.length ? queryTerms.join(' && ') : undefined,
  }
  vi.mocked(useSearchParams).mockReturnValue(createSearchParams(canonicalParams) as any)
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
      const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

      expect(result.current.filtered).toBe(items)
      expect(result.current.keyword).toBe('')
    })
  })

  describe('Keyword filtering', () => {
    it('First keyword partial', () => {
      mockNavigation({ params: { keyword: 'app' } })

      const items = [{ ...mockItem, corpus: 'apple' }, { ...mockItem, corpus: 'banana' }, { ...mockItem, corpus: 'cherry' }]
      const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

      expect(result.current.filtered).toEqual([{ ...mockItem, corpus: 'apple' }]) // Only "apple" matches "app"
      expect(result.current.keyword).toBe('app')
    })
  })
})

describe('Router ready', () => {
  it('Initializes input value from URL keyword param', () => {
    const keyword = 'best'
    mockNavigation({ pathname: '/demo/vancouver2025', params: { keyword } })

    const items = [{ ...mockItem, corpus: 'best sunset' }, { ...mockItem, corpus: 'good morning' }, { ...mockItem, corpus: 'best food' }]

    // Use a wrapper component to check the input value
    function TestComponent() {
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    // Verify the input field has the URL keyword value
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('best')

    // Verify keyword is displayed
    expect(container.textContent).toMatch(/for "best"/)
  })

  it('allows overriding the summary label', () => {
    mockNavigation({ pathname: '/demo', params: {} })

    const items = [
      { ...mockItem, corpus: 'summer', filename: 'a.jpg' },
      { ...mockItem, corpus: 'winter', filename: 'b.jpg' },
    ]

    function TestComponent() {
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [], summaryLabel: 'Albums' })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    expect(container.textContent).toMatch(/Albums 2 of 2/)
  })

  it('preserves frequency-first keyword ordering in the search options', () => {
    mockNavigation({ pathname: '/demo', params: {} })

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items: [],
        indexedKeywords: [
          { label: 'Zulu (10)', value: 'Zulu' },
          { label: 'Alpha (3)', value: 'Alpha' },
          { label: 'Beta (1)', value: 'Beta' },
        ],
      })

      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const optionLabels = Array.from(container.querySelectorAll('button[type="button"]')).map((button) => button.textContent)

    expect(optionLabels.slice(0, 3)).toEqual([
      'Zulu (10)',
      'Alpha (3)',
      'Beta (1)',
    ])
  })

  it('First keyword partial', () => {
    const keyword = 'app'
    mockNavigation({ params: { keyword } })

    const items = [{ ...mockItem, corpus: 'apple' }, { ...mockItem, corpus: 'banana' }, { ...mockItem, corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[0]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('International', () => {
    const keyword = 'ban'
    mockNavigation({ params: { keyword } })

    const items = [{ ...mockItem, corpus: 'apple' }, { ...mockItem, corpus: 'bañana' }, { ...mockItem, corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('Or operator', () => {
    const keyword = 'ban||che'
    mockNavigation({ params: { keyword } })

    const items = [{ ...mockItem, corpus: 'apple' }, { ...mockItem, corpus: 'bañana' }, { ...mockItem, corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1], items[2]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('matches gallery albums for a plain year token via the album year field', () => {
    const keyword = '2024'
    mockNavigation({ params: { keyword } })

    const items = [
      { corpus: 'Birds, 2024', year: '2024', search: 'Birds, 2024' },
      { corpus: 'Trips, 2023', year: '2023', search: 'Trips, 2023' },
    ]

    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [], summaryLabel: 'Albums' }))

    expect(result.current.filtered).toStrictEqual([items[0]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('falls back to corpus matching for year tokens when an item does not expose an exact year field', () => {
    const keyword = '2001'
    mockNavigation({ params: { keyword } })

    const items = [
      { corpus: 'Expeditions, 2001-2005', year: '2001-2005', search: 'Expeditions, 2001-2005' },
      { corpus: 'Trips, 1999', year: '1999', search: 'Trips, 1999' },
    ]

    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [], summaryLabel: 'Albums' }))

    expect(result.current.filtered).toStrictEqual([items[0]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('And operator', () => {
    const keyword = 'ban&&che'
    mockNavigation({ params: { keyword } })

    const items = [{ ...mockItem, corpus: 'ban' }, { ...mockItem, corpus: 'cherished bañana' }, { ...mockItem, corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('matches a plain year keyword against the derived item year instead of incidental corpus text', () => {
    const keyword = '2021'
    mockNavigation({ params: { keyword } })

    const items = [
      { ...mockItem, filename: '2021-05-01-01.jpg', photoDate: null, corpus: 'lake trip memories' },
      { ...mockItem, filename: '2020-05-01-01.jpg', photoDate: null, corpus: 'caption mentions 2021 reunion' },
      { ...mockItem, filename: '2022-05-01-01.jpg', photoDate: '2021-08-10', corpus: 'photoDate year should win' },
    ]

    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[0], items[2]])
    expect(result.current.keyword).toBe(keyword)
  })

  it('matches an exact indexed person keyword against exact search tokens instead of broad corpus text', () => {
    const keyword = 'First Last'
    mockNavigation({ params: { keyword } })

    const items = [
      {
        ...mockItem,
        corpus: 'First Last portrait in Kyoto',
        search: 'First Last, Kyoto, Japan',
      },
      {
        ...mockItem,
        corpus: 'Caption by First Last during a reunion',
        search: 'Reunion, Kyoto, Japan',
      },
    ]

    const { result } = renderHook(() => useSearch({
      gallery: 'demo',
      items,
      indexedKeywords: [{ label: 'First Last (1)', value: 'First Last' }],
    }))

    expect(result.current.filtered).toStrictEqual([items[0]])
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

    const { result, rerender } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

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
    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

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
    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

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
    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

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
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [] })
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

    // Use a wrapper component to access the hook directly.
    function TestComponent() {
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [] })
      const { filtered, setVisibleCount, setDisplayedItems } = search
      const initialFiltered = React.useRef(filtered)

      React.useEffect(() => {
        setVisibleCount(filtered.length)
      }, [filtered.length, setVisibleCount])

      React.useEffect(() => {
        setDisplayedItems(initialFiltered.current)
      }, [setDisplayedItems])

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

    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [] }))

    expect(result.current.keyword).toBe('country:Portugal && region:Lisbon')
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
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'Portugal (1)', value: 'Portugal' }],
      })
      return <div>{search.searchBox}</div>
    }

    const { getByText, container } = render(<TestComponent />)
    fireEvent.click(getByText('Lisbon, Portugal (4)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/gallery/all?query=country%3APortugal+%26%26+region%3ALisbon')
  })

  it('does not turn an existing dropdown suggestion into a keyword filter', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo/persons', params: {} })

    const items = [
      { corpus: 'Alice at the park', filename: 'alice.jpg' },
      { corpus: 'Bob at the beach', filename: 'bob.jpg' },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'Alice (1)', value: 'Alice' }],
      })
      return <div>{search.searchBox}</div>
    }

    const { getByText, container } = render(<TestComponent />)

    fireEvent.click(getByText('Alice (1)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).not.toHaveBeenCalledWith('/demo/persons?keyword=Alice')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows the active person in the search input when the persons route is canonicalized without a keyword', () => {
    mockNavigation({ pathname: '/demo/persons', params: {} })

    const items = [
      { corpus: 'Alice at the park', filename: 'alice.jpg' },
      { corpus: 'Bob at the beach', filename: 'bob.jpg' },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'Alice (1)', value: 'Alice' }],
        personDetailsName: 'Alice',
      })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const input = container.querySelector('input') as HTMLInputElement

    expect(input.value).toBe('Alice')
    expect(container.textContent).not.toMatch(/for "Alice"/)
  })

  it('submits the fallback person option as a structured selection instead of recreating a keyword query', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo/persons', params: {} })
    const handleStructuredOptionSubmit = vi.fn(() => true)

    const items = [
      { corpus: 'Alice at the park', filename: 'alice.jpg' },
      { corpus: 'Bob at the beach', filename: 'bob.jpg' },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'Alice (1)', value: 'Alice' }],
        personDetailsName: 'Alice',
        onStructuredOptionSubmit: handleStructuredOptionSubmit,
      })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(handleStructuredOptionSubmit).toHaveBeenCalledWith({ label: 'Alice (1)', value: 'Alice' })
    expect(mockPush).not.toHaveBeenCalledWith('/demo/persons?keyword=Alice')
  })

  it('keeps manual text entry available for keyword filtering', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo/persons', params: {} })

    const items = [
      { corpus: 'Alice at the park', filename: 'alice.jpg' },
      { corpus: 'Bob at the beach', filename: 'bob.jpg' },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'Alice (1)', value: 'Alice' }],
      })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo/persons?query=Alice')
  })

  it('stacks typed text with the active query instead of replacing the existing filter', () => {
    const { push: mockPush } = mockNavigation({
      pathname: '/demo/all',
      params: { query: 'country:Canada' },
    })
    const items = [
      { corpus: 'Canada portrait', filename: 'canada.jpg', city: 'Toronto, Canada' },
    ]

    function TestComponent() {
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'portrait' } })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo/all?query=country%3ACanada+%26%26+portrait')
  })

  it('replaces the active query when the user enters a complete Boolean expression', () => {
    const { push: mockPush } = mockNavigation({
      pathname: '/demo/all',
      params: { query: 'country:Canada' },
    })
    const items = [
      { corpus: 'USA highlight^', filename: 'usa.jpg', city: 'Seattle, USA', search: 'highlight^' },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'highlight^ (1)', value: 'highlight^', filterKind: 'tag' }],
        tagOptions: [{ label: 'highlight^ (1)', value: 'highlight^', filterKind: 'tag' }],
      })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'country:USA && highlight^' } })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo/all?query=country%3AUSA+%26%26+tag%3Ahighlight%5E')
  })

  it('keeps an operator edit when autocomplete emits a programmatic input reset', () => {
    const { push: mockPush } = mockNavigation({
      pathname: '/demo/persons',
      params: { query: 'country:Japan && year:2011' },
    })
    const items = [
      { corpus: 'Japan 2011', filename: 'japan.jpg', city: 'Tokyo, Japan', photoDate: '2011-01-01' },
    ]

    function TestComponent() {
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'country:Japan || year:2011' } })

    expect(input.value).toBe('country:Japan || year:2011')

    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo/persons?query=country%3AJapan+%7C%7C+year%3A2011')
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
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [] })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)

    expect(container.textContent).toContain('Country: Portugal')
    expect(container.textContent).toContain('Region: Lisbon')

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

  it('Clear all removes contextual query params owned by the caller', () => {
    const { replace: mockReplace } = mockNavigation({
      pathname: '/demo/persons',
      params: {
        keyword: 'Alice',
        age: '21',
        person: 'Alice',
      },
    })

    const items = [
      { corpus: 'Alice', filename: 'alice.jpg' },
      { corpus: 'Bob', filename: 'bob.jpg' },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [],
        extraFiltersActive: true,
        extraQueryParamsToClear: ['age', 'person'],
        extraFilterChips: <span>Age: 21</span>,
        onClearExtraFilters: vi.fn(),
      })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const clearButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Clear all') as HTMLButtonElement

    fireEvent.click(clearButton)

    expect(mockReplace).toHaveBeenCalledWith('/demo/persons?select=alice.jpg')
  })

  it('clears a typed compound query without leaving stale route filters', () => {
    const { replace: mockReplace } = mockNavigation({
      pathname: '/gallery/all',
      params: { query: 'country:Portugal && (tag:best^ || tag:highlight^)' },
    })
    const items = [
      { corpus: 'Portugal best', city: 'Lisbon, Portugal', search: 'best^', filename: 'lisbon.jpg', photoDate: null },
      { corpus: 'Portugal highlight', city: 'Porto, Portugal', search: 'highlight^', filename: 'porto.jpg', photoDate: null },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [
          { label: 'best^ (1)', value: 'best^', filterKind: 'tag' },
          { label: 'highlight^ (1)', value: 'highlight^', filterKind: 'tag' },
        ],
        tagOptions: [
          { label: 'best^ (1)', value: 'best^', filterKind: 'tag' },
          { label: 'highlight^ (1)', value: 'highlight^', filterKind: 'tag' },
        ],
      })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const clearButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Clear') as HTMLButtonElement

    fireEvent.click(clearButton)

    expect(mockReplace).toHaveBeenCalledWith('/gallery/all?select=lisbon.jpg')
  })

  it('shows person details alongside trailing details action when a keyword resolves to a person', () => {
    mockNavigation({ pathname: '/demo/sample', params: { keyword: 'missus' } })

    const items = [
      {
        corpus: 'Missus Gingerbread at breakfast',
        filename: '2004-01-04-01.jpg',
        persons: [{ full: 'Missus Gingerbread' }],
        search: 'Missus Gingerbread, breakfast^',
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [],
        trailingAction: <Link href="/demo/sample/details">Album details</Link>,
      })
      return <div>{search.searchBox}</div>
    }

    render(<TestComponent />)

    expect(document.querySelector('a[href="/demo/persons/details?person=Missus+Gingerbread"]')?.textContent).toBe('Person details')
    expect(document.querySelector('a[href="/demo/sample/details"]')?.textContent).toBe('Album details')
  })

  it('owns a person route filter on generic pages and exposes it as an active chip', () => {
    mockNavigation({ pathname: '/demo/all', params: { person: 'Alice' } })

    const items = [
      {
        corpus: 'Alice portrait',
        filename: 'alice.jpg',
        persons: [{ full: 'Alice' }],
        search: 'Alice, portrait',
      },
      {
        corpus: 'Bob portrait',
        filename: 'bob.jpg',
        persons: [{ full: 'Bob' }],
        search: 'Bob, portrait',
      },
    ]

    function TestComponent() {
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [], ownedPersonFilter: true })
      return <div>{search.searchBox}</div>
    }

    const { result } = renderHook(() => useSearch({ gallery: 'demo', items, indexedKeywords: [], ownedPersonFilter: true }))
    render(<TestComponent />)

    expect(result.current.filtered).toEqual([items[0]])
    expect(document.body.textContent).toContain('Person: Alice')
    expect(document.querySelector('a[href="/demo/persons/details?person=Alice"]')?.textContent).toBe('Person details')
  })

  it('clears a generic page person chip without dropping the current selection anchor', () => {
    const { replace: mockReplace } = mockNavigation({ pathname: '/demo/all', params: { person: 'Alice' } })

    const items = [
      {
        corpus: 'Alice portrait',
        filename: 'alice.jpg',
        persons: [{ full: 'Alice' }],
        search: 'Alice, portrait',
      },
    ]

    function TestComponent() {
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [], ownedPersonFilter: true })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const clearPersonButton = container.querySelector('button[title="Clear person filter Alice"]') as HTMLButtonElement

    fireEvent.click(clearPersonButton)

    expect(mockReplace).toHaveBeenCalledWith('/demo/all?select=alice.jpg')
  })

  it('submits an exact typed person name as a person route on generic pages', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo/today', params: {} })

    const items = [
      {
        corpus: 'Alice portrait',
        filename: 'alice.jpg',
        persons: [{ full: 'Alice Example' }],
        search: 'Alice Example, portrait',
      },
      {
        corpus: 'Bob portrait',
        filename: 'bob.jpg',
        persons: [{ full: 'Bob Example' }],
        search: 'Bob Example, portrait',
      },
    ]

    function TestComponent() {
      const search = useSearch({ gallery: 'demo', items, indexedKeywords: [], ownedPersonFilter: true })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'Alice Example' } })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo/today?query=person%3A%22Alice+Example%22')
  })

  it('submits a selected person suggestion as a person route on generic pages', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo/today', params: {} })

    const items = [
      {
        corpus: 'Alice portrait',
        filename: 'alice.jpg',
        persons: [{ full: 'Alice Example' }],
        search: 'Alice Example, portrait',
      },
      {
        corpus: 'Bob portrait',
        filename: 'bob.jpg',
        persons: [{ full: 'Bob Example' }],
        search: 'Bob Example, portrait',
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'Alice Example (1)', value: 'Alice Example' }],
        ownedPersonFilter: true,
      })
      return <div>{search.searchBox}</div>
    }

    const { getByText, container } = render(<TestComponent />)

    fireEvent.click(getByText('Alice Example (1)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo/today?query=person%3A%22Alice+Example%22')
  })

  it('uses server-provided classification when submitting selected suggestions on generic pages', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo/today', params: {} })

    const items = [
      {
        corpus: 'First Middle Last portrait tagged tag^',
        filename: 'classified.jpg',
        search: 'First Middle Last, tag^',
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [
          { label: 'tag^ (1)', value: 'tag^', filterKind: 'tag' },
          { label: '2026 (1)', value: '2026', filterKind: 'year' },
          { label: 'First Middle Last (1)', value: 'First Middle Last', filterKind: 'person' },
        ],
        ownedPersonFilter: true,
      })
      return <div>{search.searchBox}</div>
    }

    const { getByText, container } = render(<TestComponent />)

    fireEvent.click(getByText('tag^ (1)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)
    expect(mockPush).toHaveBeenLastCalledWith('/demo/today?query=tag%3Atag%5E')

    fireEvent.click(getByText('2026 (1)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)
    expect(mockPush).toHaveBeenLastCalledWith('/demo/today?query=tag%3Atag%5E+%26%26+year%3A2026')

    fireEvent.click(getByText('First Middle Last (1)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)
    expect(mockPush).toHaveBeenLastCalledWith('/demo/today?query=tag%3Atag%5E+%26%26+year%3A2026+%26%26+person%3A%22First+Middle+Last%22')
  })

  it('uses server person options as the source of truth for person routing on generic pages', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo/today', params: {} })

    const items = [
      {
        corpus: 'First Middle Last portrait tagged tag^',
        filename: 'classified.jpg',
        search: 'First Middle Last, tag^',
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [
          { label: 'tag^ (1)', value: 'tag^', filterKind: 'tag' },
          { label: 'First Middle Last (1)', value: 'First Middle Last' },
        ],
        personOptions: [
          { label: 'First Middle Last (1)', value: 'First Middle Last', count: 1 },
        ],
        ownedPersonFilter: true,
      })
      return <div>{search.searchBox}</div>
    }

    const { getByText, container } = render(<TestComponent />)

    fireEvent.click(getByText('First Middle Last (1)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo/today?query=person%3A%22First+Middle+Last%22')
  })

  it('uses server tag options as the source of truth for tag routing on generic pages', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo/today', params: {} })

    const items = [
      {
        corpus: 'First Middle Last portrait tagged tag^',
        filename: 'classified.jpg',
        search: 'First Middle Last, tag^',
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [
          { label: 'tag^ (1)', value: 'tag^' },
          { label: 'First Middle Last (1)', value: 'First Middle Last', filterKind: 'person' },
        ],
        tagOptions: [
          { label: 'tag^ (1)', value: 'tag^' },
        ],
        ownedPersonFilter: true,
      })
      return <div>{search.searchBox}</div>
    }

    const { getByText, container } = render(<TestComponent />)

    fireEvent.click(getByText('tag^ (1)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo/today?query=tag%3Atag%5E')
  })

  it('owns a tag route filter on generic pages and exposes it as an active chip', () => {
    mockNavigation({ pathname: '/demo/all', params: { tag: 'tag^' } })

    const items = [
      {
        corpus: 'First Middle Last portrait tagged tag^',
        filename: 'tagged.jpg',
        search: 'First Middle Last, tag^',
      },
      {
        corpus: 'Jordan portrait tagged otherTag^',
        filename: 'other.jpg',
        search: 'Jordan, otherTag^',
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'tag^ (1)', value: 'tag^', filterKind: 'tag' }],
        tagOptions: [{ label: 'tag^ (1)', value: 'tag^', filterKind: 'tag' }],
        ownedPersonFilter: true,
      })
      return <div>{search.searchBox}</div>
    }

    const { result } = renderHook(() => useSearch({
      gallery: 'demo',
      items,
      indexedKeywords: [{ label: 'tag^ (1)', value: 'tag^', filterKind: 'tag' }],
      tagOptions: [{ label: 'tag^ (1)', value: 'tag^', filterKind: 'tag' }],
      ownedPersonFilter: true,
    }))
    render(<TestComponent />)

    expect(result.current.filtered).toEqual([items[0]])
    expect(document.body.textContent).toContain('Tag: tag^')
  })

  it('owns a year route filter on generic pages and exposes it as an active chip', () => {
    mockNavigation({ pathname: '/demo/all', params: { year: '2026' } })

    const items = [
      {
        corpus: 'First Middle Last portrait tagged tag^',
        filename: '2026-01-01-tagged.jpg',
        photoDate: '2026-01-01',
        search: 'First Middle Last, tag^',
      },
      {
        corpus: 'Jordan portrait tagged otherTag^',
        filename: '2025-01-01-other.jpg',
        photoDate: '2025-01-01',
        search: 'Jordan, otherTag^',
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: '2026 (1)', value: '2026', filterKind: 'year' }],
        ownedPersonFilter: true,
      })
      return <div>{search.searchBox}</div>
    }

    const { result } = renderHook(() => useSearch({
      gallery: 'demo',
      items,
      indexedKeywords: [{ label: '2026 (1)', value: '2026', filterKind: 'year' }],
      ownedPersonFilter: true,
    }))
    render(<TestComponent />)

    expect(result.current.filtered).toEqual([items[0]])
    expect(document.body.textContent).toContain('Year: 2026')
  })

  it('submits a selected non-person suggestion as a keyword route on generic pages', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo', params: {} })

    const items = [
      {
        corpus: 'Birds retrospective album',
        filename: 'album-a.jpg',
        search: 'Birds, retrospective',
        year: '2024',
      },
      {
        corpus: 'Travel retrospective album',
        filename: 'album-b.jpg',
        search: 'Travel, retrospective',
        year: '2023',
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'Birds (1)', value: 'Birds' }],
        summaryLabel: 'Albums',
        ownedPersonFilter: true,
      })
      return <div>{search.searchBox}</div>
    }

    const { getByText, container } = render(<TestComponent />)

    fireEvent.click(getByText('Birds (1)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo?query=Birds')
  })

  it('keeps ad-hoc compound tag expressions on the keyword route', () => {
    const { push: mockPush } = mockNavigation({ pathname: '/demo', params: {} })

    const items = [
      {
        corpus: 'best^ highlight^ retrospective album',
        filename: 'album-a.jpg',
        search: 'best^, highlight^',
        year: '2024',
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [{ label: 'best^ (1)', value: 'best^', filterKind: 'tag' }],
        tagOptions: [{ label: 'best^ (1)', value: 'best^', filterKind: 'tag' }],
        summaryLabel: 'Albums',
        ownedPersonFilter: true,
      })
      return <div>{search.searchBox}</div>
    }

    const { container } = render(<TestComponent />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'best^ && highlight^' } })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith('/demo?query=tag%3Abest%5E+%26%26+highlight%5E')
  })

  it('stacks a selected person with an existing country and tag OR expression', () => {
    const { push: mockPush } = mockNavigation({
      pathname: '/demo/all',
      params: { query: 'country:Canada && (tag:best^ || tag:highlight^)' },
    })
    const items = [
      {
        corpus: 'Canada best Alice',
        city: 'Toronto, Canada',
        filename: 'alice.jpg',
        search: 'best^, Alice Example',
        persons: [{ full: 'Alice Example' }],
      },
    ]

    function TestComponent() {
      const search = useSearch({
        gallery: 'demo',
        items,
        indexedKeywords: [
          { label: 'best^ (1)', value: 'best^', filterKind: 'tag' },
          { label: 'highlight^ (1)', value: 'highlight^', filterKind: 'tag' },
          { label: 'Alice Example (1)', value: 'Alice Example', filterKind: 'person' },
        ],
        tagOptions: [
          { label: 'best^ (1)', value: 'best^', filterKind: 'tag' },
          { label: 'highlight^ (1)', value: 'highlight^', filterKind: 'tag' },
        ],
        ownedPersonFilter: true,
      })
      return <div>{search.searchBox}</div>
    }

    const { getByText, container } = render(<TestComponent />)
    fireEvent.click(getByText('Alice Example (1)'))
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(mockPush).toHaveBeenCalledWith(
      '/demo/all?query=country%3ACanada+%26%26+%28tag%3Abest%5E+%7C%7C+tag%3Ahighlight%5E%29+%26%26+person%3A%22Alice+Example%22',
    )
  })

  it('filters generic pages by owned person route using corpus/search fallback when items have no persons array', () => {
    mockNavigation({ pathname: '/demo', params: { person: 'Taylor Example' } })

    const items = [
      {
        corpus: 'Taylor Example retrospective album',
        filename: 'album-a.jpg',
        search: 'Taylor Example, retrospective',
        year: '2024',
      },
      {
        corpus: 'Jordan Sample retrospective album',
        filename: 'album-b.jpg',
        search: 'Jordan Sample, retrospective',
        year: '2023',
      },
    ]

    const { result } = renderHook(() => useSearch({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      summaryLabel: 'Albums',
      ownedPersonFilter: true,
    }))

    expect(result.current.filtered).toEqual([items[0]])
  })
})
