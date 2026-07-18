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
  people: z.array(z.string().trim().min(1)),
  personCounts: z.array(personCountSchema),
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
  matches: z.array(storyMomentSchema),
}).strip()

function formatCountedPeople(people: PersonCount[]) {
  return people.map(person => `${person.name} (${person.count})`).join(', ') || 'none'
}

function formatAlbumResourceText(album: Pick<AlbumStoryResult, 'summary' | 'places' | 'personCounts'>) {
  return [
    album.summary,
    `Places: ${album.places.join(', ') || 'none'}`,
    `Persons: ${formatCountedPeople(album.personCounts)}`,
  ].join('\n')
}

function formatPersonResourceText(
  person: Pick<PersonStoryIndexEntry, 'name' | 'appearances' | 'firstSeen' | 'lastSeen' | 'dateOfBirth' | 'albums'>,
  gallery: PersonStoryIndexResult['gallery'],
  guiHref: string,
) {
  return [
    `Person ${person.name}`,
    `Gallery is ${gallery}`,
    `Appearances: ${person.appearances}`,
    `First seen: ${person.firstSeen ?? 'unknown'}`,
    `Last seen: ${person.lastSeen ?? 'unknown'}`,
    `Date of birth: ${person.dateOfBirth ?? 'unknown'}`,
    `Albums: ${person.albums.join(', ') || 'none'}`,
    `GUI: ${guiHref}`,
  ].join('\n')
}

function formatOnThisDayResourceText(
  output: Pick<OnThisDayStoryResult, 'summary' | 'matches'>,
  guiHref: string,
) {
  return [
    output.summary,
    `GUI: ${guiHref}`,
    ...output.matches.map((match) => `${match.date ?? 'unknown'}: ${match.caption} (${match.filename})`),
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
type PersonStoryIndexResult = z.infer<typeof personStoryIndexResultSchema>
type OnThisDayStoryResult = z.infer<typeof onThisDayStoryResultSchema>

export {
  formatAlbumResourceText,
  formatCountedPeople,
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
