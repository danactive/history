import { createGlobalStyle, ThemeProvider } from 'styled-components'
import '../image-gallery.css' /* cannot use import on SplitViewer as unit test fails */

const GlobalStyle = createGlobalStyle`
  body {
    font-family: Verdana, sans-serif;
    color: silver;
    background-color: #323232;
    margin: 0 auto;
    display: flex;
    min-height: 100%;
    padding: 0 16px;
    flex-direction: column;
  }
`

const theme = {
  colors: {
    primary: '#0070f3',
  },
}

export default function App({ Component, pageProps }) {
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}
