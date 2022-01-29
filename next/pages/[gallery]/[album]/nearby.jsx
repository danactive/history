/* global fetch */
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
  const [hasError, setError] = useState(false)
  useEffect(async () => {
    try {
      const response = await fetch('http://localhost:3055/api/flickr')
      const result = await response.json()
      setAlbums(result.photos)
    } catch (e) {
      console.log('Error fetch Flickr data', e.message)
      setError(true)
    }
  }, [])

  return (
    <>
      <Head>
        <title>History App - Nearby</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Hello>Hello World</Hello>
      {hasError && 'Sorry try again later'}
      <ul>
        {albums.map((album) => (
          <li key={album.path}><img src={album.path} alt={album.caption} /></li>
        ))}
      </ul>
    </>
  )
}

export default Nearby
