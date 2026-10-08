import type { RawXmlItem } from '../../types/common'
import { primaryFilename, type CurationRow, type Suggestion } from './model'

export function exactItem(items: RawXmlItem[], itemId?: string, filename?: string) {
  const matches = items.map((item, index) => ({ item, index }))
    .filter(({ item }) => item.$.id === itemId && primaryFilename(item.filename) === filename)
  return matches.length === 1 ? matches[0] : null
}

export function stageSuggestion(row: CurationRow, suggestion: Suggestion, items: RawXmlItem[], revision: string, edited?: RawXmlItem | null) {
  const target = exactItem(items, row.source.itemId, row.source.filename)
  if (!target || revision !== row.source.revision || target.item[suggestion.field] !== suggestion.original) {
    throw new Error('This suggestion is stale. Recheck the finding and reload the album before accepting it.')
  }
  if (edited && edited[suggestion.field] !== suggestion.original) {
    throw new Error('This field already has a pending edit. Review it manually before accepting another suggestion.')
  }
  return { ...(edited ?? target.item), [suggestion.field]: suggestion.proposed }
}
