import { describe, expect, test } from 'vitest'

import { mapMarkerUi } from '../components/SlippyMap/marker-theme'
import { themeMui } from '../theme'

describe('theme primary palette', () => {
  test('uses the shared map-marker colors for primary controls', () => {
    for (const colorScheme of [themeMui.colorSchemes.dark, themeMui.colorSchemes.light]) {
      const primary = colorScheme.palette.primary

      expect(primary.solidBg).toBe(mapMarkerUi.active)
      expect(primary.solidHoverBg).toBe(mapMarkerUi.hover)
      expect(primary.solidActiveBg).toBe(mapMarkerUi.pressed)
      expect(primary.outlinedBorder).toBe(mapMarkerUi.primary)
      expect(primary[500]).toBe(mapMarkerUi.active)
    }
  })
})
