import { renderHook } from '@testing-library/react'
import { useSearchParams, usePathname } from 'next/navigation'
import useSearch from '../../src/hooks/useSearch'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

describe('Query string', () => {
  describe('Router not ready', () => {
    test('Blank', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => (key === 'keyword' ? '' : null),
      });

      (usePathname as jest.Mock).mockReturnValue('/search')

      const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]
      const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

      expect(result.current.filtered).toBe(items)
      expect(result.current.keyword).toBe('')
    })
  })

  describe('Keyword filtering', () => {
    test('First keyword partial', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => (key === 'keyword' ? 'app' : null),
      });

      (usePathname as jest.Mock).mockReturnValue('/search')

      const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]
      const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

      expect(result.current.filtered).toEqual([{ corpus: 'apple' }]) // Only "apple" matches "app"
      expect(result.current.keyword).toBe('app')
    })
  })
})

describe('Router ready', () => {
  test('First keyword partial', () => {
    const keyword = 'app';
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    });

    (usePathname as jest.Mock).mockReturnValue('/search')

    const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[0]])
    expect(result.current.keyword).toBe(keyword)
  })

  test('International', () => {
    const keyword = 'ban';
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    });

    (usePathname as jest.Mock).mockReturnValue('/search')

    const items = [{ corpus: 'apple' }, { corpus: 'bañana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })

  test('Or operator', () => {
    const keyword = 'ban||che';
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    });

    (usePathname as jest.Mock).mockReturnValue('/search')

    const items = [{ corpus: 'apple' }, { corpus: 'bañana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1], items[2]])
    expect(result.current.keyword).toBe(keyword)
  })

  test('And operator', () => {
    const keyword = 'ban&&che';
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'keyword' ? keyword : null),
    });

    (usePathname as jest.Mock).mockReturnValue('/search')

    const items = [{ corpus: 'ban' }, { corpus: 'cherished bañana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch({ items, indexedKeywords: [] }))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })
})
