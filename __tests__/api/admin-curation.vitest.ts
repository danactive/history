// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { GET, POST } from '../../app/api/admin/curation/route'

const mocks = vi.hoisted(() => ({ getInbox: vi.fn(), startWorker: vi.fn() }))
vi.mock('../../src/lib/curation/worker', () => ({ startWorker: mocks.startWorker }))
vi.mock('../../src/lib/curation/query', async importOriginal => ({
  ...await importOriginal<typeof import('../../src/lib/curation/query')>(), getInbox: mocks.getInbox,
}))
beforeEach(() => {
  vi.stubEnv('HISTORY_LOCAL_ADMIN', 'true'); vi.stubEnv('VERCEL', ''); vi.stubEnv('CF_PAGES', '')
  mocks.getInbox.mockResolvedValue({ rows: [] }); mocks.startWorker.mockResolvedValue('run-id')
})
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs() })
const request = (body: unknown, origin = 'http://localhost:3030') => new Request('http://localhost:3030/api/admin/curation', {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

test('reads are no-store and never launch scans; malformed filters are rejected', async () => {
  const response = await GET(new Request('http://localhost:3030/api/admin/curation?place=Market'))
  expect(response.status).toBe(200)
  expect(response.headers.get('Cache-Control')).toBe('no-store')
  expect(mocks.startWorker).not.toHaveBeenCalled()
  expect((await GET(new Request('http://localhost:3030/api/admin/curation?page=-1'))).status).toBe(400)
})

test('disabled and cross-origin requests expose no index or worker', async () => {
  expect((await POST(request({}, 'https://other.test'))).status).toBe(403)
  vi.stubEnv('HISTORY_LOCAL_ADMIN', '')
  expect((await GET(new Request('http://localhost:3030/api/admin/curation'))).status).toBe(403)
  expect(mocks.getInbox).not.toHaveBeenCalled()
  expect(mocks.startWorker).not.toHaveBeenCalled()
})

test('valid scans return run identifiers and reject malformed scope or failed startup', async () => {
  expect((await POST(request({ gallery: '../escape', album: 'sample' }))).status).toBe(400)
  expect((await POST(request({ gallery: 'demo' }))).status).toBe(400)
  const response = await POST(request({ gallery: 'demo', album: 'sample' }))
  expect(response.status).toBe(202)
  expect(await response.json()).toEqual({ runId: 'run-id' })
  expect(mocks.startWorker).toHaveBeenCalledWith(process.cwd(), 'incremental', 'demo/sample')
  mocks.startWorker.mockRejectedValueOnce(new Error('Unavailable runtime'))
  expect((await POST(request({ mode: 'full' }))).status).toBe(500)
})
