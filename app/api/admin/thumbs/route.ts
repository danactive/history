import { NextRequest, NextResponse } from 'next/server'

import { isZodError, simplifyZodMessages } from '../../../../src/lib/errors'
import { saveThumbnail } from '../../../../src/lib/thumbnail-framing'
import { validateRequestBody } from '../../../../src/models/thumbnail-framing'

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status })
}

async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await saveThumbnail(validateRequestBody(body))
    return NextResponse.json(result)
  } catch (err) {
    if (isZodError(err)) {
      return errorResponse(simplifyZodMessages(err), 400)
    }
    if (err instanceof Error) {
      return errorResponse(err.message, 400)
    }
    return errorResponse('Internal Server Error', 500)
  }
}

function notSupported(req: NextRequest) {
  return errorResponse(`Method ${req.method} Not Allowed`, 405)
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
