import type { Metadata } from 'next'
import { Suspense } from 'react'
import AlbumPageComponent from '../../../src/components/Album/AlbumClient'
import { parseMapBoundsParam } from '../../../src/lib/map-filter-query'
import {
  buildClusteredPageData,
  generateGalleryStaticParams,
  resolveRouteInputs,
  type GalleryRouteProps,
} from '../../../src/lib/server/page-route'
import {
  getQueryFromSearchParams,
  parseTodayRouteSearchParams,
  type QuerySearchParams,
  type TodayRouteSearchParams,
} from '../../../src/lib/server/search-params'
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
}: GalleryRouteProps<
  TodayRouteSearchParams & QuerySearchParams
>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params,
    searchParams)
  const { monthDay } = parseTodayRouteSearchParams(resolvedSearchParams)
  const query = getQueryFromSearchParams(resolvedSearchParams)
  const mapBounds = parseMapBoundsParam(resolvedSearchParams.bbox)
  const {
    items,
    indexedKeywords,
    personOptions,
    tagOptions,
    totalItemCount,
    clusteredMarkers,
  } = buildClusteredPageData(
    await getTodayItems(gallery, monthDay, query, mapBounds),
  )
  return (
    <Suspense fallback={<div>Loading Today...</div>}>
      <AlbumPageComponent
        gallery={gallery}
        monthDay={monthDay}
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
