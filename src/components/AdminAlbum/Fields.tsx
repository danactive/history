import Button from '@mui/joy/Button'
import Checkbox from '@mui/joy/Checkbox'
import IconButton from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import Textarea from '@mui/joy/Textarea'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import xml2js from 'xml2js'

import type { Gallery, IndexedKeywords, ItemReferenceSource, RawXmlAlbum, RawXmlItem } from '../../types/common'
import { transformReference } from '../../utils/reference'
import ComboBox from '../ComboBox'
import { type XmlItemState } from './AdminAlbumClient'
import type { EditCountPillHook } from './useEditCountPill'
import { useGeoCopy } from './useGeoCopy'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const REFERENCE_SOURCES: ItemReferenceSource[] = ['facebook', 'google', 'instagram', 'wikipedia', 'youtube']

const DMS_PATTERN = /(\d+)[°\s]+(\d+)[\'’′\s]+(\d+(?:\.\d+)?)[\"”″\s]*([NSEW])?/i
const DMS_PAIR_PATTERN = /\d+[°\s]+\d+[\'’′\s]+\d+(?:\.\d+)?[\"”″\s]*[NSEW]?/ig

// Parse DMS (Degrees Minutes Seconds) format to decimal
// Supports formats like: 50° 22' 51.51" N or 50°22'51.51"N or 50 22 51.51 N
export function parseDMS(dms: string): number | null {
  const match = dms.trim().match(DMS_PATTERN)

  if (!match) return null

  const degrees = parseFloat(match[1])
  const minutes = parseFloat(match[2])
  const seconds = parseFloat(match[3])
  const direction = match[4]?.toUpperCase()

  let decimal = degrees + minutes / 60 + seconds / 3600

  // Negate if South or West
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal
  }

  return decimal
}

export function parseLatInput(value: string, prevGeo?: RawXmlItem['geo']): RawXmlItem['geo'] | undefined {
  const trimmed = value.trim()
  const hasDms = /\d+[°\s]+\d+[\'’′\s]+\d+/.test(trimmed)
  const hasComma = trimmed.includes(',')

  const splitDmsPair = (input: string): [string, string] | null => {
    if (hasComma) {
      const parts = input.split(',').map(s => s.trim()).filter(Boolean)
      return parts.length === 2 ? [parts[0], parts[1]] : null
    }
    const match = input.match(DMS_PAIR_PATTERN)
    if (match && match.length >= 2) {
      return [match[0].trim(), match[1].trim()]
    }
    return null
  }

  // Check if value contains DMS format (degrees, minutes, seconds)
  if (hasDms) {
    const pair = splitDmsPair(trimmed)
    if (pair) {
      const lat = parseDMS(pair[0])
      const lon = parseDMS(pair[1])
      if (lat !== null && lon !== null) {
        return { lat: lat.toString(), lon: lon.toString(), accuracy: prevGeo?.accuracy || '' }
      }
    }
    const lat = parseDMS(trimmed)
    if (lat !== null) {
      return { lat: lat.toString(), lon: prevGeo?.lon || '', accuracy: prevGeo?.accuracy || '' }
    }
  }

  // Check if the value contains a comma (decimal lat,lon format)
  if (hasComma) {
    const [lat, lon] = trimmed.split(',').map(s => s.trim())
    return { lat: lat || '', lon: lon || '', accuracy: prevGeo?.accuracy || '' }
  }

  // Plain value for latitude
  const lat = trimmed
  return lat || prevGeo?.lon ? { lat, lon: prevGeo?.lon || '', accuracy: prevGeo?.accuracy || '' } : undefined
}

export default function Fields(
  { xmlAlbum, gallery, item, children, onItemUpdate, onXmlGenerated, editedItems, applyEditsToItems }:
  {
    xmlAlbum: RawXmlAlbum | undefined,
    gallery: Gallery,
    item: XmlItemState,
    children: React.ReactElement,
    onItemUpdate: EditCountPillHook['handleItemUpdate'],
    onXmlGenerated: EditCountPillHook['handleXmlGenerated'],
    editedItems: EditCountPillHook['editedItems'],
    applyEditsToItems: EditCountPillHook['applyEditsToItems']
  },
) {
  const [editedItem, setEditedItem] = useState<RawXmlItem | null>(item)
  const [xmlOutput, setXmlOutput] = useState<string>('')
  const [autocompleteValue, setAutocompleteValue] = useState<string>('')
  const updatePendingRef = useRef(false)
  const GeoCopyButton = useGeoCopy(editedItem)

  // Fetch all available keywords from all albums
  const { data: keywordsData } = useSWR<{ keywords: IndexedKeywords[] }>('/api/admin/keywords', fetcher)
  const allKeywords = keywordsData?.keywords ?? []

  useEffect(() => {
    if (updatePendingRef.current) return
    setEditedItem(item)
    setXmlOutput('')
    setAutocompleteValue('')
  }, [item])

  // Notify parent after editedItem updates (after render)
  useEffect(() => {
    if (updatePendingRef.current && editedItem) {
      updatePendingRef.current = false
      onItemUpdate(editedItem)
    }
  }, [editedItem, onItemUpdate])

  // Wrapper to update local state and schedule parent notification
  const updateItem = (updater: (prev: RawXmlItem | null) => RawXmlItem | null) => {
    updatePendingRef.current = true
    setEditedItem(updater)
  }

  const generateXml = () => {
    if (!xmlAlbum) return

    // Get all items from XML
    const items = xmlAlbum.album.item ? (Array.isArray(xmlAlbum.album.item) ? xmlAlbum.album.item : [xmlAlbum.album.item]) : []

    // Apply all edits from editedItems state and maintain proper field ordering
    const updatedItems = applyEditsToItems(items)

    // Build XML album structure
    const albumXml = {
      meta: xmlAlbum.album.meta,
      item: updatedItems.length === 1 ? updatedItems[0] : updatedItems,
    }

    // Convert to XML
    const builder = new xml2js.Builder({
      rootName: 'album',
      renderOpts: { pretty: true, indent: '\t' },
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    })

    const xml = builder.buildObject(albumXml)
    setXmlOutput(xml)

    // Reset the counter of edits since generation
    onXmlGenerated()
  }

  const rawFilename = editedItem?.filename ? (Array.isArray(editedItem.filename) ? editedItem.filename[0] : editedItem.filename) : ''
  const isVideo = editedItem?.type === 'video'

  const swapFilenameExt = (fn: string, toVideo: boolean): string => {
    const lastDot = fn.lastIndexOf('.')
    const base = lastDot === -1 ? fn : fn.slice(0, lastDot)
    return toVideo ? `${base}.mp4` : `${base}.jpg`
  }

  const displayFilename = rawFilename ? swapFilenameExt(rawFilename, isVideo) : ''

  return (
    <>
      <Stack direction="column" spacing={2} sx={{ width: '35rem', flexShrink: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Input
            value={displayFilename}
            readOnly
            placeholder="Filename"
            title="Filename (read-only)"
            sx={{ flex: 1, minWidth: 0 }}
          />
          <Checkbox
            checked={isVideo}
            onChange={(e) => updateItem((prev: RawXmlItem | null) => {
              if (!prev) return null
              const checked = e.target.checked
              const currentFn = Array.isArray(prev.filename) ? prev.filename[0] : prev.filename
              const newFn = swapFilenameExt(currentFn ?? '', checked)
              const newFilename = Array.isArray(prev.filename) ? [newFn, ...prev.filename.slice(1)] : newFn
              if (checked) return { ...prev, type: 'video', filename: newFilename }
              const { type: _t, ...rest } = prev
              return { ...rest, filename: newFilename } as RawXmlItem
            })}
            label="Video item"
            title="Item type: photo (unchecked) or video (checked). Toggles &lt;type&gt;video&lt;/type&gt; and filename extension (.jpg ↔ .mp4)."
            slotProps={{ label: { sx: { color: '#E0E0E0' } } }}
          />
        </Stack>
        <Input
          value={editedItem?.photo_city ?? ''}
          onChange={(e) => updateItem((prev: RawXmlItem | null) => prev ? { ...prev, photo_city: e.target.value } : null)}
          placeholder="City"
          title="City (photo_city)"
        />
        <Input
          value={editedItem?.photo_loc ?? ''}
          onChange={(e) => updateItem((prev: RawXmlItem | null) => prev ? { ...prev, photo_loc: e.target.value } : null)}
          placeholder="Location"
          title="Location (photo_loc)"
        />
        <Textarea
          value={editedItem?.photo_desc ?? ''}
          onChange={(e) => updateItem((prev: RawXmlItem | null) => prev ? { ...prev, photo_desc: e.target.value } : null)}
          placeholder="Description"
          title="Description (photo_desc)"
          minRows={2}
        />
        <Input
          value={editedItem?.thumb_caption ?? ''}
          onChange={(e) => updateItem((prev: RawXmlItem | null) => prev ? { ...prev, thumb_caption: e.target.value } : null)}
          placeholder="Caption"
          title="Caption (thumb_caption)"
        />
        <Input
          value={editedItem?.search ?? ''}
          onChange={(e) => updateItem((prev: RawXmlItem | null) => prev ? { ...prev, search: e.target.value } : null)}
          placeholder="Search keywords"
          title="Search keywords (comma-separated)"
        />
        <ComboBox
          className="keyword-autocomplete"
          options={allKeywords}
          value={null}
          inputValue={autocompleteValue}
          onInputChange={(newValue) => {
            setAutocompleteValue(newValue)
          }}
          onChange={({ value }) => {
            // Append the selected keyword to the existing search field
            updateItem((prev: RawXmlItem | null) => {
              if (!prev) return null
              const currentSearch = prev.search ?? ''
              const separator = currentSearch && !currentSearch.endsWith(', ') ? ', ' : ''
              return { ...prev, search: currentSearch + separator + value }
            })
            // Clear the autocomplete input
            setAutocompleteValue('')
          }}
        />
        <Stack direction="row" spacing={1}>
          <Input
            value={editedItem?.geo?.lat ?? ''}
            onChange={(e) => {
              const value = e.target.value
              updateItem((prev: RawXmlItem | null) => prev ? {
                ...prev,
                geo: parseLatInput(value, prev.geo),
              } : null)
            }}
            placeholder="Latitude (or lat,lon or DMS)"
            title="Latitude (geo.lat) - paste lat,lon or DMS format to auto-split"
            sx={{ flex: 1, minWidth: 0 }}
          />
          <Input
            value={editedItem?.geo?.lon ?? ''}
            onChange={(e) => {
              const value = e.target.value

              // Check if value contains DMS format
              if (/\d+[°\s]+\d+['\s]+\d+/.test(value)) {
                const lon = parseDMS(value)
                if (lon !== null) {
                  updateItem((prev: RawXmlItem | null) => prev ? {
                    ...prev,
                    geo: { lat: prev.geo?.lat || '', lon: lon.toString(), accuracy: prev.geo?.accuracy || '' },
                  } : null)
                  return
                }
              }

              // Plain value for longitude
              const lon = value
              updateItem((prev: RawXmlItem | null) => prev ? {
                ...prev,
                geo: lon || prev.geo?.lat ? { lat: prev.geo?.lat || '', lon, accuracy: prev.geo?.accuracy || '' } : undefined,
              } : null)
            }}
            placeholder="Longitude (or DMS)"
            title="Longitude (geo.lon) - paste DMS format to convert"
            sx={{ flex: 1, minWidth: 0 }}
          />
          <GeoCopyButton />

          <Input
            value={editedItem?.geo?.accuracy ?? ''}
            onChange={(e) => {
              const accuracy = e.target.value
              updateItem((prev: RawXmlItem | null) => prev ? {
                ...prev,
                geo: prev.geo ? { ...prev.geo, accuracy } : undefined,
              } : null)
            }}
            placeholder="Accuracy"
            title="Coordinate accuracy (geo.accuracy)"
            type="number"
            sx={{ flex: 0.6, minWidth: 0 }}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Select
            value={editedItem?.ref?.source ?? ''}
            onChange={(_, value) => {
              updateItem((prev: RawXmlItem | null) => prev ? {
                ...prev,
                ref: value ? { source: value as ItemReferenceSource, name: prev.ref?.name || '' } : undefined,
              } : null)
            }}
            placeholder="Reference Source"
            title="Reference source (ref.source)"
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Option value="">None</Option>
            {REFERENCE_SOURCES.map(source => (
              <Option key={source} value={source}>{source.charAt(0).toUpperCase() + source.slice(1)}</Option>
            ))}
          </Select>
          <Input
            value={editedItem?.ref?.name ?? ''}
            onChange={(e) => {
              const name = e.target.value
              updateItem((prev: RawXmlItem | null) => prev ? {
                ...prev,
                ref: prev.ref?.source ? { source: prev.ref.source, name } : undefined,
              } : null)
            }}
            placeholder="Reference Name"
            title="Reference name/ID (ref.name)"
            sx={{ flex: 1, minWidth: 0 }}
          />
          <IconButton
            size="sm"
            variant="outlined"
            onClick={() => {
              const reference = transformReference(editedItem?.ref)
              if (reference) {
                navigator.clipboard.writeText(reference[0])
              }
            }}
            disabled={!editedItem?.ref?.source || !editedItem?.ref?.name}
            title="Copy reference URL to clipboard"
            aria-label="Copy reference URL to clipboard"
            sx={{ minWidth: 'auto', px: 1 }}
          >
            📋
          </IconButton>
        </Stack>
        <Button onClick={generateXml} variant="solid" color="primary">
          Generate XML
        </Button>
        {children}
        {xmlOutput && (
          <Textarea
            value={xmlOutput}
            readOnly
            minRows={10}
            maxRows={20}
            placeholder="Generated XML will appear here"
          />
        )}
      </Stack>
    </>
  )
}
