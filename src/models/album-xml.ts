import xml2js from 'xml2js'

import type { RawXmlAlbum, RawXmlItem } from '../types/common'

function buildEditedAlbumXml(xmlAlbum: RawXmlAlbum, items: RawXmlItem[]) {
  const builder = new xml2js.Builder({
    rootName: 'album',
    renderOpts: { pretty: true, indent: '\t' },
    xmldec: { version: '1.0', encoding: 'UTF-8' },
  })

  return builder.buildObject({
    meta: xmlAlbum.album.meta,
    item: items.length === 1 ? items[0] : items,
  })
}

export { buildEditedAlbumXml }
