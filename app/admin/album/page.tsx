import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import type { Metadata } from 'next'

import config from "../../../config.json"
import get from "../../../src/lib/galleries"

export const metadata: Metadata = {
  title: 'Admin > Edit Album - History App',
}

export default async function AdminAlbumServer() {
  const { galleries } = await get()
  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
        }}
      >
        <label htmlFor="select-gallery-label" id="select-gallery">Gallery</label>
        <Select
          defaultValue={galleries.find(gallery => config.defaultGallery !== gallery)}
          slotProps={{
            button: {
              id: 'select-gallery-label',
              'aria-labelledby': 'select-gallery select-gallery-label',
            }
          }}
          variant='solid'
        >
          <Option value="">Select a Gallery</Option>
          {galleries.map(gallery => <Option value={gallery}>{gallery}</Option>)}
        </Select>
      </Stack>
    </>
  )
}
