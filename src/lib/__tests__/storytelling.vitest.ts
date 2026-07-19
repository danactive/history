import { afterEach, describe, expect, test, vi } from 'vitest'

import config from '../../models/config'
import { formatAlbumResourceText } from '../../models/storytelling'
import getAlbum from '../album'
import * as allLib from '../all'
import * as todayLib from '../today'
import {
  buildAlbumPeopleAndKeywordTags,
  buildGalleryDetailsText,
  buildAlbumStory,
  buildDateDetailsText,
  buildPersonDetailsText,
  getOnThisDayStory,
  getPeopleStoryIndex,
  resolveSearchOnlyPersonEntryFromItems,
  searchStoryMoments,
} from '../storytelling'

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

  test('formats album details with descending persons and keyword tags', () => {
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
      keywordTags: ['architecture (2)', 'memory (1)'],
    })

    expect(text).toContain('Places: Example City (3), Sample Town (1)')
    expect(text).toContain('Persons: Taylor Example (3), Jordan Sample (1)')
    expect(text).toContain('Keyword tags: architecture (2), memory (1)')
  })

  test('builds gallery details text from the shared builder', async () => {
    const text = await buildGalleryDetailsText(config.defaultGallery)

    expect(text).toContain(`Gallery is ${config.defaultGallery}`)
    expect(text).toContain('Albums: ')
    expect(text).toContain('sample: Sample')
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

  test('resolves person resource text from a case-insensitive person name', async () => {
    const text = await buildPersonDetailsText(config.defaultGallery, 'mister gingerbread')

    expect(text).toContain('Person Mister Gingerbread')
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

  test('builds on-this-day resource text with years, locations, and keyword tags', async () => {
    const text = await buildDateDetailsText(config.defaultGallery, '01-04', 3)

    expect(text).toContain('Years: ')
    expect(text).toContain('Locations: ')
    expect(text).toContain('Persons: ')
    expect(text).toContain('Keyword tags: ')
    expect(text).toContain('GUI: http://localhost:3030/')
    expect(text).not.toContain('.jpg')
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
  })
})
