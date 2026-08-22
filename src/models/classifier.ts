import * as z from 'zod/v4'

const photoClassificationSuggestionSchema = z.object({
  type: z.enum(['organism', 'architecture']),
  id: z.string(),
  name: z.string(),
  commonName: z.string().nullable(),
  context: z.string().nullable(),
  descriptionValue: z.string(),
  score: z.number(),
  matchStrength: z.enum(['strong', 'possible', 'weak']),
  reviewCues: z.array(z.string()),
})

const photoClassificationResponseSchema = z.object({
  status: z.enum(['matched', 'no_match']),
  suggestions: z.array(photoClassificationSuggestionSchema).max(4),
  diagnostics: z.object({
    organismStatus: z.enum(['identified', 'uncertain', 'not_organism']).nullable(),
    architectureStatus: z.enum(['identified', 'uncertain', 'not_architecture']).nullable(),
    unavailableClassifiers: z.array(z.string()),
  }),
})

export type PhotoClassificationSuggestion = z.infer<typeof photoClassificationSuggestionSchema>
export type PhotoClassificationResponse = z.infer<typeof photoClassificationResponseSchema>

export type ClassificationRequest = {
  path: string
  fallbackPath?: string
  photoDate?: string | null
  city?: string
  location?: string
  geo?: {
    lat?: string
    lon?: string
  }
}

export function encodeClassificationMetadata(value: string): string {
  return encodeURIComponent(value)
}

function isPhotoClassificationResponse(value: unknown): value is PhotoClassificationResponse {
  return photoClassificationResponseSchema.safeParse(value).success
}

export function normalizePhotoClassificationResponse(value: unknown): PhotoClassificationResponse {
  if (!isPhotoClassificationResponse(value)) {
    throw new Error('Classifier returned an invalid response')
  }

  return value
}

export function appendPhotoDescription(description: string | undefined, value: string): string {
  const currentDescription = (description ?? '').trim()
  const trimmedValue = value.trim()

  if (!trimmedValue) return currentDescription
  if (currentDescription.toLocaleLowerCase().includes(trimmedValue.toLocaleLowerCase())) {
    return currentDescription
  }
  return currentDescription ? `${currentDescription} — ${trimmedValue}` : trimmedValue
}
