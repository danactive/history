import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const WalkClient = dynamic(
  () => import('../../../src/components/Walk/WalkClient'),
  { ssr: true },
)
export const metadata: Metadata = {
  title: 'Admin > Walk - History App',
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalkClient />
    </Suspense>
  )
}
