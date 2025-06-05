import type { Metadata } from 'next'

import Link from '../../src/components/Link'

export const metadata: Metadata = {
  title: 'Admin - History App',
}

export default function AdminServer() {
  return <div><Link href="/admin/walk">Walk</Link></div>
}
