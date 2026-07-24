import { Suspense } from 'react'
import type { Metadata } from 'next'

import PersonsClient from '../../../src/components/Persons/PersonsClient'
import { filterAllItemsByVisitedPlace } from '../../../src/lib/all'
import { buildAgeSummary } from '../../../src/utils/person-age'
import getGalleries from '../../../src/lib/galleries'
import { filterPersonsItems, getPersonsData } from '../../../src/lib/persons'
import indexKeywords from '../../../src/lib/search'
import type { Gallery, VisitedPlace } from '../../../src/types/common'
import { generateClusters } from '../../../src/lib/generate-clusters'

export const metadata: Metadata = {
  title: 'Persons - History App',
}

type SearchParams = {
  age?: string | string[]
  person?: string | string[]
  visitedCountry?: string | string[]
  visitedRegion?: string | string[]
}

type AgeFilterValue = number | 'unknown' | null

function getPersonFromSearchParams(searchParams?: SearchParams) {
  const person = typeof searchParams?.person === 'string' ? searchParams.person.trim() : ''
  return person || null
}

function getAgeFromSearchParams(searchParams?: SearchParams): AgeFilterValue {
  const ageValue = typeof searchParams?.age === 'string' ? searchParams.age.trim() : ''
  if (!ageValue) {
    return null
  }

  if (ageValue === 'unknown') {
    return 'unknown'
  }

  const age = Number.parseInt(ageValue, 10)
  return Number.isNaN(age) ? null : age
}

function getVisitedPlaceFromSearchParams(searchParams?: SearchParams): VisitedPlace | null {
  const country = typeof searchParams?.visitedCountry === 'string' ? searchParams.visitedCountry.trim() : ''
  const region = typeof searchParams?.visitedRegion === 'string' ? searchParams.visitedRegion.trim() : ''

  if (!country) {
    return null
  }

  return {
    country,
    region: region || null,
  }
}

export async function generateStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ gallery }))
}

export default async function PersonsServer({
  params,
  searchParams,
}: {
  params: Promise<{ gallery: Gallery }>
  searchParams?: Promise<SearchParams>
}) {
  const [{ gallery }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ])
  const initialSelectedAge = getAgeFromSearchParams(resolvedSearchParams)
  const initialSelectedPerson = getPersonFromSearchParams(resolvedSearchParams)
  const visitedPlace = getVisitedPlaceFromSearchParams(resolvedSearchParams)

  const personsData = await getPersonsData({ gallery })
  const visitedScopedItems = visitedPlace
    ? filterAllItemsByVisitedPlace(personsData.items, visitedPlace)
    : personsData.items
  const summaryItems = filterPersonsItems(visitedScopedItems, null, initialSelectedPerson)
  const items = visitedPlace
    ? summaryItems
    : filterPersonsItems(summaryItems, initialSelectedAge, initialSelectedPerson)
  const hasServerScope = visitedPlace !== null || initialSelectedAge !== null || initialSelectedPerson !== null
  const indexedKeywords = hasServerScope ? indexKeywords(items).indexedKeywords : personsData.indexedKeywords

  const clusterMarkers = generateClusters(items)
  const initialAgeSummary = buildAgeSummary(summaryItems)

  return (
    <Suspense fallback={<div>Loading Persons...</div>}>
      <PersonsClient
        gallery={gallery}
        items={items}
        totalItemCount={personsData.items.length}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusterMarkers}
        initialAgeSummary={initialAgeSummary}
        initialSelectedAge={initialSelectedAge}
        initialSelectedPerson={initialSelectedPerson}
      />
    </Suspense>
  )
}
