import type { Metadata } from 'next'
import { Suspense } from 'react'
import { buildCalendarMonths, getCalendarPhotoCounts } from '../../../src/lib/calendar'
import {
  generateGalleryStaticParams,
  type GalleryParams,
  type RouteParamsProps,
} from '../../../src/lib/server/page-route'
import CalendarView from './calendar-view'

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

export const metadata: Metadata = {
  title: 'Calendar - History App',
}

export default function CalendarServer(props: RouteParamsProps<GalleryParams>) {
  return (
    <Suspense fallback={<div>Loading calendar...</div>}>
      <CalendarServerContent {...props} />
    </Suspense>
  )
}

async function CalendarServerContent({ params }: RouteParamsProps<GalleryParams>) {
  const { gallery } = await params
  const months = buildCalendarMonths(await getCalendarPhotoCounts(gallery))

  return <CalendarView gallery={gallery} months={months} />
}
