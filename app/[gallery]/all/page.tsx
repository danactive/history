import type { Metadata } from 'next'
import { Suspense } from 'react'
import AllClient from '../../../src/components/All/AllClient'
import { getAllData } from '../../../src/lib/all'
import getGalleries from '../../../src/lib/galleries'
import { generateClusters } from '../../../src/lib/generate-clusters'
import { formatVisitedPlace } from '../../../src/lib/visited'
import type { VisitedPlace } from '../../../src/types/common'
import type { All } from '../../../src/types/pages'

export async function generateStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ gallery }))
}

export const metadata: Metadata = {
  title: 'All - History App',
}

type SearchParams = {
  visitedCountry?: string | string[]
  visitedRegion?: string | string[]
}

function getVisitedPlaceFromSearchParams(searchParams?: SearchParams): VisitedPlace | null {
  const country = typeof searchParams?.visitedCountry === 'string' ? searchParams.visitedCountry.trim() : ''
  const regionValue = typeof searchParams?.visitedRegion === 'string' ? searchParams.visitedRegion.trim() : ''

  if (!country) {
    return null
  }

  return {
    country,
    region: regionValue || null,
  }
}

export default async function AllServer({
  params,
  searchParams,
}: {
  params: Promise<All.Params>,
  searchParams?: Promise<SearchParams>,
}) {
  const [{ gallery }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ])
  const visitedPlace = getVisitedPlaceFromSearchParams(resolvedSearchParams)

  const { items = [], indexedKeywords } = await getAllData({ gallery }, visitedPlace)
  const clusterMarkers = generateClusters(items)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllClient
        items={items}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusterMarkers}
        visitedPlace={visitedPlace}
        visitedFilterLabel={visitedPlace ? formatVisitedPlace(visitedPlace) : null}
      />
    </Suspense>
  )
}
