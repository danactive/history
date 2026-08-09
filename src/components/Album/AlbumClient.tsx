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
  activeFacetCounts,
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
    selectionCoordinator,
  } = useMapFilter({
    gallery,
    items,
    totalCount: totalItemCount,
    indexedKeywords,
    personOptions,
    tagOptions,
    activeFacetCounts,
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
    selectionCoordinator,
  })

  const handleThumbSelect = useCallback((index: number) => {
    selectionCoordinator.selectIndex(index, { origin: 'thumbnail' })
  }, [selectionCoordinator])

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
          clusteredMarkers={clusteredMarkers}
          items={itemsToShow}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          mapBounds={mapBounds}
          isClearing={isClearing}
          clearCoordinates={clearCoordinates}
          selectionCoordinator={selectionCoordinator}
          onToggleMapFilter={handleToggleMapFilter}
          onMapBoundsChange={handleBoundsChange}
        />
        <ThumbImgList
          items={itemsToShow}
          className={styles.thumbWrapper}
          getKey={(item) => getPrimaryFilename(item.filename)}
          getThumbProps={getThumbProps}
          virtualize
        />
      </AlbumContext.Provider>
    </div>
  )
}

export default AlbumClient
