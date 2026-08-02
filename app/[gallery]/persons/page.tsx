import { Suspense } from 'react'
import type { Metadata } from 'next'

import PersonsClient from '../../../src/components/Persons/PersonsClient'
import PersonsFallback from '../../../src/components/Persons/PersonsFallback'
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

export default async function PersonsServer({
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
  const {
    items,
    indexedKeywords,
    personOptions,
    tagOptions,
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
  }))

  return (
    <Suspense fallback={<PersonsFallback />}>
      <PersonsClient
        gallery={gallery}
        items={items}
        totalItemCount={totalItemCount}
        indexedKeywords={indexedKeywords}
        personOptions={personOptions}
        tagOptions={tagOptions}
        clusteredMarkers={clusteredMarkers}
        initialAgeSummary={initialAgeSummary}
        initialBaseScopeItems={initialBaseScopeItems}
        initialAgeScopeItems={initialAgeScopeItems}
        initialPersonScopeItems={initialPersonScopeItems}
        initialSelectedAge={initialSelectedAge}
        initialSelectedPerson={initialSelectedPerson}
      />
    </Suspense>
  )
}
