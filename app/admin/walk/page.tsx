import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

const WalkClient = dynamic(
  () => import('../../../src/components/Walk/WalkClient'),
  { ssr: true },
)
export const metadata: Metadata = {
  title: 'Admin > Walk - History App',
}

export default async function Page() {
  return <WalkClient />
}
