'use client'

import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'

import { type GalleryAlbumsBody } from '../../lib/albums'
import { type Gallery } from '../../lib/galleries'

export default function AdminAlbumClient(
  { galleries, galleryAlbum, selectedGallery }:
  { galleries: Gallery[], galleryAlbum: GalleryAlbumsBody, selectedGallery: Gallery },
) {
  function handleAlbumChange() {

  }
  return (
    <form>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          <label htmlFor="select-gallery-label" id="select-gallery">Gallery</label>
          <Select
            defaultValue={selectedGallery}
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
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
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
            {galleryAlbum[selectedGallery].albums.map(album => <Option key={album.name} value={album.name}>{album.name}</Option>)}
          </Select>
        </Stack>
      </form>
  )
}
