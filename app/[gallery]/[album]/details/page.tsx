import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { AlbumRouteParams, RouteParamsProps } from '../../../../src/lib/server/page-route'
import { buildAlbumDetailsText } from '../../../../src/lib/storytelling'

export async function generateMetadata(
  { params }: RouteParamsProps<AlbumRouteParams>,
): Promise<Metadata> {
  const { album } = await params
  return { title: `Album details ${album} - History App` }
}

export default function AlbumDetailsPage(props: RouteParamsProps<AlbumRouteParams>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlbumDetailsContent {...props} />
    </Suspense>
  )
}

async function AlbumDetailsContent(props: RouteParamsProps<AlbumRouteParams>) {
  const { gallery, album } = await props.params
  const text = await buildAlbumDetailsText(gallery, album, 8)

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Album details</h1>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</pre>
    </main>
  )
}
