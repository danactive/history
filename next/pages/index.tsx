import { List, ListDivider, ListItem } from '@mui/joy'
import { type GetStaticProps } from 'next'
import Head from 'next/head'
import { Fragment } from 'react'

import Link from '../src/components/Link'
import getGalleries, { type Gallery } from '../src/lib/galleries'

type Props = {
  galleries: { id: Gallery; gallery: Gallery }[]
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { galleries } = await getGalleries()

  return {
    props: {
      galleries: galleries.map((gallery) => ({ id: gallery, gallery })),
    },
  }
}

function Home({ galleries }: Props) {
  return (
    <>
      <Head>
        <title>History App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>List of Galleries</h1>
        <List>
          {galleries && galleries.map((item, i) => (
            <Fragment key={`frag${item.gallery}`}>
              {i > 0 && <ListDivider />}
              <ListItem>
                <Link href={`/${item.gallery}`}>
                  {item.gallery}
                </Link>
              </ListItem>
            </Fragment>
          ))}
        </List>
      </main>
    </>
  )
}

export default Home
