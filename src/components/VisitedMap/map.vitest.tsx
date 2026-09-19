import { readFileSync } from 'node:fs'
import React, { useImperativeHandle, type ReactNode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { CountryVisit } from '../../lib/visited-core'

const mock = vi.hoisted(() => ({ panTo: vi.fn(), props: {} as Record<string, unknown>, reduced: false }))
vi.mock('react-map-gl/mapbox', () => ({
  default: ({ ref, children, ...props }: { ref: React.Ref<unknown>, children: ReactNode }) => {
    mock.props = props
    useImperativeHandle(ref, () => ({ panTo: mock.panTo, isStyleLoaded: () => true }))
    return <div>{children}</div>
  },
  NavigationControl: () => <button>Zoom in</button>,
  Source: ({ id, children }: { id: string, children: ReactNode }) => <div data-testid={id}>{children}</div>,
  Layer: () => null,
}))
vi.mock('./labels', () => ({ default: () => <div data-testid="labels">Local labels</div> }))
const loaded: import('./use-boundaries').BoundaryState = {
  Japan: { data: { type: 'FeatureCollection', features: [] } },
  USA: { data: { type: 'FeatureCollection', features: [] } },
  Canada: { error: true },
  Mexico: { data: { type: 'FeatureCollection', features: [] } },
}
import CountryMap, { VECTOR_STYLE } from './map'
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); mock.panTo.mockClear() })
const countries = [{ country: 'USA', regions: [], years: [], count: 0, filter: { country: 'USA', region: '' } }] as CountryVisit[]

it('keeps all loaded sources through pan-only country changes, manual basemap switching, and network failure', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: mock.reduced }))
  const { rerender } = render(<CountryMap country="USA" countries={countries} loaded={loaded} />)
  expect(mock.props.scrollZoom).toBe(true)
  expect(mock.props.doubleClickZoom).toBe(true)
  expect(mock.props.projection).toBe('globe')
  for (const option of ['dragRotate', 'touchPitch', 'pitchWithRotate', 'keyboard']) expect(mock.props[option]).toBe(false)
  expect(screen.getByText('0 of 51 states / DC visited')).toBeTruthy()
  expect(screen.getByText('Boundaries unavailable: Canada.')).toBeTruthy()
  expect(screen.getByTestId('regions-Japan')).toBeTruthy()
  expect(screen.getByTestId('regions-USA')).toBeTruthy()
  expect(mock.panTo).toHaveBeenLastCalledWith([-110, 42], { duration: 900 })
  mock.reduced = true
  rerender(<CountryMap country="Japan" countries={countries} loaded={loaded} />)
  expect(mock.panTo).toHaveBeenLastCalledWith([138, 37], { duration: 0 })
  expect(screen.getByTestId('regions-USA')).toBeTruthy()
  const labels = screen.getByTestId('labels')
  const calls = mock.panTo.mock.calls.length
  fireEvent.click(screen.getByRole('switch', { name: 'Basemap' }))
  expect(mock.props.mapStyle).toEqual(VECTOR_STYLE)
  expect(screen.getByTestId('labels')).toBe(labels)
  expect(screen.getByTestId('regions-Mexico')).toBeTruthy()
  expect(mock.props.projection).toBe('globe')
  expect(mock.panTo).toHaveBeenCalledTimes(calls)
  expect(VECTOR_STYLE.sources).toEqual({})
  expect(VECTOR_STYLE.glyphs).toBeUndefined()
  expect(VECTOR_STYLE.sprite).toBeUndefined()
  fireEvent.click(screen.getByRole('switch', { name: 'Basemap' }))
  act(() => (mock.props.onError as (event: { error: Error }) => void)({ error: new Error('Network failed') }))
  expect(mock.props.mapStyle).toEqual(VECTOR_STYLE)
  expect(screen.getByTestId('labels')).toBe(labels)
  expect(screen.getByTestId('regions-Mexico')).toBeTruthy()
  expect(screen.getByTestId('regions-USA')).toBeTruthy()
  expect(mock.panTo).toHaveBeenCalledTimes(calls)
  rerender(<CountryMap country="Mexico" countries={countries} loaded={loaded} />)
  expect(screen.getByText('0 of 32 states / Mexico City visited')).toBeTruthy()
  rerender(<CountryMap country="Canada" countries={countries} loaded={loaded} />)
  expect(screen.getByText('Visited regions unavailable')).toBeTruthy()
  expect(screen.queryByText('0 of 13 provinces / territories visited')).toBeNull()
})


it('combines regional visits across duplicate country names', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  const mexico = JSON.parse(readFileSync('public/maps/visited/mexico.geojson', 'utf8'))
  const visits: CountryVisit[] = [['Mexico', 'Yucatan'], ['México', 'Jalisco']].map(([country, region]) => ({
    country, count: 1, years: [], filter: { country, region: null },
    regions: [{ region, count: 1, years: [], filter: { country, region } }],
  }))
  render(<CountryMap country="Mexico" countries={visits} loaded={{ Mexico: { data: mexico } }} />)
  expect(screen.getByText('2 of 32 states / Mexico City visited')).toBeTruthy()
})
