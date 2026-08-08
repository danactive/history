import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { GalleryParams, RouteParamsProps } from '../../../src/lib/server/page-route'
import { buildGalleryDetailsText } from '../../../src/lib/storytelling'

export async function generateMetadata(
  { params }: RouteParamsProps<GalleryParams>,
): Promise<Metadata> {
  const { gallery } = await params
  return { title: `Gallery details ${gallery} - History App` }
}

export default function GalleryDetailsPage(props: RouteParamsProps<GalleryParams>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryDetailsContent {...props} />
    </Suspense>
  )
}

async function GalleryDetailsContent({
  params,
}: RouteParamsProps<GalleryParams>) {
  const { gallery } = await params
  const text = await buildGalleryDetailsText(gallery)

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Gallery details</h1>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</pre>
    </main>
  )
}
