import { Suspense } from 'react'

import WalkPageComp from '../../../src/components/Walk/WalkPage'

function WalkPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalkPageComp />
    </Suspense>
  )
}

export default WalkPage
