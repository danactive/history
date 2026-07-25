import { Suspense } from 'react'
import type { Metadata } from 'next'

import PersonsClient from '../../../src/components/Persons/PersonsClient'
import { getPersonsPageData } from '../../../src/lib/persons-page'
import {
  buildClusteredPageData,
  generateGalleryStaticParams,
  resolveRouteInputs,
  type GalleryRouteProps,
} from '../../../src/lib/server/page-route'
import { parsePersonsRouteSearchParams, type PersonsSearchParams } from '../../../src/lib/server/search-params'

export const metadata: Metadata = {
  title: 'Persons - History App',
}

type SearchParams = {
  age?: string | string[]
  person?: string | string[]
} & PersonsSearchParams

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

export default async function PersonsServer({
  params,
  searchParams,
}: GalleryRouteProps<SearchParams>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params, searchParams)
  const {
    selectedAge: initialSelectedAge,
    selectedPerson: initialSelectedPerson,
  } = parsePersonsRouteSearchParams(resolvedSearchParams)
  const {
    items,
    indexedKeywords,
    initialAgeSummary,
    totalItemCount,
    visitedPlace,
    visitedFilterLabel,
    clusteredMarkers,
  } = buildClusteredPageData(await getPersonsPageData({
    gallery,
    selectedAge: initialSelectedAge,
    selectedPerson: initialSelectedPerson,
    searchParams: resolvedSearchParams,
  }))

  return (
    <Suspense fallback={<div>Loading Persons...</div>}>
      <PersonsClient
        gallery={gallery}
        items={items}
        totalItemCount={totalItemCount}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusteredMarkers}
        initialAgeSummary={initialAgeSummary}
        initialSelectedAge={initialSelectedAge}
        initialSelectedPerson={initialSelectedPerson}
        visitedPlace={visitedPlace}
        visitedFilterLabel={visitedFilterLabel}
      />
    </Suspense>
  )
}
