import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import GalleryServer from '../app/[gallery]/page'
import type { Gallery } from '../src/types/pages'

type GalleryClientMockProps = Pick<Gallery.ComponentProps, 'albums' | 'indexedKeywords'>

vi.mock('../src/components/GalleryPage', () => ({
  __esModule: true,
  default: ({
    albums,
    indexedKeywords,
  }: GalleryClientMockProps) => (
    <div>
      {albums.map((album) => <div key={album.name}>{album.name}</div>)}
      {indexedKeywords.map((option) => (
        <div key={option.value}>{`${option.value}:${option.filterKind ?? 'none'}`}</div>
      ))}
    </div>
  ),
}))

vi.mock('../src/lib/albums', () => ({
  __esModule: true,
  default: vi.fn(async () => ({
    demo: {
      albums: [
        {
          name: 'album-one',
          h1: 'First album',
          h2: 'Demo subtitle',
          year: '2026',
          search: 'tag^, First Middle Last, 2026',
          count: 1,
          image: 'cover.jpg',
          video: false,
        },
        {
          name: 'album-two',
          h1: 'Second album',
          h2: 'Other subtitle',
          year: '2025',
          search: 'other^, Other Person, 2025',
          count: 1,
          image: 'other-cover.jpg',
          video: false,
        },
      ],
    },
  })),
}))

vi.mock('../src/lib/galleries', () => ({
  __esModule: true,
  default: vi.fn(async () => ({ galleries: ['demo'] })),
}))

describe('Gallery page', () => {
  test('passes backend-classified search options to the gallery client', async () => {
    const component = await GalleryServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({}),
    })

    render(component)

    expect(screen.getByText('tag^:tag')).toBeInTheDocument()
    expect(screen.getByText('First Middle Last:person')).toBeInTheDocument()
    expect(screen.getByText('2026:year')).toBeInTheDocument()
  })

  test('filters albums from the canonical query before rendering the client', async () => {
    const component = await GalleryServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ query: 'tag:tag^' }),
    })

    render(component)

    expect(screen.getByText('album-one')).toBeInTheDocument()
    expect(screen.queryByText('album-two')).not.toBeInTheDocument()
  })
})
