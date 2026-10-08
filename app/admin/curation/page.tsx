import { Suspense } from 'react'
import { connection } from 'next/server'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import CurationInbox from '../../../src/components/Curation/Inbox'
import { localCurationEnabled } from '../../../src/lib/curation/local'

export const metadata = { title: 'Admin > Curation Inbox - History App' }

async function LocalInbox() {
  await connection()
  const host = (await headers()).get('host')?.split(':')[0]
  if (!localCurationEnabled() || !host || !['localhost', '127.0.0.1', '['].includes(host)) notFound()
  return <CurationInbox />
}

export default function CurationPage() {
  return <Suspense fallback={<p>Loading Curation Inbox…</p>}><LocalInbox /></Suspense>
}
