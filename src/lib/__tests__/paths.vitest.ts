import { describe, expect, test } from 'vitest'

import { originalPath, photoPath, thumbPath } from '../paths'

describe('media paths', () => {
  test('uses the legacy false directory for undated nested media', () => {
    const filename = 'art/example.jpg'

    expect(thumbPath(filename, 'demo')).toBe('/galleries/demo/media/thumbs/false/art/example.jpg')
    expect(photoPath(filename, 'demo')).toBe('/galleries/demo/media/photos/false/art/example.jpg')
    expect(originalPath(filename, 'demo')).toBe('/galleries/demo/media/originals/false/art/example.jpg')
  })
})
