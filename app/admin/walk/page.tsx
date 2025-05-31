import { Suspense } from 'react'
import type { Metadata } from 'next'

import WalkPageComp from '../../../src/components/Walk/WalkPage'

export const metadata: Metadata = {
  title: 'Admin > Walk - History App',
}

function WalkPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalkPageComp />
    </Suspense>
  )
}

export default WalkPage
