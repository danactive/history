'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MapboxMap, { Layer, NavigationControl, Source, type MapRef, type StyleSpecification } from 'react-map-gl/mapbox'
import type { CountryVisit } from '../../lib/visited-core'
import { MAPBOX_TOKEN } from '../SlippyMap/token'
import { coverageSummary, mapCountries, markVisitedRegions, resolveMapCountry, type MapCountry } from './regions'
import type { BoundaryState } from './use-boundaries'
import { useBasemap } from './use-basemap'
import RegionLabels from './labels'
import styles from './styles.module.css'

export const VECTOR_STYLE: StyleSpecification = {
  version: 8, projection: { name: 'globe' }, sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#202a33' } }],
}
const ONLINE_STYLE = 'mapbox://styles/mapbox/dark-v11'
const INITIAL_ZOOM = 1.5
const COUNTRY_NAMES = Object.keys(mapCountries) as MapCountry[]

export default function CountryMap({ country, countries, loaded }: {
  country: MapCountry, countries: CountryVisit[], loaded: BoundaryState,
}) {
  const map = useRef<MapRef>(null)
  const [readyMap, setReadyMap] = useState<MapRef | null>(null)
  const [mapError, setMapError] = useState(false)
  const basemap = useBasemap()
  const config = mapCountries[country]
  const style = basemap.visible ? ONLINE_STYLE : VECTOR_STYLE

  const panCountry = useCallback(() => {
    map.current?.panTo(mapCountries[country].center, {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900,
    })
  }, [country])
  useEffect(() => { panCountry() }, [panCountry])

  // A hung style request must not leave an offline local app with a blank map.
  useEffect(() => {
    if (!basemap.visible) return
    const timeout = window.setTimeout(() => {
      if (!map.current?.isStyleLoaded()) basemap.fail()
    }, 10000)
    return () => window.clearTimeout(timeout)
  }, [style, basemap.visible, basemap.fail])

  const overlays = useMemo(() => COUNTRY_NAMES.flatMap(name => {
    const data = loaded[name]?.data
    if (!data) return []
    const regions = countries.filter(visit => resolveMapCountry(visit.country) === name).flatMap(visit => visit.regions.map(region => region.region))
    return [{ country: name, ...markVisitedRegions(data, regions) }]
  }), [loaded, countries])
  const features = useMemo(() => overlays.flatMap(overlay => overlay.data.features), [overlays])
  const active = overlays.find(overlay => overlay.country === country)
  const failed = COUNTRY_NAMES.filter(name => loaded[name]?.error)

  return (
    <>
      <header className={styles.header}>
        <h2>{country}</h2>
        <p className={styles.legend} aria-live="polite">
          {active ? coverageSummary(country, active.count)
            : loaded[country]?.error ? 'Visited regions unavailable' : 'Loading visited regions…'}
        </p>
        <div className={styles.toolbar}>
          <label>
            <input type="checkbox" role="switch" checked={basemap.enabled} onChange={basemap.toggle} /> Basemap
          </label>
          <span role="status">
            {basemap.unavailable ? 'Offline / basemap unavailable · vectors only' : !basemap.enabled ? 'Vectors only' : ''}
          </span>
        </div>
      </header>
      <div className={styles.map}>
        <MapboxMap
          ref={map}
          initialViewState={{ longitude: config.center[0], latitude: config.center[1], zoom: INITIAL_ZOOM, bearing: 0, pitch: 0 }}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={style}
          styleDiffing={false}
          style={{ width: '100%', height: '100%' }}
          projection="globe"
          scrollZoom
          dragRotate={false}
          pitchWithRotate={false}
          touchZoomRotate={false}
          touchPitch={false}
          doubleClickZoom
          boxZoom={false}
          keyboard={false}
          onLoad={() => { setReadyMap(map.current); panCountry() }}
          onError={event => {
            if ('sourceId' in event && String(event.sourceId).startsWith('regions-')) return
            if (basemap.visible) basemap.fail()
            else if (!/mapbox|network|fetch|load|abort/i.test(event.error.message)) setMapError(true)
          }}
        >
          <NavigationControl showCompass={false} />
          {overlays.map(overlay => (
            <Source key={overlay.country} id={`regions-${overlay.country}`} type="geojson" data={overlay.data} attribution="Natural Earth">
              <Layer
                id={`fill-${overlay.country}`} type="fill" filter={['==', ['get', 'visited'], true]}
                paint={{ 'fill-color': '#ffbd69', 'fill-opacity': 0.22 }}
              />
              <Layer
                id={`boundaries-${overlay.country}`} type="line"
                paint={{ 'line-color': '#bac5cf', 'line-opacity': 0.5, 'line-width': 1 }}
              />
              <Layer
                id={`visited-${overlay.country}`} type="line" filter={['==', ['get', 'visited'], true]}
                paint={{ 'line-color': '#ffbd69', 'line-width': 2.5 }}
              />
            </Source>
          ))}
        </MapboxMap>
        <RegionLabels map={readyMap} features={features} />
      </div>
      {mapError && <p className={styles.notice} role="status">The map could not render. Visit details remain available in the list.</p>}
      {failed.length > 0 && <p className={styles.notice} role="status">Boundaries unavailable: {failed.join(', ')}.</p>}
      {active && active.unmatched.length > 0 && (
        <div className={styles.notice}>
          <details>
            <summary>{active.unmatched.length} region names could not be mapped</summary>
            {active.unmatched.join(', ')}
          </details>
        </div>
      )}
    </>
  )
}
