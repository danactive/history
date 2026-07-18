import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { resolvePersonResource } from '../../../../src/lib/storytelling'
import type { Gallery } from '../../../../src/types/common'

type SearchParams = {
  person?: string | string[]
}

function getPersonFromSearchParams(searchParams?: SearchParams) {
  const person = typeof searchParams?.person === 'string' ? searchParams.person.trim() : ''
  return person || null
}

export async function generateMetadata(
  { searchParams }: { searchParams?: Promise<SearchParams> },
): Promise<Metadata> {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}))
  const person = getPersonFromSearchParams(resolvedSearchParams)
  return { title: `${person ?? 'Person'} details - History App` }
}

export default async function PersonDetailsPage({
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
  const person = getPersonFromSearchParams(resolvedSearchParams)

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
