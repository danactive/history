'use client'

import Button from '@mui/joy/Button'
import Input from '@mui/joy/Input'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import type { SearchResult } from '../../../app/api/admin/search/route'
import { type GalleryAlbumsBody } from '../../lib/albums'
import { type Gallery } from '../../lib/galleries'
import type { GalleryAlbum, RawXmlAlbum, RawXmlItem } from '../../types/common'
import Fields from './Fields'
import Photo from './Photo'
import Thumbs from './Thumbs'
import { useEditCountPill } from './useEditCountPill'

export type XmlItemState = RawXmlItem | null

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AdminAlbumClient(
  { galleries, galleryAlbum, gallery }:
  { galleries: Gallery[], galleryAlbum: GalleryAlbumsBody, gallery: Gallery },
) {
  const [currentGallery, setCurrentGallery] = useState<Gallery>(gallery)
  const [album, setAlbum] = useState<GalleryAlbum | null>(null)
  const [item, setItem] = useState<XmlItemState>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSearching, setIsSearching] = useState(false)
  const {
    EditCountPill,
    editedItems,
    handleItemUpdate: handleItemUpdateOriginal,
    handleXmlGenerated,
    getItemWithEdits,
    clearEdits,
    applyEditsToItems,
  } = useEditCountPill()
  const { data, error } = useSWR<RawXmlAlbum>(album?.name ? `/api/admin/xml/${currentGallery}/${album?.name}` : null, fetcher)

  const items = data?.album?.item
    ? (Array.isArray(data.album.item) ? data.album.item : [data.album.item])
    : []

  const countFields = (item: RawXmlItem | null) => {
    if (!item) return 0
    let count = 0
    for (const [key, value] of Object.entries(item)) {
      if (key !== '$' && key !== 'filename' && value) {
        count++
      }
    }
    return count
  }

  const handleItemUpdateWrapper = (updatedItem: RawXmlItem) => {
    // If multiple items are selected, apply the update to all of them
    // preserving their specific ID and filename (each keeps its own filename)
    if (selectedIndices.size > 1) {
      const activeOriginalFilename = item?.filename
      const activeOriginalValue = Array.isArray(activeOriginalFilename)
        ? activeOriginalFilename[0]
        : activeOriginalFilename
      const activeUpdatedValue = Array.isArray(updatedItem.filename)
        ? updatedItem.filename[0]
        : updatedItem.filename

      selectedIndices.forEach(index => {
        const targetItem = items[index]
        if (!targetItem) return
        const targetFilename = targetItem.filename
        let newFilename = targetFilename

        if (activeOriginalValue && activeUpdatedValue && activeOriginalValue !== activeUpdatedValue) {
          const originalLower = activeOriginalValue.toLowerCase()
          const updatedLower = activeUpdatedValue.toLowerCase()
          const isJpgToMp4 = originalLower.endsWith('.jpg') && updatedLower.endsWith('.mp4')
          const isMp4ToJpg = originalLower.endsWith('.mp4') && updatedLower.endsWith('.jpg')

          if (isJpgToMp4 || isMp4ToJpg) {
            const targetValue = Array.isArray(targetFilename) ? targetFilename[0] : targetFilename
            const swapped = isJpgToMp4
              ? targetValue?.replace(/\.jpg$/i, '.mp4')
              : targetValue?.replace(/\.mp4$/i, '.jpg')
            newFilename = Array.isArray(targetFilename) ? [swapped] : swapped
          }
        }

        const newItem = {
          ...updatedItem,
          $: targetItem.$,
          filename: newFilename,
        }

        handleItemUpdateOriginal(newItem)
      })
    } else {
      handleItemUpdateOriginal(updatedItem)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      let delta = 0

      if (e.key === 'ArrowLeft') {
        delta = -1
      } else if (e.key === 'ArrowUp') {
        delta = -4
      } else if (e.key === 'ArrowRight') {
        delta = 1
      } else if (e.key === 'ArrowDown') {
        delta = 4
      }

      if (delta !== 0 && items.length > 0) {
        e.preventDefault()
        const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + delta))
        if (newIndex !== currentIndex) {
          // Reset selection on navigation
          setSelectedIndices(new Set([newIndex]))
          setCurrentIndex(newIndex)
          setItem(items[newIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, items])

  const handleItemSelect = (selectedItem: RawXmlItem, index: number, isShift: boolean = false) => {
    let newSelectedIndices = new Set<number>()

    if (isShift && currentIndex !== -1) {
      // Range selection
      const start = Math.min(currentIndex, index)
      const end = Math.max(currentIndex, index)
      // Keep existing selection if needed? Standard behavior usually anchors to last click.
      // But let's assume standard shift-click behavior: select range from anchor to current.
      // We don't track anchor separately loop, so we assume currentIndex is anchor.

      // If we want to ADD to selection with CMD/Ctrl, we'd need that too, but user asked for Shift.
      // For simplicity, just range select.
      for (let i = start; i <= end; i++) {
        newSelectedIndices.add(i)
      }
    } else {
      newSelectedIndices.add(index)
    }

    setSelectedIndices(newSelectedIndices)
    setCurrentIndex(index)

    // Find the item with most fields among selected
    let bestItem = items[index]
    let maxFields = -1

    newSelectedIndices.forEach(idx => {
      const candidate = items[idx]
      // Use the edited version if available to count fields?
      // User said "Select the photo's XML value which has the most fields"
      // Likely refers to current state.
      const itemToCheck = getItemWithEdits(candidate) || candidate
      const fields = countFields(itemToCheck)
      if (fields > maxFields) {
        maxFields = fields
        bestItem = candidate
      }
    })

    setItem(bestItem)
  }

  const handleAlbumChange = (
    event: React.SyntheticEvent | null,
    newValue: string | null,
  ) => {
    const selectedAlbum = galleryAlbum[currentGallery].albums.find(a => a.name === newValue)
    if (selectedAlbum) {
      setAlbum(selectedAlbum)
      // Clear edits when album changes
      clearEdits()
      setCurrentIndex(-1)
      setItem(null)
      setSelectedIndices(new Set())
    }
  }

  const handleGalleryChange = (
    event: React.SyntheticEvent | null,
    newValue: string | null,
  ) => {
    if (newValue) {
      setCurrentGallery(newValue as Gallery)
      setAlbum(null)
      // Clear edits when gallery changes
      clearEdits()
      setItem(null)
      setCurrentIndex(-1)
      setSelectedIndices(new Set())
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/admin/search?query=${encodeURIComponent(searchQuery)}`)
      const data: { results: SearchResult[] } = await response.json()

      if (data.results && data.results.length > 0) {
        // Load the first result automatically
        const firstResult = data.results[0]
        setCurrentGallery(firstResult.gallery)

        const selectedAlbum = galleryAlbum[firstResult.gallery].albums.find(a => a.name === firstResult.album)
        if (selectedAlbum) {
          setAlbum(selectedAlbum)
          setCurrentIndex(firstResult.index)
        }
      } else {
        alert('No matching files found')
      }
    } catch (error) {
      console.error('Search failed:', error)
      alert('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  // Update the item when currentIndex changes and items are available
  useEffect(() => {
    if (items.length > 0 && currentIndex >= 0 && currentIndex < items.length) {
      setItem(items[currentIndex])
    }
  }, [currentIndex, items])

  return (
    <form>
      <EditCountPill />
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <label htmlFor="search-filename">Search Filename</label>
        <Input
          id="search-filename"
          placeholder="Enter filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          sx={{ flexGrow: 1 }}
        />
        <Button onClick={handleSearch} disabled={isSearching} variant="solid">
          {isSearching ? 'Searching...' : 'Search'}
        </Button>

        <label htmlFor="select-gallery-label" id="select-gallery">Gallery</label>
        <Select
          value={currentGallery}
          onChange={handleGalleryChange}
          slotProps={{
            button: {
              id: 'select-gallery-label',
              'aria-labelledby': 'select-gallery select-gallery-label',
            },
          }}
          variant='solid'
        >
          <Option value="">Select a Gallery</Option>
          {galleries.map(gallery => <Option key={gallery} value={gallery}>{gallery}</Option>)}
        </Select>

        <label htmlFor="select-album-label" id="select-album">Album</label>
        <Select
          value={album?.name ?? ''}
          onChange={handleAlbumChange}
          slotProps={{
            button: {
              id: 'select-album-label',
              'aria-labelledby': 'select-album select-album-label',
            },
          }}
          variant='solid'
        >
          <Option value="">Select a Album</Option>
          {galleryAlbum[currentGallery].albums.map(album => <Option key={album.name} value={album.name}>{album.name}</Option>)}
        </Select>
      </Stack>
      {error && <div>{JSON.stringify(error)}</div>}
      {!error && data ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Thumbs
              xmlAlbum={data}
              gallery={currentGallery}
              setItem={handleItemSelect}
              currentIndex={currentIndex}
              selectedIndices={selectedIndices}
            />
          </Stack>
          {item && (
            <Stack sx={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
              <Fields
                xmlAlbum={data}
                gallery={currentGallery}
                item={getItemWithEdits(item)}
                onItemUpdate={handleItemUpdateWrapper}
                onXmlGenerated={handleXmlGenerated}
                editedItems={editedItems}
                applyEditsToItems={applyEditsToItems}
              >
                <Photo item={item} gallery={currentGallery} size="small" />
              </Fields>
            </Stack>
          )}
        </Stack>
      ) : (
        <div>Select an album</div>
      )}
    </form>
  )
}
