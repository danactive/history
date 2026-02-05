import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'
import Stack from '@mui/joy/Stack'
import useSWRMutation from 'swr/mutation'

import type { Prediction } from '../../../app/api/admin/classify/route'
import { originalPath, photoPath } from '../../lib/paths'
import config from '../../models/config'
import type { Gallery, RawXmlItem } from '../../types/common'
import Img from '../Img'
import Link from '../Link'

function OpenInNewIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
    </svg>
  )
}

const fetcher = async (url: string, { arg }: { arg: string }) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: arg }),
  }).then((res) => res.json())

export default function AdminAlbumPhoto(
  { item, gallery, size = 'default' }:
  { item: RawXmlItem, gallery: Gallery, size?: 'default' | 'small' },
) {
  const { trigger, data, error, isMutating } = useSWRMutation(
    '/api/admin/classify',
    fetcher,
  )

  const photoSrc = photoPath(item.filename, gallery)
  const originalSrc = originalPath(item.filename, gallery)
  const dimensions = size === 'small' ? config.resizeDimensions.preview : config.resizeDimensions.photo

  return (
    <>
      <Stack direction="column">
        <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ position: 'relative' }}>
          <Img
            src={photoSrc}
            alt={item.thumb_caption || 'Photo'}
            width={dimensions.width - 20}
            height={dimensions.height - 20}
          />
          <IconButton
            component={Link}
            href={originalSrc}
            target="_blank"
            rel="noopener noreferrer"
            variant="soft"
            color="primary"
            size="sm"
            title="Open original image in new tab"
            aria-label="Open original image in new tab"
            sx={{ flexShrink: 0, mt: 0.5 }}
          >
            <OpenInNewIcon />
          </IconButton>
        </Stack>
        <Button
          onClick={(e) => {
            e.preventDefault()
            trigger(photoSrc)
          }}
        >
          Classify Image
        </Button>
        {isMutating && <div>Classifying...</div>}
        {error && <div>Error loading classification</div>}
        {data && <div>Predictions:
          {data.predictions.map((p: Prediction) =>
            (
              <div key={p.label}>
                <Link
                  href={`https://en.wikipedia.org/w/index.php?search=${p.label}`}
                  target="_blank"
                >
                  {p.label}
                </Link> {(p.score * 100).toFixed(2)}%
              </div>
            ),
          )}
          </div>
        }
      </Stack>
    </>
  )
}
