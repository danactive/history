import Button from '@mui/joy/Button'
import Input from '@mui/joy/Input'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import Textarea from '@mui/joy/Textarea'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import xml2js from 'xml2js'

import type { Gallery, IndexedKeywords, ItemReferenceSource, RawXmlAlbum, RawXmlItem } from '../../types/common'
import ComboBox from '../ComboBox'
import { type XmlItemState } from './AdminAlbumClient'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const REFERENCE_SOURCES: ItemReferenceSource[] = ['facebook', 'google', 'instagram', 'wikipedia', 'youtube']

export default function Fields(
  { xmlAlbum, gallery, item, children, onItemUpdate, editedItems }:
  {
    xmlAlbum: RawXmlAlbum | undefined,
    gallery: Gallery,
    item: XmlItemState,
    children: React.ReactElement,
    onItemUpdate: (item: RawXmlItem) => void,
    editedItems: Record<string, RawXmlItem>
  },
) {
  const [editedItem, setEditedItem] = useState<RawXmlItem | null>(item)
  const [xmlOutput, setXmlOutput] = useState<string>('')
  const [autocompleteValue, setAutocompleteValue] = useState<string>('')
  const updatePendingRef = useRef(false)

  // Fetch all available keywords from all albums
  const { data: keywordsData } = useSWR<{ keywords: IndexedKeywords[] }>('/api/admin/keywords', fetcher)
  const allKeywords = keywordsData?.keywords ?? []

  useEffect(() => {
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
    const updatedItems = items.map((originalItem: RawXmlItem) => {
      const edited = editedItems[originalItem.$.id]
      if (!edited) return originalItem

      // Reconstruct item with desired field order: search before geo
      const { search, geo, ref, ...rest } = edited
      return {
        ...rest,
        ...(search !== undefined && search !== null && { search }),
        ...(geo && { geo }),
        ...(ref && { ref }),
      }
    })

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
  }

  const filename = editedItem?.filename ? (Array.isArray(editedItem.filename) ? editedItem.filename[0] : editedItem.filename) : ''

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'flex-start',
        }}
      >
        {children}
        <Stack direction="column" spacing={2} sx={{ width: '35rem', flexShrink: 0 }}>
          <Input
            value={filename}
            readOnly
            placeholder="Filename"
            title="Filename (read-only)"
          />
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
          <Input
            value={editedItem?.thumb_caption ?? ''}
            onChange={(e) => updateItem((prev: RawXmlItem | null) => prev ? { ...prev, thumb_caption: e.target.value } : null)}
            placeholder="Caption"
            title="Caption (thumb_caption)"
          />
          <Textarea
            value={editedItem?.photo_desc ?? ''}
            onChange={(e) => updateItem((prev: RawXmlItem | null) => prev ? { ...prev, photo_desc: e.target.value } : null)}
            placeholder="Description"
            title="Description (photo_desc)"
            minRows={2}
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
                const lat = e.target.value
                updateItem((prev: RawXmlItem | null) => prev ? {
                  ...prev,
                  geo: lat || prev.geo?.lon ? { lat, lon: prev.geo?.lon || '', accuracy: prev.geo?.accuracy || '' } : undefined,
                } : null)
              }}
              placeholder="Latitude"
              title="Latitude (geo.lat)"
              type="number"
              sx={{ flex: 1, minWidth: 0 }}
            />
            <Input
              value={editedItem?.geo?.lon ?? ''}
              onChange={(e) => {
                const lon = e.target.value
                updateItem((prev: RawXmlItem | null) => prev ? {
                  ...prev,
                  geo: lon || prev.geo?.lat ? { lat: prev.geo?.lat || '', lon, accuracy: prev.geo?.accuracy || '' } : undefined,
                } : null)
              }}
              placeholder="Longitude"
              title="Longitude (geo.lon)"
              type="number"
              sx={{ flex: 1, minWidth: 0 }}
            />
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
          </Stack>
          <Button onClick={generateXml} variant="solid" color="primary">
            Generate XML
          </Button>
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
      </Stack>
    </>
  )
}
