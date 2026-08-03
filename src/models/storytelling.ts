import * as z from 'zod/v4'
import { generatedGallerySchema } from '../types/generated'

const visitedPlaceSchema = z.object({
  country: z.string().trim().min(1),
  region: z.string().trim().min(1).nullable(),
}).strip()

const storyMomentSchema = z.object({
  gallery: generatedGallerySchema,
  album: z.string().nullable(),
  filename: z.string().trim().min(1),
  date: z.string().trim().min(1).nullable(),
  title: z.string(),
  caption: z.string(),
  description: z.string().nullable(),
  search: z.string().nullable(),
  city: z.string(),
  location: z.string().nullable(),
  persons: z.array(z.string().trim().min(1)),
  mediaPath: z.string(),
  thumbPath: z.string(),
  reference: z.unknown(),
  visitedPlace: visitedPlaceSchema.nullable(),
  score: z.number(),
  reasons: z.array(z.string().trim().min(1)),
}).strip()

const storySearchFiltersSchema = z.object({
  query: z.string().nullable(),
  gallery: generatedGallerySchema.nullable(),
  album: z.string().nullable(),
  person: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  region: z.string().nullable(),
  year: z.string().nullable(),
  limit: z.number().int().min(1).max(25),
}).strip()

const personCountSchema = z.object({
  name: z.string().trim().min(1),
  count: z.number().int().min(1),
}).strip()

const personStoryIndexEntrySchema = z.object({
  name: z.string().trim().min(1),
  dateOfBirth: z.string().trim().min(1).nullable(),
  appearances: z.number().int().min(1),
  firstSeen: z.string().trim().min(1).nullable(),
  lastSeen: z.string().trim().min(1).nullable(),
  albums: z.array(z.string().trim().min(1)),
}).strip()

const personAlbumDetailsSchema = z.object({
  name: z.string().trim().min(1),
  keywordTags: z.array(z.string().trim().min(1)),
}).strip()

export const storySearchInputSchema = z.object({
  query: z.string().optional().describe('Free-text story query such as a place, theme, or event.'),
  gallery: generatedGallerySchema.optional().describe('Gallery name from the local archive.'),
  album: z.string().optional().describe('Album name inside the selected gallery.'),
  person: z.string().optional().describe('Person name to require in the result set.'),
  city: z.string().optional().describe('City or location fragment to require in the result set.'),
  country: z.string().optional().describe('Exact visited country to require, for example Japan or Canada.'),
  region: z.string().optional().describe('Exact visited region to require, for example Aichi, British Columbia, or Hawaii.'),
  year: z.string().optional().describe('Four-digit year to require in the result set.'),
  limit: z.number().int().min(1).max(25).default(8).describe('Maximum number of story moments to return.'),
}).refine(
  value => Boolean(value.query || value.album || value.person || value.city || value.country || value.region || value.year),
  'Provide at least one of query, album, person, city, country, region, or year.',
)

export const storySearchResultSchema = z.object({
  summary: z.string().trim().min(1),
  filtersApplied: storySearchFiltersSchema,
  totalCandidates: z.number().int().min(0),
  matches: z.array(storyMomentSchema),
}).strip()

export const albumStoryResultSchema = z.object({
  summary: z.string().trim().min(1),
  gallery: generatedGallerySchema,
  album: z.string().trim().min(1),
  title: z.string(),
  subtitle: z.string(),
  year: z.string().trim().min(1).nullable(),
  itemCount: z.number().int().min(0),
  places: z.array(z.string().trim().min(1)),
  placeCounts: z.array(personCountSchema),
  people: z.array(z.string().trim().min(1)),
  personCounts: z.array(personCountSchema),
  keywordTags: z.array(z.string().trim().min(1)),
  highlights: z.array(storyMomentSchema),
}).strip()

export const personStoryIndexResultSchema = z.object({
  summary: z.string().trim().min(1),
  gallery: generatedGallerySchema,
  people: z.array(personStoryIndexEntrySchema),
}).strip()

export const onThisDayStoryResultSchema = z.object({
  summary: z.string().trim().min(1),
  gallery: generatedGallerySchema,
  monthDay: z.string().regex(/^\d{2}-\d{2}$/),
  totalMatches: z.number().int().min(0),
  matches: z.array(storyMomentSchema),
}).strip()

function formatCountedValues(values: PersonCount[]) {
  return values
    .slice()
    .sort((left, right) => right.count - left.count)
    .map(value => `${value.name} (${value.count})`)
    .join(', ') || 'none'
}

function formatStoryMomentDetails(memory: StoryMoment) {
  const title = memory.title || memory.caption || memory.description || 'Untitled memory'
  const location = memory.location || memory.city
  const memoryDetails = [
    `  Album: ${memory.album ?? 'unknown'}`,
    memory.caption && memory.caption !== title ? `  Caption: ${memory.caption}` : null,
    memory.description && memory.description !== title && memory.description !== memory.caption
      ? `  Description: ${memory.description}`
      : null,
    location ? `  Location: ${location}` : null,
    memory.persons.length > 0 ? `  People: ${memory.persons.join(', ')}` : null,
  ]

  return [`- ${memory.date ?? 'Unknown date'}: ${title}`, ...memoryDetails.filter(Boolean)]
}

function formatStoryMomentList(
  heading: string,
  moments: StoryMoment[],
  totalMoments: number,
  qualifier: string,
) {
  if (moments.length === 0) {
    return [`${heading}: none`]
  }

  const displayHeading = moments.length < totalMoments
    ? `${heading} (showing ${moments.length} of ${totalMoments}, ${qualifier}):`
    : `${heading} (${qualifier}):`

  return [displayHeading, ...moments.flatMap(formatStoryMomentDetails)]
}

function formatAlbumResourceText(
  album: Pick<AlbumStoryResult, 'summary' | 'placeCounts' | 'personCounts' | 'keywordTags' | 'itemCount' | 'highlights'>,
  guiHref: string,
) {
  return [
    album.summary,
    `Places: ${formatCountedValues(album.placeCounts)}`,
    `Persons: ${formatCountedValues(album.personCounts)}`,
    `Keyword tags: ${album.keywordTags.join(', ') || 'none'}`,
    ...formatStoryMomentList('Highlights', album.highlights, album.itemCount, 'selected for narrative richness'),
    `View the graphical interface in a web browser: ${guiHref}`,
  ].join('\n')
}

function formatPersonResourceText(
  person: Pick<PersonStoryIndexEntry, 'name' | 'appearances' | 'firstSeen' | 'lastSeen' | 'dateOfBirth' | 'albums'>,
  gallery: PersonStoryIndexResult['gallery'],
  albumDetails: PersonAlbumDetails[],
  guiHref: string,
) {
  const albums = albumDetails.length > 0
    ? ['Albums:', ...albumDetails.map(album => [
      `- ${album.name}`,
      `  Keywords: ${album.keywordTags.join(', ') || 'no keyword tags'}`,
    ].join('\n'))]
    : ['Albums: none']

  return [
    `Person ${person.name}`,
    `Gallery is ${gallery}`,
    `Appearances: ${person.appearances}`,
    `First seen: ${person.firstSeen ?? 'unknown'}`,
    `Last seen: ${person.lastSeen ?? 'unknown'}`,
    `Date of birth: ${person.dateOfBirth ?? 'unknown'}`,
    ...albums,
    `View the graphical interface in a web browser: ${guiHref}`,
  ].join('\n')
}

function formatOnThisDayResourceText(
  output: Pick<OnThisDayStoryResult, 'summary' | 'totalMatches' | 'matches'>,
  guiHref: string,
  details: {
    years: string
    locations: string[]
    persons: PersonCount[]
    keywordTags: string[]
  },
) {
  return [
    output.summary,
    `Years: ${details.years || 'none'}`,
    `Locations: ${details.locations.join(', ') || 'none'}`,
    `Persons: ${formatCountedValues(details.persons)}`,
    `Keyword tags: ${details.keywordTags.join(', ') || 'none'}`,
    ...formatStoryMomentList('Matching memories', output.matches, output.totalMatches, 'newest first'),
    `View the graphical interface in a web browser: ${guiHref}`,
  ].join('\n')
}

function validateStorySearchInput(input: unknown) {
  return storySearchInputSchema.parse(input)
}

function validateStorySearchResult(result: StorySearchResult) {
  return storySearchResultSchema.parse(result)
}

function validateAlbumStoryResult(result: AlbumStoryResult) {
  return albumStoryResultSchema.parse(result)
}

function validatePersonStoryIndexResult(result: PersonStoryIndexResult) {
  return personStoryIndexResultSchema.parse(result)
}

function validateOnThisDayStoryResult(result: OnThisDayStoryResult) {
  return onThisDayStoryResultSchema.parse(result)
}

type StorySearchSchemaInput = z.input<typeof storySearchInputSchema>
type StorySearchSchemaOutput = z.output<typeof storySearchInputSchema>
type StoryMoment = z.infer<typeof storyMomentSchema>
type StorySearchResult = z.infer<typeof storySearchResultSchema>
type PersonCount = z.infer<typeof personCountSchema>
type AlbumStoryResult = z.infer<typeof albumStoryResultSchema>
type PersonStoryIndexEntry = z.infer<typeof personStoryIndexEntrySchema>
type PersonAlbumDetails = z.infer<typeof personAlbumDetailsSchema>
type PersonStoryIndexResult = z.infer<typeof personStoryIndexResultSchema>
type OnThisDayStoryResult = z.infer<typeof onThisDayStoryResultSchema>

export {
  formatAlbumResourceText,
  formatCountedValues,
  formatOnThisDayResourceText,
  formatPersonResourceText,
  validateAlbumStoryResult,
  validateOnThisDayStoryResult,
  validatePersonStoryIndexResult,
  validateStorySearchInput,
  validateStorySearchResult,
}

export type {
  AlbumStoryResult,
  OnThisDayStoryResult,
  PersonCount,
  PersonStoryIndexEntry,
  PersonStoryIndexResult,
  StoryMoment,
  StorySearchResult,
  StorySearchSchemaInput,
  StorySearchSchemaOutput,
}
