import type { Metadata } from 'next'
import { Suspense } from 'react'
import AlbumPageComponent from '../../../src/components/Album/AlbumClient'
import {
  buildClusteredPageData,
  generateGalleryStaticParams,
  resolveRouteInputs,
  type GalleryRouteProps,
} from '../../../src/lib/server/page-route'
import { parseTodayRouteSearchParams, type TodayRouteSearchParams } from '../../../src/lib/server/search-params'
import { getTodayItems } from '../../../src/lib/today'

export const metadata: Metadata = {
  title: 'Today - History App',
}

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

export default async function TodayServer({
  params,
  searchParams,
}: GalleryRouteProps<TodayRouteSearchParams>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params, searchParams)
  const { monthDay, visitedPlace } = parseTodayRouteSearchParams(resolvedSearchParams)
  const {
    items,
    indexedKeywords,
    totalItemCount,
    visitedPlace: scopedVisitedPlace,
    visitedFilterLabel,
    clusteredMarkers,
  } = buildClusteredPageData(await getTodayItems(gallery, monthDay, visitedPlace))
  return (
    <Suspense fallback={<div>Loading Today...</div>}>
      <AlbumPageComponent
        gallery={gallery}
        monthDay={monthDay}
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
