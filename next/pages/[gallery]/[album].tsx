import type { GetStaticPaths, GetStaticProps } from 'next'
import { type ParsedUrlQuery } from 'node:querystring'

import AlbumPageComponent from '../../src/components/AlbumPage'
import getAlbum from '../../src/lib/album'
import getAlbums from '../../src/lib/albums'
import getGalleries from '../../src/lib/galleries'
import indexKeywords, { addGeographyToSearch } from '../../src/lib/search'
import type { AlbumMeta, Item } from '../../src/types/common'

async function buildStaticPaths() {
  const { galleries } = await getGalleries()
  const groups = await Promise.all(galleries.map(async (gallery) => {
    const { albums } = await getAlbums(gallery)
    return albums.map(({ name: album }) => ({ params: { gallery, album } }))
  }))
  return groups.flat()
}

interface ServerSideAlbumItem extends Item {
  corpus: string;
}

type ComponentProps = {
  items?: ServerSideAlbumItem[];
  meta: AlbumMeta;
  indexedKeywords: object[];
}

interface Params extends ParsedUrlQuery {
  gallery: NonNullable<AlbumMeta['gallery']>
  album: NonNullable<AlbumMeta['albumName']>
}

export const getStaticProps: GetStaticProps<ComponentProps, Params> = async (context) => {
  const params = context.params!
  const { album: { items, meta } } = await getAlbum(params.gallery, params.album)
  const preparedItems = items.map((item) => ({
    ...item,
    search: addGeographyToSearch(item),
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
  }))

  return {
    props: { items: preparedItems, meta, ...indexKeywords(preparedItems) },
  }
}

// Define these albums as allowed, otherwise 404
export const getStaticPaths: GetStaticPaths = async () => (
  {
    paths: await buildStaticPaths(),
    fallback: false,
  }
)

function AlbumPage({ items = [], meta, indexedKeywords }: ComponentProps) {
  return <AlbumPageComponent items={items} meta={meta} indexedKeywords={indexedKeywords} />
}

export default AlbumPage
