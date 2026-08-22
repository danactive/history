export type ClassificationStatus = 'identified' | 'uncertain' | 'not_organism'
export type MatchStrength = 'strong' | 'possible' | 'weak'

export type ClassificationPrediction = {
  taxonId: string
  scientificName: string
  commonName: string | null
  kingdom: string | null
  family: string | null
  genus: string | null
  lineage: string[]
  score: number
  matchStrength: MatchStrength
}

export type ClassificationResponse = {
  status: ClassificationStatus
  model: {
    id: string
    revision: string
    taxonomy: string
  }
  predictions: ClassificationPrediction[]
  diagnostics: {
    candidateCount: number
    cropCount: number
    cropAgreement: number
    topMargin: number
    organismScore: number
    nonOrganismScore: number
    topTwoSameFamily: boolean
    topTwoSameGenus: boolean
    metadataAvailable: boolean
    metadataApplied: boolean
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

export function normalizeClassificationResponse(value: unknown): ClassificationResponse {
  if (
    !isRecord(value)
    || !Array.isArray(value.predictions)
    || typeof value.status !== 'string'
    || !isRecord(value.model)
    || !isRecord(value.diagnostics)
  ) {
    throw new Error('Classifier returned an invalid response')
  }

  return value as ClassificationResponse
}

export function appendSearchKeyword(search: string | undefined, keyword: string): string {
  const trimmedKeyword = keyword.trim()
  const keywords = (search ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)

  if (!keywords.some(value => value.toLocaleLowerCase() === trimmedKeyword.toLocaleLowerCase())) {
    keywords.push(trimmedKeyword)
  }
  return keywords.join(', ')
}
