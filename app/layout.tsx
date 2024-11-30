'use client'

import { CssVarsProvider } from '@mui/joy/styles'
import './global.css'
import { themeMui } from '../src/theme'

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
