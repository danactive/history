import type { Metadata } from 'next'
import { Suspense } from 'react'

import AllClient from '../../../src/components/All/AllClient'
import { getAllData } from '../../../src/lib/all'
import getGalleries from '../../../src/lib/galleries'
import type { All } from '../../../src/types/pages'
import { generateClusters } from '../../../src/lib/generate-clusters'

export async function generateStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ gallery }))
}

export const metadata: Metadata = {
  title: 'All - History App',
}

export default async function AllServer(props: { params: Promise<All.Params> }) {
  const params = await props.params
  const { gallery } = params

  const { items = [], indexedKeywords } = await getAllData({ gallery })
  const clusterMarkers = generateClusters(items)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllClient
        items={items}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusterMarkers}
      />
    </Suspense>
  )
}
