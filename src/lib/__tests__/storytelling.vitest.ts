import { describe, expect, test } from 'vitest'

import config from '../../models/config'
import {
  buildAlbumStory,
  getOnThisDayStory,
  getPeopleStoryIndex,
  searchStoryMoments,
} from '../storytelling'

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

    expect(result.title).toBe('Sample')
    expect(result.year).toBe('2001-2005')
    expect(result.highlights.length).toBeGreaterThan(0)
  })

  test('indexes people for storytelling queries', async () => {
    const result = await getPeopleStoryIndex(config.defaultGallery)
    const gingerbread = result.people.find(person => person.name === 'Mister Gingerbread')

    expect(gingerbread).toBeDefined()
    expect(gingerbread?.appearances).toBe(1)
    expect(gingerbread?.albums).toContain(config.defaultAlbum)
  })

  test('finds on-this-day story matches for a supplied month-day', async () => {
    const result = await getOnThisDayStory(config.defaultGallery, '01-04', 3)

    expect(result.matches.some(item => item.filename === '2004-01-04-01.jpg')).toBe(true)
  })
})