import { describe, expect, test } from 'vitest'

import { encodePathSegments } from '../url-path'

describe('encodePathSegments', () => {
  test('encodes URL syntax in individual path segments', () => {
    expect(encodePathSegments('/test/photos/one?# two.jpg')).toBe('/test/photos/one%3F%23%20two.jpg')
  })

  test('preserves path separators', () => {
    expect(encodePathSegments('/test/photos/sample.jpg')).toBe('/test/photos/sample.jpg')
  })
})
