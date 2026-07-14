import type { Metadata } from 'next'
import Link from '../../../src/components/Link'
import getGalleries from '../../../src/lib/galleries'
import type { RegionVisit } from '../../../src/lib/visited'
import { formatVisitedYears, getVisitedData } from '../../../src/lib/visited'
import type { VisitedPlace } from '../../../src/types/common'
import type { Gallery } from '../../../src/types/pages'
import styles from './styles.module.css'

export async function generateStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ gallery }))
}

export const metadata: Metadata = {
  title: 'Visited - History App',
}

function formatYears(years: string[]) {
  const formattedYears = formatVisitedYears(years)
  return formattedYears ? ` ${formattedYears}` : ''
}

function buildVisitedHref(gallery: string, filter: VisitedPlace) {
  const searchParams = new URLSearchParams({ visitedCountry: filter.country })

  if (filter.region) {
    searchParams.set('visitedRegion', filter.region)
  }

  return `/${gallery}/all?${searchParams.toString()}`
}

export default async function VisitedServer(props: { params: Promise<Gallery.Params> }) {
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
