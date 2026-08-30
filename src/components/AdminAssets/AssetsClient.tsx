'use client'

import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { AssetBatchResponse, AssetDescriptor, AssetStripAddress, AssetStripItem } from '../../lib/admin/assets'
import Img from '../Img'
import { assetStripHash, assetStripKey, parseAssetStripHash } from './hash'
import styles from './styles.module.css'

const stripGap = 24
const defaultStripWidth = 1024
const stripOverscan = 2

function dimensionsCaption(asset: AssetDescriptor) {
  if (asset.dimensions) return `${asset.dimensions.width} × ${asset.dimensions.height} px`
  return asset.available ? 'Dimensions unavailable' : 'Unavailable at build time'
}

function AssetPreview({ asset, filename }: { asset: AssetDescriptor, filename: string }) {
  if (!asset.available) {
    return <div className={styles.unavailable}>Asset not found at build time</div>
  }

  if (asset.kind === 'video') {
    return (
      <video
        className={styles.media}
        controls
        preload="metadata"
        src={asset.src}
        width={asset.dimensions?.width}
        height={asset.dimensions?.height}
      >
        Your browser does not support this video.
      </video>
    )
  }

  return (
    <Img
      className={styles.media}
      src={asset.src}
      alt={`${asset.label} for ${filename}`}
      width={asset.dimensions?.width}
      height={asset.dimensions?.height}
      loading="lazy"
      sizes="(max-width: 1100px) 100vw, 1024px"
    />
  )
}

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || (target instanceof HTMLElement && target.isContentEditable)
}

export default function AdminAssetsClient({ addresses }: { addresses: AssetStripAddress[] }) {
  const stripListRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [stripWidth, setStripWidth] = useState(defaultStripWidth)
  const [loadedItems, setLoadedItems] = useState<Map<string, AssetStripItem>>(() => new Map())
  const [loadError, setLoadError] = useState<string | null>(null)
  const [visibleRange, setVisibleRange] = useState(() => ({
    start: 0,
    end: Math.min(addresses.length, stripOverscan + 1),
  }))

  const updateVisibleRange = useCallback(() => {
    const stripList = stripListRef.current
    if (!stripList) return

    const nextStripWidth = stripList.clientWidth > 0
      ? Math.min(defaultStripWidth, stripList.clientWidth)
      : defaultStripWidth
    const trackWidth = nextStripWidth + stripGap
    const start = Math.max(0, Math.floor(stripList.scrollLeft / trackWidth) - stripOverscan)
    const end = Math.min(
      addresses.length,
      Math.ceil((stripList.scrollLeft + stripList.clientWidth) / trackWidth) + stripOverscan,
    )
    const nearestIndex = Math.max(0, Math.min(addresses.length - 1, Math.round(stripList.scrollLeft / trackWidth)))

    setStripWidth(previousWidth => previousWidth === nextStripWidth ? previousWidth : nextStripWidth)
    setVisibleRange(previousRange => (
      previousRange.start === start && previousRange.end === end ? previousRange : { start, end }
    ))
    setActiveIndex(previousIndex => previousIndex === nearestIndex ? previousIndex : nearestIndex)
  }, [addresses.length])

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior) => {
    if (!addresses[index]) return

    setActiveIndex(index)
    const stripList = stripListRef.current
    const currentStripWidth = stripList && stripList.clientWidth > 0
      ? Math.min(defaultStripWidth, stripList.clientWidth)
      : stripWidth
    stripList?.scrollTo({
      behavior,
      left: index * (currentStripWidth + stripGap),
    })
  }, [addresses, stripWidth])

  useEffect(() => {
    const selectFromHash = (behavior: ScrollBehavior) => {
      const address = parseAssetStripHash(window.location.hash)
      const matchingIndex = address
        ? addresses.findIndex(item => assetStripKey(item) === assetStripKey(address))
        : -1
      const index = matchingIndex >= 0 ? matchingIndex : 0

      if (addresses[index]) {
        setActiveIndex(index)
        if (matchingIndex >= 0) {
          window.requestAnimationFrame(() => scrollToIndex(index, behavior))
        }
      }
    }

    selectFromHash('auto')
    const onHashChange = () => selectFromHash('smooth')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [addresses, scrollToIndex])

  useEffect(() => {
    if (activeIndex === null || !addresses[activeIndex]) return
    const hash = assetStripHash(addresses[activeIndex])
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash)
    }
  }, [activeIndex, addresses])

  useEffect(() => {
    const stripList = stripListRef.current
    if (!stripList) return

    let frame: number | null = null
    const scheduleUpdate = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        updateVisibleRange()
      })
    }

    updateVisibleRange()
    stripList.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate)
    observer?.observe(stripList)

    return () => {
      stripList.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      observer?.disconnect()
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [updateVisibleRange])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) return
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return

      event.preventDefault()
      const direction = event.key === 'ArrowRight' ? 1 : -1
      const currentIndex = activeIndex ?? 0
      const nextIndex = Math.max(0, Math.min(addresses.length - 1, currentIndex + direction))
      scrollToIndex(nextIndex, 'smooth')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, addresses.length, scrollToIndex])

  useEffect(() => {
    if (visibleRange.start >= visibleRange.end) return

    const controller = new AbortController()
    const loadAssets = async () => {
      try {
        const response = await fetch(
          `/api/admin/assets?start=${visibleRange.start}&end=${visibleRange.end}`,
          { signal: controller.signal },
        )
        const data: AssetBatchResponse = await response.json()
        const items = data.items
        if (!response.ok || !items) throw new Error(data.error ?? 'Unable to load assets')
        if (controller.signal.aborted) return
        setLoadedItems(previousItems => {
          const visibleKeys = new Set(
            addresses
              .slice(visibleRange.start, visibleRange.end)
              .map(assetStripKey),
          )
          const nextItems = new Map(
            [...previousItems].filter(([key]) => visibleKeys.has(key)),
          )
          items.forEach(item => nextItems.set(assetStripKey(item), item))
          return nextItems
        })
        setLoadError(null)
      } catch (error) {
        if (controller.signal.aborted) return
        setLoadError(error instanceof Error ? error.message : 'Unable to load assets')
      }
    }

    void loadAssets()
    return () => controller.abort()
  }, [addresses, visibleRange])

  if (addresses.length === 0) {
    return <div>No assets found.</div>
  }

  const trackWidth = Math.max(0, (addresses.length * (stripWidth + stripGap)) - stripGap)
  const visibleAddresses = addresses.slice(visibleRange.start, visibleRange.end)

  return (
    <Stack className={styles.page} spacing={3}>
      <header>
        <Typography level="h1">Assets</Typography>
        <Typography level="body-sm">Use ← and → to move between filename strips.</Typography>
        {loadError ? <Typography color="danger" level="body-sm">{loadError}</Typography> : null}
      </header>
      <div ref={stripListRef} className={styles.stripList}>
        <div className={styles.stripTrack} style={{ width: trackWidth }}>
        {visibleAddresses.map((address, visibleIndex) => {
          const index = visibleRange.start + visibleIndex
          const key = assetStripKey(address)
          const item = loadedItems.get(key)
          const isActive = index === activeIndex
          return (
            <section
              key={key}
              id={`asset-strip-${index}`}
              className={`${styles.strip} ${isActive ? styles.active : ''}`}
              style={{ left: index * (stripWidth + stripGap), width: stripWidth }}
              tabIndex={-1}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              aria-labelledby={`asset-strip-heading-${index}`}
            >
              <Typography id={`asset-strip-heading-${index}`} level="title-lg" className={styles.filename}>
                {address.filename}
                <span>{address.gallery}</span>
              </Typography>
              <div className={styles.assetStack}>
                {!item ? <div className={styles.unavailable}>Loading assets…</div> : item.assets.map((asset, assetIndex) => (
                  <figure key={asset.kind} className={styles.asset}>
                    <figcaption>
                      <strong>{asset.label}</strong>
                      <span>{address.assetDimensionCaptions?.[assetIndex] ?? dimensionsCaption(asset)}</span>
                    </figcaption>
                    <AssetPreview asset={asset} filename={address.filename} />
                  </figure>
                ))}
              </div>
            </section>
          )
        })}
        </div>
      </div>
    </Stack>
  )
}
