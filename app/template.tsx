import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'History App',
  description: 'History App Gallery',
}

export default function Template({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
