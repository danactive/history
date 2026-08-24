import * as z from 'zod/v4'

export const scoreRequestSchema = z.object({
  path: z.string().trim().min(1),
})

export const photoScoreSchema = z.object({
  overall_score: z.number().min(0).max(100),
  technical_score: z.number().min(0).max(10),
  composition_score: z.number().min(0).max(10).nullable(),
  aesthetic_score: z.number().min(0).max(10).nullable(),
  sharpness_score: z.number().min(0).max(10),
  exposure_score: z.number().min(0).max(10),
  resolution_score: z.number().min(0).max(10),
  image_width: z.number().int().positive(),
  image_height: z.number().int().positive(),
  notes: z.array(z.string()),
})

export type ScoreRequest = z.infer<typeof scoreRequestSchema>
export type PhotoScore = z.infer<typeof photoScoreSchema>

export function normalizePhotoScore(value: unknown): PhotoScore {
  const result = photoScoreSchema.safeParse(value)
  if (!result.success) throw new Error('Score service returned an invalid response')
  return result.data
}
