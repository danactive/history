import Head from 'next/head'

import { get as getGalleries } from '../src/lib/galleries'
import GenericList from '../src/components/GenericList'
import ListItem from '../src/components/ListItem'
import Link from '../src/components/Link'

export async function getStaticProps() {
  const { galleries } = await getGalleries()

  return {
    props: {
      galleries: galleries.map((gallery) => ({ id: gallery, gallery })),
    },
  }
}

function ListComponent({ item }) {
  return (
    <ListItem item={(
      <>
        <Link href={`/${item.gallery}`}>{item.gallery}</Link>
        <Link href={`/${item.gallery}/all`}>Search album</Link>
      </>
  )}
    />
  )
}

function Home({ galleries }) {
  return (
    <div>
      <Head>
        <title>History App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>List of Galleries</h1>
        <GenericList loading={false} error={false} items={galleries} component={ListComponent} />
      </main>
    </div>
  )
}

export default Home
