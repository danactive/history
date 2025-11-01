import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'

import utilsFactory from '../../../../src/lib/utils'
import config from '../../../../src/models/config'

export type Prediction = {
  label: string;
  score: number;
}

export async function POST(req: Request) {
  try {
    const utils = utilsFactory()
    const { path: relativePath }: { path?: string } = await req.json()

    if (!relativePath) {
      return NextResponse.json({ error: 'Missing image path' }, { status: 400 })
    }

    const fullPath = utils.safePublicPath(relativePath)
    const buffer = await fs.readFile(fullPath)
    const body = new Uint8Array(buffer) // TS-compatible BodyInit

    const classifyUrl = `http://localhost:${config.pythonPort}/classify`

    const res = await fetch(classifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'image/jpeg' },
      body,
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Python backend failed' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
