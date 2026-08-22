export type PhotoClassificationSuggestion = {
  type: 'organism' | 'architecture'
  id: string
  name: string
  commonName: string | null
  context: string | null
  descriptionValue: string
  score: number
  matchStrength: 'strong' | 'possible' | 'weak'
  reviewCues: string[]
}

export type PhotoClassificationResponse = {
  status: 'matched' | 'no_match'
  suggestions: PhotoClassificationSuggestion[]
  diagnostics: {
    organismStatus: 'identified' | 'uncertain' | 'not_organism' | null
    architectureStatus: 'identified' | 'uncertain' | 'not_architecture' | null
    unavailableClassifiers: string[]
  }
}

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

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
)

export function normalizePhotoClassificationResponse(value: unknown): PhotoClassificationResponse {
  if (
    !isRecord(value)
    || !Array.isArray(value.suggestions)
    || value.suggestions.length > 4
    || typeof value.status !== 'string'
    || !isRecord(value.diagnostics)
  ) {
    throw new Error('Classifier returned an invalid response')
  }

  return value as PhotoClassificationResponse
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
