import { afterEach, expect, test, vi } from 'vitest'
import { localCurationEnabled, requireLocalRequest } from './local'
afterEach(() => vi.unstubAllEnvs())

test('local curation requires explicit configuration and is unavailable on hosted deployments', () => {
  vi.stubEnv('HISTORY_LOCAL_ADMIN', '')
  expect(localCurationEnabled()).toBe(false)
  vi.stubEnv('HISTORY_LOCAL_ADMIN', 'true')
  vi.stubEnv('VERCEL', '')
  vi.stubEnv('CF_PAGES', '')
  expect(localCurationEnabled()).toBe(true)
  vi.stubEnv('HISTORY_LOCAL_ADMIN', 'false')
  expect(localCurationEnabled()).toBe(false)
  vi.stubEnv('HISTORY_LOCAL_ADMIN', '1')
  expect(localCurationEnabled()).toBe(false)
  vi.stubEnv('HISTORY_LOCAL_ADMIN', 'true')
  expect(localCurationEnabled()).toBe(true)
  vi.stubEnv('VERCEL', '1')
  expect(localCurationEnabled()).toBe(false)
})

test('rejects cross-origin, foreign host, and cross-site triggers', () => {
  vi.stubEnv('HISTORY_LOCAL_ADMIN', 'true')
  vi.stubEnv('VERCEL', '')
  vi.stubEnv('CF_PAGES', '')
  expect(() => requireLocalRequest(new Request('http://localhost:3030/api/admin/curation'))).not.toThrow()
  expect(() => requireLocalRequest(new Request('http://localhost:3030/api/admin/curation',
    { headers: { Origin: 'https://other.test' } }))).toThrow()
  expect(() => requireLocalRequest(new Request('http://other.test/api/admin/curation'))).toThrow()
  expect(() => requireLocalRequest(new Request('http://localhost:3030/api/admin/curation',
    { headers: { 'Sec-Fetch-Site': 'cross-site' } }))).toThrow()
})
