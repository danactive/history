import { NextRequest, NextResponse } from 'next/server'

import { rawParseOptions, readAlbum } from '../../../../../../src/lib/xml'
import type { Gallery, RawXmlAlbum } from '../../../../../../src/types/common'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gallery: string, album: string }> },
) {
  const { gallery, album } = await params

  try {
    // Use existing readAlbum with raw parse options (no camelCase transformation)
    const xmlAlbum: RawXmlAlbum = await readAlbum(gallery as Gallery, album, rawParseOptions)

    return NextResponse.json(xmlAlbum)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load XML' }, { status: 500 })
  }
}
