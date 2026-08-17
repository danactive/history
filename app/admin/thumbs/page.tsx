import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

const ThumbnailFramerClient = dynamic(
  () => import('../../../src/components/ThumbnailFramer/ThumbnailFramerClient'),
  { ssr: true },
)

export const metadata: Metadata = {
  title: 'Admin > Frame Thumbnails - History App',
}

export default function ThumbnailFramerPage() {
  return <ThumbnailFramerClient />
}
