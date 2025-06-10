import type { Metadata } from 'next'

import getAlbums from "../../../src/lib/albums"
import config from "../../../src/models/config"
import { type Gallery } from '../../../src/types/common'
import AdminAlbumClient from './AdminAlbumClient'

export const metadata: Metadata = {
  title: 'Admin > Edit Album - History App',
}

export default async function AdminAlbumServer() {
  const galleryAlbum = await getAlbums()
  const galleries = Object.keys(galleryAlbum) as Gallery[]
  const selectedGallery = galleries.find(gallery => config.defaultGallery !== gallery) ?? config.defaultGallery

  return (
    <AdminAlbumClient galleries={galleries} selectedGallery={selectedGallery} galleryAlbum={galleryAlbum} />
  )
}
