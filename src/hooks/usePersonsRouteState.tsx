'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { buildPersonsRouteSearchParams } from '../lib/persons-route-filters'
import type { PersonAgeFilterValue } from '../lib/persons'
import type { PersonsRouteFilters } from '../lib/persons-route-filters'

export default function usePersonsRouteState({
  initialSelectedAge,
  initialSelectedPerson,
  pathname,
  replace,
  routeFilters,
  searchParamsSnapshot,
}: {
  initialSelectedAge: PersonAgeFilterValue
  initialSelectedPerson: string | null
  pathname: string
  replace: (url: string, options?: { scroll?: boolean }) => void
  routeFilters: PersonsRouteFilters
  searchParamsSnapshot: string
}) {
  const [selectedAge, setSelectedAgeState] = useState<PersonAgeFilterValue>(initialSelectedAge)
  const [selectedPerson, setSelectedPersonState] = useState<string | null>(initialSelectedPerson)
  const shouldSyncUrlRef = useRef(false)

  const syncUrlImmediately = useCallback((nextAge: PersonAgeFilterValue, nextPerson: string | null) => {
    const params = buildPersonsRouteSearchParams(searchParamsSnapshot, {
      ...routeFilters,
      selectedAge: nextAge,
      selectedPerson: nextPerson,
    })

    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname

    if (typeof window !== 'undefined') {
      const currentUrl = `${window.location.pathname}${window.location.search}`
      if (currentUrl !== nextUrl) {
        window.history.replaceState(null, '', nextUrl)
      }
    }

    replace(nextUrl, { scroll: false })
  }, [pathname, replace, routeFilters, searchParamsSnapshot])

  const setSelectedAge = useCallback((value: PersonAgeFilterValue) => {
    if (selectedAge === value) {
      return
    }

    shouldSyncUrlRef.current = true
    setSelectedAgeState(value)
    syncUrlImmediately(value, selectedPerson)
  }, [selectedAge, selectedPerson, syncUrlImmediately])

  const setSelectedPerson = useCallback((value: string | null) => {
    if (selectedPerson === value) {
      return
    }

    shouldSyncUrlRef.current = true
    setSelectedPersonState(value)
    syncUrlImmediately(selectedAge, value)
  }, [selectedAge, selectedPerson, syncUrlImmediately])

  useEffect(() => {
    if (shouldSyncUrlRef.current) {
      return
    }

    shouldSyncUrlRef.current = false
    setSelectedAgeState((previousAge) => (
      previousAge === routeFilters.selectedAge ? previousAge : routeFilters.selectedAge
    ))
    setSelectedPersonState((previousPerson) => (
      previousPerson === routeFilters.selectedPerson ? previousPerson : routeFilters.selectedPerson
    ))
  }, [routeFilters.selectedAge, routeFilters.selectedPerson])

  useEffect(() => {
    if (shouldSyncUrlRef.current) {
      return
    }

    const currentQuery = new URLSearchParams(searchParamsSnapshot).toString()
    const canonicalQuery = buildPersonsRouteSearchParams(searchParamsSnapshot, routeFilters).toString()

    if (canonicalQuery === currentQuery) {
      return
    }

    replace(canonicalQuery ? `${pathname}?${canonicalQuery}` : pathname, { scroll: false })
  }, [pathname, replace, routeFilters, searchParamsSnapshot])

  useEffect(() => {
    if (!shouldSyncUrlRef.current) {
      return
    }

    if (routeFilters.selectedAge === selectedAge && routeFilters.selectedPerson === selectedPerson) {
      shouldSyncUrlRef.current = false
    }
  }, [pathname, replace, routeFilters, searchParamsSnapshot, selectedAge, selectedPerson])

  return {
    isServerScopeCurrent: selectedAge === initialSelectedAge && selectedPerson === initialSelectedPerson,
    selectedAge,
    selectedPerson,
    setSelectedAge,
    setSelectedPerson,
  }
}
