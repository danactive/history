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
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { data, error, mutate } = useSWR<RawXmlAlbum>(album?.name ? `/api/admin/xml/${currentGallery}/${album?.name}` : null, fetcher)

  const items = data?.album.item ? (Array.isArray(data.album.item) ? data.album.item : [data.album.item]) : []

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
          setCurrentIndex(newIndex)
          setItem(items[newIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, items])

  const handleItemSelect = (selectedItem: RawXmlItem, index: number) => {
    setItem(selectedItem)
    setCurrentIndex(index)
  }

  const handleAlbumChange = (
    event: React.SyntheticEvent | null,
    newValue: string | null,
  ) => {
    const selectedAlbum = galleryAlbum[currentGallery].albums.find(a => a.name === newValue)
    if (selectedAlbum) {
      setAlbum(selectedAlbum)
      setCurrentIndex(-1)
      setItem(null)
    }
  }

  const handleGalleryChange = (
    event: React.SyntheticEvent | null,
    newValue: string | null,
  ) => {
    if (newValue) {
      setCurrentGallery(newValue as Gallery)
      setAlbum(null)
      setItem(null)
      setCurrentIndex(-1)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/admin/search?query=${encodeURIComponent(searchQuery)}`)
      const data: { results: SearchResult[] } = await response.json()

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results)
        // Load the first result automatically
        const firstResult = data.results[0]
        setCurrentGallery(firstResult.gallery)

        const selectedAlbum = galleryAlbum[firstResult.gallery].albums.find(a => a.name === firstResult.album)
        if (selectedAlbum) {
          setAlbum(selectedAlbum)
          // Wait for the album to load, then select the item
          setTimeout(async () => {
            await mutate()
            setCurrentIndex(firstResult.index)
          }, 100)
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
        {item && <Fields xmlAlbum={data} gallery={currentGallery} item={item}>
          <Photo item={item} gallery={currentGallery} />
        </Fields>}
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
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
          }}
        >
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
          <Thumbs xmlAlbum={data} gallery={currentGallery} setItem={handleItemSelect} currentIndex={currentIndex} />
        ) : (
          <div>Select an album</div>
        )}
      </form>
  )
}
