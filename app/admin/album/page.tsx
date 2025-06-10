import type { Metadata } from 'next'

import AdminAlbumClient from '../../../src/components/AdminAlbum/AdminAlbumClient'
import getAlbums from "../../../src/lib/albums"
import config from "../../../src/models/config"
import { type Gallery } from '../../../src/types/common'

export const metadata: Metadata = {
  title: 'Admin > Album - History App',
}

export default async function AdminAlbumServer() {
  const galleryAlbum = await getAlbums()
  const galleries = Object.keys(galleryAlbum) as Gallery[]
  const selectedGallery = galleries.find(gallery => config.defaultGallery !== gallery) ?? config.defaultGallery

  return (
    <AdminAlbumClient galleries={galleries} selectedGallery={selectedGallery} galleryAlbum={galleryAlbum} />
  )
}
