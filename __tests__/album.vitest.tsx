import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import AlbumServer from '../app/[gallery]/[album]/page'
import type { Album } from '../src/types/pages'
import { getPrimaryFilename } from '../src/utils'

type AlbumClientMockProps = Pick<Album.ComponentProps, 'items' | 'album' | 'totalItemCount'>

vi.mock('../src/components/Album/AlbumClient', () => ({
  __esModule: true,
  default: ({
    items,
    album,
    totalItemCount,
  }: AlbumClientMockProps) => (
    <div>
      <div>{album ?? 'no-album'}</div>
      <div>{totalItemCount ?? 'no-total'}</div>
      {items.map((item) => {
        const filename = getPrimaryFilename(item.filename)
        return (
          <div key={filename}>
            <div>{filename}</div>
            <div>{item.city}</div>
          </div>
        )
      })}
    </div>
  ),
}))

vi.mock('../src/lib/galleries', () => ({
  __esModule: true,
  default: async () => ({ galleries: ['demo'] }),
}))

vi.mock('../src/lib/albums', () => ({
  __esModule: true,
  default: async () => ({
    demo: {
      albums: [{ name: 'sample', h1: 'Sample', h2: '', version: '1', thumbPath: '', year: '2025', search: null }],
    },
  }),
}))

vi.mock('../src/lib/album', () => ({
  __esModule: true,
  default: async () => ({
    album: {
      meta: { geo: { zoom: 9 } },
      items: [
        {
          id: '1',
          filename: '2025-07-12-01.jpg',
          photoDate: '2025-07-12',
          city: 'Vancouver, BC, Canada',
          location: 'Cemetery',
          caption: 'BC photo',
          description: 'Wanted description',
          search: null,
          persons: null,
          title: 'Wanted title',
          coordinates: null,
          coordinateAccuracy: null,
          thumbPath: '',
          photoPath: '',
          mediaPath: '',
          videoPaths: null,
          reference: null,
        },
        {
          id: '2',
          filename: '2025-07-12-02.jpg',
          photoDate: '2025-07-12',
          city: 'Toronto, ON, Canada',
          location: 'Temple',
          caption: 'ON photo',
          description: 'Other description',
          search: null,
          persons: null,
          title: 'Other title',
          coordinates: null,
          coordinateAccuracy: null,
          thumbPath: '',
          photoPath: '',
          mediaPath: '',
          videoPaths: null,
          reference: null,
        },
      ],
    },
  }),
}))

vi.mock('../src/lib/generate-clusters', () => ({
  __esModule: true,
  generateClusters: () => [],
}))

describe('Album page', () => {
  test('applies typed country and region filters on the server for album routes', async () => {
    const component = await AlbumServer({
      params: Promise.resolve({ gallery: 'demo', album: 'sample' }),
      searchParams: Promise.resolve({ query: 'country:Canada && region:BC' }),
    })

    render(component)

    expect(screen.getByText('sample')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-01.jpg')).toBeInTheDocument()
    expect(screen.getByText('Vancouver, BC, Canada')).toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-02.jpg')).not.toBeInTheDocument()
    expect(screen.queryByText('Toronto, ON, Canada')).not.toBeInTheDocument()
  })
})
