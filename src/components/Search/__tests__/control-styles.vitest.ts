import { describe, expect, test } from 'vitest'

import { popupListSx, selectButtonSx } from '../control-styles'

describe('search control styles', () => {
  test('uses the marker palette for active popup options', () => {
    expect(popupListSx['--variant-plainHoverBg']).toBe('rgba(52, 58, 68, 0.98)')
    expect(popupListSx['--variant-plainActiveBg']).toBe('color-mix(in srgb, var(--map-marker-active) 55%, transparent)')
    expect(popupListSx['& .MuiOption-root.MuiOption-highlighted:not([aria-selected="true"])']).toEqual({
      backgroundColor: 'rgba(52, 58, 68, 0.98)',
      color: 'rgba(255, 255, 255, 0.96)',
    })
    expect(popupListSx['& [role="option"][aria-selected="true"]']).toEqual({
      backgroundColor: 'color-mix(in srgb, var(--map-marker-active) 45%, transparent)',
      color: 'rgba(255, 255, 255, 0.96)',
    })
    expect(popupListSx['& [role="option"][aria-selected="true"]:hover, & [role="option"][aria-selected="true"].Mui-focused']).toEqual({
      backgroundColor: 'color-mix(in srgb, var(--map-marker-active) 62%, transparent)',
      color: 'rgba(255, 255, 255, 0.98)',
    })
  })

  test('keeps select control hover on the shared dark field surface', () => {
    expect(selectButtonSx['--variant-softHoverBg']).toBe('rgba(38, 43, 50, 0.96)')
    expect(selectButtonSx['--variant-softActiveBg']).toBe('rgba(44, 49, 57, 0.98)')
    expect(selectButtonSx['&:hover']).toEqual({
      backgroundColor: 'rgba(38, 43, 50, 0.96)',
    })
  })
})
