import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import AlbumServer from '../app/[gallery]/[album]/page'

vi.mock('../src/components/Album/AlbumClient', () => ({
  __esModule: true,
  default: ({
    indexedKeywords,
    tagOptions,
    visitedFilterLabel,
  }: {
    indexedKeywords: Array<{ value: string; filterKind?: string }>
    tagOptions?: Array<{ value: string; filterKind?: string }>
    visitedFilterLabel?: string | null
  }) => (
    <div>
      {indexedKeywords.map((option) => (
        <div key={`indexed-${option.value}`}>{`${option.value}:${option.filterKind ?? 'none'}`}</div>
      ))}
      {tagOptions?.map((option) => (
        <div key={`tag-${option.value}`}>{`tagOption:${option.value}:${option.filterKind ?? 'none'}`}</div>
      ))}
      <div>{`visitedFilterLabel:${visitedFilterLabel ?? 'none'}`}</div>
    </div>
  ),
}))

vi.mock('../src/lib/album', () => ({
  __esModule: true,
  default: vi.fn(async () => ({
    album: {
      meta: { geo: { zoom: 8 } },
      items: [
        {
          id: '1',
          filename: '2026-01-01-01.jpg',
          photoDate: '2026-01-01',
          city: 'Demo City, Guanajuato, Mexico',
          location: null,
          caption: 'Caption',
          description: null,
          search: 'tag^, First Middle Last, 2026',
          persons: null,
          title: 'Title',
          coordinates: null,
          coordinateAccuracy: 0,
          thumbPath: '',
          photoPath: '',
          mediaPath: '',
          videoPaths: null,
          reference: null,
        },
      ],
    },
  })),
}))

describe('Album page', () => {
  test('passes backend-classified tag options to the album client', async () => {
    const component = await AlbumServer({
      params: Promise.resolve({ gallery: 'demo', album: 'album-one' }),
      searchParams: Promise.resolve({ visitedCountry: 'Mexico', visitedRegion: 'Guanajuato' }),
    })

    render(component)

    expect(screen.getByText('tag^:tag')).toBeInTheDocument()
    expect(screen.getByText('First Middle Last:person')).toBeInTheDocument()
    expect(screen.getByText('2026:year')).toBeInTheDocument()
    expect(screen.getByText('tagOption:tag^:tag')).toBeInTheDocument()
    expect(screen.getByText('visitedFilterLabel:Guanajuato, Mexico')).toBeInTheDocument()
  })
})
