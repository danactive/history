'use client'

import { useMemo, useRef, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'

import config from '../../../src/models/config'

import useMemory from '../../hooks/useMemory'
import useSearch from '../../hooks/useSearch'
import { All } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import AllItems from './Items'

export default function AllClient({ items, indexedKeywords }: All.ComponentProps) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const {
    filtered,
    keyword,
    searchBox,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })
  const { setViewed, memoryHtml } = useMemory(filtered, refImageGallery)

  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [config.defaultZoom])

  return (
    <div>
      <AlbumContext.Provider value={zooms}>
        {searchBox}
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={filtered}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
        />
        <AllItems items={filtered} keyword={keyword} refImageGallery={refImageGallery} />
      </AlbumContext.Provider>
    </div>
  )
}
