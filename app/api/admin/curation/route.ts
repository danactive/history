import * as z from 'zod/v4'
import { getInbox, querySchema, findRow } from '../../../../src/lib/curation/query'
import { digestSchema, identifier } from '../../../../src/lib/curation/model'
import { requireLocalRequest } from '../../../../src/lib/curation/local'
import { startWorker } from '../../../../src/lib/curation/worker'

const headers = { 'Cache-Control': 'no-store' }

export async function GET(request: Request) {
  try { requireLocalRequest(request) } catch { return Response.json({ error: 'Local curation unavailable' }, { status: 403, headers }) }
  try {
    const params = new URL(request.url).searchParams
    if (params.has('finding')) {
      const row = await findRow(process.cwd(), digestSchema.parse(params.get('finding')))
      return Response.json({ row }, { headers })
    }
    const query = querySchema.parse(Object.fromEntries(params))
    return Response.json(await getInbox(process.cwd(), query), { headers })
  } catch (error) {
    return Response.json({ error: error instanceof z.ZodError ? 'Invalid query' : 'Unable to read scan results. Run a full scan.' }, {
      status: error instanceof z.ZodError ? 400 : 500, headers,
    })
  }
}

const scanRequest = z.object({
  mode: z.enum(['incremental', 'full']).default('incremental'),
  gallery: identifier.optional(), album: identifier.optional(),
}).refine(value => Boolean(value.gallery) === Boolean(value.album), 'Recheck requires gallery and album')

export async function POST(request: Request) {
  try { requireLocalRequest(request) } catch { return Response.json({ error: 'Local curation unavailable' }, { status: 403, headers }) }
  try {
    const input = scanRequest.parse(await request.json())
    const scope = input.gallery ? `${input.gallery}/${input.album}` : undefined
    const runId = await startWorker(process.cwd(), input.mode, scope)
    return Response.json({ runId }, { status: 202, headers })
  } catch (error) {
    return Response.json({ error: 'Unable to request scan. Check local runtime and inputs.' }, {
      status: error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 500, headers,
    })
  }
}
