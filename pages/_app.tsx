import { CssVarsProvider } from '@mui/joy/styles'
import { type AppProps } from 'next/app'
import '../app/global.css'
import { themeMui } from '../src/theme'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CssVarsProvider theme={themeMui}>
      <Component {...pageProps} />
    </CssVarsProvider>
  )
}
