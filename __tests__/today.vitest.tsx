import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import TodayServer from '../app/[gallery]/today/page'
import { getPrimaryFilename } from '../src/utils'

vi.mock('../src/components/Album/AlbumClient', () => ({
  __esModule: true,
  default: ({ items, gallery, monthDay }: { items: Array<{ filename: string | string[] }>; gallery?: string; monthDay?: string }) => (
    <div>
      {gallery && monthDay ? <div>{`/${gallery}/today/details?day=${monthDay}`}</div> : null}
      {items.map((item) => {
        const filename = getPrimaryFilename(item.filename)
        return <div key={filename}>{filename}</div>
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
          city: 'Kyoto',
          location: 'Cemetery',
          caption: 'Wanted day',
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
          filename: '2025-01-02-01.jpg',
          photoDate: '2025-01-02',
          city: 'Kyoto',
          location: 'Temple',
          caption: 'Other day',
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

describe('Today page', () => {
  test('uses the day query string to filter items', async () => {
    const component = await TodayServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ day: '07-12' }),
    })

    render(component)

    expect(screen.getByText('/demo/today/details?day=07-12')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-01.jpg')).toBeInTheDocument()
    expect(screen.queryByText('2025-01-02-01.jpg')).not.toBeInTheDocument()
  })
})
