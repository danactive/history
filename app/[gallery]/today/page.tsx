import type { Metadata } from 'next'
import { Suspense } from 'react'
import AlbumPageComponent from '../../../src/components/Album/AlbumClient'
import {
  buildClusteredPageData,
  generateGalleryStaticParams,
  resolveRouteInputs,
  type GalleryRouteProps,
} from '../../../src/lib/server/page-route'
import {
  parsePersonSearchParams,
  parseTodayRouteSearchParams,
  type PersonsSearchParams,
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
  TodayRouteSearchParams & PersonsSearchParams
>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params,
    searchParams)
  const { monthDay,
    visitedPlace } = parseTodayRouteSearchParams(resolvedSearchParams)
  const { person } = parsePersonSearchParams(resolvedSearchParams)
  const {
    items,
    indexedKeywords,
    personOptions,
    tagOptions,
    totalItemCount,
    visitedPlace: scopedVisitedPlace,
    visitedFilterLabel,
    clusteredMarkers,
  } = buildClusteredPageData(
    await getTodayItems(gallery, monthDay, visitedPlace, person),
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
        visitedPlace={scopedVisitedPlace}
        visitedFilterLabel={visitedFilterLabel}
      />
    </Suspense>
  )
}
