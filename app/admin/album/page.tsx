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
import { type Gallery } from '../../../src/types/common'

export const metadata: Metadata = {
  title: 'Admin > Album - History App',
}

export default function AdminAlbumServer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminAlbumContent />
    </Suspense>
  )
}

async function AdminAlbumContent() {
  await connection()
  const galleryAlbum = await getAlbums()
  const galleries = Object.keys(galleryAlbum) as Gallery[]
  const selectedGallery = galleries.find(gallery => config.defaultGallery !== gallery) ?? config.defaultGallery

  return (
    <AdminAlbumClient galleries={galleries} gallery={selectedGallery} galleryAlbum={galleryAlbum} />
  )
}
