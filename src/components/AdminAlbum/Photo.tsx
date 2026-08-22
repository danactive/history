import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import useSWRMutation from 'swr/mutation'

import { originalPath, photoPath } from '../../lib/paths'
import type {
  ClassificationRequest,
  ClassificationResponse,
} from '../../models/classifier'
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

const fetcher = async (
  url: string,
  { arg }: { arg: ClassificationRequest },
): Promise<ClassificationResponse> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Classifier request failed')
  }
  return data
}

export default function AdminAlbumPhoto(
  { item, gallery, size = 'default', onAcceptPrediction }:
  {
    item: RawXmlItem,
    gallery: Gallery,
    size?: 'default' | 'small',
    onAcceptPrediction?: (scientificName: string) => void,
  },
) {
  const { trigger, data, error, isMutating } = useSWRMutation<
    ClassificationResponse,
    Error,
    string,
    ClassificationRequest
  >(
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
          type="button"
          variant="solid"
          color="primary"
          onClick={(e) => {
            e.preventDefault()
            trigger({
              path: originalSrc,
              fallbackPath: photoSrc,
              photoDate: item.photo_date,
              city: item.photo_city,
              location: item.photo_loc,
              geo: item.geo,
            })
          }}
          loading={isMutating}
        >
          Classify organism
        </Button>
        {error && <Typography color="danger">{error.message}</Typography>}
        {data && (
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            <Typography level="title-sm">
              {data.status === 'identified' && 'Best-supported suggestion — verify before adding'}
              {data.status === 'uncertain' && 'Uncertain — review the leading suggestions'}
              {data.status === 'not_organism' && 'No clear organism detected'}
            </Typography>
            {data.status === 'uncertain' && !data.diagnostics.topTwoSameFamily && (
              <Typography level="body-sm">
                The leading suggestions disagree at the family level. Do not treat this as an identification.
              </Typography>
            )}
            {data.status !== 'not_organism' && data.predictions.map(prediction => (
              <Stack
                key={prediction.taxonId}
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
              >
                <div>
                  <div>
                    {prediction.commonName && `${prediction.commonName} — `}
                    <Link
                      href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(prediction.scientificName)}`}
                      target="_blank"
                    >
                      <i>{prediction.scientificName}</i>
                    </Link>
                  </div>
                  <Typography level="body-xs" sx={{ color: 'neutral.400' }}>
                    {prediction.family && `${prediction.family} · `}
                    {prediction.matchStrength} match · similarity {prediction.score.toFixed(3)}
                  </Typography>
                </div>
                {onAcceptPrediction && (
                  <Button
                    type="button"
                    size="sm"
                    variant="solid"
                    color="primary"
                    onClick={() => onAcceptPrediction(prediction.scientificName)}
                  >
                    Add keyword
                  </Button>
                )}
              </Stack>
            ))}
            <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
              {data.model.id} · {data.diagnostics.cropCount} crop{data.diagnostics.cropCount === 1 ? '' : 's'}
            </Typography>
          </Stack>
        )}
      </Stack>
    </>
  )
}
