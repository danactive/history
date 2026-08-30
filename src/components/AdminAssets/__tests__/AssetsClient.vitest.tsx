import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={typeof props.alt === 'string' ? props.alt : ''} />
  ),
}))

import { assetKinds, type AssetKind, type AssetStripItem } from '../../../lib/admin/assets'
import { rasterAssetKinds } from '../../../lib/paths'
import AdminAssetsClient from '../AssetsClient'
import styles from '../styles.module.css'

const firstAssetKinds: readonly AssetKind[] = rasterAssetKinds
const secondAssetKinds: readonly AssetKind[] = assetKinds

const items: AssetStripItem[] = [
  {
    gallery: 'demo',
    filename: 'first.jpg',
    assets: firstAssetKinds.map(kind => ({
      kind,
      label: kind[0].toUpperCase() + kind.slice(1),
      src: `/${kind}/first.jpg`,
      available: true,
      dimensions: { width: 100, height: 50 },
    })),
  },
  {
    gallery: 'demo',
    filename: 'second.mp4',
    assets: secondAssetKinds.map(kind => ({
      kind,
      label: kind[0].toUpperCase() + kind.slice(1),
      src: `/${kind}/second.${kind === 'video' ? 'mp4' : 'jpg'}`,
      available: true,
      dimensions: { width: 200, height: 100 },
    })),
  },
]

describe('AdminAssetsClient', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/admin/assets')
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items }),
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('moves horizontally by filename and keeps the hash in sync', async () => {
    render(<AdminAssetsClient addresses={items} />)

    await waitFor(() => expect(window.location.hash).toBe('#demo/first.jpg'))
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    await waitFor(() => expect(window.location.hash).toBe('#demo/second.mp4'))
    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth', left: 1048,
    })
  })

  test('restores the focused filename strip from the hash', async () => {
    window.history.replaceState(null, '', '/admin/assets#demo/second.mp4')
    render(<AdminAssetsClient addresses={items} />)

    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'second.mp4demo' })).toHaveClass(styles.active)
    })
  })

  test('includes the fourth video preview after the raster assets', async () => {
    render(<AdminAssetsClient addresses={items} />)

    const secondStrip = screen.getByRole('region', { name: 'second.mp4demo' })
    await waitFor(() => expect(secondStrip.querySelector('video')).toBeTruthy())
    const captions = Array.from(secondStrip.querySelectorAll('figcaption strong')).map(element => element.textContent)

    expect(captions).toEqual(['Original', 'Photo', 'Thumb', 'Video'])
    expect(secondStrip.querySelector('video')).toHaveAttribute('src', '/video/second.mp4')
  })

  test('uses the fetched dimensions when static album metadata has no size', async () => {
    const addresses = items.map(item => ({
      gallery: item.gallery,
      filename: item.filename,
      assetDimensionCaptions: [null, null, '185 × 45 px'],
    }))
    render(<AdminAssetsClient addresses={addresses} />)

    const firstStrip = screen.getByRole('region', { name: 'first.jpgdemo' })
    await waitFor(() => expect(firstStrip.querySelector('figcaption span')?.textContent).toBe('100 × 50 px'))
  })
})
