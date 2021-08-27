import Head from 'next/head'
import styled, { css } from 'styled-components'
import { get as getAlbum } from '../../../src/lib/album'
import Link from '../../../src/components/Link'

const GoTo = styled.a`
  color: black;
  text-decoration: none;
  display: inline-block;
  padding: 10px;
  margin-left: 20px;
  font-size: 14px;
  background-color: lightgrey;
  border: 1px solid black;
  border-radius: 4px;
`;

export async function getStaticProps({ params: { gallery, album } }) {
  const json = await getAlbum(gallery, album)
  return {
    props: json,
  }
}

export async function getStaticPaths() {
  const paths = [{ params: { gallery: 'demo', album: 'sample' } }]
  return {
    paths,
    fallback: false,
  }
}

const AlbumPage = ({ album }) => (
  <div>
    <Head>
      <title>History App - Album</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <ul>
      {album.items.map((item) => (
        <li key={item.filename}>{item.city}
          <img src={item.thumbPath} alt={item.caption} />
          {item?.geo?.lat}, {item?.geo?.lon}
          <Link href={`/view/nearby?lat=${item?.geo?.lat}&lon=${item?.geo?.lon}`}><GoTo>See Nearby</GoTo></Link>
        </li>
      ))}
    </ul>
  </div>
)

export default AlbumPage
