'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { CountryVisit } from '../../lib/visited-core'
import { countryAtReadingLine, resolveMapCountry } from './regions'
import styles from './styles.module.css'
import { useBoundaries } from './use-boundaries'
import ValidationWarnings from './validation'

const CountryMap = dynamic(() => import('./map'), { ssr: false, loading: () => <p role="status">Loading map…</p> })

export default function VisitedMapLayout({ countries, children }: { countries: CountryVisit[], children: ReactNode }) {
  const loaded = useBoundaries(countries.some(country => resolveMapCountry(country.country)))
  const content = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(() => countries.map(country => resolveMapCountry(country.country)).find(Boolean) ?? null)

  useEffect(() => {
    const headings = Array.from(content.current?.querySelectorAll<HTMLElement>('[data-visited-country]') ?? [])
      .filter(heading => resolveMapCountry(heading.dataset.visitedCountry ?? ''))
    let frame = 0
    const update = () => {
      frame = 0
      const readingLine = 100
      setActive(countryAtReadingLine(headings.flatMap(heading => {
        const country = resolveMapCountry(heading.dataset.visitedCountry ?? '')
        return country ? [{ country, top: heading.getBoundingClientRect().top }] : []
      }), readingLine))
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('pageshow', schedule)
    const observer = new ResizeObserver(schedule)
    if (content.current) observer.observe(content.current)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('pageshow', schedule)
      observer.disconnect()
    }
  }, [countries])

  useEffect(() => {
    const headings = content.current?.querySelectorAll<HTMLElement>('[data-visited-country]') ?? []
    for (const heading of headings) {
      if (active && resolveMapCountry(heading.dataset.visitedCountry ?? '') === active) heading.setAttribute('aria-current', 'location')
      else heading.removeAttribute('aria-current')
    }
  }, [active])

  const country = countries.find(country => resolveMapCountry(country.country) === active)
  return (
    <div className={country ? styles.layout : undefined}>
      <div ref={content} className={styles.content}>
        <a href="#visit-validation-title">Review location validation</a>
        {children}
        <ValidationWarnings countries={countries} loaded={loaded} />
      </div>
      {country && active && (
        <aside className={styles.panel} aria-label="Visited regions map">
          <CountryMap country={active} countries={countries} loaded={loaded} />
        </aside>
      )}
    </div>
  )
}
