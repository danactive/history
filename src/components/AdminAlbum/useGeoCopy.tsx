import IconButton from '@mui/joy/IconButton'
import { useState } from 'react'
import type { RawXmlItem } from '../../types/common'

export function useGeoCopy(editedItem: RawXmlItem | null) {
  const [copyMode, setCopyMode] = useState<'coords' | 'maps'>('coords')

  const copyGeoCoordinates = () => {
    const lat = editedItem?.geo?.lat ?? ''
    const lon = editedItem?.geo?.lon ?? ''

    if (!lat || !lon) return

    if (copyMode === 'coords') {
      navigator.clipboard.writeText(`${lat}, ${lon}`)
      setCopyMode('maps')
    } else {
      navigator.clipboard.writeText(`https://www.google.ca/maps/place/${lat}, ${lon}`)
      setCopyMode('coords')
    }
  }

  const title = copyMode === 'coords' ? 'Copy coordinates' : 'Copy Google Maps URL'
  const disabled = !editedItem?.geo?.lat || !editedItem?.geo?.lon

  const GeoCopyButton = () => (
    <IconButton
      size="sm"
      variant="outlined"
      onClick={copyGeoCoordinates}
      disabled={disabled}
      title={title}
      aria-label={title}
      sx={{ minWidth: 'auto', px: 1 }}
    >
      📋
    </IconButton>
  )

  return GeoCopyButton
}
