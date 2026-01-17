'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import useMapFilter from '../../hooks/useMapFilter'
import type { Album } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import ThumbImg from '../ThumbImg'
import styles from './styles.module.css'

/**
 * Render an album with gallery, map, and thumbnails.
 * @param {Album.ComponentProps} props Component properties.
 * @param {AlbumMeta extends unknown ? Album.ComponentProps['items'] : Album.ComponentProps['items']} props.items Album items.
 * @param {AlbumMeta} props.meta Album metadata (geo info etc.).
 * @param {Map<string, string[]>} props.indexedKeywords Indexed keywords map.
 * @returns {JSX.Element} Album page markup.
 */
function AlbumClient({ items = [], meta, indexedKeywords, clusteredMarkers }: Album.ComponentProps) {
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
    isClearing,
    clearCoordinates,
  } = useMapFilter({ items, indexedKeywords })

  const searchParams = useSearchParams()
  const selectId = searchParams.get('select')

  useEffect(() => {
    if (!selectId || itemsToShow.length === 0) return
    let idx = itemsToShow.findIndex(i => i.id === selectId)

    // Fallback: try matching by filename (for All view where IDs may not be unique)
    if (idx < 0) {
      idx = itemsToShow.findIndex(i => {
        const filename = Array.isArray(i.filename) ? i.filename[0] : i.filename
        return filename === selectId
      })
    }

    // Only slide if we found the item (idx >= 0) AND the gallery isn't already at that index
    if (idx >= 0 && refImageGallery.current?.getCurrentIndex?.() !== idx) {
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
          clusteredMarkers={clusteredMarkers}
          items={itemsToShow}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          isClearing={isClearing}
          clearCoordinates={clearCoordinates}
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
