import type { Metadata } from 'next'
import type { TodaySearchParams } from '../../../../src/lib/monthDay'
import { getMonthDayFromSearchParams } from '../../../../src/lib/monthDay'
import { buildOnThisDayResourceText } from '../../../../src/lib/storytelling'
import type { Gallery } from '../../../../src/types/common'

export async function generateMetadata(
  { searchParams }: { searchParams?: Promise<TodaySearchParams> },
): Promise<Metadata> {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}))
  const monthDay = getMonthDayFromSearchParams(resolvedSearchParams)
  return { title: `Date details ${monthDay} - History App` }
}

export default async function TodayDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ gallery: Gallery }>
  searchParams?: Promise<TodaySearchParams>
}) {
  const [{ gallery }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ])
  const monthDay = getMonthDayFromSearchParams(resolvedSearchParams)
  const text = await buildOnThisDayResourceText(gallery, monthDay, 8)

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Date details</h1>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</pre>
    </main>
  )
}
