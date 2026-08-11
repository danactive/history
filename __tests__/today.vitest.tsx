import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import TodayServer from '../app/[gallery]/today/page'
import type { Today } from '../src/types/pages'
import { getPrimaryFilename } from '../src/utils'

type AlbumClientMockProps = Pick<Today.ComponentProps, 'items' | 'gallery' | 'monthDay' | 'totalItemCount'>

vi.mock('../src/components/Album/AlbumClient', () => ({
  __esModule: true,
  default: ({
    items,
    gallery,
    monthDay,
    totalItemCount,
  }: AlbumClientMockProps) => (
    <div>
      {gallery && monthDay ? <div>{`/${gallery}/today/details?day=${monthDay}`}</div> : null}
      <div>{totalItemCount ?? 'no-total'}</div>
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
          city: 'Vancouver, BC, Canada',
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
          filename: '2025-07-12-02.jpg',
          photoDate: '2025-07-12',
          city: 'Toronto, ON, Canada',
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

async function resolveTodayServer(props: Parameters<typeof TodayServer>[0]) {
  const page = TodayServer(props)
  const content = page.props.children as {
    props: unknown;
    type: (props: unknown) => Promise<React.ReactNode>;
  }
  return content.type(content.props)
}

describe('Today page', () => {
  test('uses the day query string to filter items', async () => {
    const component = await resolveTodayServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ day: '07-12' }),
    })

    render(component)

    expect(screen.getByText('/demo/today/details?day=07-12')).toBeInTheDocument()
    expect(screen.getByText('no-total')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-01.jpg')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-02.jpg')).toBeInTheDocument()
  })

  test('applies typed country and region filters on the server for today routes', async () => {
    const component = await resolveTodayServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ day: '07-12', query: 'country:Canada && region:BC' }),
    })

    render(component)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-01.jpg')).toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-02.jpg')).not.toBeInTheDocument()
  })
})
