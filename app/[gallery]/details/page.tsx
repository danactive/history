import type { Metadata } from 'next'
import type { GalleryParams, RouteParamsProps } from '../../../src/lib/server/page-route'
import { buildGalleryDetailsText } from '../../../src/lib/storytelling'

export async function generateMetadata(
  { params }: RouteParamsProps<GalleryParams>,
): Promise<Metadata> {
  const { gallery } = await params
  return { title: `Gallery details ${gallery} - History App` }
}

export default async function GalleryDetailsPage({
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
