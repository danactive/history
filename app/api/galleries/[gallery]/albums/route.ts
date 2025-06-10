import { NextRequest, NextResponse } from 'next/server'

import get, { errorSchema } from '../../../../../src/lib/albums'
import type { Gallery } from '../../../../../src/types/common'

async function GET(request: NextRequest, props: { params: Promise<{ gallery: Gallery }> }) {
  const params = await props.params

  const {
    gallery,
  } = params

  const out = await get(gallery, true)
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
