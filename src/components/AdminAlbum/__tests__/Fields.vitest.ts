import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('swr', () => ({
  default: () => ({ data: { keywords: [] } }),
}))

import Fields, { parseDMS, parseLatInput } from '../Fields'
import type { RawXmlAlbum, RawXmlItem } from '../../../types/common'

const toDecimal = (degrees: number, minutes: number, seconds: number) => (
  degrees + (minutes / 60) + (seconds / 3600)
)

describe('parseDMS', () => {
  test('parses standard DMS with direction', () => {
    const value = parseDMS('50° 22\' 51.51" N')
    expect(value).not.toBeNull()
    expect(value).toBeCloseTo(toDecimal(50, 22, 51.51), 6)
  })

  test('parses compact DMS without spaces', () => {
    const value = parseDMS('50°22\'51.51"N')
    expect(value).not.toBeNull()
    expect(value).toBeCloseTo(toDecimal(50, 22, 51.51), 6)
  })

  test('parses DMS with spaces and no symbols', () => {
    const value = parseDMS('50 22 51.51 N')
    expect(value).not.toBeNull()
    expect(value).toBeCloseTo(toDecimal(50, 22, 51.51), 6)
  })

  test('negates for south and west', () => {
    const south = parseDMS('12° 30\' 0" S')
    const west = parseDMS('120° 0\' 30" W')
    expect(south).toBeCloseTo(-toDecimal(12, 30, 0), 6)
    expect(west).toBeCloseTo(-toDecimal(120, 0, 30), 6)
  })

  test('parses DMS with prime symbols for lat/lon pair', () => {
    const lat = parseDMS('50°45′42″N')
    const lon = parseDMS('111°29′06″W')
    expect(lat).toBeCloseTo(toDecimal(50, 45, 42), 6)
    expect(lon).toBeCloseTo(-toDecimal(111, 29, 6), 6)
  })

  test('returns null for invalid input', () => {
    expect(parseDMS('not a coordinate')).toBeNull()
  })
})

describe('parseLatInput', () => {
  test('parses comma-delimited decimal lat,lon', () => {
    const geo = parseLatInput('50.75, -111.485', { lat: '', lon: '', accuracy: '3' })
    expect(geo).toEqual({ lat: '50.75', lon: '-111.485', accuracy: '3' })
  })

  test('parses single number latitude and preserves longitude', () => {
    const geo = parseLatInput('12.34', { lat: '0', lon: '99', accuracy: '5' })
    expect(geo).toEqual({ lat: '12.34', lon: '99', accuracy: '5' })
  })

  test('parses DMS lat/lon pair without comma', () => {
    const geo = parseLatInput('50°45′42″N 111°29′06″W', { lat: '', lon: '', accuracy: '' })
    expect(geo).toEqual({
      lat: (50 + (45 / 60) + (42 / 3600)).toString(),
      lon: (-(111 + (29 / 60) + (6 / 3600))).toString(),
      accuracy: '',
    })
  })
})

const item: RawXmlItem = {
  $: { id: '1' },
  filename: '2024-07-12-lake.jpg',
  photo_date: '2024-07-12',
  photo_city: 'Vancouver',
  thumb_caption: 'Lake',
}

const xmlAlbum: RawXmlAlbum = {
  album: {
    meta: { gallery: 'demo', albumName: 'sample' },
    item,
  },
}

function renderFields() {
  render(
    React.createElement(
      Fields,
      {
        gallery: 'demo',
        album: 'sample',
        xmlAlbum,
        item,
        onItemUpdate: vi.fn(),
        onXmlGenerated: vi.fn(),
        applyEditsToItems: (items) => items,
        children: React.createElement('div', null, 'Preview'),
      },
    ),
  )
}

describe('XML export and persistence', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('generates an exportable XML snapshot without saving it', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderFields()

    fireEvent.click(screen.getByRole('button', { name: 'Generate XML' }))

    const output = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Generated XML' })
    expect(output.value).toContain('<album>')
    expect(output).toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: 'Save XML' })).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('saves exactly the generated XML only after an explicit save action', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ saved: true }) })
    vi.stubGlobal('fetch', fetchMock)
    renderFields()

    fireEvent.click(screen.getByRole('button', { name: 'Generate XML' }))
    const output = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Generated XML' })
    fireEvent.click(screen.getByRole('button', { name: 'Save XML' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/xml/demo/sample', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xml: output.value }),
    })
    expect(screen.getByRole('status')).toHaveTextContent('XML saved')
  })

  test('keeps the export visible when saving fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'XML must be well formed' }),
    }))
    renderFields()

    fireEvent.click(screen.getByRole('button', { name: 'Generate XML' }))
    const output = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Generated XML' })
    fireEvent.click(screen.getByRole('button', { name: 'Save XML' }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('XML must be well formed'))
    expect(output.value).toContain('<album>')
  })
})
