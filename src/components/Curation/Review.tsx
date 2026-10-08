'use client'

import { useState } from 'react'
import useSWR from 'swr'
import type { RawXmlItem } from '../../types/common'
import { inboxReturn, type CurationRow, type Suggestion } from '../../lib/curation/model'
import { stageSuggestion } from '../../lib/curation/review'
import Link from '../Link'

type Props = {
  finding: string, returnTo?: string, gallery: string, album: string,
  items: RawXmlItem[], revision?: string,
  getEdited: (item: RawXmlItem) => RawXmlItem | null,
  onAccept: (item: RawXmlItem) => void,
}
export default function CurationReview({ finding, returnTo, gallery, album, items, revision, getEdited, onAccept }: Props) {
  const [message, setMessage] = useState('')
  const { data, error } = useSWR<{ row: CurationRow | null }>(`/api/admin/curation?finding=${encodeURIComponent(finding)}`, async (url: string) => {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error('Finding unavailable. Return to the inbox and recheck.')
    return response.json()
  })
  const row = data?.row
  const accept = async (suggestion: Suggestion) => {
    try {
      if (!row || row.source.gallery !== gallery || row.source.album !== album) throw new Error('Open the finding’s original album first.')
      const response = await fetch(`/api/admin/xml/${encodeURIComponent(gallery)}/${encodeURIComponent(album)}?curation=1`, { cache: 'no-store' })
      if (!response.ok || response.headers.get('X-Album-Revision') !== revision) throw new Error('Album changed. Reload and review your edits.')
      const original = items.find(item => item.$.id === row.source.itemId)
      const staged = stageSuggestion(row, suggestion, items, revision ?? '', original ? getEdited(original) : undefined)
      onAccept(staged)
      setMessage('Suggestion staged. Generate XML and Save to XML when you are ready.')
    } catch (error) { setMessage(String(error)) }
  }
  return <aside aria-label="Curation review" style={{ border: '1px solid #52677f', padding: '1rem', marginBottom: '1rem' }}>
    <Link href={inboxReturn(returnTo)}>Return to Curation Inbox</Link>
    <h2>Curation review</h2>
    {error && <p role="alert">{String(error)}</p>}
    {data && !row && <p>This finding is no longer available. Review current metadata or return to the inbox.</p>}
    {row?.findings.map(finding => <div key={finding.id}>
      <strong>{finding.reason}</strong><p>{finding.evidence}</p>
      {finding.suggestion ? <>
        <p>{finding.suggestion.original} → {finding.suggestion.proposed}</p>
        <button type="button" onClick={() => void accept(finding.suggestion!)}>Accept suggestion</button>
      </> : finding.candidates.length > 0 && <p>Review manually: {finding.candidates.join(', ')}</p>}
    </div>)}
    <p role="status">{message}</p>
  </aside>
}
