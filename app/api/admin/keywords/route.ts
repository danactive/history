import { NextResponse } from 'next/server'

import { getAllKeywords } from '../../../../src/lib/get-all-items'

export async function GET() {
  try {
    const { indexedKeywords } = await getAllKeywords()
    return NextResponse.json({ keywords: indexedKeywords })
  } catch (error) {
    console.error('Failed to get keywords:', error)
    return NextResponse.json({ error: 'Failed to get keywords' }, { status: 500 })
  }
}
