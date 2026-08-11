import { Suspense } from 'react'
import type { Metadata } from 'next'

import PersonsClient from '../../../src/components/Persons/PersonsClient'
import PersonsFallback from '../../../src/components/Persons/PersonsFallback'
import { parseMapBoundsParam } from '../../../src/lib/map-filter-query'
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

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

export default function PersonsServer(props: GalleryRouteProps<PersonsSearchParams>) {
  return (
    <Suspense fallback={<PersonsFallback />}>
      <PersonsServerContent {...props} />
    </Suspense>
  )
}

async function PersonsServerContent({
  params,
  searchParams,
}: GalleryRouteProps<PersonsSearchParams>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params, searchParams)
  const {
    selectedAge: initialSelectedAge,
    selectedPerson: initialSelectedPerson,
  } = parsePersonsRouteSearchParams(resolvedSearchParams)
  const mapBounds = parseMapBoundsParam(resolvedSearchParams.bbox)
  const {
    items,
    indexedKeywords,
    personOptions,
    tagOptions,
    activeFacetCounts,
    initialAgeSummary,
    initialBaseScopeItems,
    initialAgeScopeItems,
    initialPersonScopeItems,
    totalItemCount,
    clusteredMarkers,
  } = buildClusteredPageData(await getPersonsPageData({
    gallery,
    selectedAge: initialSelectedAge,
    selectedPerson: initialSelectedPerson,
    searchParams: resolvedSearchParams,
    mapBounds,
  }))

  return (
    <PersonsClient
      gallery={gallery}
      items={items}
      totalItemCount={totalItemCount}
      indexedKeywords={indexedKeywords}
      personOptions={personOptions}
      tagOptions={tagOptions}
      activeFacetCounts={activeFacetCounts}
      clusteredMarkers={clusteredMarkers}
      initialAgeSummary={initialAgeSummary}
      initialBaseScopeItems={initialBaseScopeItems}
      initialAgeScopeItems={initialAgeScopeItems}
      initialPersonScopeItems={initialPersonScopeItems}
      initialSelectedAge={initialSelectedAge}
      initialSelectedPerson={initialSelectedPerson}
    />
  )
}
