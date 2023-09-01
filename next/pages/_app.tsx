import { CssVarsProvider, extendTheme } from '@mui/joy/styles'
import { type AppProps } from 'next/app'
import { ThemeProvider, createGlobalStyle } from 'styled-components'

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

const themeMui = extendTheme({
  components: {
    JoyListDivider: {
      defaultProps: {
        inset: 'gutter',
      },
      styleOverrides: {
        root: {
          backgroundColor: 'silver',
        },
      },
    },
    JoyList: {
      styleOverrides: {
        root: {
          border: '1px solid silver',
          borderRadius: '3px',
          backgroundColor: '#545454',
        },
      },
    },
  },
})

const themeStyled = {
  colors: {
    primary: '#0070f3',
  },
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={themeStyled}>
        <CssVarsProvider theme={themeMui}>
          <Component {...pageProps} />
        </CssVarsProvider>
      </ThemeProvider>
    </>
  )
}
