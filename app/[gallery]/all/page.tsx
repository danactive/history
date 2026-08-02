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
import { getQueryFromSearchParams, type QuerySearchParams } from '../../../src/lib/server/search-params'

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

export const metadata: Metadata = {
  title: 'All - History App',
}

export default async function AllServer({
  params,
  searchParams,
}: GalleryRouteProps<QuerySearchParams>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params, searchParams)
  const query = getQueryFromSearchParams(resolvedSearchParams)

  const {
    items = [],
    indexedKeywords,
    personOptions,
    tagOptions,
    totalItemCount,
    clusteredMarkers,
  } = buildClusteredPageData(await getAllData({ gallery, query }))

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllClient
        gallery={gallery}
        items={items}
        totalItemCount={totalItemCount}
        indexedKeywords={indexedKeywords}
        personOptions={personOptions}
        tagOptions={tagOptions}
        clusteredMarkers={clusteredMarkers}
      />
    </Suspense>
  )
}
