import Head from 'next/head'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const Hello = styled.div`
  background: palevioletred;
  border-radius: 3px;
  border: none;
  color: white;
`

function Nearby() {
  const [albums, setAlbums] = useState([])
  useEffect(async () => {
    const response = await fetch('http://localhost:3030/api/galleries/demo/albums')
    const result = await response.json()
    setAlbums(result.albums)
  }, [])

  return (
    <>
      <Head>
        <title>History App - Nearby</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Hello>Hello World</Hello>
      <ul>{albums.map((album) => <li>{album.name}</li>)}</ul>
    </>
  )
}

export default Nearby
