import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { MapRef } from 'react-map-gl/mapbox'
import RegionLabels from './labels'
import type { RegionCollection } from './regions'

afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('removes hidden labels and focus targets, restores them on pan, and connects leaders to fixed anchors', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    measureText: (text: string) => ({ width: text.length * 6 }),
  } as CanvasRenderingContext2D)
  let center = { lng: 0, lat: 0 }
  let update = () => {}
  const off = vi.fn()
  const canvas = document.createElement('div')
  const wheel = vi.fn()
  const doubleClick = vi.fn()
  canvas.addEventListener('wheel', wheel)
  canvas.addEventListener('dblclick', doubleClick)
  const map = {
    getCanvasContainer: () => canvas,
    getContainer: () => ({ clientWidth: 700, clientHeight: 550 }),
    getCenter: () => center,
    getFreeCameraOptions: () => ({ position: { toAltitude: () => 10000000 } }),
    project: () => ({ x: 300, y: 200 }),
    unproject: () => ({ lng: 0, lat: 0 }),
    isPointOnSurface: () => true,
    getMap: () => ({ on: (_event: string, callback: () => void) => { update = callback }, off }),
  } as unknown as MapRef
  const features = ['First Region', 'Second Region'].map((name, i) => ({
    type: 'Feature', geometry: { type: 'Polygon', coordinates: [] },
    properties: { id: `R-${i}`, name, abbreviation: `R${i}`, label: [0, 0], labelRadius: 1, aliases: [], visited: i === 0 },
  })) as RegionCollection['features']
  const { unmount } = render(<RegionLabels map={map} features={features} />)
  expect(screen.getByLabelText('First Region, visited').getAttribute('tabindex')).toBe('0')
  expect(screen.getByLabelText('Second Region, not visited').getAttribute('title')).toBe('Second Region')
  expect(screen.getAllByRole('tooltip', { hidden: true })).toHaveLength(2)
  fireEvent.wheel(screen.getByLabelText('First Region, visited'), { deltaY: -120, clientX: 300, clientY: 200 })
  expect(wheel).toHaveBeenCalledOnce()
  expect(wheel.mock.calls[0][0].deltaY).toBe(-120)
  fireEvent.doubleClick(screen.getByLabelText('First Region, visited'))
  expect(doubleClick).toHaveBeenCalledOnce()
  const leader = document.querySelector('line')!
  expect(leader.getAttribute('x1')).toBe('300')
  expect(leader.getAttribute('y1')).toBe('200')
  expect([leader.getAttribute('x2'), leader.getAttribute('y2')]).not.toEqual(['300', '200'])
  center = { lng: 180, lat: 0 }
  act(() => update())
  expect(screen.queryByLabelText('First Region, visited')).toBeNull()
  expect(document.querySelector('line')).toBeNull()
  center = { lng: 0, lat: 0 }
  act(() => update())
  expect(screen.getByLabelText('First Region, visited')).toBeTruthy()
  unmount()
  expect(off).toHaveBeenCalledWith('render', update)
})
