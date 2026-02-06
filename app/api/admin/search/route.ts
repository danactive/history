import { NextRequest, NextResponse } from 'next/server'

import getAlbums from '../../../../src/lib/albums'
import { rawParseOptions, readAlbum } from '../../../../src/lib/xml'
import type { AlbumMeta, Gallery, Item, RawXmlAlbum, RawXmlItem } from '../../../../src/types/common'

export type SearchResult = {
  gallery: Gallery;
  album: AlbumMeta['albumName'];
  filename: Item['filename'];
  index: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    // Get all galleries and albums
    const galleryAlbum = await getAlbums()
    const results: SearchResult[] = []

    // Search through all galleries and albums
    for (const gallery of Object.keys(galleryAlbum) as Gallery[]) {
      const albums = galleryAlbum[gallery].albums

      for (const album of albums) {
        try {
          // Read the album XML
          const xmlAlbum: RawXmlAlbum = await readAlbum(gallery, album.name, rawParseOptions)
          const items = xmlAlbum?.album?.item ? (Array.isArray(xmlAlbum.album.item) ? xmlAlbum.album.item : [xmlAlbum.album.item]) : []

          // Search through items for matching filenames
          items.forEach((item: RawXmlItem, index: number) => {
            const filenames = Array.isArray(item.filename) ? item.filename : [item.filename]
            const hasMatch = filenames.some((filename: string) =>
              filename.toLowerCase().includes(query.toLowerCase()),
            )

            if (hasMatch) {
              results.push({
                gallery,
                album: album.name,
                filename: Array.isArray(item.filename) ? item.filename[0] : item.filename,
                index,
              })
            }
          })
        } catch (error) {
          // Skip albums that can't be read
          console.error(`Error reading album ${gallery}/${album.name}:`, error)
        }
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
