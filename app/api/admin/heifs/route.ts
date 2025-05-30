import { NextRequest, NextResponse } from 'next/server'

import post, { errorSchema } from '../../../../src/lib/heifs'
import { isZodError, simplifyZodMessages } from '../../../../src/lib/utils'
import requestSchema from '../../../../src/models/heifs'

async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    requestSchema.parse(body || {})

    const out = await post(body.files, body.destinationPath, true)
    return NextResponse.json(out.body, { status: out.status })
  } catch (err) {
    if (isZodError(err)) {
      return NextResponse.json(errorSchema(simplifyZodMessages(err)), { status: 400 })
    }
    return NextResponse.json(errorSchema('Internal Server Error'), { status: 500 })
  }
}

// Catch-all for unsupported methods
function notSupported(req: NextRequest) {
  return NextResponse.json(errorSchema(`Method ${req.method} Not Allowed`), { status: 405 })
}

export {
  notSupported as GET,
  POST,
  notSupported as PUT,
  notSupported as DELETE,
  notSupported as PATCH,
  notSupported as OPTIONS,
  notSupported as HEAD,
}
