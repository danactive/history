import * as z from 'zod/v4'

export const identifier = z.string().regex(/^[A-Za-z0-9_-]+$/)
export const digestSchema = z.string().regex(/^[a-f0-9]{64}$/)
export const categorySchema = z.enum(['location', 'tags', 'description'])
export const sourceSchema = z.object({
  gallery: identifier, album: identifier, revision: digestSchema,
  itemId: z.string().optional(), filename: z.string().optional(),
})
export const suggestionSchema = z.object({
  field: z.literal('photo_city'), original: z.string(), proposed: z.string(),
})
export const findingSchema = z.object({
  id: digestSchema, category: categorySchema, reason: z.string(), evidence: z.string(),
  candidates: z.array(z.string()), suggestion: suggestionSchema.optional(),
})
export const rowSchema = z.object({
  id: digestSchema, source: sourceSchema, scope: z.enum(['photo', 'video', 'album']),
  title: z.string(), places: z.array(z.string()), findings: z.array(findingSchema), checkedAt: z.string(),
})
export type Finding = z.infer<typeof findingSchema>
export type CurationRow = z.infer<typeof rowSchema>
export type Suggestion = z.infer<typeof suggestionSchema>
export type ScanMode = 'incremental' | 'full' | 'scheduled'
export type RunStatus = {
  state: 'not-scanned' | 'running' | 'complete' | 'incomplete' | 'failed'
  runId?: string
  mode?: ScanMode
  startedAt?: string
  finishedAt?: string
  completed: number
  total: number
  errors: string[]
}
export type Snapshot = {
  version: 1
  generation: string
  completedAt: string
  lastFullAt?: string
  tagsConfigured: boolean
  shards: string[]
}
export const snapshotSchema = z.object({
  version: z.literal(1), generation: z.string().uuid(), completedAt: z.string().datetime(),
  lastFullAt: z.string().datetime().optional(), tagsConfigured: z.boolean(), shards: z.array(digestSchema),
})
export type InboxResult = {
  rows: CurationRow[]
  status: RunStatus
  snapshot: Snapshot | null
  page: number
  pages: number
  counts: { findings: number, photos: number, albums: number, rows: number }
  galleries: string[]
  albums: string[]
  places: string[]
  awaiting: string[]
}

export const normalizePlace = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
export const primaryFilename = (value: string | string[]) => Array.isArray(value) ? value[0] : value

export function inboxReturn(value?: string) {
  if (!value || !/^\/admin\/curation(?:[?#]|$)/.test(value) || value.includes('\\')) return '/admin/curation'
  return value
}
