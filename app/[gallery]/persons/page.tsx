import { Suspense } from 'react'
import type { Metadata } from 'next'

import PersonsClient from '../../../src/components/Persons/PersonsClient'
import { buildAgeSummary } from '../../../src/utils/person-age'
import getGalleries from '../../../src/lib/galleries'
import { getPersonsData } from '../../../src/lib/persons'
import indexKeywords from '../../../src/lib/search'
import type { Gallery } from '../../../src/types/common'
import { generateClusters } from '../../../src/lib/generate-clusters'
import { calcAgeAtDate, resolvePhotoDate } from '../../../src/utils/person-age'

export const metadata: Metadata = {
  title: 'Persons - History App',
}

type SearchParams = {
  age?: string | string[]
  person?: string | string[]
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

  const personsData = await getPersonsData({ gallery })
  const personFilteredItems = initialSelectedPerson
    ? personsData.items.filter((item) => item.persons?.some((person) => person.full === initialSelectedPerson))
    : personsData.items
  const items = initialSelectedAge === null
    ? personFilteredItems
    : personFilteredItems.filter((item) => {
      if (!item.persons || !item.filename) {
        return false
      }

      const photoDate = resolvePhotoDate(item)
      return item.persons.some((person) => {
        if (initialSelectedPerson && person.full !== initialSelectedPerson) {
          return false
        }
        const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
        return age === initialSelectedAge
      })
    })
  const indexedKeywords = initialSelectedPerson ? indexKeywords(items).indexedKeywords : personsData.indexedKeywords

  const clusterMarkers = generateClusters(items)
  const initialAgeSummary = buildAgeSummary(items)

  return (
    <Suspense fallback={<div>Loading Persons...</div>}>
      <PersonsClient
        items={items}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusterMarkers}
        initialAgeSummary={initialAgeSummary}
        initialSelectedAge={initialSelectedAge}
        initialSelectedPerson={initialSelectedPerson}
      />
    </Suspense>
  )
}
