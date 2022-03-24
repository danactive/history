import { renderHook } from '@testing-library/react-hooks'
import { useRouter } from 'next/router'

import useSearch from '../../src/hooks/useSearch'

jest.mock('next/router')

describe('Router not ready', () => {
  test('Blank', () => {
    useRouter.mockImplementation(() => ({
      isReady: false,
      asPath: '',
      query: { keyword: '' },
    }))
    const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch(items))

    expect(result.current.filtered).toBe(items)
    expect(result.current.keyword).toBe('')
  })
  test('First keyword partial', () => {
    useRouter.mockImplementation(() => ({
      isReady: false,
      asPath: '',
      query: { keyword: 'app' },
    }))
    const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch(items))

    expect(result.current.filtered).toBe(items)
    expect(result.current.keyword).toBe('')
  })
})
describe('Router ready', () => {
  test('First keyword partial', () => {
    const keyword = 'app'
    useRouter.mockImplementation(() => ({ isReady: true, asPath: '', query: { keyword } }))
    const items = [{ corpus: 'apple' }, { corpus: 'banana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch(items))

    expect(result.current.filtered).toStrictEqual([items[0]])
    expect(result.current.keyword).toBe(keyword)
  })
  test('International', () => {
    const keyword = 'ban'
    useRouter.mockImplementation(() => ({ isReady: true, asPath: '', query: { keyword } }))
    const items = [{ corpus: 'apple' }, { corpus: 'bañana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch(items))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })
  test('Or operator', () => {
    const keyword = 'ban||che'
    useRouter.mockImplementation(() => ({ isReady: true, asPath: '', query: { keyword } }))
    const items = [{ corpus: 'apple' }, { corpus: 'bañana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch(items))

    expect(result.current.filtered).toStrictEqual([items[1], items[2]])
    expect(result.current.keyword).toBe(keyword)
  })
  test('And operator', () => {
    const keyword = 'ban&&che'
    useRouter.mockImplementation(() => ({ isReady: true, asPath: '', query: { keyword } }))
    const items = [{ corpus: 'ban' }, { corpus: 'cherrished bañana' }, { corpus: 'cherry' }]
    const { result } = renderHook(() => useSearch(items))

    expect(result.current.filtered).toStrictEqual([items[1]])
    expect(result.current.keyword).toBe(keyword)
  })
})
