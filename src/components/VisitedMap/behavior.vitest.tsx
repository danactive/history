import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useBasemap } from './use-basemap'
import { useBoundaries } from './use-boundaries'
import { aboveHorizon, layoutLabels, sameLocation } from './label-layout'
import VisitedMapLayout from './index'
import type { CountryVisit } from '../../lib/visited-core'

vi.mock('next/dynamic', () => ({ default: () => ({ country }: { country: string }) => <div data-testid="country">{country}</div> }))
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('handles cold offline, request failure, reconnect, and the manual basemap preference', () => {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
  const { result } = renderHook(useBasemap)
  expect(result.current.visible).toBe(false)
  act(() => window.dispatchEvent(new Event('online')))
  expect(result.current.visible).toBe(true)
  act(() => result.current.fail())
  expect(result.current.unavailable).toBe(true)
  expect(result.current.visible).toBe(false)
  act(() => window.dispatchEvent(new Event('online')))
  expect(result.current.visible).toBe(true)
  act(() => result.current.toggle())
  act(() => window.dispatchEvent(new Event('offline')))
  act(() => window.dispatchEvent(new Event('online')))
  expect(result.current.visible).toBe(false)
  expect(result.current.enabled).toBe(false)
})

it('retains independent late boundaries, reports one failure, caches successes and aborts on cleanup', async () => {
  const pending = new Map<string, (value: Response) => void>()
  const signals: AbortSignal[] = []
  const fetcher = vi.fn((url: string, options: { signal: AbortSignal }) => {
    signals.push(options.signal)
    return new Promise<Response>(resolve => pending.set(url, resolve))
  })
  vi.stubGlobal('fetch', fetcher)
  const first = renderHook(useBoundaries)
  expect(fetcher).toHaveBeenCalledTimes(8)
  const respond = (name: string, ok = true) => pending.get(`/maps/visited/${name}.geojson`)?.({
    ok, json: async () => ({ type: 'FeatureCollection', features: [], name }),
  } as Response)
  await act(async () => { respond('canada'); respond('usa', false) })
  expect(first.result.current.Canada?.data).toBeDefined()
  expect(first.result.current.USA?.error).toBe(true)
  expect(first.result.current.Japan).toBeUndefined()
  await act(async () => {
    for (const country of ['japan', 'mexico', 'italy', 'turkiye', 'spain', 'dominican-republic']) respond(country)
  })
  expect(first.result.current.Canada?.data).toBeDefined()
  expect(first.result.current.Japan?.data).toBeDefined()
  expect(first.result.current['Dominican Republic']?.data).toBeDefined()
  first.rerender()
  expect(fetcher).toHaveBeenCalledTimes(8)
  first.unmount()
  expect(signals.every(signal => signal.aborted)).toBe(true)
  const second = renderHook(useBoundaries)
  expect(fetcher).toHaveBeenCalledTimes(9) // Only the previously failed country retries.
  expect(second.result.current.Canada?.data).toBeDefined()
})

describe('desktop reading line', () => {
  it('restores, skips unsupported sections, scrolls both ways, and cleans up', async () => {
    let positions: Record<string, number> = { Canada: -500, France: -200, USA: 50, Japan: 900 }
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return { top: positions[this.dataset.visitedCountry ?? ''] ?? 0 } as DOMRect
    })
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0))
    vi.stubGlobal('cancelAnimationFrame', window.clearTimeout)
    const disconnect = vi.fn()
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect = disconnect })
    const countries: CountryVisit[] = Object.keys(positions).map(country => ({
      country, regions: [], years: ['2020'], count: 1, filter: { country, region: '' },
    }))
    const { unmount } = render(<VisitedMapLayout countries={countries}>{countries.map(({ country }) => (
      <a key={country} href={`/?country=${country}`} data-visited-country={country}>{country}</a>
    ))}</VisitedMapLayout>)
    expect(screen.getByTestId('country').textContent).toBe('USA')
    expect(screen.getByRole('link', { name: 'USA' }).getAttribute('aria-current')).toBe('location')
    positions = { Canada: -1000, France: -800, USA: -600, Japan: 50 }
    act(() => window.dispatchEvent(new Event('scroll')))
    await waitFor(() => expect(screen.getByTestId('country').textContent).toBe('Japan'))
    positions = { Canada: -20, France: 80, USA: 500, Japan: 900 }
    act(() => window.dispatchEvent(new Event('pageshow')))
    await waitFor(() => expect(screen.getByTestId('country').textContent).toBe('Canada'))
    expect(screen.getByRole('link', { name: 'Japan' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByRole('link', { name: 'Japan' }).getAttribute('href')).toBe('/?country=Japan')
    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })
  it('omits the panel without a supported country', () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
    render(<VisitedMapLayout countries={[]}>Existing visit list</VisitedMapLayout>)
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.getByText('Existing visit list')).toBeTruthy()
  })
})

it('lays out dense labels deterministically with abbreviations and non-overlapping boxes', () => {
  const candidates = Array.from({ length: 47 }, (_, i) => ({
    id: `JP-${i}`, name: `Prefecture ${i}`, abbreviation: `JP-${i}`, x: 300, y: 200, room: 10, visited: false,
  }))
  const result = layoutLabels(candidates, 700, 550, text => text.length * 6)
  expect(result).toEqual(layoutLabels([...candidates].reverse(), 700, 550, text => text.length * 6))
  expect(result.every(label => label.text === label.abbreviation)).toBe(true)
  for (const [i, a] of result.entries()) for (const b of result.slice(i + 1)) {
    expect(Math.abs(a.left - b.left) >= (a.width + b.width) / 2 + 3 || Math.abs(a.top - b.top) >= 20).toBe(true)
  }
  expect(result.some(label => label.left !== label.x || label.top !== label.y)).toBe(true)
})

it('rejects horizon-occluded locations while handling wrapped dateline coordinates', () => {
  expect(aboveHorizon([0, 0], { lng: 0, lat: 0 }, 10000000)).toBe(true)
  expect(aboveHorizon([180, 0], { lng: 0, lat: 0 }, 10000000)).toBe(false)
  expect(aboveHorizon([70, 0], { lng: 0, lat: 0 }, 10000000)).toBe(false)
  expect(aboveHorizon([70, 0], { lng: 70, lat: 0 }, 10000000)).toBe(true)
  expect(sameLocation({ lng: 181, lat: 20 }, [-179, 20])).toBe(true)
})
