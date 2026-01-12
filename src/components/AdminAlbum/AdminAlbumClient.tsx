'use client'

import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

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
  const [album, setAlbum] = useState<GalleryAlbum | null>(null)
  const [item, setItem] = useState<XmlItemState>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const { data, error } = useSWR<RawXmlAlbum>(album?.name ? `/api/admin/xml/${gallery}/${album?.name}` : null, fetcher)

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
    const selectedAlbum = galleryAlbum[gallery].albums.find(a => a.name === newValue)
    if (selectedAlbum) {
      setAlbum(selectedAlbum)
    }
  }

  return (
    <form>
        {item && <Fields xmlAlbum={data} gallery={gallery} item={item}>
          <Photo item={item} gallery={gallery} />
        </Fields>}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
          }}
        >
          <label htmlFor="select-gallery-label" id="select-gallery">Gallery</label>
          <Select
            defaultValue={gallery}
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
            defaultValue=""
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
            {galleryAlbum[gallery].albums.map(album => <Option key={album.name} value={album.name}>{album.name}</Option>)}
          </Select>
        </Stack>
        {error && <div>{JSON.stringify(error)}</div>}
        {!error && data ? (
          <Thumbs xmlAlbum={data} gallery={gallery} setItem={handleItemSelect} currentIndex={currentIndex} />
        ) : (
          <div>Select an album</div>
        )}
      </form>
  )
}
