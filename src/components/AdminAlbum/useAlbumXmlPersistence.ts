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
  curationRevision?: string
  curationReview?: boolean
  onRevisionSaved?: (revision: string) => void
}

function useAlbumXmlPersistence({
  gallery,
  album,
  xmlAlbum,
  applyEditsToItems,
  onXmlGenerated,
  curationRevision,
  curationReview,
  onRevisionSaved,
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
        body: JSON.stringify({ xml: xmlOutput, ...(curationReview ? { expectedRevision: curationRevision, curationReview: true } : {}) }),
      })

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined)
        const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
          ? body.error
          : 'Failed to save XML'
        throw new Error(message)
      }

      if (curationReview) {
        const result = await response.json()
        if (result.revision) onRevisionSaved?.(result.revision)
        if (result.verificationError) setSaveError(result.verificationError)
      }
      setSaveStatus('saved')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save XML')
      setSaveStatus('error')
    }
  }, [album, gallery, xmlOutput, curationReview, curationRevision, onRevisionSaved])

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
