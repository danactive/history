import { describe, expect, test } from 'vitest'

import type { RawXmlAlbum, RawXmlItem } from '../../types/common'
import { buildEditedAlbumXml } from '../album-xml'

const item: RawXmlItem = {
  $: { id: '1' },
  filename: '2024-07-12-lake.jpg',
  photo_date: '2024-07-12',
  photo_city: 'Vancouver',
  thumb_caption: 'Lake',
}

const xmlAlbum: RawXmlAlbum = {
  album: {
    meta: { gallery: 'demo', albumName: 'sample' },
    item,
  },
}

describe('buildEditedAlbumXml', () => {
  test('builds the exportable XML from the supplied edited items', () => {
    const xml = buildEditedAlbumXml(xmlAlbum, [{ ...item, photo_city: 'Victoria' }])

    expect(xml).toContain('<album>')
    expect(xml).toContain('<photo_city>Victoria</photo_city>')
    expect(xml).toContain('<albumName>sample</albumName>')
  })
})
