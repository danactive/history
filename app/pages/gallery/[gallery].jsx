import { get as getAlbums } from '../../src/lib/albums'

export async function getStaticProps() {
  return {
    props: await getAlbums('demo'),
  }
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { gallery: 'demo' } },
    ],
    fallback: false,
  }
}

const Gallery = ({ albums }) => (
  <div>Gallery page for {JSON.stringify(albums)}</div>
)

export default Gallery
