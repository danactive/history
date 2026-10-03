'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { MapRef } from 'react-map-gl/mapbox'
import { normalizeMapBounds, parseMapCamera, writeMapCamera, type MapCamera } from '../lib/map-camera-query'
import { parseMapBounds, serializeMapBounds } from '../lib/map-filter-query'
import type { Bounds } from '../lib/map-filtering'

export const MAP_QUERY_DEBOUNCE = 300
export type MapQuery = ReturnType<typeof useMapQuery>
type MovementEvent = { type?: string; originalEvent?: { type?: string } }

/** Synchronizes the photo map URL only while Map Filter is enabled. */
export default function useMapQuery() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams?.toString() ?? ''
  const map = useRef<MapRef | null>(null)
  const defaultZoom = useRef(1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restoring = useRef(false)
  const moving = useRef(false)
  const filterEnabled = useRef(Boolean(parseMapBounds(searchParams?.get('bbox'))))
  const ownedUrls = useRef(new Set<string>())
  const acknowledgedUrl = useRef<string | null>(null)
  const latest = useRef({ pathname, query, router })
  latest.current = { pathname, query, router }

  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
    moving.current = false
  }, [])

  const readCamera = useCallback((): MapCamera | null => {
    const current = map.current
    if (!current) return null
    const center = current.getCenter()
    return { longitude: center.lng, latitude: center.lat, zoom: current.getZoom() }
  }, [])

  const readBounds = useCallback((): Bounds | null => {
    const bounds = map.current?.getBounds()
    return bounds ? normalizeMapBounds(bounds.toArray()) : null
  }, [])

  const getParams = useCallback(() => new URLSearchParams(
    typeof window !== 'undefined' && window.location.pathname === latest.current.pathname
      ? window.location.search : latest.current.query,
  ), [])

  const publish = useCallback((camera: MapCamera | null, bounds: Bounds | null, navigate = true) => {
    const params = getParams()
    const before = params.toString()
    if (bounds && camera) {
      writeMapCamera(params, camera)
      params.set('bbox', serializeMapBounds(bounds))
    } else {
      for (const key of ['bbox', 'longitude', 'latitude', 'zoom']) params.delete(key)
    }
    const after = params.toString()
    if (navigate && after !== before) {
      const path = latest.current.pathname + (after ? `?${after}` : '')
      ownedUrls.current.add(path)
      const href = path + window.location.hash
      latest.current.router.replace(href, { scroll: false })
    }
    return params
  }, [getParams])

  const restore = useCallback(() => {
    cancel()
    const params = getParams()
    const bounds = parseMapBounds(params.get('bbox'))
    filterEnabled.current = Boolean(bounds)
    const current = map.current
    // Without an active filter, normal photo selection owns the camera.
    if (!current || !bounds) return false
    const camera = parseMapCamera(params, defaultZoom.current)
    restoring.current = true
    try {
      current.stop()
      if (camera) current.jumpTo({ center: [camera.longitude, camera.latitude], zoom: camera.zoom })
      else current.fitBounds(bounds, { duration: 0 })
    } finally {
      restoring.current = false
    }
    return true
  }, [cancel, getParams])

  const attach = useCallback((current: MapRef, zoom: number) => {
    map.current = current
    defaultZoom.current = zoom
    return restore()
  }, [restore])
  const detach = useCallback(() => { cancel(); map.current = null }, [cancel])

  useEffect(() => {
    const key = pathname + (query ? `?${query}` : '')
    if (ownedUrls.current.delete(key)) {
      acknowledgedUrl.current = key
      return
    }
    acknowledgedUrl.current = null
    cancel()
    ownedUrls.current.clear()
    restore()
  }, [pathname, query, cancel, restore])

  useEffect(() => {
    // Popstate wins even before React has rendered the destination search params.
    const onPopState = () => { acknowledgedUrl.current = null; ownedUrls.current.clear(); restore() }
    window.addEventListener('popstate', onPopState)
    return () => { cancel(); window.removeEventListener('popstate', onPopState) }
  }, [cancel, restore])

  const onMoveStart = useCallback((event?: MovementEvent) => {
    cancel()
    moving.current = Boolean(filterEnabled.current && map.current && !restoring.current && event?.originalEvent?.type !== 'resize')
  }, [cancel])

  const onMoveEnd = useCallback(() => {
    if (!filterEnabled.current || !moving.current || restoring.current) return null
    moving.current = false
    const camera = readCamera()
    const bounds = readBounds()
    if (!bounds || !camera) return null
    const href = window.location.href
    timer.current = setTimeout(() => {
      timer.current = null
      if (!filterEnabled.current) return
      const currentPath = window.location.pathname + window.location.search
      if (window.location.href !== href
        && currentPath !== acknowledgedUrl.current && !ownedUrls.current.has(currentPath)) return
      publish(camera, bounds)
    }, MAP_QUERY_DEBOUNCE)
    return bounds
  }, [publish, readBounds, readCamera])

  const setFilter = useCallback((enabled: boolean, navigate = true) => {
    cancel()
    filterEnabled.current = enabled
    return publish(enabled ? readCamera() : null, enabled ? readBounds() : null, navigate)
  }, [cancel, publish, readBounds, readCamera])

  const initialCamera = useCallback((zoom: number) => {
    const params = new URLSearchParams(latest.current.query)
    return parseMapBounds(params.get('bbox')) ? parseMapCamera(params, zoom) : null
  }, [])

  return { attach, detach, onMoveStart, onMoveEnd, setFilter, readBounds, initialCamera, cancel }
}
