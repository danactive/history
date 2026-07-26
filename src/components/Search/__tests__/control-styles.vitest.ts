import { describe, expect, test } from 'vitest'

import { popupListSx } from '../control-styles'

describe('search control styles', () => {
  test('keeps popup option colors on the darker shared palette', () => {
    expect(popupListSx['--variant-plainHoverBg']).toBe('rgba(52, 58, 68, 0.98)')
    expect(popupListSx['--variant-plainActiveBg']).toBe('rgba(71, 113, 129, 0.62)')
    expect(popupListSx['& .MuiOption-root.MuiOption-highlighted:not([aria-selected="true"])']).toEqual({
      backgroundColor: 'rgba(52, 58, 68, 0.98)',
      color: 'rgba(255, 255, 255, 0.96)',
    })
    expect(popupListSx['& [role="option"][aria-selected="true"]']).toEqual({
      backgroundColor: 'rgba(71, 113, 129, 0.5)',
      color: 'rgba(255, 255, 255, 0.96)',
    })
    expect(popupListSx['& [role="option"][aria-selected="true"]:hover, & [role="option"][aria-selected="true"].Mui-focused']).toEqual({
      backgroundColor: 'rgba(71, 113, 129, 0.68)',
      color: 'rgba(255, 255, 255, 0.98)',
    })
  })
})
