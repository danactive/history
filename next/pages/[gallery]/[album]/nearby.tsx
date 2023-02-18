import Head from 'next/head'
import styled from 'styled-components'

const Hello = styled.div`
  background: palevioletred;
  border-radius: 3px;
  border: none;
  color: white;
`

function Nearby() {
  return (
    <>
      <Head>
        <title>History App - Nearby</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Hello>Hello World</Hello>
    </>
  )
}

export default Nearby
