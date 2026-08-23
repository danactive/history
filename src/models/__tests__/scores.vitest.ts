import { describe, expect, test } from 'vitest'

import { normalizePhotoScore } from '../scores'

const validScore = {
  overall_score: 70.8,
  technical_score: 7.1,
  composition_score: 6.4,
  aesthetic_score: 6.8,
  sharpness_score: 6.1,
  exposure_score: 8.4,
  resolution_score: 10,
  image_width: 4032,
  image_height: 3024,
  notes: ['No obvious technical limitation was detected.'],
}

describe('photo score schema', () => {
  test('accepts a complete Python score response', () => {
    expect(normalizePhotoScore(validScore)).toEqual(validScore)
  })

  test('rejects incomplete score responses', () => {
    expect(() => normalizePhotoScore({ overall_score: 70.8 })).toThrow(
      'Score service returned an invalid response',
    )
  })
})
