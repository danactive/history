import { List, ListDivider, ListItem } from '@mui/joy'
import { cacheLife, cacheTag } from 'next/cache'
import type { Metadata } from 'next'
import { Fragment } from 'react'

import Link from '../src/components/Link'
import getGalleries from '../src/lib/galleries'

export const metadata: Metadata = {
  title: 'Galleries - History App',
}

async function getCachedGalleries() {
  'use cache'

  cacheLife('max')
  cacheTag('gallery-index')
  return getGalleries()
}

export default async function Home() {
  const { galleries } = await getCachedGalleries()

  return (
    <main>
      <h1>List of Galleries</h1>
      <p>
        <Link href="/details">Galleries details</Link>
      </p>
      <List>
        {galleries && galleries.map((gallery, i) => (
          <Fragment key={`frag${gallery}`}>
            {i > 0 && <ListDivider />}
            <ListItem>
              <Link href={`/${gallery}`}>
                {gallery}
              </Link>
            </ListItem>
          </Fragment>
        ))}
      </List>
    </main>
  )
}
