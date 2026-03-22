import { Suspense } from 'react'
import type { Metadata } from 'next'

import PersonsClient from '../../../src/components/Persons/PersonsClient'
import { buildAgeSummary } from '../../../src/utils/person-age'
import getGalleries from '../../../src/lib/galleries'
import { getPersonsData } from '../../../src/lib/persons'
import type { Gallery } from '../../../src/types/common'
import { generateClusters } from '../../../src/lib/generate-clusters'

type AgeSummary = {
  ages: { age: number; count: number }[];
};

export const metadata: Metadata = {
  title: 'Persons - History App',
}

export async function generateStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ gallery }))
}

export default async function PersonsServer(props: { params: Promise<{ gallery: Gallery }> }) {
  const params = await props.params
  const { gallery } = params

  const { items, indexedKeywords } = await getPersonsData({ gallery })
  const clusterMarkers = generateClusters(items)
  const initialAgeSummary = buildAgeSummary(items)

  return (
    <Suspense fallback={<div>Loading Persons...</div>}>
      <PersonsClient
        items={items}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusterMarkers}
        initialAgeSummary={initialAgeSummary}
      />
    </Suspense>
  )
}
