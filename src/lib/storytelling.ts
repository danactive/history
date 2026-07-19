import {
  formatAlbumResourceText,
  formatOnThisDayResourceText,
  formatPersonResourceText,
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
import type { Gallery, Item, Person } from '../types/common'
import getAlbum from './album'
import getAlbums from './albums'
import { getAllData } from './all'
import getGalleries from './galleries'
import { buildPersonGuiHref, buildTodayGuiHref } from './monthDay'
import getPersons, { getPersonsData } from './persons'
import indexKeywords from './search'
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
  storyRichness,
} from './storytelling-ranking'
import { buildVisitedRegionCountryIndex, formatVisitedYears } from './visited'
import { getTodayItems } from './today'

const DEFAULT_LIMIT = 8
const MAX_LIMIT = 25

const clampLimit = (limit = DEFAULT_LIMIT) => Math.max(1, Math.min(limit, MAX_LIMIT))

const hasPersonLikeCasing = (value: string) => /^[A-Z][A-Za-z'-]+(?: [A-Z][A-Za-z'-]+)+$/.test(value)

function buildAlbumPeopleAndKeywordTags(
  items: Item[],
  places: string[],
  limit: number,
) {
  const indexedKeywords = indexKeywords(items).indexedKeywords
  const itemPersonCounts = countValuesByFrequency(
    items.flatMap((item) => item.persons?.map((person) => person.full) ?? []),
    items.length,
  )
  const itemPersonNames = new Set(itemPersonCounts.map(person => person.name))
  const searchOnlyPersonCounts = countValuesByFrequency(
    items.flatMap((item) => item.search?.split(', ').map((token) => token.trim()).filter(Boolean) ?? []),
    items.length * 10,
  ).filter(({ name, count }) => !itemPersonNames.has(name)
    && !name.endsWith('^')
    && !places.includes(name)
    && !/^\d{4}$/.test(name)
    && hasPersonLikeCasing(name)
    && count > 0)

  const personCounts = [...itemPersonCounts, ...searchOnlyPersonCounts]
    .sort((left, right) => right.count - left.count)
    .slice(0, limit)
  const people = personCounts.map(person => person.name)
  const keywordTags = indexedKeywords
    .filter(option => option.value.endsWith('^'))
    .map(option => option.label)
    .slice(0, limit)

  return {
    people,
    personCounts,
    keywordTags,
  }
}

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
      const { items } = await getAllData({ gallery, visitedPlace: visitedFilter })
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

  const placeCounts = countValuesByFrequency(candidates.map(item => item.city).filter(Boolean), maxItems)
  const places = placeCounts.map(place => place.name)
  const { people, personCounts, keywordTags } = buildAlbumPeopleAndKeywordTags(
    albumData.items,
    places,
    maxItems,
  )
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
    summary: `${summaryParts.join(', ')}.`,
    gallery,
    album,
    title,
    subtitle,
    year,
    itemCount: albumData.items.length,
    places,
    placeCounts,
    people,
    personCounts,
    keywordTags,
    highlights,
  })
}

export async function buildAlbumDetailsText(gallery: Gallery, album: string, limit = DEFAULT_LIMIT) {
  const output = await buildAlbumStory(gallery, album, limit)
  return formatAlbumResourceText(output)
}

function resolvePersonEntry(output: PersonStoryIndexResult, name: string) {
  const normalizedName = name.trim().toLowerCase()
  const exactMatch = output.people.find((candidate) => candidate.name === name)
  if (exactMatch) {
    return exactMatch
  }

  const caseInsensitiveMatch = output.people.find((candidate) => candidate.name.toLowerCase() === normalizedName)
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch
  }

  const partialMatches = output.people.filter((candidate) => candidate.name.toLowerCase().includes(normalizedName))
  if (partialMatches.length === 1) {
    return partialMatches[0] ?? null
  }

  return null
}

function getSearchTokenMatches(search: string | null | undefined, name: string) {
  if (!search) return [] as string[]

  const normalizedName = name.trim().toLowerCase()
  return search
    .split(', ')
    .map(token => token.trim())
    .filter(token => token.length > 0 && token.toLowerCase() === normalizedName)
}

type SearchOnlyPersonInput = Pick<StoryMoment, 'search' | 'date' | 'album'>

function resolveSearchOnlyPersonEntryFromItems(items: SearchOnlyPersonInput[], name: string): PersonStoryIndexEntry | null {
  const aggregate = new Map<string, PersonStoryIndexEntry>()

  items.forEach((item) => {
    const date = item.date
    const album = item.album ?? null
    getSearchTokenMatches(item.search, name).forEach((matchedName) => {
      const current = aggregate.get(matchedName)
      if (!current) {
        aggregate.set(matchedName, {
          name: matchedName,
          dateOfBirth: null,
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

  return aggregate.get(name) ?? [...aggregate.values()][0] ?? null
}

async function resolveSearchOnlyPersonEntry(gallery: Gallery, name: string): Promise<PersonStoryIndexEntry | null> {
  const { items } = await getAllData({ gallery })
  return resolveSearchOnlyPersonEntryFromItems(items.map((item) => ({
    search: item.search,
    date: getItemDate(item),
    album: item.album ?? null,
  })), name)
}

async function getResolvedPersonResource(gallery: Gallery, name: string) {
  const output = await getPeopleStoryIndex(gallery)
  const person = resolvePersonEntry(output, name) ?? await resolveSearchOnlyPersonEntry(gallery, name)
  if (!person) {
    throw new ReferenceError(`No person named ${name} was found in gallery ${gallery}`)
  }

  return {
    person,
    text: formatPersonResourceText(person, gallery, buildPersonGuiHref(gallery, person.name)),
  }
}

export async function buildPersonDetailsText(gallery: Gallery, name: string) {
  const { text } = await getResolvedPersonResource(gallery, name)
  return text
}

export async function resolvePersonResource(gallery: Gallery, name: string) {
  return getResolvedPersonResource(gallery, name)
}

export { buildAlbumPeopleAndKeywordTags, resolveSearchOnlyPersonEntryFromItems }

export async function buildDateDetailsText(gallery: Gallery, monthDay?: string, maxDisplayEntries = DEFAULT_LIMIT) {
  const output = await getOnThisDayStory(gallery, monthDay)
  const displayLimit = clampLimit(maxDisplayEntries)
  const resourceSummary = output.totalMatches > 0
    ? `Found ${output.totalMatches} on-this-day match${output.totalMatches === 1 ? '' : 'es'} for ${output.monthDay}.`
    : `No on-this-day matches for ${output.monthDay}.`

  const { locationOptions, personCounts, yearOptions, tagOptions } = await getTodayItems(gallery, output.monthDay)
  const years = formatVisitedYears(yearOptions
    .map(option => option.value)
    .filter(value => /^\d{4}$/.test(value))
    .slice(0, displayLimit))
  const keywordTags = tagOptions
    .slice(0, displayLimit)
    .map(option => option.label)

  return formatOnThisDayResourceText({ summary: resourceSummary }, buildTodayGuiHref(gallery, output.monthDay), {
    years,
    locations: locationOptions.slice(0, displayLimit).map(option => option.label),
    persons: personCounts.slice(0, displayLimit),
    keywordTags,
  })
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

  const allMatches = items
    .filter(item => getMonthDay(item) === targetMonthDay)
    .map(item => {
      const candidate = mapAllItemToCandidate(item)
      return buildStoryMoment(candidate, storyRichness(candidate), [`matches month-day: ${targetMonthDay}`])
    })
    .sort((left, right) => compareDatesDescending(left.date, right.date))
  const totalMatches = allMatches.length
  const matches = allMatches
    .slice(0, maxItems)
  const limitSuffix = totalMatches > maxItems
    ? ` Limited to ${matches.length}.`
    : ''

  const summary = totalMatches > 0
    ? `Found ${totalMatches} on-this-day match${totalMatches === 1 ? '' : 'es'} for ${targetMonthDay}.${limitSuffix}`
    : `No on-this-day matches for ${targetMonthDay}.`

  return validateOnThisDayStoryResult({
    summary,
    gallery,
    monthDay: targetMonthDay,
    totalMatches,
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

