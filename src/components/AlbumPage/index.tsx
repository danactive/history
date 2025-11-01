'use client'

import type { Metadata } from 'next'
import { useSearchParams } from 'next/navigation'
import { useEffect, useCallback } from 'react'
import type ReactImageGallery from 'react-image-gallery'

import type { Album } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import ThumbImg from '../ThumbImg'
import styles from './styles.module.css'
import useMapFilter from '../../hooks/useMapFilter'

export const metadata: Metadata = {
  title: 'Album - History App',
}

function AlbumPage({ items = [], meta, indexedKeywords }: Album.ComponentProps) {
  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    resetViewedList,
    memoryHtml,
    viewedList,
    filtered,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
    selectById,
  } = useMapFilter({ items, indexedKeywords })

  // Wrapper ensures viewed outline reset immediately on toggle
  const handleToggleWithReset = useCallback(() => {
    resetViewedList()
    handleToggleMapFilter()
  }, [resetViewedList, handleToggleMapFilter])

  const resetToken = mapFilterEnabled ? 1 : 0

  const searchParams = useSearchParams()
  const selectId = searchParams.get('select')

  useEffect(() => {
    if (selectId) {
      selectById(selectId)
    }
  }, [selectId, selectById])

  return (
    <div>
      <AlbumContext.Provider value={meta}>
        {searchBox}
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={itemsToShow}
          refImageGallery={refImageGallery as React.RefObject<ReactImageGallery>}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          onToggleMapFilter={handleToggleWithReset}
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
              key={Array.isArray(item.filename) ? item.filename.join(',') : String(item.filename)}
              id={`select${item.id}`}
              viewed={!!viewedList?.has?.(item.id)}
              resetToken={resetToken}
            />
          ))}
        </ul>
      </AlbumContext.Provider>
    </div>
  )
}

export default AlbumPage
