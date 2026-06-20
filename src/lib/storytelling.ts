import getAlbum from './album'
import getAlbums from './albums'
import { getAllData } from './all'
import getGalleries from './galleries'
import getPersons, { getPersonsData } from './persons'

import type { Gallery, Item, Person, ServerSideAllItem } from '../types/common'

const DEFAULT_LIMIT = 8
const MAX_LIMIT = 25

type StoryMoment = {
  gallery: Gallery
  album: string | null
  filename: string
  date: string | null
  title: string
  caption: string
  description: string | null
  city: string
  location: string | null
  persons: string[]
  mediaPath: string
  thumbPath: string
  reference: Item['reference']
  score: number
  reasons: string[]
}

type StorySearchInput = {
  query?: string
  gallery?: Gallery
  album?: string
  person?: string
  city?: string
  year?: string
  limit?: number
}

type StorySearchResult = {
  summary: string
  filtersApplied: {
    query: string | null
    gallery: Gallery | null
    album: string | null
    person: string | null
    city: string | null
    year: string | null
    limit: number
  }
  totalCandidates: number
  matches: StoryMoment[]
}

type AlbumStoryResult = {
  summary: string
  gallery: Gallery
  album: string
  title: string
  subtitle: string
  year: string | null
  itemCount: number
  places: string[]
  people: string[]
  highlights: StoryMoment[]
}

type PersonStoryIndexEntry = {
  name: string
  dateOfBirth: string | null
  appearances: number
  firstSeen: string | null
  lastSeen: string | null
  albums: string[]
}

type PersonStoryIndexResult = {
  summary: string
  gallery: Gallery
  people: PersonStoryIndexEntry[]
}

type OnThisDayStoryResult = {
  summary: string
  gallery: Gallery
  monthDay: string
  matches: StoryMoment[]
}

type StoryCandidate = Omit<StoryMoment, 'score' | 'reasons'>

const clampLimit = (limit = DEFAULT_LIMIT) => Math.max(1, Math.min(limit, MAX_LIMIT))

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (value === null || value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

const normalize = (value: string | null | undefined) => (value ?? '').trim().toLowerCase()

const tokenize = (value: string | null | undefined) => normalize(value)
  .split(/[^a-z0-9]+/)
  .filter(Boolean)

const unique = <T>(values: T[]) => [...new Set(values)]

const getFilename = (item: Pick<Item, 'filename'> | Pick<ServerSideAllItem, 'filename'>) => asArray(item.filename)[0] ?? ''

const getTitle = (item: Pick<Item, 'title'> | Pick<ServerSideAllItem, 'title'>) => asArray(item.title)[0] ?? ''

const getItemDate = (item: Pick<Item, 'photoDate' | 'filename'> | Pick<ServerSideAllItem, 'photoDate' | 'filename'>) => {
  if (item.photoDate) {
    return item.photoDate
  }

  const filename = getFilename(item)
  const maybeDate = filename.match(/^\d{4}-\d{2}-\d{2}/)
  return maybeDate?.[0] ?? null
}

const getPersonNames = (item: Pick<Item, 'persons'> | Pick<ServerSideAllItem, 'persons'>) => item.persons?.map((person) => person.full) ?? []

const getMonthDay = (item: Pick<Item, 'photoDate' | 'filename'> | Pick<ServerSideAllItem, 'photoDate' | 'filename'>) => {
  const date = getItemDate(item)
  return date?.substring(5, 10) ?? null
}

const compareDatesDescending = (left: string | null, right: string | null) => {
  if (left === right) return 0
  if (left === null) return 1
  if (right === null) return -1
  return right.localeCompare(left)
}

const buildHaystack = (item: StoryCandidate) => normalize([
  item.album,
  item.filename,
  item.date,
  item.title,
  item.caption,
  item.description,
  item.city,
  item.location,
  item.persons.join(' '),
].join(' '))

const buildStoryMoment = (candidate: StoryCandidate, score: number, reasons: string[]): StoryMoment => ({
  ...candidate,
  score,
  reasons,
})

const mapAlbumItemToCandidate = (gallery: Gallery, album: string, item: Item): StoryCandidate => ({
  gallery,
  album,
  filename: getFilename(item),
  date: getItemDate(item),
  title: getTitle(item),
  caption: item.caption,
  description: item.description,
  city: item.city,
  location: item.location,
  persons: getPersonNames(item),
  mediaPath: item.mediaPath,
  thumbPath: item.thumbPath,
  reference: item.reference,
})

const mapAllItemToCandidate = (item: ServerSideAllItem): StoryCandidate => ({
  gallery: item.gallery as Gallery,
  album: item.album ?? null,
  filename: getFilename(item),
  date: getItemDate(item),
  title: getTitle(item),
  caption: item.caption,
  description: item.description,
  city: item.city,
  location: item.location,
  persons: getPersonNames(item),
  mediaPath: item.mediaPath,
  thumbPath: item.thumbPath,
  reference: item.reference,
})

const storyRichness = (candidate: StoryCandidate) => {
  let score = 0

  if (candidate.caption) score += 2
  if (candidate.description) score += 2
  if (candidate.location) score += 1
  if (candidate.city) score += 1
  if (candidate.reference) score += 1
  score += Math.min(candidate.persons.length, 3)

  return score
}

function scoreCandidate(candidate: StoryCandidate, input: StorySearchInput) {
  const haystack = buildHaystack(candidate)
  const reasons: string[] = []
  let score = 0

  const queryTokens = tokenize(input.query)
  if (queryTokens.length > 0) {
    const matchedTokens = queryTokens.filter(token => haystack.includes(token))
    if (matchedTokens.length === 0) {
      return null
    }

    score += matchedTokens.length * 4
    reasons.push(`matched query terms: ${unique(matchedTokens).join(', ')}`)
  }

  if (input.person) {
    const match = candidate.persons.find(person => normalize(person).includes(normalize(input.person)))
    if (!match) {
      return null
    }

    score += 6
    reasons.push(`includes person: ${match}`)
  }

  if (input.city) {
    const cityMatch = [candidate.city, candidate.location]
      .filter(Boolean)
      .find(value => normalize(value).includes(normalize(input.city)))

    if (!cityMatch) {
      return null
    }

    score += 5
    reasons.push(`matches place: ${cityMatch}`)
  }

  if (input.year) {
    const date = candidate.date ?? candidate.filename
    if (!date.startsWith(input.year)) {
      return null
    }

    score += 5
    reasons.push(`matches year: ${input.year}`)
  }

  if (input.album) {
    if (normalize(candidate.album) !== normalize(input.album)) {
      return null
    }

    score += 3
    reasons.push(`matches album: ${candidate.album}`)
  }

  score += storyRichness(candidate)

  if (reasons.length === 0) {
    reasons.push('selected as a rich storytelling candidate')
  }

  return buildStoryMoment(candidate, score, reasons)
}

async function getGalleryCandidates(gallery: Gallery): Promise<StoryCandidate[]> {
  const { items } = await getAllData({ gallery })
  return items.map(mapAllItemToCandidate)
}

async function getScopedCandidates(input: StorySearchInput): Promise<StoryCandidate[]> {
  if (input.gallery && input.album) {
    const { album: { items } } = await getAlbum(input.gallery, input.album)
    return items.map(item => mapAlbumItemToCandidate(input.gallery as Gallery, input.album as string, item))
  }

  const galleries = input.gallery
    ? [input.gallery]
    : (await getGalleries()).galleries

  const groups = await Promise.all(galleries.map(gallery => getGalleryCandidates(gallery)))
  return groups.flat()
}

export async function searchStoryMoments(input: StorySearchInput): Promise<StorySearchResult> {
  const limit = clampLimit(input.limit)
  const candidates = await getScopedCandidates(input)
  const matches = candidates
    .map(candidate => scoreCandidate(candidate, input))
    .filter((candidate): candidate is StoryMoment => candidate !== null)
    .sort((left, right) => right.score - left.score || compareDatesDescending(left.date, right.date))
    .slice(0, limit)

  const candiCount = candidates.length
  const summary = matches.length > 0
    ? `Found ${matches.length} story candidate${matches.length === 1 ? '' : 's'} from ${candiCount} scanned item${candiCount === 1 ? '' : 's'}.`
    : `No story candidates matched across ${candiCount} scanned item${candiCount === 1 ? '' : 's'}.`

  return {
    summary,
    filtersApplied: {
      query: input.query ?? null,
      gallery: input.gallery ?? null,
      album: input.album ?? null,
      person: input.person ?? null,
      city: input.city ?? null,
      year: input.year ?? null,
      limit,
    },
    totalCandidates: candidates.length,
    matches,
  }
}

export async function buildAlbumStory(gallery: Gallery, album: string, limit = DEFAULT_LIMIT): Promise<AlbumStoryResult> {
  const maxItems = clampLimit(limit)
  const [{ album: albumData }, galleryAlbums] = await Promise.all([
    getAlbum(gallery, album),
    getAlbums(gallery),
  ])

  const albumMeta = galleryAlbums[gallery].albums.find(candidate => candidate.name === album)
  const candidates = albumData.items.map(item => mapAlbumItemToCandidate(gallery, album, item))
  const highlights = candidates
    .map(candidate => buildStoryMoment(candidate, storyRichness(candidate), ['selected for narrative richness']))
    .sort((left, right) => right.score - left.score || compareDatesDescending(left.date, right.date))
    .slice(0, maxItems)

  const places = unique(candidates.map(item => item.city).filter(Boolean)).slice(0, maxItems)
  const people = unique(candidates.flatMap(item => item.persons)).slice(0, maxItems)
  const title = albumMeta?.h1 ?? album
  const subtitle = albumMeta?.h2 ?? ''
  const year = albumMeta?.year ?? null
  const summaryParts = [
    `Album ${title}`,
    subtitle ? `set in ${subtitle}` : null,
    year ? `covers ${year}` : null,
    `contains ${albumData.items.length} item${albumData.items.length === 1 ? '' : 's'}`,
  ].filter(Boolean)

  return {
    summary: `${summaryParts.join(', ')}. Returned ${highlights.length} highlight${highlights.length === 1 ? '' : 's'} for storytelling.`,
    gallery,
    album,
    title,
    subtitle,
    year,
    itemCount: albumData.items.length,
    places,
    people,
    highlights,
  }
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

  return {
    summary: `Indexed ${indexedPeople.length} person${indexedPeople.length === 1 ? '' : 's'} for gallery ${gallery}.`,
    gallery,
    people: indexedPeople,
  }
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

  return {
    summary: matches.length > 0
      ? `Found ${matches.length} on-this-day match${matches.length === 1 ? '' : 'es'} for ${targetMonthDay}.`
      : `No on-this-day matches for ${targetMonthDay}.`,
    gallery,
    monthDay: targetMonthDay,
    matches,
  }
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
  StorySearchInput,
  StorySearchResult,
}

