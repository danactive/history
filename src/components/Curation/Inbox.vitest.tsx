import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import type { InboxResult } from '../../lib/curation/model'
import Inbox, { editorLink } from './Inbox'

const mock = vi.hoisted(() => ({ data: undefined as InboxResult | undefined, push: vi.fn(), mutate: vi.fn() }))
vi.mock('swr', () => ({ default: () => ({ data: mock.data, mutate: mock.mutate }) }))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(), usePathname: () => '/admin/curation', useRouter: () => ({ push: mock.push }),
}))
vi.mock('../Link', () => ({ default: ({ href, children, onClick }: React.PropsWithChildren<{ href: string, onClick?: () => void }>) =>
  <a href={href} onClick={onClick}>{children}</a> }))
vi.mock('../Img', () => ({ default: ({ alt }: { alt: string }) => <span>{alt}</span> }))
afterEach(() => { cleanup(); vi.clearAllMocks() })

function result(): InboxResult {
  return {
    rows: [], status: { state: 'not-scanned', completed: 0, total: 0, errors: [] }, snapshot: null,
    page: 1, pages: 1, counts: { findings: 0, rows: 0, photos: 0, albums: 0 },
    galleries: ['demo', 'other'], albums: ['demo/sample'], places: ['Canada / Old Montréal'], awaiting: [],
  }
}

test('starts across all galleries without triggering a scan and exposes incomplete first scans', () => {
  mock.data = result()
  render(<Inbox />)
  expect(screen.getByLabelText('Gallery')).toHaveValue('')
  expect(screen.getByText('Not scanned yet')).toBeTruthy()
  expect(mock.mutate).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('Place or neighbourhood'), { target: { value: 'Old Montreal' } })
  fireEvent.click(screen.getByRole('button', { name: 'Find place' }))
  expect(mock.push).toHaveBeenCalledWith('/admin/curation?place=Old+Montreal')
})

test.each(['running', 'incomplete', 'failed', 'complete'] as const)('renders %s scan status without concealing errors', state => {
  mock.data = { ...result(), status: { state, completed: 1, total: 3, errors: state === 'failed' ? ['Source unavailable'] : [] } }
  render(<Inbox />)
  expect(screen.getByText(state)).toBeTruthy()
  if (state === 'failed') expect(screen.getByRole('alert')).toHaveTextContent('Source unavailable')
  expect(screen.queryByText('No findings match this view.')).toBeNull()
})

test('renders whole-album scope, grouped findings, exact links, and awaiting verification', () => {
  const value = result()
  value.snapshot = { version: 1, generation: 'x', completedAt: new Date().toISOString(), tagsConfigured: false, shards: [] }
  value.rows = [{
    id: 'abc', scope: 'album', source: { gallery: 'demo', album: 'sample', revision: 'a'.repeat(64) },
    title: 'Sample', checkedAt: new Date().toISOString(), places: ['Canada / Vancouver', 'Canada / Victoria'],
    findings: [{ id: 'def', category: 'tags', reason: 'Tag opportunity', evidence: 'Whole-album opportunity.', candidates: [] }],
  }]
  value.awaiting = ['demo/sample']
  mock.data = value
  render(<Inbox />)
  expect(screen.getByText(/Whole album/)).toBeTruthy()
  expect(screen.getByText('Multiple places (2)')).toBeTruthy()
  expect(screen.getByText('Critical-tag checks are unconfigured.')).toBeTruthy()
  expect(screen.getByText('Awaiting verification of saved edits')).toBeTruthy()
  const href = editorLink({ ...value.rows[0], source: { ...value.rows[0].source, itemId: '42', filename: 'photo.jpg' } }, '/admin/curation')
  expect(href).toContain('itemId=42')
  expect(href).toContain('filename=photo.jpg')
})

test('shows today gap counts, badges, and preserves the today filter in the URL', () => {
  const value = result()
  value.snapshot = { version: 1, generation: 'x', completedAt: '2026-10-07T12:00:00Z', tagsConfigured: true, shards: [] }
  value.today = { monthDay: '10-07', photos: 1, findings: 2 }
  value.rows = [{
    id: 'today-row', scope: 'photo', source: { gallery: 'demo', album: 'sample', revision: 'a'.repeat(64) },
    title: 'Today photo', checkedAt: '2026-10-07T12:00:00Z', places: ['Unknown location'], monthDay: '10-07',
    findings: [{ id: 'place', category: 'location', reason: 'Missing place', evidence: 'No city or location.', candidates: [] }],
  }]
  mock.data = value
  render(<Inbox />)
  expect(screen.getByText('Today’s photo')).toBeTruthy()
  expect(screen.getByText(/Today \(10-07\): 2 gaps in 1 photos/)).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Photo priority'), { target: { value: 'today' } })
  expect(mock.push).toHaveBeenCalledWith('/admin/curation?focus=today')
})
