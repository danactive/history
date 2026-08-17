import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'

const ThumbnailFramerClient = dynamic(
  () => import('../../../../src/components/ThumbnailFramer/ThumbnailFramerClient'),
  { ssr: true },
)

export const metadata: Metadata = {
  title: 'Admin > Frame Thumbnails - History App',
}

export default function ThumbnailFramerPathPage({ params }: { params: Promise<{ path: string[] }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThumbnailFramerContent params={params} />
    </Suspense>
  )
}

async function ThumbnailFramerContent({ params }: { params: Promise<{ path: string[] }> }) {
  await connection()
  const { path } = await params
  return <ThumbnailFramerClient sourceFolder={`/${path.join('/')}`} />
}
