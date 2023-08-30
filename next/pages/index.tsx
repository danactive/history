import { List, ListDivider, ListItem } from '@mui/joy'
import { CssVarsProvider } from '@mui/joy/styles'
import { type GetStaticProps } from 'next'
import Head from 'next/head'
import { Fragment } from 'react'
import styled from 'styled-components'

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

const Wrapper = styled.div`
  padding: 0;
  margin: 0;
  width: 100%;
  background-color: #545454;
  border: 1px solid #ccc;
  border-radius: 3px;
  overflow: hidden;
`

function Home({ galleries }: Props) {
  return (
    <>
      <Head>
        <title>History App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <CssVarsProvider defaultMode="dark">
        <main>
          <h1>List of Galleries</h1>
          <Wrapper>
            <List
              aria-labelledby="galleries"
              variant="outlined"
              sx={{
                listStyle: 'none',
                margin: 0,
                padding: '0',
                width: '100%',
                maxHeight: '30em',
                overflowY: 'auto',
              }}
            >
              {galleries && galleries.map((item, i) => (
                <Fragment key={`frag${item.gallery}`}>
                  {i > 0 && (
                    <ListDivider
                      sx={{ background: '#ccc' }}
                      inset="gutter"
                    />
                  )}
                  <ListItem>
                    <Link href={`/${item.gallery}`}>
                      {item.gallery}
                    </Link>
                  </ListItem>
                </Fragment>
              ))}
            </List>
          </Wrapper>
        </main>
      </CssVarsProvider>
    </>
  )
}

export default Home
