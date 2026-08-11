import type { Metadata } from 'next'
import { cacheLife, cacheTag } from 'next/cache'
import { buildGalleriesDetailsText } from '../../src/lib/storytelling'

export const metadata: Metadata = {
  title: 'Galleries details - History App',
}

async function getCachedGalleriesDetailsText() {
  'use cache'

  cacheLife('max')
  cacheTag('gallery-index')
  return buildGalleriesDetailsText()
}

export default async function GalleriesDetailsPage() {
  const text = await getCachedGalleriesDetailsText()

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Galleries details</h1>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</pre>
    </main>
  )
}
