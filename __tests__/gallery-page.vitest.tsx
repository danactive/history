import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import GalleryServer from '../app/[gallery]/page'

vi.mock('../src/components/GalleryPage', () => ({
  __esModule: true,
  default: ({ indexedKeywords }: { indexedKeywords: Array<{ value: string; filterKind?: string }> }) => (
    <div>
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
      ],
    },
  })),
}))

vi.mock('../src/lib/galleries', () => ({
  __esModule: true,
  default: vi.fn(async () => ({ galleries: ['demo'] })),
}))

describe('Gallery page', () => {
  test('passes backend-classified tag and person options to the gallery client', async () => {
    const component = await GalleryServer({
      params: Promise.resolve({ gallery: 'demo' }),
    })

    render(component)

    expect(screen.getByText('tag^:tag')).toBeInTheDocument()
    expect(screen.getByText('First Middle Last:person')).toBeInTheDocument()
    expect(screen.getByText('2026:year')).toBeInTheDocument()
  })
})
