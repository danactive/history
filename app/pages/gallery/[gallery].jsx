import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'

export async function getStaticProps({ params: { gallery } }) {
  return {
    props: await getAlbums(gallery),
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

const Gallery = ({ albums }) => (
  <div>Gallery page for {JSON.stringify(albums)}</div>
)

export default Gallery
