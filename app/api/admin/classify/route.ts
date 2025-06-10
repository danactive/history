import { NextResponse } from "next/server"
import fs from "node:fs/promises"

import utilsFactory from "../../../../src/lib/utils"
import config from "../../../../src/models/config"

export async function POST(req: Request) {
  try {
    const utils = utilsFactory()
    const { path: relativePath } = await req.json()

    if (!relativePath) {
      return NextResponse.json({ error: "Missing image path" }, { status: 400 })
    }

    const fullPath = utils.safePublicPath(relativePath)
    const buffer = await fs.readFile(fullPath)

    const res = await fetch(`http://localhost:${config.pythonPort}/classify`, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: buffer,
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Python backend failed" }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 })
  }
}
