import Input from '@mui/joy/Input'
import Stack from '@mui/joy/Stack'

import { type AlbumResponseBody } from '../../lib/album'
import { type ItemState } from './AdminAlbumClient'
import Xml from './Xml'

export default function Fields(
  { albumEntity, item, children }:
  { albumEntity: AlbumResponseBody['album'] | undefined, item: ItemState, children: React.ReactElement },
) {
  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
        }}
      >
        {children}
        <Stack direction="column">
          <Input value={item?.filename} />
          <Input value={item?.city} />
          <Input value={item?.location ?? ''} />
          <Input value={item?.caption} />
          <Input value={item?.description ?? ''} />
          <Input value={item?.search ?? ''} />
          <Xml jsonBlob={JSON.stringify(albumEntity)} />
        </Stack>
      </Stack>
    </>
  )
}
