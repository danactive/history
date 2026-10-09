'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import Link from '../Link'
import Img from '../Img'
import { rasterPath } from '../../lib/paths'
import type { Gallery } from '../../types/common'
import type { CurationRow, InboxResult } from '../../lib/curation/model'
import styles from './styles.module.css'

const fetcher = async (url: string): Promise<InboxResult> => {
  const response = await fetch(url, { cache: 'no-store' })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error ?? 'Unable to load findings')
  return body
}

export function editorLink(row: CurationRow, returnTo: string) {
  const params = new URLSearchParams({ gallery: row.source.gallery, album: row.source.album, returnTo, finding: row.id })
  if (row.source.itemId) params.set('itemId', row.source.itemId)
  if (row.source.filename) params.set('filename', row.source.filename)
  return `/admin/album?${params}`
}

function Thumbnail({ row }: { row: CurationRow }) {
  const [failed, setFailed] = useState(false)
  if (!row.source.filename || failed) return <span className={styles.placeholder}>{row.scope === 'album' ? 'Album' : 'Photo'}</span>
  return <Img src={rasterPath(row.source.filename, row.source.gallery as Gallery, 'thumb')}
    alt={row.title} width={185} height={45} onError={() => setFailed(true)} />
}

export default function CurationInbox() {
  const search = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const query = search.toString()
  const { data, error, mutate } = useSWR(`/api/admin/curation?${query}`, fetcher, { refreshInterval: 5000 })
  const selectedPlace = search.get('place') ?? ''
  const [place, setPlace] = useState(selectedPlace)
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<'incremental' | 'full'>('incremental')
  useEffect(() => setPlace(selectedPlace), [selectedPlace])
  useEffect(() => {
    if (!data) return
    const anchor = decodeURIComponent(window.location.hash.slice(1))
    if (!anchor) return
    const savedPlace = sessionStorage.getItem(`curation-return:${anchor}`)
    const target = document.getElementById(anchor)
      ?? [...document.querySelectorAll<HTMLElement>('[data-curation-place]')].find(element => element.dataset.curationPlace === savedPlace)
    target?.scrollIntoView({ block: 'center' })
  }, [query, Boolean(data)])

  const update = (name: string, value: string) => {
    const params = new URLSearchParams(query)
    if (value) params.set(name, value)
    else params.delete(name)
    if (name !== 'page') params.delete('page')
    if (name === 'gallery') params.delete('album')
    router.push(`${pathname}?${params}`)
  }
  const scan = async (row?: CurationRow) => {
    setSubmitting(true)
    setNotice('')
    try {
      const response = await fetch('/api/admin/curation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row ? { mode: 'incremental', gallery: row.source.gallery, album: row.source.album } : { mode }),
      })
      if (!response.ok) throw new Error((await response.json()).error)
      setNotice('Scan requested. You can close this page while it runs.')
      await mutate()
    } catch (error) { setNotice(String(error)) } finally { setSubmitting(false) }
  }

  return <main className={styles.page}>
    <header><h1>Curation Inbox</h1><p>Start with gaps in today’s photos, or find a place to review.</p></header>
    <section className={styles.toolbar} aria-label="Scan controls">
      <label>Scan mode <select value={mode} onChange={event => setMode(event.target.value as typeof mode)}>
        <option value="incremental">Changed metadata</option><option value="full">Full library</option>
      </select></label>
      <button type="button" disabled={submitting} onClick={() => void scan()}>Scan now</button>
      <span role="status">{notice}</span>
    </section>
    {error && <p role="alert">{String(error)}</p>}
    {!data && !error && <p>Loading findings…</p>}
    {data && <>
      <section className={styles.status} aria-label="Scan status">
        <strong>{data.status.state === 'not-scanned' ? 'Not scanned yet' : data.status.state}</strong>
        {data.status.state === 'running' && <span> {data.status.completed} / {data.status.total} albums ({data.status.mode})</span>}
        <p>{data.snapshot ? `Last successful scan: ${new Date(data.snapshot.completedAt).toLocaleString()}` : 'Run a scan to build your inbox.'}</p>
        {data.status.errors.map(message => <p role="alert" key={message}>{message}</p>)}
        {data.snapshot && !data.snapshot.tagsConfigured && <p>Critical-tag checks are unconfigured.</p>}
      </section>
      <form className={styles.toolbar} onSubmit={event => { event.preventDefault(); update('place', place) }}>
        <label>Photo priority <select value={search.get('focus') ?? ''} onChange={event => update('focus', event.target.value)}>
          <option value="">Today first · all findings</option><option value="today">Today only</option>
        </select></label>
        <label>Place or neighbourhood <input value={place} onChange={event => setPlace(event.target.value)} list="curation-places" /></label>
        <datalist id="curation-places">{data.places.map(label => <option key={label} value={label} />)}</datalist>
        <button type="submit">Find place</button>
        <label>Category <select value={search.get('category') ?? ''} onChange={event => update('category', event.target.value)}>
          <option value="">All findings</option><option value="location">Location review</option>
          <option value="tags">Tag opportunities</option><option value="description">Description opportunities</option>
        </select></label>
        <label>Gallery <select value={search.get('gallery') ?? ''} onChange={event => update('gallery', event.target.value)}>
          <option value="">All galleries</option>{data.galleries.map(value => <option key={value}>{value}</option>)}
        </select></label>
        <label>Album <select value={search.get('album') ?? ''} onChange={event => update('album', event.target.value)}>
          <option value="">All albums</option>{data.albums.map(value => <option key={value}>{value}</option>)}
        </select></label>
        <Link href="/admin/curation">Clear filters</Link>
      </form>
      {data.snapshot && <p>{data.counts.findings} findings · {data.counts.photos} affected photos · {data.counts.albums} affected albums</p>}
      {data.snapshot && data.today && <p>
        Today ({data.today.monthDay}): {data.today.findings} gaps in {data.today.photos} photos matching your filters.
        {' '}Photos from this month and day in any year come first.
      </p>}
      {data.snapshot && !data.rows.length && <p>
        {data.status.state === 'complete' ? 'No findings match this view.'
          : 'No matching findings in the last successful results; current coverage is incomplete.'}
      </p>}
      {data.rows.map((row, index) => <section key={row.id} id={row.id} className={styles.card} data-curation-place={row.places[0]}>
        {row.scope === 'photo' && row.monthDay === data.today?.monthDay && row.monthDay && <strong>Today’s photo</strong>}
        {(index === 0 || data.rows[index - 1].places[0] !== row.places[0]) && <h2>{row.places[0]}</h2>}
        <div className={styles.heading}><Thumbnail row={row} /><div><h3>{row.title}</h3>
          <p>{row.source.gallery} / {row.source.album} · {row.scope === 'album' ? 'Whole album' : row.source.filename}</p>
        </div></div>
        {row.places.length > 1 && <details><summary>Multiple places ({row.places.length})</summary><p>{row.places.join(' · ')}</p></details>}
        {row.findings.map(finding => <div key={finding.id} className={styles.finding}>
          <strong>{finding.reason}</strong><p>{finding.evidence}</p>
          {finding.suggestion && <p>Suggested: {finding.suggestion.original} → {finding.suggestion.proposed}</p>}
        </div>)}
        {data.awaiting.includes(`${row.source.gallery}/${row.source.album}`) && <p role="status">Awaiting verification of saved edits</p>}
        <div className={styles.toolbar}>
          <Link href={editorLink(row, `/admin/curation?${query}#${row.id}`)}
            onClick={() => sessionStorage.setItem(`curation-return:${row.id}`, row.places[0])}>Review in Album Editor</Link>
          <button type="button" disabled={submitting} onClick={() => void scan(row)}>Recheck</button>
          <small>Checked {new Date(row.checkedAt).toLocaleString()}</small>
        </div>
      </section>)}
      {data.snapshot && <nav className={styles.toolbar} aria-label="Findings pages">
        <button type="button" disabled={data.page <= 1} onClick={() => update('page', String(data.page - 1))}>Previous</button>
        <span>Page {data.page} of {data.pages}</span>
        <button type="button" disabled={data.page >= data.pages} onClick={() => update('page', String(data.page + 1))}>Next</button>
      </nav>}
    </>}
  </main>
}
