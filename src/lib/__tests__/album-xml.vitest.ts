import { describe, expect, test } from 'vitest'

import { buildAlbumXml } from '../album-xml'

describe('album-xml', () => {
  test('builds photo items', () => {
    const items = [
      { base: '2024-01-15-10', filename: '2024-01-15-10.jpg', isVideo: false },
      { base: '2024-01-15-11', filename: '2024-01-15-11.jpg', isVideo: false },
    ]
    expect(buildAlbumXml(items)).toBe(
      '<item id="011500"><filename>2024-01-15-10.jpg</filename></item>'
      + '<item id="011501"><filename>2024-01-15-11.jpg</filename></item>',
    )
  })

  test('builds video items', () => {
    const items = [
      { base: '2024-01-15-10', filename: '2024-01-15-10.jpg', isVideo: true },
    ]
    expect(buildAlbumXml(items)).toBe(
      '<item id="011500"><type>video</type><filename>2024-01-15-10.mp4</filename><filename>2024-01-15-10.webm</filename></item>',
    )
  })

  test('uses sequential ids for non-date filenames', () => {
    const items = [
      { base: 'IMG_1234', filename: 'IMG_1234.jpg', isVideo: false },
    ]
    expect(buildAlbumXml(items)).toBe('<item id="100"><filename>IMG_1234.jpg</filename></item>')
  })

  test('uses provided id from filename (exact mode)', () => {
    const items = [
      { base: 'DSC06421', filename: 'DSC06421.jpg', isVideo: false, id: '06421' },
    ]
    expect(buildAlbumXml(items)).toBe('<item id="06421"><filename>DSC06421.jpg</filename></item>')
  })
})
