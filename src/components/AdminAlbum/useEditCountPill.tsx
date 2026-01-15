import Chip from '@mui/joy/Chip'
import type { JSX } from 'react'
import { useState } from 'react'
import type { RawXmlItem } from '../../types/common'

export type EditCountPillHook = {
  EditCountPill: () => JSX.Element | null
  editedItems: Record<string, RawXmlItem>
  handleItemUpdate: (updatedItem: RawXmlItem) => void
  handleXmlGenerated: () => void
  getItemWithEdits: (itemToGet: RawXmlItem | null) => RawXmlItem | null
  clearEdits: () => void
  applyEditsToItems: (items: RawXmlItem[]) => RawXmlItem[]
}

export function useEditCountPill(): EditCountPillHook {
  // Store edits for all items by ID - persist across photo switches
  const [editedItems, setEditedItems] = useState<Record<string, RawXmlItem>>({})
  // Track edits made since last XML generation
  const [editsSinceGeneration, setEditsSinceGeneration] = useState<Set<string>>(new Set())

  const handleItemUpdate = (updatedItem: RawXmlItem) => {
    setEditedItems(prev => ({
      ...prev,
      [updatedItem.$.id]: updatedItem,
    }))
    // Track this item as edited since last generation
    setEditsSinceGeneration(prev => new Set(prev).add(updatedItem.$.id))
  }

  const handleXmlGenerated = () => {
    // Reset the counter of edits since generation, but keep the actual edits
    setEditsSinceGeneration(new Set())
  }

  const clearEdits = () => {
    setEditedItems({})
    setEditsSinceGeneration(new Set())
  }

  // Get item with edits applied if they exist
  const getItemWithEdits = (itemToGet: RawXmlItem | null): RawXmlItem | null => {
    if (!itemToGet) return null
    return editedItems[itemToGet.$.id] || itemToGet
  }

  // Helper to remove empty/null/undefined properties recursively
  const removeEmpty = (obj: any): any => {
    if (obj === null || obj === undefined || obj === '') return undefined
    if (typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(removeEmpty).filter((v) => v !== undefined)

    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeEmpty(value)
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined
  }

  // Apply all edits from editedItems state and maintain proper field ordering
  const applyEditsToItems = (items: RawXmlItem[]): RawXmlItem[] => {
    return items.map((originalItem: RawXmlItem) => {
      const edited = editedItems[originalItem.$.id]
      if (!edited) return originalItem

      // Reconstruct item with desired field order: search before geo
      const { search, geo, ref, ...rest } = edited
      const orderedItem = {
        ...rest,
        ...(search !== undefined && search !== null && search !== '' && { search }),
        ...(geo && { geo }),
        ...(ref && { ref }),
      }

      // Remove empty properties
      return removeEmpty(orderedItem)
    }).filter((item) => item !== undefined)
  }

  const EditCountPill = () => {
    const count = editsSinceGeneration.size
    if (count === 0) return null

    return (
      <Chip
        color="primary"
        size="lg"
        variant="solid"
        sx={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          fontSize: '1rem',
          paddingX: '1.5rem',
          paddingY: '0.75rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: count > 0 ? 'pulse 0.3s ease-in-out' : 'none',
          '@keyframes pulse': {
            '0%': { transform: 'translateX(-50%) scale(1)' },
            '50%': { transform: 'translateX(-50%) scale(1.1)' },
            '100%': { transform: 'translateX(-50%) scale(1)' },
          },
        }}
      >
        {count} {count === 1 ? 'photo edited' : 'photos edited'}
      </Chip>
    )
  }

  return { EditCountPill, editedItems, handleItemUpdate, handleXmlGenerated, getItemWithEdits, clearEdits, applyEditsToItems }
}
