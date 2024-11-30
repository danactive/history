// These styles apply to every route in the application
import './global.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'History App',
  description: 'History App Gallery',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <h1>App root layout</h1>
        {children}
      </body>
    </html>
  )
}
