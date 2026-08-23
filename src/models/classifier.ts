import * as z from 'zod/v4'

import { xmlGeoInputSchema } from './schemas'
import { scoreRequestSchema } from './scores'
import {
  storyMomentCitySchema,
  storyMomentDateSchema,
  storyMomentLocationSchema,
} from './storytelling'

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

const galleryAssetPathSchema = scoreRequestSchema.shape.path.refine(
  (value) => value.startsWith('/galleries/'),
  { message: 'Path must point to a gallery asset' },
)

const classificationGeoSchema = xmlGeoInputSchema.pick({ lat: true, lon: true }).partial()

export const classificationRequestSchema = z.object({
  path: galleryAssetPathSchema,
  fallbackPath: galleryAssetPathSchema.optional(),
  photoDate: storyMomentDateSchema.optional(),
  city: storyMomentCitySchema.optional(),
  location: storyMomentLocationSchema.optional(),
  geo: classificationGeoSchema.optional(),
})

export type PhotoClassificationSuggestion = z.infer<typeof photoClassificationSuggestionSchema>
export type PhotoClassificationResponse = z.infer<typeof photoClassificationResponseSchema>
export type ClassificationRequest = z.infer<typeof classificationRequestSchema>

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
