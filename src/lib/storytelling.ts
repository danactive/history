import {
  formatAlbumResourceText,
  validateAlbumStoryResult,
  validateOnThisDayStoryResult,
  validatePersonStoryIndexResult,
  validateStorySearchInput,
  validateStorySearchResult,
  type AlbumStoryResult,
  type OnThisDayStoryResult,
  type PersonStoryIndexEntry,
  type PersonStoryIndexResult,
  type StoryMoment,
  type StorySearchResult,
  type StorySearchSchemaInput,
} from '../models/storytelling'
import type { Gallery, Person } from '../types/common'
import getAlbum from './album'
import getAlbums from './albums'
import { getAllData } from './all'
import getGalleries from './galleries'
import getPersons, { getPersonsData } from './persons'
import {
  buildStoryMoment,
  getItemDate,
  getMonthDay,
  getPersonNames,
  mapAlbumItemToCandidate,
  mapAllItemToCandidate,
  type StoryCandidate,
} from './storytelling-candidates'
import {
  compareDatesDescending,
  countValuesByFrequency,
  getVisitedPlaceFilter,
  scoreCandidate,
  sortValuesByFrequency,
  storyRichness,
} from './storytelling-ranking'
import { buildVisitedRegionCountryIndex } from './visited'

const DEFAULT_LIMIT = 8
const MAX_LIMIT = 25

const clampLimit = (limit = DEFAULT_LIMIT) => Math.max(1, Math.min(limit, MAX_LIMIT))

async function getGalleryCandidates(gallery: Gallery): Promise<StoryCandidate[]> {
  const { items } = await getAllData({ gallery })
  return items.map(mapAllItemToCandidate)
}

async function getScopedCandidates(input: StorySearchSchemaInput): Promise<StoryCandidate[]> {
  if (input.gallery && input.album) {
    const { album: { items } } = await getAlbum(input.gallery, input.album)
    const regionCountryIndex = buildVisitedRegionCountryIndex(items)
    return items.map(item => mapAlbumItemToCandidate(input.gallery as Gallery, input.album as string, item, regionCountryIndex))
  }

  const galleries = input.gallery
    ? [input.gallery]
    : (await getGalleries()).galleries

  const visitedFilter = getVisitedPlaceFilter(input)
  const groups = await Promise.all(galleries.map(async (gallery) => {
    if (visitedFilter) {
      const { items } = await getAllData({ gallery }, visitedFilter)
      return items.map(mapAllItemToCandidate)
    }

    return getGalleryCandidates(gallery)
  }))
  return groups.flat()
}

export async function searchStoryMoments(input: StorySearchSchemaInput): Promise<StorySearchResult> {
  const validatedInput = validateStorySearchInput(input)
  const limit = clampLimit(validatedInput.limit)
  const candidates = await getScopedCandidates(validatedInput)
  const matches = candidates
    .map(candidate => scoreCandidate(candidate, validatedInput))
    .filter((candidate): candidate is StoryMoment => candidate !== null)
    .sort((left, right) => right.score - left.score || compareDatesDescending(left.date, right.date))
    .slice(0, limit)

  const candiCount = candidates.length
  const summary = matches.length > 0
    ? `Found ${matches.length} story candidate${matches.length === 1 ? '' : 's'} from ${candiCount} scanned item${candiCount === 1 ? '' : 's'}.`
    : `No story candidates matched across ${candiCount} scanned item${candiCount === 1 ? '' : 's'}.`

  return validateStorySearchResult({
    summary,
    filtersApplied: {
      query: input.query ?? null,
      gallery: validatedInput.gallery ?? null,
      album: validatedInput.album ?? null,
      person: validatedInput.person ?? null,
      city: validatedInput.city ?? null,
      country: validatedInput.country ?? null,
      region: validatedInput.region ?? null,
      year: validatedInput.year ?? null,
      limit,
    },
    totalCandidates: candidates.length,
    matches,
  })
}

export async function buildAlbumStory(gallery: Gallery, album: string, limit = DEFAULT_LIMIT): Promise<AlbumStoryResult> {
  const maxItems = clampLimit(limit)
  const [{ album: albumData }, galleryAlbums] = await Promise.all([
    getAlbum(gallery, album),
    getAlbums(gallery),
  ])

  const albumMeta = galleryAlbums[gallery].albums.find(candidate => candidate.name === album)
  const regionCountryIndex = buildVisitedRegionCountryIndex(albumData.items)
  const candidates = albumData.items.map(item => mapAlbumItemToCandidate(gallery, album, item, regionCountryIndex))
  const highlights = candidates
    .map(candidate => buildStoryMoment(candidate, storyRichness(candidate), ['selected for narrative richness']))
    .sort((left, right) => right.score - left.score || compareDatesDescending(left.date, right.date))
    .slice(0, maxItems)

  const places = sortValuesByFrequency(candidates.map(item => item.city).filter(Boolean), maxItems)
  const personCounts = countValuesByFrequency(candidates.flatMap(item => item.persons), maxItems)
  const people = personCounts.map(person => person.name)
  const title = albumMeta?.h1 ?? album
  const subtitle = albumMeta?.h2 ?? ''
  const year = albumMeta?.year ?? null
  const summaryParts = [
    `Album ${title}`,
    subtitle ? `set in ${subtitle}` : null,
    year ? `covers ${year}` : null,
    `contains ${albumData.items.length} item${albumData.items.length === 1 ? '' : 's'}`,
  ].filter(Boolean)

  return validateAlbumStoryResult({
    summary: `${summaryParts.join(', ')}. Returned ${highlights.length} highlight${highlights.length === 1 ? '' : 's'} for storytelling.`,
    gallery,
    album,
    title,
    subtitle,
    year,
    itemCount: albumData.items.length,
    places,
    people,
    personCounts,
    highlights,
  })
}

export async function buildAlbumResourceText(gallery: Gallery, album: string, limit = DEFAULT_LIMIT) {
  const output = await buildAlbumStory(gallery, album, limit)
  return formatAlbumResourceText(output)
}

export async function getPeopleStoryIndex(gallery: Gallery): Promise<PersonStoryIndexResult> {
  const [people, allPeopleItems] = await Promise.all([
    getPersons(gallery),
    getPersonsData({ gallery }),
  ])

  const peopleByName = new Map<string, Person>(people.map(person => [person.full, person]))
  const aggregate = new Map<string, PersonStoryIndexEntry>()

  allPeopleItems.items.forEach((item) => {
    const date = getItemDate(item)
    const album = item.album ?? null
    getPersonNames(item).forEach((name) => {
      const current = aggregate.get(name)
      if (!current) {
        aggregate.set(name, {
          name,
          dateOfBirth: peopleByName.get(name)?.dob ?? null,
          appearances: 1,
          firstSeen: date,
          lastSeen: date,
          albums: album ? [album] : [],
        })
        return
      }

      current.appearances += 1
      current.firstSeen = current.firstSeen === null || (date !== null && date < current.firstSeen)
        ? date
        : current.firstSeen
      current.lastSeen = current.lastSeen === null || (date !== null && date > current.lastSeen)
        ? date
        : current.lastSeen
      if (album && !current.albums.includes(album)) {
        current.albums.push(album)
      }
    })
  })

  const indexedPeople = [...aggregate.values()]
    .sort((left, right) => right.appearances - left.appearances || left.name.localeCompare(right.name))

  return validatePersonStoryIndexResult({
    summary: `Indexed ${indexedPeople.length} person${indexedPeople.length === 1 ? '' : 's'} for gallery ${gallery}.`,
    gallery,
    people: indexedPeople,
  })
}

export async function getOnThisDayStory(gallery: Gallery, monthDay?: string, limit = DEFAULT_LIMIT): Promise<OnThisDayStoryResult> {
  const targetMonthDay = monthDay ?? new Date().toLocaleString('en-CA').substring(5, 10)
  const maxItems = clampLimit(limit)
  const { items } = await getAllData({ gallery })

  const matches = items
    .filter(item => getMonthDay(item) === targetMonthDay)
    .map(item => {
      const candidate = mapAllItemToCandidate(item)
      return buildStoryMoment(candidate, storyRichness(candidate), [`matches month-day: ${targetMonthDay}`])
    })
    .sort((left, right) => compareDatesDescending(left.date, right.date))
    .slice(0, maxItems)

  return validateOnThisDayStoryResult({
    summary: matches.length > 0
      ? `Found ${matches.length} on-this-day match${matches.length === 1 ? '' : 'es'} for ${targetMonthDay}.`
      : `No on-this-day matches for ${targetMonthDay}.`,
    gallery,
    monthDay: targetMonthDay,
    matches,
  })
}

export async function buildStorytellingOverview() {
  const { galleries } = await getGalleries()
  const counts = await Promise.all(galleries.map(async (gallery) => {
    const albumData = await getAlbums(gallery)
    return `${gallery}: ${albumData[gallery].albums.length} album(s)`
  }))

  return [
    'History storytelling MCP server',
    'Read-only tools for finding people, places, albums, and narrative moments in a local photo/video archive.',
    `Available galleries: ${galleries.join(', ') || 'none'}`,
    ...counts,
    'Recommended flow: search_story_moments -> get_album_story -> write-history-story prompt.',
  ].join('\n')
}

export type {
  AlbumStoryResult,
  OnThisDayStoryResult,
  PersonStoryIndexResult,
  StoryMoment,
  StorySearchResult,
  StorySearchSchemaInput,
}

