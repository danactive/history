import { List, ListDivider, ListItem } from '@mui/joy'
import { Fragment } from 'react'

import Link from '../components/Link'

import getGalleryNames, { type Gallery } from '../lib/galleries'

async function getGalleries(): Promise<{ id: Gallery; gallery: Gallery }[]> {
  const { galleries } = await getGalleryNames()

  return galleries.map((gallery) => ({ id: gallery, gallery }))
}

export default async function Index() {
  const galleries = await getGalleries()
  return (
    <main>
      <h1>List of Galleries</h1>
      <List>
        {galleries && galleries.map((item, i) => (
          <Fragment key={`frag${item.gallery}`}>
            {i > 0 && <ListDivider />}
            <ListItem>
              <Link href={`/${item.gallery}`} title={`${item.gallery} gallery`}>
                {item.gallery}
              </Link>
            </ListItem>
          </Fragment>
        ))}
      </List>
    </main>
  )
}
