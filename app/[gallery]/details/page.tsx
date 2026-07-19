import type { Metadata } from 'next'
import { buildGalleryDetailsText } from '../../../src/lib/storytelling'
import type { Gallery } from '../../../src/types/common'

export async function generateMetadata(
  { params }: { params: Promise<{ gallery: Gallery }> },
): Promise<Metadata> {
  const { gallery } = await params
  return { title: `Gallery details ${gallery} - History App` }
}

export default async function GalleryDetailsPage({
  params,
}: {
  params: Promise<{ gallery: Gallery }>
}) {
  const { gallery } = await params
  const text = await buildGalleryDetailsText(gallery)

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Gallery details</h1>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</pre>
    </main>
  )
}
