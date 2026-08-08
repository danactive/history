import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import {
  resolveRouteInputs,
  resolveSearchParams,
  type GalleryRouteProps,
  type RouteSearchParamsProps,
} from '../../../../src/lib/server/page-route'
import { parsePersonSearchParams, type PersonDetailsSearchParams } from '../../../../src/lib/server/search-params'
import { resolvePersonResource } from '../../../../src/lib/storytelling'

export async function generateMetadata(
  { searchParams }: RouteSearchParamsProps<PersonDetailsSearchParams>,
): Promise<Metadata> {
  const resolvedSearchParams = await resolveSearchParams(searchParams)
  const { person } = parsePersonSearchParams(resolvedSearchParams)
  return { title: `${person ?? 'Person'} details - History App` }
}

export default function PersonDetailsPage(props: GalleryRouteProps<PersonDetailsSearchParams>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PersonDetailsContent {...props} />
    </Suspense>
  )
}

async function PersonDetailsContent({
  params,
  searchParams,
}: GalleryRouteProps<PersonDetailsSearchParams>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params, searchParams)
  const { person } = parsePersonSearchParams(resolvedSearchParams)

  if (!person) {
    return (
      <main style={{ padding: '1rem' }}>
        <h1>Person details</h1>
        <p>No person selected.</p>
      </main>
    )
  }

  let text: string
  try {
    const resolved = await resolvePersonResource(gallery, person)
    if (resolved.person.name !== person) {
      redirect(`/${gallery}/persons/details?${new URLSearchParams({ person: resolved.person.name }).toString()}`)
    }

    text = resolved.text
  } catch (error) {
    if (error instanceof ReferenceError) {
      return (
        <main style={{ padding: '1rem' }}>
          <h1>Person details</h1>
          <p>{error.message}</p>
        </main>
      )
    }

    throw error
  }

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Person details</h1>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</pre>
    </main>
  )
}
