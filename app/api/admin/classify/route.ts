import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'

import utilsFactory from '../../../../src/lib/utils'
import config from '../../../../src/models/config'
import {
  encodeClassificationMetadata,
  normalizeClassificationResponse,
  type ClassificationRequest,
} from '../../../../src/models/classifier'

function setMetadataHeader(headers: Headers, name: string, value?: string | null) {
  if (value) headers.set(name, encodeClassificationMetadata(value))
}

export async function POST(req: Request) {
  try {
    const utils = utilsFactory()
    const request: ClassificationRequest = await req.json()
    const relativePath = request.path

    if (!relativePath) {
      return NextResponse.json({ error: 'Missing image path' }, { status: 400 })
    }

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

    const classifyUrl = `http://localhost:${config.pythonPort}/classify`

    const res = await fetch(classifyUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(180_000),
    })

    const data: unknown = await res.json()
    if (!res.ok) {
      const message = typeof data === 'object' && data !== null && 'error' in data
        ? String(data.error)
        : 'Classifier backend failed'
      return NextResponse.json({ error: message }, { status: res.status })
    }

    return NextResponse.json(normalizeClassificationResponse(data))
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    const status = err instanceof Error && err.name === 'TimeoutError' ? 504 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
