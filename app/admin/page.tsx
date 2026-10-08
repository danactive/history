import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'

import Link from '../../src/components/Link'
import { localCurationEnabled } from '../../src/lib/curation/local'

export const metadata: Metadata = {
  title: 'Admin - History App',
}

async function CurationLink() {
  await connection()
  if (!localCurationEnabled()) return null
  return <li><Link href="/admin/curation">Curation Inbox (local)</Link></li>
}

export default function AdminServer() {
  return (
    <ul>
      <li><Link href="/admin/walk">Walk</Link></li>
      <li><Link href="/admin/album">Edit Album</Link></li>
      <li><Link href="/admin/assets">Assets</Link></li>
      <li><Link href="/admin/critical-tags">Critical-tag coverage</Link></li>
      <Suspense fallback={null}><CurationLink /></Suspense>
    </ul>
  )
}
