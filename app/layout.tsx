import ThemeRegistry from '../src/components/ThemeRegistry'
import { mapMarkerCssVariables } from '../src/components/SlippyMap/marker-theme'
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={mapMarkerCssVariables}>
        <ThemeRegistry options={{ key: 'joy' }}>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
