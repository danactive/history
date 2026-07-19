import type { Metadata } from 'next'
import { Suspense } from 'react'
import AlbumPageComponent from '../../../src/components/Album/AlbumClient'
import getGalleries from '../../../src/lib/galleries'
import { generateClusters } from '../../../src/lib/generate-clusters'
import type { TodaySearchParams } from '../../../src/lib/monthDay'
import { getMonthDayFromSearchParams } from '../../../src/lib/monthDay'
import { getTodayItems } from '../../../src/lib/today'
import type { Gallery } from '../../../src/types/common'

export const metadata: Metadata = {
  title: 'Today - History App',
}

export async function generateStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ gallery }))
}

export default async function TodayServer({
  params,
  searchParams,
}: {
  params: Promise<{ gallery: Gallery }>,
  searchParams?: Promise<TodaySearchParams>,
}) {
  const [{ gallery }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ])
  const monthDay = getMonthDayFromSearchParams(resolvedSearchParams)
  const { items, indexedKeywords } = await getTodayItems(gallery, monthDay)
  const clusteredMarkers = generateClusters(items)
  return (
    <Suspense fallback={<div>Loading Today...</div>}>
      <AlbumPageComponent
        gallery={gallery}
        monthDay={monthDay}
        items={items}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusteredMarkers}
      />
    </Suspense>
  )
}
