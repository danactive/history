import { CssVarsProvider, extendTheme } from '@mui/joy/styles'
import { type AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import '../app/global.css'

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
          color: 'red',
        },
      },
    },
    JoyListItem: {
      styleOverrides: {
        root: {
          color: '#C0C0C0',
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
    <ThemeProvider theme={themeStyled}>
      <CssVarsProvider theme={themeMui}>
        <Component {...pageProps} />
      </CssVarsProvider>
    </ThemeProvider>
  )
}
