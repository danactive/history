import Head from 'next/head'

import { get as getGalleries } from '../../src/lib/galleries'
import GenericList from '../../src/components/GenericList'
import ListItem from '../../src/components/ListItem'
import Link from '../../src/components/Link'

export async function getStaticProps() {
  const { galleries } = await getGalleries()

  return {
    props: {
      galleries: galleries.map((gallery) => ({ id: gallery, gallery })),
    },
  }
}

const ListComponent = ({ item }) => (
  <ListItem item={<Link href={`/view/${item.gallery}/albums`}>{item.gallery}</Link>} />
)

const Home = ({ galleries }) => (
  <div>
    <Head>
      <title>History App - List Galleries</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1>List of Galleries</h1>
      <GenericList loading={false} error={false} items={galleries} component={ListComponent} />
    </main>
  </div>
)

export default Home
