import { afterEach, describe, expect, test, vi } from 'vitest'
import config from '../../models/config'
import { formatAlbumResourceText, formatPersonResourceText } from '../../models/storytelling'
import getAlbum from '../album'
import type { GalleryAlbumsBody } from '../albums'
import * as albumsLib from '../albums'
import * as allLib from '../all'
import getGalleries from '../galleries'
import {
  buildAlbumPeopleAndKeywordTags,
  buildAlbumStory,
  buildDateDetailsText,
  buildGalleriesDetailsText,
  buildGalleryDetailsText,
  buildGalleryInventoryText,
  buildPeopleInventoryText,
  buildPersonDetailsText,
  getOnThisDayStory,
  getPeopleStoryIndex,
  getStorytellingDefaultGallery,
  resolveSearchOnlyPersonEntryFromItems,
  searchStoryMoments,
} from '../storytelling'
import * as todayLib from '../today'

afterEach(() => {
  vi.restoreAllMocks()
})

function createSyntheticAllItem(id: string, filename: string) {
  return {
    id,
    filename,
    photoDate: filename.substring(0, 10),
    city: 'Example City',
    location: 'Example Place',
    caption: `Caption ${id}`,
    description: null,
    search: 'Taylor Example, Jordan Sample',
    persons: [{ full: 'Taylor Example', dob: null }],
    title: `Title ${id}`,
    coordinates: null,
    coordinateAccuracy: 9,
    thumbPath: '',
    photoPath: '',
    mediaPath: '',
    videoPaths: null,
    reference: null,
    album: 'sample-album',
    gallery: config.defaultGallery,
    corpus: `Title ${id} Caption ${id}`,
    visitedPlace: { country: 'Exampleland', region: 'North Example' },
  }
}

describe('Storytelling library', () => {
  test('finds a story moment by query token', async () => {
    const result = await searchStoryMoments({
      gallery: config.defaultGallery,
      query: 'gingerbread',
      limit: 3,
    })

    expect(result.matches.length).toBeGreaterThan(0)
    expect(result.matches[0]?.filename).toBe('2004-01-04-01.jpg')
  })

  test('builds an album story summary', async () => {
    const result = await buildAlbumStory(config.defaultGallery, config.defaultAlbum, 3)
    const { album } = await getAlbum(config.defaultGallery, config.defaultAlbum)
    const expectedPlaces = [...new Map(
      album.items
        .map(item => item.city)
        .filter((city): city is string => Boolean(city))
        .map(city => [city, album.items.filter(item => item.city === city).length]),
    ).entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
    const expectedPlaceCounts = expectedPlaces.map(([name, count]) => ({ name, count }))
    const personCounts = new Map<string, number>()
    album.items.forEach((item) => {
      item.persons?.forEach((person) => {
        personCounts.set(person.full, (personCounts.get(person.full) ?? 0) + 1)
      })
    })
    const expectedPeople = [...personCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
    const expectedPersonCounts = expectedPeople.map(([name, count]) => ({ name, count }))

    expect(result.title).toBe('Sample')
    expect(result.year).toBe('2001-2005')
    expect(result.highlights.length).toBeGreaterThan(0)
    expect(result.places).toEqual(expectedPlaceCounts.map(place => place.name))
    expect(result.placeCounts).toEqual(expectedPlaceCounts)
    expect(result.people).toEqual(expectedPersonCounts.map(person => person.name))
    expect(result.personCounts).toEqual(expectedPersonCounts)
  })

  test('formats album details with descending persons, keyword tags, and highlights', () => {
    const text = formatAlbumResourceText({
      summary: 'Album Sample contains 4 items.',
      placeCounts: [
        { name: 'Sample Town', count: 1 },
        { name: 'Example City', count: 3 },
      ],
      personCounts: [
        { name: 'Jordan Sample', count: 1 },
        { name: 'Taylor Example', count: 3 },
      ],
      popularKeywords: ['architecture (2)', 'memory (1)'],
      keywordTags: ['architecture^ (2)'],
      galleryKeywords: [{
        name: 'sample',
        title: 'Sample',
        subtitle: null,
        year: null,
        keywords: ['Nagoya Castle', 'Atsuta Shrine'],
      }],
      itemCount: 4,
      highlights: [{
        gallery: config.defaultGallery,
        album: 'sample',
        filename: '2024-01-02-01.jpg',
        date: '2024-01-02',
        title: 'Sample highlight',
        caption: 'A memorable detail',
        description: null,
        search: null,
        city: 'Example City',
        location: 'Sample Place',
        persons: ['Taylor Example'],
        mediaPath: '',
        thumbPath: '',
        reference: null,
        visitedPlace: null,
        score: 1,
        reasons: [],
      }],
    }, 'http://localhost:3030/demo/sample')

    expect(text).toContain('# Album story')
    expect(text).toContain('- Places: Example City (3), Sample Town (1)')
    expect(text).toContain('- Persons: Taylor Example (3), Jordan Sample (1)')
    expect(text).toContain('- Popular: architecture (2), memory (1)')
    expect(text).toContain('- Tags: architecture^ (2)')
    expect(text).toContain('## Gallery keywords\n- Album: sample\n  - Title: Sample')
    expect(text).toContain('- Gallery includes: Nagoya Castle, Atsuta Shrine')
    expect(text).toContain('Highlights (showing 1 of 4, selected for narrative richness):')
    expect(text).toContain('- On 2024-01-02 date @ Sample highlight')
    expect(text).toContain('Album: sample')
    expect(text).toContain('Caption: A memorable detail')
    expect(text).toContain('View the graphical interface in a web browser: http://localhost:3030/demo/sample')
  })

  test('builds gallery details text from the shared builder', async () => {
    const text = await buildGalleryDetailsText(config.defaultGallery)

    expect(text).toContain(`# Gallery: ${config.defaultGallery}`)
    expect(text).toContain('## Albums')
    expect(text).toContain('- Album: sample')
    expect(text).toContain('- Gallery includes: ')
  })

  test('builds compact paginated gallery inventory text for MCP resources', async () => {
    const galleryAlbums = {
      [config.defaultGallery]: {
        albums: Array.from({ length: 30 }, (_, index) => ({
          name: `album-${index + 1}`,
          h1: `Album ${index + 1}`,
          h2: '',
          version: '',
          thumbPath: '',
          year: '2024',
          search: `keyword-${index + 1}`,
        })),
      },
    } as GalleryAlbumsBody
    vi.spyOn(albumsLib, 'default').mockResolvedValue(galleryAlbums)

    const text = await buildGalleryInventoryText(config.defaultGallery, { page: 2, limit: 10 })

    expect(text).toContain('- Albums: 30')
    expect(text).toContain('- Page: 2 of 3')
    expect(text).toContain('- Showing albums 11-20')
    expect(text).toContain('- album-11 | title=Album 11 | year=2024 | keywords=keyword-11')
    expect(text).toContain('- album-20 | title=Album 20 | year=2024 | keywords=keyword-20')
    expect(text).not.toContain('- album-10 |')
    expect(text).not.toContain('- album-21 |')
    expect(text).toContain(`- Previous page: history://gallery/${config.defaultGallery}?page=1&limit=10`)
    expect(text).toContain(`- Next page: history://gallery/${config.defaultGallery}?page=3&limit=10`)
  })

  test('identifies the default and non-default galleries in the gallery inventory', async () => {
    const { galleries } = await getGalleries()
    const defaultGallery = getStorytellingDefaultGallery(galleries)
    const nonDefaultGalleries = galleries.filter(gallery => gallery !== defaultGallery)
    const text = await buildGalleriesDetailsText()

    expect(text).toContain(`Default gallery: ${defaultGallery}`)
    expect(text).toContain(`Non-default galleries: ${nonDefaultGalleries.join(', ') || 'none'}`)
    expect(text).toContain(`- ${defaultGallery} (default): `)
    nonDefaultGalleries.forEach((gallery) => {
      expect(text).toContain(`- ${gallery}: `)
    })
  })

  test('uses the configured gallery only when no non-config gallery exists', () => {
    expect(getStorytellingDefaultGallery([config.defaultGallery])).toBe(config.defaultGallery)
  })

  test('promotes repeated search-only names into album person counts before keyword tags', () => {
    const result = buildAlbumPeopleAndKeywordTags([
      {
        id: '1',
        filename: '2021-01-01-01.jpg',
        photoDate: '2021-01-01',
        city: 'Example City',
        location: 'Arena',
        caption: 'One',
        description: null,
        search: 'concert^, Mark Sample, Lina Example',
        persons: [{ full: 'Known Person', dob: null }],
        title: 'One',
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
        filename: '2021-01-02-01.jpg',
        photoDate: '2021-01-02',
        city: 'Example City',
        location: 'Arena',
        caption: 'Two',
        description: null,
        search: 'concert^, Mark Sample, Lina Example',
        persons: null,
        title: 'Two',
        coordinates: null,
        coordinateAccuracy: null,
        thumbPath: '',
        photoPath: '',
        mediaPath: '',
        videoPaths: null,
        reference: null,
      },
    ], ['Example City'], 8)

    expect(result.personCounts).toEqual([
      { name: 'Mark Sample', count: 2 },
      { name: 'Lina Example', count: 2 },
      { name: 'Known Person', count: 1 },
    ])
    expect(result.keywordTags).toEqual(['concert^ (2)'])
  })

  test('indexes people for storytelling queries', async () => {
    const result = await getPeopleStoryIndex(config.defaultGallery)
    const gingerbread = result.people.find(person => person.name === 'Mister Gingerbread')

    expect(gingerbread).toBeDefined()
    expect(gingerbread?.appearances).toBe(1)
    expect(gingerbread?.albums).toContain(config.defaultAlbum)
  })

  test('builds a people inventory for discovery', async () => {
    const text = await buildPeopleInventoryText(config.defaultGallery)

    expect(text).toContain(`Person inventory for gallery ${config.defaultGallery}`)
    expect(text).toContain('People: ')
    expect(text).toContain('Mister Gingerbread (1 appearance)')
  })

  test('resolves person resource text from a case-insensitive person name', async () => {
    const text = await buildPersonDetailsText(config.defaultGallery, 'mister gingerbread')

    expect(text).toContain('# Person story: Mister Gingerbread')
    expect(text).toContain(`- Album: ${config.defaultAlbum}`)
    expect(text).toContain('- Popular keywords: ')
    expect(text).toContain(
      `View the graphical interface in a web browser: http://localhost:3030/${config.defaultGallery}/persons?query=person%3A%22Mister+Gingerbread%22`,
    )
  })

  test('formats each person album with configured and popular keywords', () => {
    const text = formatPersonResourceText({
      name: 'Taylor Example',
      appearances: 3,
      firstSeen: '2021-02-01',
      lastSeen: '2024-03-04',
      dateOfBirth: null,
      albums: ['sample-album'],
    }, config.defaultGallery, [{
      name: 'sample-album',
      title: 'Sample Album',
      subtitle: 'A sample subtitle',
      year: '2024',
      keywords: ['Nagoya Castle', 'Atsuta Shrine'],
      popularKeywords: ['travel (2)', 'waterfront (1)'],
    }], 'http://localhost:3030/demo/persons?query=person%3ATaylor+Example')

    expect(text).toContain('## Related albums\n- Album: sample-album')
    expect(text).toContain('- Title: Sample Album')
    expect(text).toContain('- Subtitle: A sample subtitle')
    expect(text).toContain('- Gallery includes: Nagoya Castle, Atsuta Shrine')
    expect(text).toContain('- Popular keywords: travel (2), waterfront (1)')
    expect(text).not.toContain('## Gallery keywords')
  })

  test('resolves a search-only person entry from synthetic metadata', async () => {
    const person = resolveSearchOnlyPersonEntryFromItems([
      {
        search: 'Taylor Example, Jordan Sample',
        date: '2021-02-01',
        album: 'sample-album',
      },
      {
        search: 'Taylor Example',
        date: '2022-03-04',
        album: 'other-album',
      },
    ], 'Taylor Example')

    expect(person).toEqual({
      name: 'Taylor Example',
      dateOfBirth: null,
      appearances: 2,
      firstSeen: '2021-02-01',
      lastSeen: '2022-03-04',
      albums: ['sample-album', 'other-album'],
    })
  })

  test('finds on-this-day story matches for a supplied month-day', async () => {
    const result = await getOnThisDayStory(config.defaultGallery, '01-04', 3)

    expect(result.matches.some(item => item.filename === '2004-01-04-01.jpg')).toBe(true)
  })

  test('reports total on-this-day matches and explicit limit wording when truncated', async () => {
    vi.spyOn(allLib, 'getAllData').mockResolvedValue({
      gallery: 'demo',
      items: [
        createSyntheticAllItem('1', '2021-07-18-01.jpg'),
        createSyntheticAllItem('2', '2022-07-18-01.jpg'),
        createSyntheticAllItem('3', '2023-07-18-01.jpg'),
        createSyntheticAllItem('4', '2024-07-18-01.jpg'),
      ],
      indexedKeywords: [],
    })

    const result = await getOnThisDayStory(config.defaultGallery, '07-18', 3)

    expect(result.matches).toHaveLength(3)
    expect(result.summary).toContain('Found ')
    expect(result.summary).toContain('07-18')
    expect(result.summary).toContain('Limited to 3.')
    expect(result.summary).not.toContain('Found 3 on-this-day matches for 07-18.')
  })

  test('builds on-this-day resource text with years, locations, and gallery keywords', async () => {
    const text = await buildDateDetailsText(config.defaultGallery, '01-04', 3)

    expect(text).toContain('# On this day: 01-04')
    expect(text).toContain('- Years: ')
    expect(text).toContain('- Locations: ')
    expect(text).toContain('- Persons: ')
    expect(text).toContain('- Popular: ')
    expect(text).toContain('- Tags: ')
    expect(text).toContain(`## Gallery keywords\n- Album: ${config.defaultAlbum}`)
    expect(text).toContain('Matching memories (newest first):')
    expect(text).toContain('View the graphical interface in a web browser: http://localhost:3030/')
    expect(text).toContain('/today?day=01-04')
    expect(text).not.toContain('.jpg')
  })

  test('maps on-this-day gallery keywords to matching albums only', async () => {
    const matchingItem = {
      ...createSyntheticAllItem('matching', '2024-01-04-01.jpg'),
      album: 'matching-album',
    }
    vi.spyOn(allLib, 'getAllData').mockResolvedValue({
      gallery: config.defaultGallery,
      items: [matchingItem],
      indexedKeywords: [],
    })
    vi.spyOn(todayLib, 'getTodayItems').mockResolvedValue({
      items: [matchingItem],
      indexedKeywords: [],
      locationOptions: [],
      personCounts: [],
      personOptions: [],
      yearOptions: [],
      tagOptions: [],
    })
    const galleryAlbums = {
      [config.defaultGallery]: {
        albums: [
          {
            name: 'matching-album',
            h1: 'Matching album',
            h2: '',
            version: '',
            thumbPath: '',
            year: '2024',
            search: 'matching keyword',
          },
          {
            name: 'unmatched-album',
            h1: 'Unmatched album',
            h2: '',
            version: '',
            thumbPath: '',
            year: '2099',
            search: 'unmatched keyword',
          },
        ],
      },
    } as GalleryAlbumsBody
    vi.spyOn(albumsLib, 'default').mockResolvedValue(galleryAlbums)

    const text = await buildDateDetailsText(config.defaultGallery, '01-04')

    expect(text).toContain('## Gallery keywords\n- Album: matching-album')
    expect(text).toContain('- Gallery includes: matching keyword')
    expect(text).not.toContain('unmatched-album')
    expect(text).not.toContain('unmatched keyword')
  })

  test('omits limit wording from on-this-day resource text', async () => {
    vi.spyOn(allLib, 'getAllData').mockResolvedValue({
      gallery: 'demo',
      items: [
        createSyntheticAllItem('1', '2021-07-18-01.jpg'),
        createSyntheticAllItem('2', '2022-07-18-01.jpg'),
      ],
      indexedKeywords: [],
    })
    vi.spyOn(todayLib, 'getTodayItems').mockResolvedValue({
      items: [],
      indexedKeywords: [],
      locationOptions: [
        {
          label: 'Exampleland (2)',
          value: 'Exampleland',
          count: 2,
          visitedPlace: { country: 'Exampleland', region: null },
        },
      ],
      personCounts: [
        { name: 'Jordan Sample', count: 1 },
        { name: 'Taylor Example', count: 3 },
      ],
      personOptions: [
        { label: 'Jordan Sample (1)', value: 'Jordan Sample', count: 1 },
        { label: 'Taylor Example (3)', value: 'Taylor Example', count: 3 },
      ],
      yearOptions: [{ label: '2021', value: '2021' }],
      tagOptions: [{ label: 'memory', value: 'memory' }],
    })

    const text = await buildDateDetailsText(config.defaultGallery, '07-18', 3)

    expect(text).not.toContain('Limited to 3.')
    expect(text).toContain('Persons: Taylor Example (3), Jordan Sample (1)')
    expect(text).toContain('Matching memories (newest first):')
    expect(text).toContain('- On 2022-07-18 date @ Title 2')
    expect(text).toContain('Album: sample-album')
    expect(text).toContain('Caption: Caption 2')
  })
})
