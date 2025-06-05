import ThemeRegistry from '../src/components/ThemeRegistry'
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry options={{ key: 'joy' }}>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
