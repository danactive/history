import type { Metadata } from 'next'

import getGalleries from '../../../src/lib/galleries'
import { formatVisitedYears, getVisitedData } from '../../../src/lib/visited'
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

export default async function VisitedServer(props: { params: Promise<Gallery.Params> }) {
  const { gallery } = await props.params
  const countries = await getVisitedData(gallery)

  return (
    <main className={styles.page}>
      <h1>Countries</h1>
      <ol className={styles.countries}>
        {countries.map(country => (
          <li key={country.country} className={styles.country}>
            <span>{country.country}{country.regions.length === 0 ? formatYears(country.years) : ''}</span>
            {country.regions.length > 0 && (
              <ul className={styles.regions}>
                {country.regions.map(region => (
                  <li key={region.region}>
                    {region.region}{formatYears(region.years)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </main>
  )
}
