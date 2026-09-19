import type { CountryVisit } from '../../lib/visited-core'
import { mapCountries, type MapCountry } from './regions'
import type { BoundaryState } from './use-boundaries'
import { validateVisits } from './validation-core'
import styles from './styles.module.css'

export default function ValidationWarnings({ countries, loaded }: { countries: CountryVisit[], loaded: BoundaryState }) {
  const warnings = validateVisits(countries, loaded)
  const pending = (Object.keys(mapCountries) as MapCountry[]).filter(country => !loaded[country])
  const failed = (Object.keys(mapCountries) as MapCountry[]).filter(country => loaded[country]?.error)
  return (
    <section className={styles.validation} aria-labelledby="visit-validation-title">
      <h2 id="visit-validation-title">Location validation</h2>
      <p>Checks map names for Japan, USA, Canada, and Mexico, plus duplicate names throughout the list.
        Other countries are not considered errors. Suggestions never change your metadata.</p>
      {pending.length > 0 && <p role="status">Checking region names…</p>}
      {failed.length > 0 && <p role="status">Region validation unavailable for {failed.join(', ')}.</p>}
      {warnings.length > 0 ? (
        <details open>
          <summary>{warnings.length} location {warnings.length === 1 ? 'warning' : 'warnings'}</summary>
          <ul>{warnings.map((warning, index) => (
            <li key={`${warning.country}-${index}`}><strong>{warning.country} · {warning.kind}:</strong> {warning.message}</li>
          ))}</ul>
        </details>
      ) : pending.length === 0 && failed.length === 0 && <p>No issues found in the names checked.</p>}
    </section>
  )
}
