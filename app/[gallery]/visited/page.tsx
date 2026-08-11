import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from '../../../src/components/Link'
import {
  formatFilterQuery,
  type FilterQueryNode,
  type FilterQueryTerm,
} from '../../../src/lib/filter-query'
import {
  generateGalleryStaticParams,
  type GalleryParams,
  type RouteParamsProps,
} from '../../../src/lib/server/page-route'
import type { RegionVisit } from '../../../src/lib/visited'
import { formatVisitedYears, getVisitedData } from '../../../src/lib/visited'
import type { Gallery as GalleryName, VisitedPlace } from '../../../src/types/common'
import styles from './styles.module.css'

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

export const metadata: Metadata = {
  title: 'Visited - History App',
}

function formatYears(years: string[]) {
  const formattedYears = formatVisitedYears(years)
  return formattedYears ? ` ${formattedYears}` : ''
}

function buildVisitedHref(gallery: GalleryName, filter: VisitedPlace) {
  const country: FilterQueryTerm = { type: 'term', kind: 'country', value: filter.country }
  const filterQuery: FilterQueryNode = filter.region
    ? {
        type: 'and',
        children: [country, { type: 'term', kind: 'region', value: filter.region }],
      }
    : country
  const query = formatFilterQuery(filterQuery)
  const searchParams = new URLSearchParams({ query })

  return `/${gallery}/all?${searchParams.toString()}`
}

export default function VisitedServer(props: RouteParamsProps<GalleryParams>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisitedServerContent {...props} />
    </Suspense>
  )
}

async function VisitedServerContent(props: RouteParamsProps<GalleryParams>) {
  const { gallery } = await props.params
  const countries = await getVisitedData(gallery)

  return (
    <main className={styles.page}>
      <h1>Countries</h1>
      <ol className={styles.countries}>
        {countries.map(country => (
          <li key={country.country} className={styles.country}>
            <span className={styles.countryLine}>
              <span>{country.country}{formatYears(country.years)}</span>
              {' '}
              <span className={styles.count}>
                (
                <Link className={styles.countLink} href={buildVisitedHref(gallery, country.filter)}>
                  {country.count}
                </Link>
                )
              </span>
            </span>
            {country.regions.length > 0 && (
              <ol className={styles.regions}>
                {country.regions.map((region: RegionVisit) => (
                  <li key={region.region}>
                    <span>{region.region}{formatYears(region.years)}</span>
                    {' '}
                    <span className={styles.count}>
                      (
                      <Link className={styles.countLink} href={buildVisitedHref(gallery, region.filter)}>
                        {region.count}
                      </Link>
                      )
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </main>
  )
}
