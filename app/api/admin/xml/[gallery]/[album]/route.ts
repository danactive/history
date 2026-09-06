import { NextRequest, NextResponse } from 'next/server'
import { isZodError, simplifyZodMessages } from '../../../../../../src/lib/errors'
import { InvalidAlbumXmlError, rawParseOptions, readAlbum, writeAlbum } from '../../../../../../src/lib/xml'
import { xmlSaveRequestSchema } from '../../../../../../src/models/xml'
import type { Gallery, RawXmlAlbum } from '../../../../../../src/types/common'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gallery: Gallery, album: string }> },
) {
  const { gallery, album } = await params

  try {
    // Use existing readAlbum with raw parse options (no camelCase transformation)
    const xmlAlbum: RawXmlAlbum = await readAlbum(gallery, album, rawParseOptions)

    return NextResponse.json(xmlAlbum)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load XML' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ gallery: Gallery, album: string }> },
) {
  const { gallery, album } = await params

  try {
    const { xml } = xmlSaveRequestSchema.parse(await request.json())

    await writeAlbum(gallery, album, xml)
    return NextResponse.json({ saved: true })
  } catch (error) {
    if (isZodError(error)) {
      return NextResponse.json({ error: simplifyZodMessages(error) }, { status: 400 })
    }
    if (error instanceof InvalidAlbumXmlError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save XML' }, { status: 500 })
  }
}
