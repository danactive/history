import React, { useImperativeHandle, useRef } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import type { MapRef } from 'react-map-gl/mapbox'
import useMapQuery from '../../../hooks/useMapQuery'
import SlippyMap from '../index'

const mock = vi.hoisted(() => ({
  props: {} as Record<string, any>, params: new URLSearchParams(), replace: vi.fn(),
  jumpTo: vi.fn(), fitBounds: vi.fn(), ready: vi.fn(), bounds: vi.fn(), toggle: vi.fn(),
  center: { lng: 10, lat: 20 }, zoom: 4,
}))
vi.mock('next/navigation', () => ({
  usePathname: () => '/demo/all', useSearchParams: () => mock.params, useRouter: () => ({ replace: mock.replace }),
}))
vi.mock('react-map-gl/mapbox', () => ({
  default: ({ ref, ...props }: { ref: React.Ref<unknown> }) => {
    mock.props = props
    useImperativeHandle(ref, () => ({
      stop: vi.fn(), jumpTo: mock.jumpTo, fitBounds: mock.fitBounds,
      getCenter: () => mock.center, getZoom: () => mock.zoom,
      getBounds: () => ({ toArray: () => [[5, 15], [15, 25]] }),
    }))
    return <div />
  },
  Source: () => null, Layer: () => null,
}))
function Harness({ enabled = true }: { enabled?: boolean }) {
  const mapRef = useRef<MapRef>(null)
  const mapQuery = useMapQuery()
  return <SlippyMap
    mapRef={mapRef} mapQuery={mapQuery} mapFilterEnabled={enabled}
    clusteredMarkers={{ labels: {}, itemFrequency: {}, itemCount: 0 }}
    onMapReady={mock.ready} onBoundsChange={mock.bounds} onToggleMapFilter={mock.toggle}
  />
}
beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks()
  mock.params = new URLSearchParams('longitude=0&latitude=0&zoom=9&bbox=1,2,3,4')
  window.history.replaceState({}, '', `/demo/all?${mock.params}`)
})
afterEach(() => vi.useRealTimers())

it('restores a camera before readiness and never refits the saved bbox on load or resize', () => {
  render(<Harness />)
  expect(mock.props.initialViewState).toEqual({ longitude: 0, latitude: 0, zoom: 9 })
  act(() => mock.props.onLoad())
  expect(mock.jumpTo).toHaveBeenCalledWith({ center: [0, 0], zoom: 9 })
  expect(mock.fitBounds).not.toHaveBeenCalled()
  expect(mock.ready).toHaveBeenCalledWith(true)
  act(() => { mock.props.onMoveStart(); mock.props.onResize(); mock.props.onMoveEnd(); vi.advanceTimersByTime(300) })
  expect(mock.replace).not.toHaveBeenCalled()
  expect(mock.bounds).not.toHaveBeenCalled()
})
it('publishes user settled bounds and removes geo parameters when disabled', () => {
  render(<Harness />)
  act(() => mock.props.onLoad())
  act(() => { mock.props.onMoveStart(); mock.props.onMoveEnd() })
  expect(mock.bounds).toHaveBeenCalledWith([[5, 15], [15, 25]])
  expect(mock.replace).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(300))
  expect(new URL(mock.replace.mock.lastCall![0], window.location.origin).searchParams.get('bbox')).toBe('5,15,15,25')
  fireEvent.click(screen.getByRole('button', { name: 'Map filter: ON' }))
  const params = new URL(mock.replace.mock.lastCall![0], window.location.origin).searchParams
  expect(params.has('bbox')).toBe(false)
  for (const key of ['longitude', 'latitude', 'zoom']) expect(params.has(key)).toBe(false)
  expect(mock.toggle).toHaveBeenCalledOnce()
})
it('immediately captures bounds when enabling without requiring a gesture', () => {
  mock.params = new URLSearchParams()
  window.history.replaceState({}, '', '/demo/all')
  render(<Harness enabled={false} />)
  act(() => mock.props.onLoad())
  fireEvent.click(screen.getByRole('button', { name: 'Map filter: OFF' }))
  expect(mock.bounds).toHaveBeenCalledWith([[5, 15], [15, 25]])
  expect(new URL(mock.replace.mock.lastCall![0], window.location.origin).searchParams.get('bbox')).toBe('5,15,15,25')
})

it('leaves the URL and camera alone while Map Filter is off', () => {
  mock.params = new URLSearchParams('longitude=0&latitude=0&zoom=9')
  window.history.replaceState({}, '', `/demo/all?${mock.params}`)
  render(<Harness enabled={false} />)
  expect(mock.props.initialViewState).not.toEqual({ longitude: 0, latitude: 0, zoom: 9 })
  act(() => mock.props.onLoad())
  expect(mock.ready).toHaveBeenCalledWith(false)
  expect(mock.jumpTo).not.toHaveBeenCalled()
  act(() => { mock.props.onMoveStart(); mock.props.onMoveEnd(); vi.advanceTimersByTime(1000) })
  expect(mock.replace).not.toHaveBeenCalled()
  expect(mock.bounds).not.toHaveBeenCalled()
})
