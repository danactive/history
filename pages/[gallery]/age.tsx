import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { type ParsedUrlQuery } from 'node:querystring'
import { useEffect, useMemo, useRef, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'
import Link from 'next/link'
import { useRouter } from 'next/router'

import config from '../../config.json'
import getAlbum from '../../src/lib/album'
import getAlbums from '../../src/lib/albums'
import getGalleries from '../../src/lib/galleries'
import All from '../../src/components/All'
import AlbumContext from '../../src/components/Context'
import SplitViewer from '../../src/components/SplitViewer'
import useMemory from '../../src/hooks/useMemory'
import { AlbumMeta, Item, ServerSideAllItem } from '../../src/types/common'

type ComponentProps = {
  items: ServerSideAllItem[];
}

export const getStaticProps: GetStaticProps<ComponentProps> = async (context) => {
  const params = context.params!
  const { albums } = await getAlbums(params.gallery as string)
  const allItems: ServerSideAllItem[] = []

  await albums.reduce(async (previousPromise, album) => {
    await previousPromise
    const { album: { items, meta } } = await getAlbum(params.gallery as string, album.name)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    
    items.forEach((item: Item) => {
      if (item.persons) {
        allItems.push({
          ...item,
          gallery: params.gallery as string,
          album: album.name,
          corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
          coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
        })
      }
    })
  }, Promise.resolve())

  return { props: { items: allItems } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { galleries } = await getGalleries()
  const paths = galleries.map((gallery) => ({ params: { gallery } }))
  return { paths, fallback: false }
}

function calculateAge(dob: string, photoDate: string): number {
  const birth = new Date(dob.substring(0, 10))
  const photo = new Date(photoDate.substring(0, 10))
  
  let age = photo.getFullYear() - birth.getFullYear()
  const m = photo.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && photo.getDate() < birth.getDate())) {
    age--
  }
  return age
}

type PersonMatch = {
  name: string;
  age: number;
  photoDate: string;
}

function AgePage({ items = [] }: ComponentProps) {
  const router = useRouter()
  const { gallery } = router.query
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const [uniqueAges, setUniqueAges] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  const zooms = useMemo(() => ({ 
    geo: { zoom: config.defaultZoom } 
  }), [])

  useEffect(() => {
    const ages = new Set(
      items.flatMap(item => 
        item.persons?.map(person => {
          if (!person.dob || !item.filename) return null
          const photoDate = Array.isArray(item.filename) 
            ? item.filename[0].substring(0, 10)
            : item.filename.substring(0, 10)
          return calculateAge(person.dob, photoDate)
        })
      ).filter((age): age is number => age !== null)
    )
    setUniqueAges(Array.from(ages).sort((a, b) => a - b))
    setMounted(true)
  }, [items])

  const peopleAtSelectedAge = useMemo(() => {
    if (selectedAge === null) return []
    
    const matches: PersonMatch[] = []
    items.forEach(item => {
      if (!item.persons || !item.filename) return
      const photoDate = Array.isArray(item.filename) 
        ? item.filename[0].substring(0, 10)
        : item.filename.substring(0, 10)
      
      item.persons.forEach(person => {
        if (!person.dob) return
        const age = calculateAge(person.dob, photoDate)
        if (age === selectedAge) {
          matches.push({
            name: person.full,
            age,
            photoDate
          })
        }
      })
    })

    // Get unique names with their earliest photo date
    return Array.from(
      matches.reduce((acc, match) => {
        if (!acc.has(match.name) || acc.get(match.name)!.photoDate > match.photoDate) {
          acc.set(match.name, match)
        }
        return acc
      }, new Map<string, PersonMatch>())
    ).map(([_, match]) => match.name).sort()
  }, [items, selectedAge])

  const filteredItems = useMemo(() => {
    if (selectedAge === null) return items
    
    return items.filter(item => {
      if (!item.persons || !item.filename) return false
      const photoDate = Array.isArray(item.filename) 
        ? item.filename[0].substring(0, 10)
        : item.filename.substring(0, 10)
      return item.persons.some(person => {
        if (!person.dob) return false
        const matchesAge = calculateAge(person.dob, photoDate) === selectedAge
        const matchesPerson = selectedPerson ? person.full === selectedPerson : true
        return matchesAge && matchesPerson
      })
    })
  }, [items, selectedAge, selectedPerson])

  const { setViewed, memoryHtml } = useMemory(filteredItems, refImageGallery)

  if (!mounted) return null

  return (
    <div>
      <Head>
        <title>History App - Ages</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="p-4">
        <select
          value={selectedAge || ''}
          onChange={(e) => {
            const value = e.target.value
            setSelectedAge(value ? parseInt(value) : null)
            setSelectedPerson(null)
          }}
        >
          <option value="">All ages</option>
          {uniqueAges.map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>

        {selectedAge !== null && peopleAtSelectedAge.length > 0 && (
          <select
            value={selectedPerson || ''}
            onChange={(e) => {
              setSelectedPerson(e.target.value || null)
            }}
          >
            <option value="">All people at {selectedAge}...</option>
            {peopleAtSelectedAge.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      <AlbumContext.Provider value={zooms}>
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={filteredItems}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
        />

        <All items={filteredItems} keyword="" refImageGallery={refImageGallery} />
      </AlbumContext.Provider>
    </div>
  )
}

export default AgePage
