'use client'

import { useCallback } from 'react'
import useMapFilter from '../../hooks/useMapFilter'
import useSelectGalleryItemFromUrl from '../../hooks/useSelectGalleryItemFromUrl'
import type { Album } from '../../types/pages'
import { getPrimaryFilename } from '../../utils'
import AlbumContext from '../Context'
import Link from '../Link'
import FilterArea from '../Search/FilterArea'
import SplitViewer from '../SplitViewer'
import { renderAlbumCaptionAction } from '../All/Items'
import { ThumbImgList, type ThumbImgProps } from '../ThumbImg'
import styles from './styles.module.css'

/**
 * Render an album with gallery, map, and thumbnails.
 * @param {Album.ComponentProps} props Component properties.
 * @param {AlbumMeta extends unknown ? Album.ComponentProps['items'] : Album.ComponentProps['items']} props.items Album items.
 * @param {AlbumMeta} props.meta Album metadata (geo info etc.).
 * @param {Map<string, string[]>} props.indexedKeywords Indexed keywords map.
 * @returns {JSX.Element} Album page markup.
 */
function AlbumClient({
  items = [],
  totalItemCount,
  meta,
  indexedKeywords,
  personOptions,
  tagOptions,
  clusteredMarkers,
  gallery,
  album,
  monthDay,
}: Album.ComponentProps) {
  const albumDetailsHref = gallery && album ? `/${gallery}/${album}/details` : null
  const dateDetailsHref = gallery && monthDay ? `/${gallery}/today/details?${new URLSearchParams({ day: monthDay }).toString()}` : null
  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    memoryHtml,
    viewedList,
    searchBox,
    mapFilterEnabled,
    mapBounds,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
    isClearing,
    clearCoordinates,
  } = useMapFilter({
    gallery,
    items,
    totalCount: totalItemCount,
    indexedKeywords,
    personOptions,
    tagOptions,
    ownedPersonFilter: true,
    trailingAction: albumDetailsHref
      ? <Link href={albumDetailsHref}>Album details</Link>
      : dateDetailsHref
        ? <Link href={dateDetailsHref}>Date details</Link>
        : null,
  })

  useSelectGalleryItemFromUrl({
    items: itemsToShow,
    refImageGallery,
    setMemoryIndex,
    setViewed,
  })

  const handleThumbSelect = useCallback((index: number) => {
    refImageGallery.current?.slideToIndex(index)
    setMemoryIndex(index)
  }, [refImageGallery, setMemoryIndex])

  const getThumbProps = useCallback((item: Album.ComponentProps['items'][number], index: number): ThumbImgProps => ({
    onSelectIndex: handleThumbSelect,
    selectIndex: index,
    src: item.thumbPath,
    caption: item.caption,
    viewed: viewedList.has(item.id),
    captionAction: monthDay && !album
      ? renderAlbumCaptionAction(gallery, item.album, item.filename, item.corpus)
      : null,
  }), [album, gallery, handleThumbSelect, monthDay, viewedList])

  return (
    <div>
      <AlbumContext.Provider value={meta}>
        <FilterArea
          searchControls={searchBox}
          memoryContent={memoryHtml}
        />
        <SplitViewer
          setViewed={setViewed}
          clusteredMarkers={clusteredMarkers}
          items={itemsToShow}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          mapBounds={mapBounds}
          isClearing={isClearing}
          clearCoordinates={clearCoordinates}
          onToggleMapFilter={handleToggleMapFilter}
          onMapBoundsChange={handleBoundsChange}
        />
        <ThumbImgList
          items={itemsToShow}
          className={styles.thumbWrapper}
          getKey={(item) => getPrimaryFilename(item.filename)}
          getThumbProps={getThumbProps}
        />
      </AlbumContext.Provider>
    </div>
  )
}

export default AlbumClient
