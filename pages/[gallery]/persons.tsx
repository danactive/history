import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { type ParsedUrlQuery } from 'node:querystring'
import {
  useEffect, useMemo, useRef, useState,
} from 'react'
import type ReactImageGallery from 'react-image-gallery'

import config from '../../config.json'
import getAlbum from '../../src/lib/album'
import getAlbums from '../../src/lib/albums'
import getGalleries from '../../src/lib/galleries'
import indexKeywords, { addGeographyToSearch } from '../../src/lib/search'
import AllItems from '../../src/components/All/Items'
import AlbumContext from '../../src/components/Context'
import SplitViewer from '../../src/components/SplitViewer'
import useMemory from '../../src/hooks/useMemory'
import useSearch from '../../src/hooks/useSearch'
import {
  AlbumMeta,
  IndexedKeywords,
  Item,
  ServerSideAllItem,
} from '../../src/types/common'

type ComponentProps = {
  items: ServerSideAllItem[]
  indexedKeywords: IndexedKeywords[]
}

interface Params extends ParsedUrlQuery {
  gallery: NonNullable<AlbumMeta['gallery']>
}

function calculateAge(dob: string, photoDate: string): number | null {
  try {
    const birth = new Date(dob.substring(0, 10))
    const photo = new Date(photoDate.substring(0, 10))

    // Validate dates
    if (Number.isNaN(birth.getTime()) || Number.isNaN(photo.getTime())) {
      return null
    }

    let age = photo.getFullYear() - birth.getFullYear()
    const m = photo.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && photo.getDate() < birth.getDate())) {
      age -= 1
    }
    return age
  } catch (e) {
    return null
  }
}

type PersonMatch = {
  name: string
  age: number
  photoDate: string
}

function AllPage({ items = [], indexedKeywords }: ComponentProps) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [uniqueAges, setUniqueAges] = useState<number[]>([])

  const {
    filtered: keywordFiltered,
    keyword,
    searchBox,
    setFiltered,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })

  const [ageFiltered, setAgeFiltered] = useState(keywordFiltered)

  // Update age filtered results whenever keyword search or age/person selection changes
  useEffect(() => {
    if (selectedAge === null) {
      setAgeFiltered(keywordFiltered)
      return
    }

    const filtered = keywordFiltered.filter((item) => {
      if (!item.persons || !item.filename) return false
      // TODO support photo_date
      const filenameDate = Array.isArray(item.filename)
        ? item.filename[0].substring(0, 10)
        : item.filename.substring(0, 10)
      const photoDate = item.photoDate || filenameDate
      return item.persons.some((person) => {
        if (!person.dob) return false
        const matchesAge = calculateAge(person.dob, photoDate) === selectedAge
        const matchesPerson = selectedPerson ? person.full === selectedPerson : true
        return matchesAge && matchesPerson
      })
    })

    setAgeFiltered(filtered)
  }, [keywordFiltered, selectedAge, selectedPerson])

  // Update the search results with our age-filtered items
  useEffect(() => {
    setFiltered(ageFiltered)
  }, [ageFiltered, setFiltered])

  // Update uniqueAges whenever keyword search changes
  useEffect(() => {
    const ages = new Set(
      keywordFiltered.flatMap((item) => item.persons?.map((person) => {
        if (!person.dob || !item.filename) return null
        const filenameDate = Array.isArray(item.filename)
          ? item.filename[0].substring(0, 10)
          : item.filename.substring(0, 10)
        const photoDate = item.photoDate || filenameDate
        const age = calculateAge(person.dob, photoDate)
        return age
      })).filter((age): age is number => age !== null && !Number.isNaN(age)),
    )
    setUniqueAges(Array.from(ages).sort((a, b) => a - b))

    if (selectedAge !== null && !ages.has(selectedAge)) {
      setSelectedAge(null)
      setSelectedPerson(null)
    }
  }, [keywordFiltered, selectedAge, keyword])

  const agesWithCounts = useMemo(() => {
    const counts = new Map<number, number>()

    keywordFiltered.forEach((item) => {
      if (!item.persons || !item.filename) return
      const photoDate = Array.isArray(item.filename)
        ? item.filename[0].substring(0, 10)
        : item.filename.substring(0, 10)

      const agesCounted = new Set<number>()

      item.persons.forEach((person) => {
        if (!person.dob) return
        const age = calculateAge(person.dob, photoDate)
        if (age !== null && !agesCounted.has(age)) {
          counts.set(age, (counts.get(age) || 0) + 1)
          agesCounted.add(age)
        }
      })
    })

    return uniqueAges
      .map((age) => ({ age, count: counts.get(age) || 0 }))
      .filter(({ count, age }) => count > 0 && !Number.isNaN(age))
      .sort((a, b) => a.age - b.age)
  }, [keywordFiltered, uniqueAges, keyword])

  const totalPhotoCount = useMemo(
    () => keywordFiltered.filter((item) => item.persons?.some((person) => person.dob)).length,
    [keywordFiltered],
  )

  const { peopleAtSelectedAge, peopleWithCounts } = useMemo(() => {
    if (selectedAge === null) {
      return { peopleAtSelectedAge: [], peopleWithCounts: [] }
    }

    const matches: PersonMatch[] = []
    const counts = new Map<string, number>()

    ageFiltered.forEach((item) => {
      if (!item.persons || !item.filename) return
      const photoDate = Array.isArray(item.filename)
        ? item.filename[0].substring(0, 10)
        : item.filename.substring(0, 10)

      item.persons.forEach((person) => {
        if (!person.dob) return
        const age = calculateAge(person.dob, photoDate)
        if (age === selectedAge) {
          matches.push({
            name: person.full,
            age,
            photoDate,
          })
          counts.set(person.full, (counts.get(person.full) || 0) + 1)
        }
      })
    })

    const uniquePeople = Array.from(
      matches.reduce((acc, match) => {
        if (!acc.has(match.name) || acc.get(match.name)!.photoDate > match.photoDate) {
          acc.set(match.name, match)
        }
        return acc
      }, new Map<string, PersonMatch>()),
    ).map(([_, match]) => match.name).sort()

    return {
      peopleAtSelectedAge: uniquePeople,
      peopleWithCounts: uniquePeople.map((name) => ({
        name,
        count: counts.get(name) || 0,
      })),
    }
  }, [ageFiltered, selectedAge])

  const { setViewed, memoryHtml } = useMemory(ageFiltered, refImageGallery)
  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [])

  return (
    <div>
      <Head>
        <title>History App - All</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AlbumContext.Provider value={zooms}>
        <div className="p-4">
          {searchBox}
          <div className="mt-4">
            <select
              value={selectedAge || ''}
              onChange={(e) => {
                const { value } = e.target
                setSelectedAge(value ? parseInt(value, 10) : null)
                setSelectedPerson(null)
              }}
            >
              <option value="">
                All ages ({totalPhotoCount} {totalPhotoCount === 1 ? 'photo' : 'photos'})
              </option>
              {agesWithCounts.map(({ age, count }) => (
                <option key={age} value={age}>
                  {age} ({count} {count === 1 ? 'photo' : 'photos'})
                </option>
              ))}
            </select>

            {selectedAge !== null && peopleAtSelectedAge.length > 0 && (
              <select
                className="ml-2"
                value={selectedPerson || ''}
                onChange={(e) => {
                  setSelectedPerson(e.target.value || null)
                }}
              >
                <option value="">
                  All people at {selectedAge} ({peopleAtSelectedAge.length} {peopleAtSelectedAge.length === 1 ? 'person' : 'people'})
                </option>
                {peopleWithCounts.map(({ name, count }) => (
                  <option key={name} value={name}>
                    {name} ({count} {count === 1 ? 'photo' : 'photos'})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={ageFiltered}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
        />
        <AllItems items={ageFiltered} keyword={keyword} refImageGallery={refImageGallery} />
      </AlbumContext.Provider>
    </div>
  )
}

export const getStaticProps: GetStaticProps<ComponentProps, Params> = async (context) => {
  const params = context.params!
  const { albums } = await getAlbums(params.gallery)

  const prepareItems = (
    { albumName, albumCoordinateAccuracy, items }:
    {
      albumName: AlbumMeta['albumName'],
      albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'],
      items: Item[],
    },
  ) => items.map((item) => ({
    ...item,
    gallery: params.gallery,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
    search: addGeographyToSearch(item),
  }))

  // reverse order for albums in ascending order (oldest on top)
  const allItems = (await albums.reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items, meta } } = await getAlbum(params.gallery, album.name)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = prepareItems({
      albumName: album.name,
      albumCoordinateAccuracy,
      items,
    })
    return prev.concat(preparedItems)
  }, Promise.resolve([] as ServerSideAllItem[]))).reverse()

  return {
    props: { items: allItems, ...indexKeywords(allItems) },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { galleries } = await getGalleries()
  // Define these galleries as allowed, otherwise 404
  const paths = galleries.map((gallery) => ({ params: { gallery } }))
  return {
    paths,
    fallback: false,
  }
}

export default AllPage
