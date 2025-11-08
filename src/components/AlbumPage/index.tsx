'use client'

import type { Metadata } from 'next'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import type { Album } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import ThumbImg from '../ThumbImg'
import styles from './styles.module.css'
import useMapFilter from '../../hooks/useMapFilter'

export const metadata: Metadata = {
  title: 'Album - History App',
}

/**
 * Render an album with gallery, map, and thumbnails.
 * @param {Album.ComponentProps} props Component properties.
 * @returns {JSX.Element} Album page markup.
 */
function AlbumPage({ items = [], meta, indexedKeywords }: Album.ComponentProps) {
  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    memoryHtml,
    viewedList,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
  } = useMapFilter({ items, indexedKeywords })

  // Read ?select=<id> from URL
  const searchParams = useSearchParams()
  const selectId = searchParams.get('select')

  // Apply initial selection
  useEffect(() => {
    if (!selectId || itemsToShow.length === 0) return
    const idx = itemsToShow.findIndex(i => i.id === selectId)
    if (idx >= 0) {
      refImageGallery.current?.slideToIndex(idx)
      setMemoryIndex(idx)
      setViewed(idx)
    }
  }, [selectId, itemsToShow, refImageGallery, setMemoryIndex, setViewed])

  // FIX: Ensure memory (details, filename, etc.) updates on every slide change after initial select.
  useEffect(() => {
    if (itemsToShow[memoryIndex]) {
      setViewed(memoryIndex)
    }
  }, [memoryIndex, itemsToShow, setViewed])

  return (
    <div>
      <AlbumContext.Provider value={meta}>
        {searchBox}
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={itemsToShow}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          onToggleMapFilter={handleToggleMapFilter}
          onMapBoundsChange={handleBoundsChange}
        />
        <ul className={styles.thumbWrapper}>
          {itemsToShow.map((item, index) => (
            <ThumbImg
              onClick={() => {
                refImageGallery.current?.slideToIndex(index)
                setMemoryIndex(index)
              }}
              src={item.thumbPath}
              caption={item.caption}
              key={item.id}
              id={`select${item.id}`}
              viewed={viewedList.has(item.id)}
            />
          ))}
        </ul>
      </AlbumContext.Provider>
    </div>
  )
}

export default AlbumPage
