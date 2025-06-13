'use client'

import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import { useState } from 'react'
import useSWR from 'swr'

import { type AlbumResponseBody } from '../../lib/album'
import { type GalleryAlbumsBody } from '../../lib/albums'
import { type Gallery } from '../../lib/galleries'
import type { GalleryAlbum, Item } from '../../types/common'
import Fields from './Fields'
import Photo from './Photo'
import Thumbs from './Thumbs'

export type ItemState = Item | null

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AdminAlbumClient(
  { galleries, galleryAlbum, gallery }:
  { galleries: Gallery[], galleryAlbum: GalleryAlbumsBody, gallery: Gallery },
) {
  const [album, setAlbum] = useState<GalleryAlbum | null>(null)
  const [item, setItem] = useState<ItemState>(null)
  const { data, error } = useSWR<AlbumResponseBody>(album?.name ? `/api/galleries/${gallery}/albums/${album?.name}` : null, fetcher)

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
        <Fields albumEntity={data?.album} item={item}>
          <Photo item={item} />
        </Fields>
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
        {!error && album ? <Thumbs album={data?.album} setItem={setItem} /> : <div>Select an album</div>}
      </form>
  )
}
