import { describe, expect, test } from 'vitest'

import {
  classifierFetchFailure,
  classifierHttpFailure,
  classifierUnexpectedResponseFailure,
} from '../classifier-backend'
import {
  appendPhotoDescription,
  encodeClassificationMetadata,
  normalizePhotoClassificationResponse,
} from '../../models/classifier'

describe('classifier response helpers', () => {
  test('accepts the combined photo-classification response shape', () => {
    const value = {
      status: 'no_match',
      suggestions: [],
      diagnostics: {
        organismStatus: 'uncertain',
        architectureStatus: 'not_architecture',
        unavailableClassifiers: [],
      },
    }

    expect(normalizePhotoClassificationResponse(value)).toBe(value)
  })

  test('rejects malformed classifier data', () => {
    expect(() => normalizePhotoClassificationResponse({ suggestions: [{ score: 1 }] })).toThrow(
      'Classifier returned an invalid response',
    )
    expect(() => normalizePhotoClassificationResponse({
      status: 'matched',
      suggestions: [{}, {}, {}, {}, {}],
      diagnostics: {},
    })).toThrow('Classifier returned an invalid response')
  })

  test('appends a scientific name to the photo description once', () => {
    expect(appendPhotoDescription('Rufous-naped lark', 'Lanius cabanisi')).toBe(
      'Rufous-naped lark — Lanius cabanisi',
    )
    expect(appendPhotoDescription('Rufous-naped lark — lanius cabanisi', 'Lanius cabanisi')).toBe(
      'Rufous-naped lark — lanius cabanisi',
    )
    expect(appendPhotoDescription(undefined, 'Pisaster ochraceus')).toBe('Pisaster ochraceus')
  })

  test('encodes Unicode metadata as an HTTP-header-safe ByteString', () => {
    const metadata = 'Tarangire — long-tailed fiscal ō'
    const encoded = encodeClassificationMetadata(metadata)

    expect([...encoded].every(character => character.charCodeAt(0) <= 255)).toBe(true)
    expect(decodeURIComponent(encoded)).toBe(metadata)
  })

  test('turns a stopped Python service into a recoverable 503', () => {
    const error = Object.assign(new TypeError('fetch failed'), {
      cause: { code: 'ECONNREFUSED' },
    })

    expect(classifierFetchFailure(error)).toEqual({
      status: 503,
      code: 'classifier_unavailable',
      message: 'The photo classifier is not running. Start the Python AI service with make ai-api, then try again.',
    })
  })

  test('explains when the running Python image is out of date', () => {
    expect(classifierHttpFailure(404, { detail: 'Not Found' })).toEqual({
      status: 503,
      code: 'classifier_outdated',
      message: 'The Python AI service is out of date. Stop it, run make build-ai-api, then start it with make ai-api.',
    })
    expect(classifierUnexpectedResponseFailure().code).toBe('classifier_outdated')
  })

  test('preserves a useful classifier readiness error', () => {
    expect(classifierHttpFailure(503, { error: 'Architecture model is missing' })).toEqual({
      status: 503,
      code: 'classifier_unavailable',
      message: 'The photo classifier is unavailable: Architecture model is missing',
    })
  })
})
