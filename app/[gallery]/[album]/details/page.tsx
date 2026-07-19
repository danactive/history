import type { Metadata } from 'next'
import { buildAlbumDetailsText } from '../../../../src/lib/storytelling'
import type { Album } from '../../../../src/types/pages'

export async function generateMetadata(
  { params }: { params: Promise<Album.Params> },
): Promise<Metadata> {
  const { album } = await params
  return { title: `Album details ${album} - History App` }
}

export default async function AlbumDetailsPage(props: { params: Promise<Album.Params> }) {
  const { gallery, album } = await props.params
  const text = await buildAlbumDetailsText(gallery, album, 8)

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Album details</h1>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</pre>
    </main>
  )
}
