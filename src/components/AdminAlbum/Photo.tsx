import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import useSWRMutation from 'swr/mutation'

import type { Prediction } from '../../../app/api/admin/classify/route'
import config from '../../models/config'
import Img from '../Img'
import Link from '../Link'
import type { ItemState } from './AdminAlbumClient'

const fetcher = async (url: string, { arg }: { arg: string }) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: arg }),
  }).then((res) => res.json())

export default function AdminAlbumPhoto({ item }: { item: ItemState }) {
  const { trigger, data, error, isMutating } = useSWRMutation(
    '/api/admin/classify',
    fetcher,
  )

  if (!item?.photoPath) return <div>No photo</div>

  return (
    <>
      <Stack direction="column">
        <Img
          src={item.photoPath}
          alt={item.caption}
          width={config.resizeDimensions.photo.width-200}
          height={config.resizeDimensions.photo.height-200}
        />
        <Button
          onClick={(e) => {
            e.preventDefault()
            trigger(item.photoPath)
          }}
        >
          Classify Image
        </Button>
        {isMutating && <p>Classifying...</p>}
        {error && <p>Error loading classification</p>}
        {data && <p>Predictions:
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
          </p>
        }
      </Stack>
    </>
  )
}
