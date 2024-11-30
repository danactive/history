import type { GetStaticPaths, GetStaticProps } from 'next'

import GalleryPageComponent from '../src/components/GalleryPage'
import getAlbums from '../src/lib/albums'
import getGalleries from '../src/lib/galleries'
import indexKeywords from '../src/lib/search'
import type { ServerSideAlbumItem } from '../src/types/common'
import { Gallery } from '../src/types/pages'

export const getStaticProps: GetStaticProps<Gallery.ComponentProps, Gallery.Params> = async (context) => {
  const params = context.params!
  const { albums } = await getAlbums(params.gallery)
  const preparedAlbums = albums.map((album): ServerSideAlbumItem => ({
    ...album,
    corpus: [album.h1, album.h2, album.year, album.search].join(' '),
  }))
  return {
    props: { gallery: params.gallery, albums: preparedAlbums, ...indexKeywords(preparedAlbums) },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { galleries } = await getGalleries()
  // Define these galleries as allowed, otherwise 404
  const paths = galleries.map((gallery) => ({ params: { gallery } }))
  return {
    paths,
    fallback: false,
  }
}

function GalleryPage({ gallery, albums, indexedKeywords }: Gallery.ComponentProps) {
  return (
    <GalleryPageComponent albums={albums} gallery={gallery} indexedKeywords={indexedKeywords} />
  )
}

export default GalleryPage
