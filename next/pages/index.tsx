import '@fontsource/public-sans';
import {List, ListDivider, ListItem} from '@mui/joy';
import Head from 'next/head';
import { CssVarsProvider } from '@mui/joy/styles';
import styled from 'styled-components'

import GenericList from '../src/components/GenericList';
import Link from '../src/components/Link';
import ListItemOld from '../src/components/ListItem'
import { get as getGalleries } from '../src/lib/galleries';

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
    <ListItemOld item={<Link href={`/${item.gallery}`}>{item.gallery}</Link>} />
  )
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

function Home({ galleries }) {
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
            <List aria-labelledby="galleries" variant="outlined" sx={{
                listStyle: 'none',
                margin: 0,
                padding: '0',
                width: '100%',
                maxHeight: '30em',
                overflowY: 'auto',
              }}>
              <ListItem>1 red onion</ListItem>
              <ListDivider sx={{ background: '#ccc' }} inset="gutter"/>
              <ListItem>2 red peppers</ListItem>
              <ListDivider sx={{ background: '#ccc' }} inset="gutter"/>
              <ListItem>120g bacon</ListItem>
            </List>
          </Wrapper>
          <GenericList loading={false} error={false} items={galleries} component={ListComponent} />
        </main>
      </CssVarsProvider>
    </>
  )
}

export default Home
