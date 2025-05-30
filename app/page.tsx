import { List, ListDivider, ListItem } from '@mui/joy'
import { Fragment } from 'react'
import Head from 'next/head'
import Link from '../src/components/Link'
import getGalleries, { type Gallery } from '../src/lib/galleries'

export const metadata = {
  title: 'Galleries - History App',
}

type PageProps = {
  galleries: { id: Gallery; gallery: Gallery }[]
}

async function getGalleryData(): Promise<PageProps> {
  const { galleries } = await getGalleries()

  return {
    galleries: galleries.map((gallery) => ({ id: gallery, gallery })),
  }
}

export default async function Home() {
  const { galleries } = await getGalleryData()

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
