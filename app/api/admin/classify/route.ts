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
import {
  classificationRequestSchema,
  encodeClassificationMetadata,
  normalizePhotoClassificationResponse,
} from '../../../../src/models/classifier'

function setMetadataHeader(headers: Headers, name: string, value?: string | null) {
  if (value) headers.set(name, encodeClassificationMetadata(value))
}

function failureResponse(failure: ClassifierBackendFailure) {
  return NextResponse.json(
    { error: failure.message, code: failure.code },
    { status: failure.status },
  )
}

export async function POST(req: Request) {
  try {
    const utils = utilsFactory()
    const request = classificationRequestSchema.parse(await req.json())
    const relativePath = request.path

    const fullPath = utils.safePublicPath(relativePath)
    let buffer: Buffer
    try {
      buffer = await fs.readFile(fullPath)
    } catch (error) {
      if (!request.fallbackPath) throw error
      buffer = await fs.readFile(utils.safePublicPath(request.fallbackPath))
    }
    const body = new Uint8Array(buffer) // TS-compatible BodyInit
    const headers = new Headers({
      'Content-Type': 'image/jpeg',
      'X-Photo-Metadata-Encoding': 'percent',
    })

    setMetadataHeader(headers, 'X-Photo-Date', request.photoDate)
    setMetadataHeader(headers, 'X-Photo-Latitude', request.geo?.lat)
    setMetadataHeader(headers, 'X-Photo-Longitude', request.geo?.lon)
    setMetadataHeader(headers, 'X-Photo-City', request.city)
    setMetadataHeader(headers, 'X-Photo-Location', request.location)

    const classifyUrl = `http://localhost:${config.pythonPort}/classify/photo`

    let res: Response
    let responseBody: string
    try {
      res = await fetch(classifyUrl, {
        method: 'POST',
        headers,
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
      return NextResponse.json(normalizePhotoClassificationResponse(data))
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
