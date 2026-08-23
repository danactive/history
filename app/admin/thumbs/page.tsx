import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const ThumbnailFramerClient = dynamic(
  () => import('../../../src/components/ThumbnailFramer/ThumbnailFramerClient'),
  { ssr: true },
)

export const metadata: Metadata = {
  title: 'Admin > Frame Thumbnails - History App',
}

export default function ThumbnailFramerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThumbnailFramerClient />
    </Suspense>
  )
}
