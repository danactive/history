import Button from '@mui/joy/Button'
import Input from '@mui/joy/Input'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import Textarea from '@mui/joy/Textarea'
import { useEffect, useState } from 'react'
import xml2js from 'xml2js'

import type { Gallery, ItemReferenceSource, RawXmlAlbum, RawXmlItem } from '../../types/common'
import { type XmlItemState } from './AdminAlbumClient'

const REFERENCE_SOURCES: ItemReferenceSource[] = ['facebook', 'google', 'instagram', 'wikipedia', 'youtube']

export default function Fields(
  { xmlAlbum, gallery, item, children }:
  { xmlAlbum: RawXmlAlbum | undefined, gallery: Gallery, item: XmlItemState, children: React.ReactElement },
) {
  const [editedItem, setEditedItem] = useState<RawXmlItem | null>(item)
  const [xmlOutput, setXmlOutput] = useState<string>('')

  useEffect(() => {
    setEditedItem(item)
    setXmlOutput('')
  }, [item])

  const generateXml = () => {
    if (!editedItem || !xmlAlbum) return

    // Get all items from XML
    const items = xmlAlbum.album.item ? (Array.isArray(xmlAlbum.album.item) ? xmlAlbum.album.item : [xmlAlbum.album.item]) : []

    // Update the edited item in the list
    const itemIndex = items.findIndex(i => i?.$.id === editedItem.$.id)
    if (itemIndex !== -1) {
      items[itemIndex] = editedItem
    }

    // Build XML album structure
    const xmlOutput = {
      meta: xmlAlbum.album.meta,
      item: items.length === 1 ? items[0] : items,
    }

    // Convert to XML
    const builder = new xml2js.Builder({
      rootName: 'album',
      renderOpts: { pretty: true, indent: '\t' },
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    })

    const xml = builder.buildObject(xmlOutput)
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
          />
          <Input
            value={editedItem?.photo_city ?? ''}
            onChange={(e) => setEditedItem(prev => prev ? { ...prev, photo_city: e.target.value } : null)}
            placeholder="City"
          />
          <Input
            value={editedItem?.photo_loc ?? ''}
            onChange={(e) => setEditedItem(prev => prev ? { ...prev, photo_loc: e.target.value } : null)}
            placeholder="Location"
          />
          <Input
            value={editedItem?.thumb_caption ?? ''}
            onChange={(e) => setEditedItem(prev => prev ? { ...prev, thumb_caption: e.target.value } : null)}
            placeholder="Caption"
          />
          <Textarea
            value={editedItem?.photo_desc ?? ''}
            onChange={(e) => setEditedItem(prev => prev ? { ...prev, photo_desc: e.target.value } : null)}
            placeholder="Description"
            minRows={2}
          />
          <Input
            value={editedItem?.search ?? ''}
            onChange={(e) => setEditedItem(prev => prev ? { ...prev, search: e.target.value } : null)}
            placeholder="Search keywords"
          />
          <Stack direction="row" spacing={1}>
            <Input
              value={editedItem?.geo?.lat ?? ''}
              onChange={(e) => {
                const lat = e.target.value
                setEditedItem(prev => prev ? {
                  ...prev,
                  geo: lat || prev.geo?.lon ? { lat, lon: prev.geo?.lon || '', accuracy: prev.geo?.accuracy || '' } : undefined,
                } : null)
              }}
              placeholder="Latitude"
              type="number"
              sx={{ flex: 1, minWidth: 0 }}
            />
            <Input
              value={editedItem?.geo?.lon ?? ''}
              onChange={(e) => {
                const lon = e.target.value
                setEditedItem(prev => prev ? {
                  ...prev,
                  geo: lon || prev.geo?.lat ? { lat: prev.geo?.lat || '', lon, accuracy: prev.geo?.accuracy || '' } : undefined,
                } : null)
              }}
              placeholder="Longitude"
              type="number"
              sx={{ flex: 1, minWidth: 0 }}
            />
            <Input
              value={editedItem?.geo?.accuracy ?? ''}
              onChange={(e) => {
                const accuracy = e.target.value
                setEditedItem(prev => prev ? {
                  ...prev,
                  geo: prev.geo ? { ...prev.geo, accuracy } : undefined,
                } : null)
              }}
              placeholder="Accuracy"
              type="number"
              sx={{ flex: 0.6, minWidth: 0 }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Select
              value={editedItem?.ref?.source ?? ''}
              onChange={(_, value) => {
                setEditedItem(prev => prev ? {
                  ...prev,
                  ref: value ? { source: value as ItemReferenceSource, name: prev.ref?.name || '' } : undefined,
                } : null)
              }}
              placeholder="Reference Source"
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
                setEditedItem(prev => prev ? {
                  ...prev,
                  ref: prev.ref?.source ? { source: prev.ref.source, name } : undefined,
                } : null)
              }}
              placeholder="Reference Name"
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
