import type { Metadata } from 'next'
import { Suspense } from 'react'
import AllClient from '../../../src/components/All/AllClient'
import { getAllData } from '../../../src/lib/all'
import { compactAllPageItems } from '../../../src/lib/all-client-items'
import { parseMapBoundsParam } from '../../../src/lib/map-filter-query'
import {
  buildClusteredPageData,
  generateGalleryStaticParams,
  resolveRouteInputs,
  type GalleryRouteProps,
} from '../../../src/lib/server/page-route'
import { getQueryFromSearchParams, type QuerySearchParams } from '../../../src/lib/server/search-params'

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

export const metadata: Metadata = {
  title: 'All - History App',
}

export default function AllServer(props: GalleryRouteProps<QuerySearchParams>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllServerContent {...props} />
    </Suspense>
  )
}

async function AllServerContent({
  params,
  searchParams,
}: GalleryRouteProps<QuerySearchParams>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params, searchParams)
  const query = getQueryFromSearchParams(resolvedSearchParams)
  const mapBounds = parseMapBoundsParam(resolvedSearchParams.bbox)

  const {
    items = [],
    indexedKeywords,
    personOptions,
    tagOptions,
    activeFacetCounts,
    totalItemCount,
    clusteredMarkers,
  } = buildClusteredPageData(await getAllData({ gallery, query, mapBounds }))

  return (
    <AllClient
      gallery={gallery}
      items={compactAllPageItems(items)}
      totalItemCount={totalItemCount}
      indexedKeywords={indexedKeywords}
      personOptions={personOptions}
      tagOptions={tagOptions}
      activeFacetCounts={activeFacetCounts}
      clusteredMarkers={clusteredMarkers}
    />
  )
}
