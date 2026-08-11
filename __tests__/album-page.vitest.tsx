import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import AlbumServer from '../app/[gallery]/[album]/page'
import type { Album } from '../src/types/pages'

type AlbumClientMockProps = Pick<Album.ComponentProps, 'items' | 'indexedKeywords' | 'tagOptions'>

vi.mock('../src/components/Album/AlbumClient', () => ({
  __esModule: true,
  default: ({
    items,
    indexedKeywords,
    tagOptions,
  }: AlbumClientMockProps) => (
    <div>
      {items.map((item) => <div key={String(item.filename)}>{item.filename}</div>)}
      {indexedKeywords.map((option) => (
        <div key={`indexed-${option.value}`}>{`${option.value}:${option.filterKind ?? 'none'}`}</div>
      ))}
      {tagOptions?.map((option) => (
        <div key={`tag-${option.value}`}>{`tagOption:${option.value}:${option.filterKind ?? 'none'}`}</div>
      ))}
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
        {
          id: '2',
          filename: '2025-01-01-01.jpg',
          photoDate: '2025-01-01',
          city: 'Other City, BC, Canada',
          location: null,
          caption: 'Other caption',
          description: null,
          search: 'other^, Other Person, 2025',
          persons: null,
          title: 'Other title',
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

async function resolveAlbumServer(props: Parameters<typeof AlbumServer>[0]) {
  const page = AlbumServer(props)
  const content = page.props.children as {
    props: unknown;
    type: (props: unknown) => Promise<React.ReactNode>;
  }
  return content.type(content.props)
}

describe('Album page', () => {
  test('passes backend-classified tag options to the album client', async () => {
    const component = await resolveAlbumServer({
      params: Promise.resolve({ gallery: 'demo', album: 'album-one' }),
      searchParams: Promise.resolve({ visitedCountry: 'Mexico', visitedRegion: 'Guanajuato' }),
    })

    render(component)

    expect(screen.getByText('tag^:tag')).toBeInTheDocument()
    expect(screen.getByText('First Middle Last:person')).toBeInTheDocument()
    expect(screen.getByText('2026:year')).toBeInTheDocument()
    expect(screen.getByText('tagOption:tag^:tag')).toBeInTheDocument()
  })

  test('filters album items from the canonical query before rendering the client', async () => {
    const component = await resolveAlbumServer({
      params: Promise.resolve({ gallery: 'demo', album: 'album-one' }),
      searchParams: Promise.resolve({ query: 'tag:tag^' }),
    })

    render(component)

    expect(screen.getByText('2026-01-01-01.jpg')).toBeInTheDocument()
    expect(screen.queryByText('2025-01-01-01.jpg')).not.toBeInTheDocument()
  })
})
