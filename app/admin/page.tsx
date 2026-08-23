import type { Metadata } from 'next'

import Link from '../../src/components/Link'

export const metadata: Metadata = {
  title: 'Admin - History App',
}

export default function AdminServer() {
  return (
    <ul>
      <li><Link href="/admin/walk">Walk</Link></li>
      <li><Link href="/admin/album">Edit Album</Link></li>
    </ul>
  )
}
