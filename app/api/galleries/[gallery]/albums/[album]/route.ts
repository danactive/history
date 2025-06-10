import { NextRequest, NextResponse } from 'next/server'

import get from '../../../../../../src/lib/album'
import { errorSchema } from '../../../../../../src/models/album'
import type { Gallery } from '../../../../../../src/types/common'

async function GET(
  request: NextRequest,
  props: { params: Promise<{ gallery: Gallery, album: string }> },
) {
  const params = await props.params

  const {
    gallery,
    album,
  } = params

  const out = await get(gallery, album, true)
  return NextResponse.json(out.body, { status: out.status })
}

// Catch-all for unsupported methods
function notSupported(req: Request) {
  return NextResponse.json(errorSchema(`Method ${req.method} Not Allowed`), { status: 405 })
}

export {
  GET,
  notSupported as POST,
  notSupported as PUT,
  notSupported as DELETE,
  notSupported as PATCH,
  notSupported as OPTIONS,
  notSupported as HEAD,
}
