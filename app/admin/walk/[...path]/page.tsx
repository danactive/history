import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'

const WalkClient = dynamic(
  () => import('../../../../src/components/Walk/WalkClient'),
  { ssr: true },
)

export const metadata: Metadata = {
  title: 'Admin > Walk - History App',
}

export function generateStaticParams() {
  return [{ path: ['galleries'] }]
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalkContent />
    </Suspense>
  )
}

async function WalkContent() {
  await connection()
  return <WalkClient />
}
