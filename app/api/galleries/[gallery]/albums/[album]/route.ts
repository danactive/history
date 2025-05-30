import { NextRequest, NextResponse } from 'next/server'

import get from '../../../../../../src/lib/album'
import { errorSchema } from '../../../../../../src/models/album'

async function GET(request: NextRequest, { params: { gallery, album } }: { params: { gallery: string, album: string } }) {
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
