import type { Metadata } from 'next'
import Link from '../../src/components/Link'

export const metadata: Metadata = {
  title: 'Admin - History App',
}

function AdminPage() {
  return <div><Link href="/admin/walk">Walk</Link></div>
}

export default AdminPage
