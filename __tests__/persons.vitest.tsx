import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import PersonsServer from '../app/[gallery]/persons/page'
import type { Persons } from '../src/types/pages'
import { getPrimaryFilename } from '../src/utils'

type PersonsClientMockProps = Pick<
  Persons.ComponentProps,
  'items' | 'totalItemCount' | 'initialSelectedAge' | 'initialSelectedPerson'
>

vi.mock('../src/components/Persons/PersonsClient', () => ({
  __esModule: true,
  default: ({
    items,
    totalItemCount,
    initialSelectedAge,
    initialSelectedPerson,
  }: PersonsClientMockProps) => (
    <div>
      <div>{totalItemCount ?? 'no-total'}</div>
      <div>{initialSelectedAge === null || initialSelectedAge === undefined ? 'no-age' : String(initialSelectedAge)}</div>
      <div>{initialSelectedPerson ?? 'no-person'}</div>
      {items.map((item) => {
        const filename = getPrimaryFilename(item.filename)
        return <div key={filename}>{filename}</div>
      })}
    </div>
  ),
}))

vi.mock('../src/lib/persons', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/persons')>()

  return {
    __esModule: true,
    ...actual,
    getPersonsData: async () => ({
      items: [
        {
          id: '1',
          filename: '2025-07-12-01.jpg',
          photoDate: '2025-07-12',
          city: 'Sample City, Country',
          location: 'House',
          caption: 'Primary',
          description: null,
          search: 'family',
          persons: [{ full: 'Sample Person', dob: '1929-09-22' }],
          title: 'Primary',
          coordinates: null,
          coordinateAccuracy: null,
          thumbPath: '',
          photoPath: '',
          mediaPath: '',
          videoPaths: null,
          reference: null,
          corpus: 'primary',
          visitedPlace: { country: 'Canada', region: 'BC' },
          album: 'sample',
        },
        {
          id: '2',
          filename: '2025-07-12-02.jpg',
          photoDate: '2025-07-12',
          city: 'Sample City, Country',
          location: 'Yard',
          caption: 'Other',
          description: null,
          search: 'family',
          persons: [{ full: 'Secondary Person', dob: null }],
          title: 'Other',
          coordinates: null,
          coordinateAccuracy: null,
          thumbPath: '',
          photoPath: '',
          mediaPath: '',
          videoPaths: null,
          reference: null,
          corpus: 'other',
          visitedPlace: { country: 'Canada', region: 'BC' },
          album: 'sample',
        },
        {
          id: '3',
          filename: '2025-07-12-03.jpg',
          photoDate: '2025-07-12',
          city: 'Another City, Country',
          location: 'Park',
          caption: 'Elsewhere',
          description: null,
          search: 'family',
          persons: [{ full: 'Far Person', dob: null }],
          title: 'Elsewhere',
          coordinates: null,
          coordinateAccuracy: null,
          thumbPath: '',
          photoPath: '',
          mediaPath: '',
          videoPaths: null,
          reference: null,
          corpus: 'away',
          visitedPlace: { country: 'Canada', region: 'ON' },
          album: 'sample',
        },
        {
          id: '4',
          filename: '2025-07-12-04.jpg',
          photoDate: '2025-07-12',
          city: 'Another City, Country',
          location: 'Lake',
          caption: 'Peer',
          description: null,
          search: 'family',
          persons: [{ full: 'Peer Person', dob: '1929-08-10' }],
          title: 'Peer',
          coordinates: null,
          coordinateAccuracy: null,
          thumbPath: '',
          photoPath: '',
          mediaPath: '',
          videoPaths: null,
          reference: null,
          corpus: 'peer',
          visitedPlace: { country: 'Canada', region: 'ON' },
          album: 'sample',
        },
      ],
      indexedKeywords: [{ label: 'family (3)', value: 'family' }],
    }),
  }
})

vi.mock('../src/lib/generate-clusters', () => ({
  __esModule: true,
  generateClusters: () => [],
}))

vi.mock('../src/utils/person-age', () => ({
  __esModule: true,
  buildAgeSummary: () => ({ ages: [] }),
  resolvePhotoDate: (item: { photoDate: string | null }) => item.photoDate ?? '',
  calcAgeAtDate: (dob: string, photoDate: string) => {
    const birthYear = Number.parseInt(dob.substring(0, 4), 10)
    const photoYear = Number.parseInt(photoDate.substring(0, 4), 10)
    return photoYear - birthYear
  },
}))

async function resolvePersonsServer(props: Parameters<typeof PersonsServer>[0]) {
  const page = PersonsServer(props)
  const content = page.props.children as {
    props: unknown;
    type: (props: unknown) => Promise<React.ReactNode>;
  }
  return content.type(content.props)
}

describe('Persons page', () => {
  test('prefilters items from a canonical person query on the server', async () => {
    const component = await resolvePersonsServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ query: 'person:"Sample Person"' }),
    })

    render(component)

  expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('Sample Person')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-01.jpg')).toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-02.jpg')).not.toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-04.jpg')).not.toBeInTheDocument()
  })

  test('keeps the age scope on the server when age and person are both selected', async () => {
    const component = await resolvePersonsServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ query: 'person:"Sample Person" && age:96' }),
    })

    render(component)

  expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('96')).toBeInTheDocument()
    expect(screen.getByText('Sample Person')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-01.jpg')).toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-02.jpg')).not.toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-03.jpg')).not.toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-04.jpg')).not.toBeInTheDocument()
  })

  test('keeps the final age-filtered slice on the server when only age is selected', async () => {
    const component = await resolvePersonsServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ query: 'age:96' }),
    })

    render(component)

    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('96')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-01.jpg')).toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-02.jpg')).not.toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-03.jpg')).not.toBeInTheDocument()
    expect(screen.getByText('2025-07-12-04.jpg')).toBeInTheDocument()
  })

  test('applies typed country, region, and age predicates on the server', async () => {
    const component = await resolvePersonsServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ query: 'country:Canada && region:BC && age:unknown' }),
    })

    render(component)

    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('unknown')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-02.jpg')).toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-01.jpg')).not.toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-03.jpg')).not.toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-04.jpg')).not.toBeInTheDocument()
  })
})
