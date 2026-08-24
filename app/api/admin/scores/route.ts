import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'

import {
  classifierFetchFailure,
  classifierHttpFailure,
  classifierUnexpectedResponseFailure,
  parseBackendJson,
  type ClassifierBackendFailure,
} from '../../../../src/lib/classifier-backend'
import { isStandardError, isZodError, simplifyZodMessages } from '../../../../src/lib/errors'
import utilsFactory from '../../../../src/lib/utils'
import config from '../../../../src/models/config'
import { normalizePhotoScore, scoreRequestSchema } from '../../../../src/models/scores'

function failureResponse(failure: ClassifierBackendFailure) {
  return NextResponse.json(
    { error: failure.message, code: failure.code },
    { status: failure.status },
  )
}

export async function POST(req: Request) {
  try {
    const utils = utilsFactory()
    const { path: relativePath } = scoreRequestSchema.parse(await req.json())

    const fullPath = utils.safePublicPath(relativePath)
    const buffer = await fs.readFile(fullPath)
    const body = new Uint8Array(buffer)

    const scoresUrl = `http://localhost:${config.pythonPort}/scores`

    let res: Response
    let responseBody: string
    try {
      res = await fetch(scoresUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/jpeg' },
        body,
        signal: AbortSignal.timeout(180_000),
      })
      responseBody = await res.text()
    } catch (error) {
      return failureResponse(classifierFetchFailure(error))
    }

    const data = parseBackendJson(responseBody)
    if (!res.ok) {
      return failureResponse(classifierHttpFailure(res.status, data))
    }

    try {
      return NextResponse.json(normalizePhotoScore(data))
    } catch {
      return failureResponse(classifierUnexpectedResponseFailure())
    }
  } catch (error) {
    if (isZodError(error)) {
      return NextResponse.json({ error: simplifyZodMessages(error), code: 'request_error' }, { status: 400 })
    }
    const message = isStandardError(error) ? error.message : 'Unexpected error'
    return NextResponse.json({ error: message, code: 'request_error' }, { status: 500 })
  }
}
