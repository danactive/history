import Button from '@mui/joy/Button'
import Input from '@mui/joy/Input'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import Textarea from '@mui/joy/Textarea'
import { useEffect, useState } from 'react'
import xml2js from 'xml2js'

import { type AlbumResponseBody } from '../../lib/album'
import type { Item } from '../../types/common'
import { type ItemState } from './AdminAlbumClient'
import Xml from './Xml'

export default function Fields(
  { albumEntity, item, children }:
  { albumEntity: AlbumResponseBody['album'] | undefined, item: ItemState, children: React.ReactElement },
) {
  const [editedItem, setEditedItem] = useState<Item | null>(item)
  const [xmlOutput, setXmlOutput] = useState<string>('')

  useEffect(() => {
    setEditedItem(item)
    setXmlOutput('')
  }, [item])

  const handleFieldChange = (field: keyof Item, value: string) => {
    if (editedItem) {
      setEditedItem({ ...editedItem, [field]: value })
    }
  }

  const generateXml = () => {
    if (!editedItem || !albumEntity) return

    // Create a copy of the album with the updated item
    const updatedAlbum = { ...albumEntity }
    const items = [...updatedAlbum.items]
    const itemIndex = items.findIndex(i => i?.filename === editedItem.filename)

    if (itemIndex !== -1) {
      items[itemIndex] = editedItem
    }

    // Convert to XML - need to transform back to XML format with snake_case fields
    const xmlItems = items.map(item => {
      const filename = Array.isArray(item.filename) ? item.filename[0] : item.filename
      const isVideo = filename.toLowerCase().endsWith('.mp4') ||
                      filename.toLowerCase().endsWith('.mov') ||
                      filename.toLowerCase().endsWith('.avi')

      const xmlItem: any = {
        $: { id: item.id },
      }

      if (isVideo) xmlItem.type = 'video'

      xmlItem.filename = item.filename
      xmlItem.photo_city = item.city

      if (item.location) xmlItem.photo_loc = item.location

      // Strip "Video: " prefix from caption if it's a video
      let caption = item.caption
      if (isVideo && caption.startsWith('Video: ')) {
        caption = caption.substring(7)
      }
      xmlItem.thumb_caption = caption

      if (item.description) xmlItem.photo_desc = item.description
      if (item.search) xmlItem.search = item.search

      if (item.coordinates) {
        xmlItem.geo = {
          lat: item.coordinates[1].toString(),
          lon: item.coordinates[0].toString(),
        }
        if (item.coordinateAccuracy) {
          xmlItem.geo.accuracy = item.coordinateAccuracy.toString()
        }
      }

      if (item.reference && item.reference[0] && item.reference[1]) {
        // item.reference is [url, name] - need to extract source type from URL
        const url = item.reference[0]
        const name = item.reference[1]

        let source = 'wikipedia' // default
        if (url.includes('facebook.com')) source = 'facebook'
        else if (url.includes('google.com')) source = 'google'
        else if (url.includes('instagram.com')) source = 'instagram'
        else if (url.includes('wikipedia.org')) source = 'wikipedia'
        else if (url.includes('youtube.com')) source = 'youtube'

        xmlItem.ref = {
          name,
          source,
        }
      }

      return xmlItem
    })

    // Transform meta to XML format with snake_case
    const xmlMeta = {
      gallery: updatedAlbum.meta.gallery,
      album_name: updatedAlbum.meta.albumName,
      album_version: updatedAlbum.meta.albumVersion,
      marker_zoom: updatedAlbum.meta.geo?.zoom.toString(),
      cluster_max_zoom: updatedAlbum.meta.clusterMaxZoom,
    }

    const xmlAlbum = {
      meta: xmlMeta,
      item: xmlItems.length === 1 ? xmlItems[0] : xmlItems,
    }

    // Convert to XML
    const builder = new xml2js.Builder({
      rootName: 'album',
      renderOpts: { pretty: true, indent: '\t' },
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    })

    const xml = builder.buildObject(xmlAlbum)
    setXmlOutput(xml)
  }

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
        <Stack direction="column" spacing={2} sx={{ flex: 1 }}>
          <Input
            value={editedItem?.filename ?? ''}
            readOnly
            placeholder="Filename"
          />
          <Input
            value={editedItem?.city ?? ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="City"
          />
          <Input
            value={editedItem?.location ?? ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="Location"
          />
          <Input
            value={editedItem?.caption ?? ''}
            onChange={(e) => handleFieldChange('caption', e.target.value)}
            placeholder="Caption"
          />
          <Textarea
            value={editedItem?.description ?? ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Description"
            minRows={2}
          />
          <Input
            value={editedItem?.search ?? ''}
            onChange={(e) => handleFieldChange('search', e.target.value)}
            placeholder="Search keywords"
          />
          <Stack direction="row" spacing={1}>
            <Input
              value={editedItem?.coordinates?.[0]?.toString() ?? ''}
              onChange={(e) => {
                const lat = parseFloat(e.target.value) || null
                const lon = editedItem?.coordinates?.[1] ?? null
                setEditedItem(prev => prev ? { ...prev, coordinates: lat !== null && lon !== null ? [lat, lon] : null } : null)
              }}
              placeholder="Latitude"
              type="number"
              sx={{ flex: 1, minWidth: 0 }}
            />
            <Input
              value={editedItem?.coordinates?.[1]?.toString() ?? ''}
              onChange={(e) => {
                const lon = parseFloat(e.target.value) || null
                const lat = editedItem?.coordinates?.[0] ?? null
                setEditedItem(prev => prev ? { ...prev, coordinates: lat !== null && lon !== null ? [lat, lon] : null } : null)
              }}
              placeholder="Longitude"
              type="number"
              sx={{ flex: 1, minWidth: 0 }}
            />
            <Input
              value={editedItem?.coordinateAccuracy?.toString() ?? ''}
              onChange={(e) => {
                const accuracy = parseFloat(e.target.value) || null
                setEditedItem(prev => prev ? { ...prev, coordinateAccuracy: accuracy } : null)
              }}
              placeholder="Accuracy"
              type="number"
              sx={{ flex: 0.6, minWidth: 0 }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Select
              value={(() => {
                const url = editedItem?.reference?.[0] ?? ''
                if (url.includes('facebook.com')) return 'facebook'
                if (url.includes('google.com')) return 'google'
                if (url.includes('instagram.com')) return 'instagram'
                if (url.includes('youtube.com')) return 'youtube'
                if (url.includes('wikipedia.org')) return 'wikipedia'
                return ''
              })()}
              onChange={(_, value) => {
                if (!value) {
                  setEditedItem(prev => prev ? { ...prev, reference: null } : null)
                  return
                }
                const name = editedItem?.reference?.[1] ?? ''
                const baseUrls: Record<string, string> = {
                  facebook: 'https://www.facebook.com/',
                  google: 'https://www.google.com/search?q=',
                  instagram: 'https://www.instagram.com/',
                  wikipedia: 'https://en.wikipedia.org/wiki/',
                  youtube: 'https://www.youtube.com/watch?v=',
                }
                const url = baseUrls[value] + name
                setEditedItem(prev => prev ? { ...prev, reference: name ? [url, name] : null } : null)
              }}
              placeholder="Reference Source"
              sx={{ flex: 1, minWidth: 0 }}
            >
              <Option value="">None</Option>
              <Option value="facebook">Facebook</Option>
              <Option value="google">Google</Option>
              <Option value="instagram">Instagram</Option>
              <Option value="wikipedia">Wikipedia</Option>
              <Option value="youtube">YouTube</Option>
            </Select>
            <Input
              value={editedItem?.reference?.[1] ?? ''}
              onChange={(e) => {
                const name = e.target.value
                const url = editedItem?.reference?.[0] ?? ''
                setEditedItem(prev => prev ? { ...prev, reference: name || url ? [url, name] : null } : null)
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
          <Xml jsonBlob={JSON.stringify(albumEntity, null, 2)} />
        </Stack>
      </Stack>
    </>
  )
}
