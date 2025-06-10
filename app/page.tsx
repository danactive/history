import { List, ListDivider, ListItem } from '@mui/joy'
import type { Metadata } from 'next'
import { Fragment } from 'react'

import Link from '../src/components/Link'
import getGalleries from '../src/lib/galleries'

export const metadata: Metadata = {
  title: 'Galleries - History App',
}

export default async function Home() {
  const { galleries } = await getGalleries()

  return (
    <main>
      <h1>List of Galleries</h1>
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
