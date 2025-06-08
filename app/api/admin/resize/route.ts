import { NextRequest, NextResponse } from 'next/server'

import { errorSchema, resize } from '../../../../src/lib/resize'
import { isZodError, simplifyZodMessages } from '../../../../src/lib/utils'
import { validateRequestBody } from '../../../../src/models/resize'

async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validParams = validateRequestBody(body)
    const out = await resize(validParams)
    return NextResponse.json(out, { status: 200 })
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
