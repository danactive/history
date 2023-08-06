import config from '../../../config.json'
import { get as getGalleries } from '../../src/lib/galleries'
import { get as getAlbums } from '../../src/lib/albums'
import getAlbum from '../../src/lib/album'
import { indexKeywords } from '../../src/lib/search'

import AlbumPageComponent from '../../src/components/AlbumPage'

export async function getStaticProps({ params: { gallery } }) {
  const { albums } = await getAlbums(gallery)

  const preparedItems = ({ albumName, albumCoordinateAccuracy, items }) => items.map((item) => ({
    ...item,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
  }))
  // reverse order for albums in ascending order (oldest on top)
  const allItems = await [...albums].reverse().reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    const MMDD = new Date().toISOString().substring(5, 10)
    const itemsMatchDate = items.filter((item) => item?.filename?.toString().substring?.(5, 10) === MMDD)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    return prev.concat(preparedItems({ albumName: album.name, albumCoordinateAccuracy, items: itemsMatchDate }))
  }, Promise.resolve([]))

  return {
    props: { items: allItems, ...indexKeywords(allItems) },
  }
}

export async function getStaticPaths() {
  const { galleries } = await getGalleries()
  // Define these galleries as allowed, otherwise 404
  const paths = galleries.map((gallery) => ({ params: { gallery } }))
  return {
    paths,
    fallback: false,
  }
}

function Today({ items, indexedKeywords }) {
  return <AlbumPageComponent items={items} indexedKeywords={indexedKeywords} />
}

export default Today
