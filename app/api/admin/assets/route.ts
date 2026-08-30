import { NextResponse, type NextRequest } from 'next/server'

import { getAssetStripItemsRange, type AssetBatchResponse } from '../../../../src/lib/admin/assets'

const maxBatchSize = 12

function parseIndex(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null
  const index = Number(value)
  return Number.isSafeInteger(index) ? index : null
}

export async function GET(request: NextRequest) {
  const start = parseIndex(request.nextUrl.searchParams.get('start'))
  const end = parseIndex(request.nextUrl.searchParams.get('end'))

  if (start === null || end === null || end <= start || end - start > maxBatchSize) {
    const body: AssetBatchResponse = { error: 'Invalid asset range' }
    return NextResponse.json(body, { status: 400 })
  }

  const body: AssetBatchResponse = { items: await getAssetStripItemsRange(start, end) }
  return NextResponse.json(body)
}
