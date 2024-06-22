// These styles apply to every route in the application
import ThemeRegistry from './ThemeRegistery'
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeRegistry options={{ key: 'joy' }}>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ThemeRegistry>
  )
}
