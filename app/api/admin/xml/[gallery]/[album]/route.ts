import { NextRequest, NextResponse } from 'next/server'
import { isZodError, simplifyZodMessages } from '../../../../../../src/lib/errors'
import { InvalidAlbumXmlError, rawParseOptions, readAlbum, writeAlbum } from '../../../../../../src/lib/xml'
import { xmlSaveRequestSchema } from '../../../../../../src/models/xml'
import { AlbumRevisionConflict, readAlbumVersion } from '../../../../../../src/lib/xml'
import { requireLocalRequest } from '../../../../../../src/lib/curation/local'
import { markAwaiting } from '../../../../../../src/lib/curation/engine'
import { startWorker } from '../../../../../../src/lib/curation/worker'
import { digest } from '../../../../../../src/lib/curation/files'
import type { Gallery, RawXmlAlbum } from '../../../../../../src/types/common'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gallery: Gallery, album: string }> },
) {
  const { gallery, album } = await params

  try {
    if (new URL(request.url).searchParams.get('curation') === '1') {
      requireLocalRequest(request)
      const version = await readAlbumVersion(gallery, album)
      return NextResponse.json(version.data, {
        headers: { 'X-Album-Revision': version.revision, 'Cache-Control': 'no-store' },
      })
    }
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
    const { xml, expectedRevision, curationReview } = xmlSaveRequestSchema.parse(await request.json())

    if (curationReview) requireLocalRequest(request)
    if (expectedRevision) await writeAlbum(gallery, album, xml, expectedRevision)
    else await writeAlbum(gallery, album, xml)
    let verificationError: string | undefined
    if (curationReview) {
      try {
        await markAwaiting(process.cwd(), `${gallery}/${album}`)
        await startWorker(process.cwd(), 'incremental', `${gallery}/${album}`)
      } catch { verificationError = 'Saved successfully; verification could not start. Use Recheck in the inbox.' }
    }
    return NextResponse.json({ saved: true, ...(curationReview ? { revision: digest(xml), verificationError } : {}) })
  } catch (error) {
    if (error instanceof AlbumRevisionConflict) return NextResponse.json({ error: error.message }, { status: 409 })
    if (isZodError(error)) {
      return NextResponse.json({ error: simplifyZodMessages(error) }, { status: 400 })
    }
    if (error instanceof InvalidAlbumXmlError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save XML' }, { status: 500 })
  }
}
