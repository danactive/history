import { describe, expect, test } from 'vitest'

import {
  appendSearchKeyword,
  encodeClassificationMetadata,
  normalizeClassificationResponse,
} from '../../models/classifier'

describe('classifier response helpers', () => {
  test('accepts the BioCLIP response shape', () => {
    const value = {
      status: 'uncertain',
      model: { id: 'imageomics/bioclip-2' },
      predictions: [],
      diagnostics: {},
    }

    expect(normalizeClassificationResponse(value)).toBe(value)
  })

  test('rejects malformed classifier data', () => {
    expect(() => normalizeClassificationResponse({ predictions: [{ score: 1 }] })).toThrow(
      'Classifier returned an invalid response',
    )
  })

  test('appends a keyword once while preserving existing keywords', () => {
    expect(appendSearchKeyword('spider, outdoors', 'Araneus diadematus')).toBe(
      'spider, outdoors, Araneus diadematus',
    )
    expect(appendSearchKeyword('spider, araneus diadematus', 'Araneus diadematus')).toBe(
      'spider, araneus diadematus',
    )
  })

  test('encodes Unicode metadata as an HTTP-header-safe ByteString', () => {
    const metadata = 'Tarangire — long-tailed fiscal ō'
    const encoded = encodeClassificationMetadata(metadata)

    expect([...encoded].every(character => character.charCodeAt(0) <= 255)).toBe(true)
    expect(decodeURIComponent(encoded)).toBe(metadata)
  })
})
