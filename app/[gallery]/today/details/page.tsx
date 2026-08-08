import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  resolveRouteInputs,
  resolveSearchParams,
  type GalleryRouteProps,
  type RouteSearchParamsProps,
} from '../../../../src/lib/server/page-route'
import { parseTodayRouteSearchParams, type TodaySearchParams } from '../../../../src/lib/server/search-params'
import { buildDateDetailsText } from '../../../../src/lib/storytelling'

export async function generateMetadata(
  { searchParams }: RouteSearchParamsProps<TodaySearchParams>,
): Promise<Metadata> {
  const resolvedSearchParams = await resolveSearchParams(searchParams)
  const { monthDay } = parseTodayRouteSearchParams(resolvedSearchParams)
  return { title: `Date details ${monthDay} - History App` }
}

export default function TodayDetailsPage(props: GalleryRouteProps<TodaySearchParams>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TodayDetailsContent {...props} />
    </Suspense>
  )
}

async function TodayDetailsContent({
  params,
  searchParams,
}: GalleryRouteProps<TodaySearchParams>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params, searchParams)
  const { monthDay } = parseTodayRouteSearchParams(resolvedSearchParams)
  const text = await buildDateDetailsText(gallery, monthDay, 8)

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Date details</h1>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</pre>
    </main>
  )
}
