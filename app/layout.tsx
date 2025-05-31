'use client'

import { CssVarsProvider } from '@mui/joy/styles'
import { themeMui } from '../src/theme'
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CssVarsProvider theme={themeMui}>
          {children}
        </CssVarsProvider>
      </body>
    </html>
  )
}
