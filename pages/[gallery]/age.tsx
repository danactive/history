import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { type ParsedUrlQuery } from 'node:querystring'
import { useEffect, useMemo, useRef, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'

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

function AgePage({ items = [] }: ComponentProps) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const [uniqueAges, setUniqueAges] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

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

  const filteredItems = useMemo(() => {
    if (selectedAge === null) return []
    return items.filter(item => {
      if (!item.persons || !item.filename) return false
      const photoDate = Array.isArray(item.filename) 
        ? item.filename[0].substring(0, 10)
        : item.filename.substring(0, 10)
      return item.persons.some(person => {
        if (!person.dob) return false
        return calculateAge(person.dob, photoDate) === selectedAge
      })
    })
  }, [items, selectedAge])

  const { setViewed, memoryHtml } = useMemory(filteredItems, refImageGallery)
  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [])

  return (
    <div>
      <Head>
        <title>History App - Ages</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-wrap gap-2 p-4">
        {uniqueAges.map((age) => (
          <button
            key={age}
            onClick={() => setSelectedAge(age === selectedAge ? null : age)}
            className={`px-3 py-1 rounded transition-colors ${
              selectedAge === age 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {age}
          </button>
        ))}
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
