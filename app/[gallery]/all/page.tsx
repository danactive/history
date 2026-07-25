import type { Metadata } from 'next'
import { Suspense } from 'react'
import AllClient from '../../../src/components/All/AllClient'
import { getAllData } from '../../../src/lib/all'
import {
  buildClusteredPageData,
  generateGalleryStaticParams,
  resolveRouteInputs,
  type GalleryRouteProps,
} from '../../../src/lib/server/page-route'
import { parseVisitedSearchParams, type VisitedSearchParams } from '../../../src/lib/server/search-params'

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

export const metadata: Metadata = {
  title: 'All - History App',
}

export default async function AllServer({
  params,
  searchParams,
}: GalleryRouteProps<VisitedSearchParams>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params, searchParams)
  const { visitedPlace } = parseVisitedSearchParams(resolvedSearchParams)

  const {
    items = [],
    indexedKeywords,
    totalItemCount,
    visitedPlace: scopedVisitedPlace,
    visitedFilterLabel,
    clusteredMarkers,
  } = buildClusteredPageData(await getAllData({ gallery, visitedPlace }))

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllClient
        gallery={gallery}
        items={items}
        totalItemCount={totalItemCount}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusteredMarkers}
        visitedPlace={scopedVisitedPlace}
        visitedFilterLabel={visitedFilterLabel}
      />
    </Suspense>
  )
}
