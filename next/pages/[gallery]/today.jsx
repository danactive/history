import { get as getGalleries } from '../../src/lib/galleries'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getAlbum } from '../../src/lib/album'
import AlbumPageComponent from '../../src/components/AlbumPage'

export async function getStaticProps({ params: { gallery } }) {
  const { albums } = await getAlbums(gallery)

  const preparedItems = (items) => items.map((item) => ({
    ...item,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
  }))
  // reverse order for albums in ascending order (oldest on top)
  const allItems = await [...albums].reverse().reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items } } = await getAlbum(gallery, album.name)
    const itemsMatchDate = items.filter((item) => item?.filename?.substring?.(5, 10) === new Date().toLocaleDateString().substring(5, 10))
    return prev.concat(preparedItems(itemsMatchDate))
  }, Promise.resolve([]))

  return {
    props: { items: allItems },
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

function Today({ items }) {
  return <AlbumPageComponent items={items} />
}

export default Today
