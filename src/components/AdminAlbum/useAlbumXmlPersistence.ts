import { useCallback, useState } from 'react'

import { buildEditedAlbumXml } from '../../models/album-xml'
import type { AlbumName, Gallery, RawXmlAlbum } from '../../types/common'
import type { EditCountPillHook } from './useEditCountPill'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type UseAlbumXmlPersistenceOptions = {
  gallery: Gallery
  album: AlbumName
  xmlAlbum: RawXmlAlbum | undefined
  applyEditsToItems: EditCountPillHook['applyEditsToItems']
  onXmlGenerated: EditCountPillHook['handleXmlGenerated']
}

function useAlbumXmlPersistence({
  gallery,
  album,
  xmlAlbum,
  applyEditsToItems,
  onXmlGenerated,
}: UseAlbumXmlPersistenceOptions) {
  const [xmlOutput, setXmlOutput] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState('')

  const resetXmlOutput = useCallback(() => {
    setXmlOutput('')
    setSaveStatus('idle')
    setSaveError('')
  }, [])

  const generateXml = useCallback(() => {
    if (!xmlAlbum) return

    const items = xmlAlbum.album.item
      ? (Array.isArray(xmlAlbum.album.item) ? xmlAlbum.album.item : [xmlAlbum.album.item])
      : []
    const updatedItems = applyEditsToItems(items)
    const xml = buildEditedAlbumXml(xmlAlbum, updatedItems)

    setXmlOutput(xml)
    setSaveStatus('idle')
    setSaveError('')
    onXmlGenerated()
  }, [applyEditsToItems, onXmlGenerated, xmlAlbum])

  const saveXml = useCallback(async () => {
    if (!xmlOutput) return

    setSaveStatus('saving')
    setSaveError('')
    try {
      const response = await fetch(`/api/admin/xml/${encodeURIComponent(gallery)}/${encodeURIComponent(album)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml: xmlOutput }),
      })

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined)
        const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
          ? body.error
          : 'Failed to save XML'
        throw new Error(message)
      }

      setSaveStatus('saved')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save XML')
      setSaveStatus('error')
    }
  }, [album, gallery, xmlOutput])

  return {
    xmlOutput,
    saveStatus,
    saveError,
    generateXml,
    saveXml,
    resetXmlOutput,
  }
}

export { useAlbumXmlPersistence, type SaveStatus }
