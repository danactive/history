import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import PersonsServer from '../app/[gallery]/persons/page'
import { getPrimaryFilename } from '../src/utils'

vi.mock('../src/components/Persons/PersonsClient', () => ({
  __esModule: true,
  default: ({
    items,
    initialSelectedAge,
    initialSelectedPerson,
  }: {
    items: Array<{ filename: string | string[] }>
    initialSelectedAge?: number | 'unknown' | null
    initialSelectedPerson?: string | null
  }) => (
    <div>
      <div>{initialSelectedAge === null || initialSelectedAge === undefined ? 'no-age' : String(initialSelectedAge)}</div>
      <div>{initialSelectedPerson ?? 'no-person'}</div>
      {items.map((item) => {
        const filename = getPrimaryFilename(item.filename)
        return <div key={filename}>{filename}</div>
      })}
    </div>
  ),
}))

vi.mock('../src/lib/persons', () => ({
  __esModule: true,
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
        visitedPlace: null,
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
        persons: [{ full: 'Secondary Person', dob: '1950-01-01' }],
        title: 'Other',
        coordinates: null,
        coordinateAccuracy: null,
        thumbPath: '',
        photoPath: '',
        mediaPath: '',
        videoPaths: null,
        reference: null,
        corpus: 'other',
        visitedPlace: null,
        album: 'sample',
      },
    ],
    indexedKeywords: [{ label: 'family (2)', value: 'family' }],
  }),
}))

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

describe('Persons page', () => {
  test('prefilters items from the person query string on the server', async () => {
    const component = await PersonsServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ person: 'Sample Person' }),
    })

    render(component)

    expect(screen.getByText('Sample Person')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-01.jpg')).toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-02.jpg')).not.toBeInTheDocument()
  })

  test('anchors the age query string on the server', async () => {
    const component = await PersonsServer({
      params: Promise.resolve({ gallery: 'demo' }),
      searchParams: Promise.resolve({ age: '96', person: 'Sample Person' }),
    })

    render(component)

    expect(screen.getByText('96')).toBeInTheDocument()
    expect(screen.getByText('Sample Person')).toBeInTheDocument()
    expect(screen.getByText('2025-07-12-01.jpg')).toBeInTheDocument()
    expect(screen.queryByText('2025-07-12-02.jpg')).not.toBeInTheDocument()
  })
})
