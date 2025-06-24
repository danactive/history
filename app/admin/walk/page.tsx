import { Suspense } from 'react'
import type { Metadata } from 'next'

import WalkClient from '../../../src/components/Walk/WalkClient'

export const metadata: Metadata = {
  title: 'Admin > Walk - History App',
}

export default function WalkServer() {
  return (
    <Suspense fallback={<div>Loading Walk page...</div>}>
      <WalkClient />
    </Suspense>
  )
}
