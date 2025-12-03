import { Suspense } from 'react'
import type { Metadata } from 'next'

import PersonsClient from '../../../src/components/Persons/PersonsClient'
import getGalleries from '../../../src/lib/galleries'
import { getPersonsData } from '../../../src/lib/persons'
import type { Gallery } from '../../../src/types/common'
import { generateClusters } from '../../../src/lib/generate-clusters'
import type { Item } from '../../../src/types/common'

type AgeSummary = {
  ages: { age: number; count: number }[];
};

function buildAgeSummary(items: Item[]): AgeSummary {
  const counts = new Map<number, number>()
  items.forEach(it => {
    if (!it.persons || !it.filename) return
    const filenameDate = Array.isArray(it.filename)
      ? (it.filename[0] ?? '').substring(0, 10)
      : String(it.filename).substring(0, 10)
    const photoDate = (it as any).photoDate || filenameDate
    it.persons.forEach(p => {
      if (!p.dob) return
      const birth = new Date(p.dob.substring(0, 10))
      const shot = new Date(photoDate.substring(0, 10))
      if (Number.isNaN(birth.getTime()) || Number.isNaN(shot.getTime())) return
      let age = shot.getFullYear() - birth.getFullYear()
      const m = shot.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && shot.getDate() < birth.getDate())) age -= 1
      if (age >= 0) counts.set(age, (counts.get(age) || 0) + 1)
    })
  })
  return {
    ages: Array.from(counts.entries())
      .map(([age, count]) => ({ age, count }))
      .sort((a, b) => a.age - b.age),
  }
}

export const metadata: Metadata = {
  title: 'Persons - History App',
}

export async function generateStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ gallery }))
}

export default async function PersonsServer(props: { params: Promise<{ gallery: Gallery }> }) {
  const params = await props.params
  const { gallery } = params

  const { items, indexedKeywords } = await getPersonsData({ gallery })
  const clusterMarkers = generateClusters(items)
  const initialAgeSummary = buildAgeSummary(items)

  return (
    <Suspense fallback={<div>Loading Persons...</div>}>
      <PersonsClient
        items={items}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusterMarkers}
        initialAgeSummary={initialAgeSummary}
      />
    </Suspense>
  )
}
