import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MapRef } from 'react-map-gl/mapbox'
import useMapQuery from '../useMapQuery'

const nav = vi.hoisted(() => ({ params: new URLSearchParams(), pathname: '/demo/all', replace: vi.fn() }))
vi.mock('next/navigation', () => ({
  useSearchParams: () => nav.params,
  usePathname: () => nav.pathname,
  useRouter: () => ({ replace: nav.replace }),
}))
function setup() {
  let center = { lng: 10, lat: 20 }
  let zoom = 3
  let bounds: [[number, number], [number, number]] = [[5, 15], [15, 25]]
  const jumpTo = vi.fn()
  const fitBounds = vi.fn()
  const map = {
    stop: vi.fn(), jumpTo, fitBounds, getCenter: () => center, getZoom: () => zoom, getBounds: () => ({ toArray: () => bounds }),
  } as unknown as MapRef
  const hook = renderHook(() => useMapQuery())
  act(() => { hook.result.current.attach(map, 3) })
  return {
    ...hook, jumpTo, fitBounds,
    move: (longitude = 50, latitude = 40, nextZoom = 8) => act(() => {
      hook.result.current.onMoveStart()
      center = { lng: longitude, lat: latitude }; zoom = nextZoom
      bounds = [[longitude - 1, latitude - 1], [longitude + 1, latitude + 1]]
      hook.result.current.onMoveEnd()
    }),
  }
}
function url(query: string, pathname = '/demo/all') {
  nav.params = new URLSearchParams(query)
  nav.pathname = pathname
  window.history.replaceState({}, '', `${pathname}?${query}#photos`)
}
beforeEach(() => { vi.useFakeTimers(); nav.replace.mockReset(); url('') })
afterEach(() => { vi.useRealTimers() })

describe('map URL lifecycle', () => {
  it('restores camera over bbox without publishing restoration', () => {
    url('longitude=0&latitude=0&zoom=9&bbox=1,2,3,4')
    const { jumpTo, fitBounds } = setup()
    expect(jumpTo).toHaveBeenLastCalledWith({ center: [0, 0], zoom: 9 })
    expect(fitBounds).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1000))
    expect(nav.replace).not.toHaveBeenCalled()
  })
  it('fits legacy bounds and uses defaults without valid coordinates', () => {
    url('longitude=bad&latitude=0&bbox=1,2,3,4')
    const { fitBounds } = setup()
    expect(fitBounds).toHaveBeenLastCalledWith([[1, 2], [3, 4]], { duration: 0 })
  })
  it('ignores camera-only URLs and all movement while filtering is off', () => {
    url('longitude=90&latitude=10&zoom=5&query=bird')
    const { result, move, jumpTo, fitBounds } = setup()
    const replace = vi.spyOn(window.history, 'replaceState')
    expect(result.current.initialCamera(3)).toBeNull()
    expect(jumpTo).not.toHaveBeenCalled()
    expect(fitBounds).not.toHaveBeenCalled()
    move()
    act(() => vi.advanceTimersByTime(1000))
    expect(nav.replace).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
    replace.mockRestore()
  })
  it('cancels a settled update as soon as movement resumes while filtering', () => {
    url('bbox=1,2,3,4&query=bird&select=one')
    const { result, move, rerender } = setup()
    move()
    act(() => vi.advanceTimersByTime(299))
    expect(nav.replace).not.toHaveBeenCalled()
    act(() => result.current.onMoveStart())
    act(() => vi.advanceTimersByTime(1000))
    expect(nav.replace).not.toHaveBeenCalled()
    move(70, 20, 6)
    act(() => vi.advanceTimersByTime(300))
    const href = nav.replace.mock.lastCall![0]
    expect(new URL(href, window.location.origin).searchParams.get('longitude')).toBe('70')
    expect(href).toContain('query=bird&select=one')
    expect(href).toContain('#photos')
    window.history.replaceState({}, '', href)
    nav.params = new URLSearchParams(window.location.search)
    rerender()
    nav.replace.mockClear()
    move(70, 20, 6)
    act(() => vi.advanceTimersByTime(300))
    expect(nav.replace).not.toHaveBeenCalled()
  })
  it('publishes filtered movement and removes all geographic parameters on disable', () => {
    url('bbox=1,2,3,4&query=bird&longitude=10&latitude=20&zoom=3')
    const { result, move } = setup()
    move()
    act(() => vi.advanceTimersByTime(300))
    const [href, options] = nav.replace.mock.calls[0]
    const params = new URL(href, window.location.origin).searchParams
    expect(params.get('bbox')).toBe('49,39,51,41')
    expect(params.get('longitude')).toBe('50')
    expect(params.get('query')).toBe('bird')
    expect(options).toEqual({ scroll: false })
    move(60)
    act(() => result.current.setFilter(false))
    const cleared = new URL(nav.replace.mock.lastCall![0], window.location.origin).searchParams
    expect(cleared.has('bbox')).toBe(false)
    for (const key of ['longitude', 'latitude', 'zoom']) expect(cleared.has(key)).toBe(false)
    move(80)
    const calls = nav.replace.mock.calls.length
    act(() => vi.advanceTimersByTime(1000))
    expect(nav.replace).toHaveBeenCalledTimes(calls)
  })
  it('returns cleared parameters for Clear all without a competing navigation', () => {
    url('bbox=1,2,3,4&query=bird&longitude=10&latitude=20&zoom=3')
    const { result, move } = setup()
    move(60)
    let params: URLSearchParams
    act(() => { params = result.current.setFilter(false, false) })
    for (const key of ['longitude', 'latitude', 'zoom']) expect(params!.has(key)).toBe(false)
    expect(params!.has('bbox')).toBe(false)
    act(() => vi.advanceTimersByTime(1000))
    expect(nav.replace).not.toHaveBeenCalled()
  })
  it('restores external navigation and cancels stale timers, including popstate before React updates', () => {
    url('bbox=1,2,3,4')
    const { result, move, rerender, jumpTo } = setup()
    move()
    act(() => {
      url('longitude=90&latitude=10&zoom=5&bbox=89,9,91,11')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(jumpTo).toHaveBeenLastCalledWith({ center: [90, 10], zoom: 5 })
    rerender()
    act(() => vi.advanceTimersByTime(1000))
    expect(window.location.search).toContain('longitude=90')
    move()
    act(() => result.current.detach())
    act(() => vi.advanceTimersByTime(1000))
    expect(window.location.search).toContain('longitude=90')
  })
  it('does not replay its own URL acknowledgements or cancel a newer gesture', () => {
    url('bbox=1,2,3,4')
    const { result, move, rerender, jumpTo } = setup()
    move()
    act(() => vi.advanceTimersByTime(300))
    const calls = jumpTo.mock.calls.length
    act(() => result.current.onMoveStart())
    window.history.replaceState({}, '', nav.replace.mock.lastCall![0])
    nav.params = new URLSearchParams(window.location.search)
    rerender()
    expect(jumpTo).toHaveBeenCalledTimes(calls)
    act(() => result.current.onMoveEnd())
    expect(vi.getTimerCount()).toBe(1)
  })
  it('suppresses resize publication', () => {
    url('bbox=1,2,3,4')
    const { result, move } = setup()
    move()
    act(() => vi.advanceTimersByTime(300))
    expect(new URLSearchParams(window.location.search).get('bbox')).toBe('1,2,3,4')
    act(() => { result.current.onMoveStart(); result.current.cancel(); result.current.onMoveEnd() })
    expect(vi.getTimerCount()).toBe(0)
  })
  it('ignores late writes after a route change or unmount', () => {
    url('bbox=1,2,3,4')
    const { move, unmount } = setup()
    move()
    url('query=new', '/demo/today')
    act(() => vi.advanceTimersByTime(300))
    expect(window.location.pathname).toBe('/demo/today')
    expect(window.location.search).not.toContain('longitude')
    move()
    unmount()
    act(() => vi.advanceTimersByTime(300))
    expect(window.location.search).not.toContain('longitude')
  })
})

it('publishes a newer settled gesture after an older server navigation acknowledges', () => {
  url('bbox=1,2,3,4')
  const { move, rerender } = setup()
  move(30)
  act(() => vi.advanceTimersByTime(300))
  const firstHref = nav.replace.mock.lastCall![0]
  move(60)
  act(() => {
    window.history.replaceState({}, '', firstHref)
    nav.params = new URLSearchParams(window.location.search)
  })
  rerender()
  act(() => vi.advanceTimersByTime(300))
  const latest = new URL(nav.replace.mock.lastCall![0], window.location.origin).searchParams
  expect(latest.get('longitude')).toBe('60')
  expect(latest.get('bbox')).toBe('59,39,61,41')
})
