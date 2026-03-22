import type { Item } from '../types/common'

const DEFAULT_XML_START_ID = 100

function formatIdPrefix(filename: Extract<Item['filename'], string>) {
  const [year, month, day] = filename.split('-')
  if (year.length !== 4 || Number.isNaN(Number(year))) return ''
  return `${month.padStart(2, '0')}${day.padStart(2, '0')}`
}

function formatIdSuffix(suffix: number): string {
  if (suffix >= 100) return suffix.toString().slice(1)
  return suffix.toString()
}

function formatId(filename: string, i: number, xmlStartPhotoId: number) {
  if (formatIdPrefix(filename) === '') return (xmlStartPhotoId + i).toString()
  return formatIdPrefix(filename) + formatIdSuffix(xmlStartPhotoId + i)
}

export type AlbumXmlItem = {
  base: string
  filename: string
  isVideo: boolean
  /** When provided (exact mode), use this id instead of formatId */
  id?: string
}

/**
 * Build album XML from a list of items.
 * @param {AlbumXmlItem[]} items Items with base name, output filename, and video flag
 * @param {number} [xmlStartPhotoId] Initial position for id (default 100)
 * @returns {string} XML string for album
 */
export function buildAlbumXml(items: AlbumXmlItem[], xmlStartPhotoId: number = DEFAULT_XML_START_ID): string {
  return items
    .map(({ base, filename, isVideo, id: itemId }, i) => {
      const id = itemId ?? formatId(filename, i, xmlStartPhotoId)
      if (isVideo) {
        return `<item id="${id}"><type>video</type><filename>${base}.mp4</filename><filename>${base}.webm</filename></item>`
      }
      return `<item id="${id}"><filename>${filename}</filename></item>`
    })
    .join('')
}
