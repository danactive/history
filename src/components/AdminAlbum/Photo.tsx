import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import NextLink from 'next/link'
import useSWRMutation from 'swr/mutation'

import { originalPath, photoPath } from '../../lib/paths'
import {
  normalizePhotoClassificationResponse,
  type ClassificationRequest,
  type PhotoClassificationResponse,
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
): Promise<PhotoClassificationResponse> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  })
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = (
      typeof data === 'object'
      && data !== null
      && 'error' in data
      && typeof data.error === 'string'
    ) ? data.error : 'Photo classification is currently unavailable. Try again.'
    throw new Error(message)
  }
  return normalizePhotoClassificationResponse(data)
}

export default function AdminAlbumPhoto(
  { item, gallery, size = 'default', onAddDescription }:
  {
    item: RawXmlItem,
    gallery: Gallery,
    size?: 'default' | 'small',
    onAddDescription?: (descriptionValue: string) => void,
  },
) {
  const { trigger, data, error, isMutating, reset } = useSWRMutation<
    PhotoClassificationResponse,
    Error,
    string,
    ClassificationRequest
  >(
    '/api/admin/classify',
    fetcher,
    { throwOnError: false },
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
            component={NextLink}
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
            reset()
            void trigger({
              path: originalSrc,
              fallbackPath: photoSrc,
              photoDate: item.photo_date,
              city: item.photo_city,
              location: item.photo_loc,
              geo: item.geo,
            }, { throwOnError: false })
          }}
          loading={isMutating}
        >
          Classify photo
        </Button>
        {error && (
          <Stack spacing={0.25} sx={{ mt: 1 }} role="alert">
            <Typography level="title-sm" color="danger">
              Classification unavailable
            </Typography>
            <Typography level="body-sm" sx={{ color: 'neutral.300' }}>
              {error.message}
            </Typography>
          </Stack>
        )}
        {data && (
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            <Typography level="title-sm">
              {data.status === 'matched'
                ? 'Top classifier results — verify before adding'
                : 'No reliable classification found'}
            </Typography>
            {data.suggestions.map((suggestion, index) => (
              <Stack
                key={`${suggestion.type}:${suggestion.id}`}
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
              >
                <div>
                  <div>
                    {index + 1}.{' '}
                    {suggestion.commonName && `${suggestion.commonName} — `}
                    <Link
                      href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(suggestion.name)}`}
                      target="_blank"
                    >
                      {suggestion.type === 'organism' ? <i>{suggestion.name}</i> : suggestion.name}
                    </Link>
                  </div>
                  <Typography level="body-xs" sx={{ color: 'neutral.400' }}>
                    {suggestion.type === 'organism' ? 'Organism' : 'Architecture'} ·{' '}
                    {suggestion.context && `${suggestion.context} · `}
                    {suggestion.matchStrength} match · similarity {suggestion.score.toFixed(3)}
                  </Typography>
                  {suggestion.reviewCues.length > 0 && (
                    <Typography level="body-xs" sx={{ color: 'neutral.400' }}>
                      Verify: {suggestion.reviewCues.join(', ')}
                    </Typography>
                  )}
                </div>
                {onAddDescription && (
                  <Button
                    type="button"
                    size="sm"
                    variant="solid"
                    color="primary"
                    onClick={() => onAddDescription(suggestion.descriptionValue)}
                  >
                    Add Desc
                  </Button>
                )}
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </>
  )
}
