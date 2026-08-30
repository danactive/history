import { describe, expect, test } from 'vitest'

import config from '../../../models/config'
import type { AssetStripAddress } from '../../../lib/admin/assets'
import { assetStripHash, assetStripKey, parseAssetStripHash } from '../hash'

describe('admin asset strip hashes', () => {
  test('round-trips a gallery and filename safely', () => {
    const address: AssetStripAddress = { gallery: config.defaultGallery, filename: '2024 test #1.jpg' }
    const hash = assetStripHash(address)
    const parsedAddress = parseAssetStripHash(hash)

    expect(hash).toBe(`#${config.defaultGallery}/2024%20test%20%231.jpg`)
    expect(parsedAddress).toEqual(address)
    expect(parsedAddress).not.toBeNull()
    if (parsedAddress) {
      expect(assetStripKey(parsedAddress)).toBe(assetStripKey(address))
    }
  })

  test('rejects incomplete or malformed hashes', () => {
    expect(parseAssetStripHash('#demo')).toBeNull()
    expect(parseAssetStripHash('#demo/%E0%A4%A')).toBeNull()
  })
})
