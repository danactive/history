import { NextResponse } from 'next/server'

import get, { errorSchema } from '../../../src/lib/galleries'

async function GET(req: Request) {
  const out = await get(true)
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
