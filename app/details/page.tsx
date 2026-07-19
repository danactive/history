import type { Metadata } from 'next'
import { buildGalleriesDetailsText } from '../../src/lib/storytelling'

export const metadata: Metadata = {
  title: 'Galleries details - History App',
}

export default async function GalleriesDetailsPage() {
  const text = await buildGalleriesDetailsText()

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Galleries details</h1>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</pre>
    </main>
  )
}