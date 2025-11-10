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
 * @param props Component properties.
 * @param props.items Album items.
 * @param props.meta Album metadata.
 * @param props.indexedKeywords Indexed keywords map.
 * @returns JSX.Element
 */
function AlbumClient({ items = [], meta, indexedKeywords }: Album.ComponentProps) {
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

  const searchParams = useSearchParams()
  const selectId = searchParams.get('select')

  // Apply initial selection WITHOUT calling setViewed (onSlide will handle it)
  useEffect(() => {
    if (!selectId || itemsToShow.length === 0) return
    const idx = itemsToShow.findIndex(i => i.id === selectId)
    if (idx >= 0) {
      refImageGallery.current?.slideToIndex(idx)
      setMemoryIndex(idx)
    }
  }, [selectId, itemsToShow, refImageGallery, setMemoryIndex])

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

export default AlbumClient
