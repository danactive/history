import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import useSWRMutation from 'swr/mutation'

import type { Prediction } from '../../../app/api/admin/classify/route'
import { photoPath } from '../../lib/paths'
import config from '../../models/config'
import type { Gallery, RawXmlItem } from '../../types/common'
import Img from '../Img'
import Link from '../Link'

const fetcher = async (url: string, { arg }: { arg: string }) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: arg }),
  }).then((res) => res.json())

export default function AdminAlbumPhoto({ item, gallery }: { item: RawXmlItem, gallery: Gallery }) {
  const { trigger, data, error, isMutating } = useSWRMutation(
    '/api/admin/classify',
    fetcher,
  )

  const path = photoPath(item.filename, gallery)

  return (
    <>
      <Stack direction="column">
        <Img
          src={path}
          alt={item.thumb_caption || 'Photo'}
          width={config.resizeDimensions.photo.width-200}
          height={config.resizeDimensions.photo.height-200}
        />
        <Button
          onClick={(e) => {
            e.preventDefault()
            trigger(path)
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
