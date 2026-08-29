import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'

const AdminAlbumClient = dynamic(
  () => import('../../../src/components/AdminAlbum/AdminAlbumClient'),
  { ssr: true },
)
import getAlbums from '../../../src/lib/albums'
import config from '../../../src/models/config'
import type { Gallery, GalleryAlbum } from '../../../src/types/common'
import { generatedGalleries } from '../../../src/types/generated'

export const metadata: Metadata = {
  title: 'Admin > Album - History App',
}

type AdminAlbumPageProps = {
  searchParams: Promise<{
    album?: GalleryAlbum['name'];
    gallery?: Gallery;
  }>;
}

export default function AdminAlbumServer({ searchParams }: AdminAlbumPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminAlbumContent searchParams={searchParams} />
    </Suspense>
  )
}

async function AdminAlbumContent({ searchParams }: AdminAlbumPageProps) {
  await connection()
  const galleryAlbum = await getAlbums()
  const galleries = generatedGalleries.filter(gallery => Object.hasOwn(galleryAlbum, gallery))
  const requested = await searchParams
  const requestedGallery = requested.gallery
  const selectedGallery = galleries.find(gallery => gallery === requestedGallery)
    ?? galleries.find(gallery => config.defaultGallery !== gallery)
    ?? config.defaultGallery
  const requestedAlbum = requested.album
  const initialAlbum = galleryAlbum[selectedGallery]?.albums.find(album => album.name === requestedAlbum)?.name

  return (
    <AdminAlbumClient
      galleries={galleries}
      gallery={selectedGallery}
      galleryAlbum={galleryAlbum}
      initialAlbum={initialAlbum}
    />
  )
}
