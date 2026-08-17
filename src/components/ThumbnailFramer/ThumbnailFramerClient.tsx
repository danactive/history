'use client'

import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { FilesystemResponseBody } from '../../lib/filesystems'
import config from '../../models/config'
import type { Filesystem } from '../../models/filesystems'
import { getThumbnailCrop, getThumbnailCropPanRange } from '../../utils/thumbnail-crop'
import styles from './styles.module.css'

const MAX_ZOOM = 4

type ImageSize = { width: number, height: number }
type DragStart = {
  pointerId: number
  clientX: number
  clientY: number
  positionX: number
  positionY: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function getPhotoFolder(sourceFolder: string) {
  return sourceFolder.replace(/\/originals\/?$/, '/photos')
}

function isSupportedPhoto(file: Filesystem) {
  return file.mediumType === 'image'
    && config.supportedFileTypes.photo.includes(file.ext.toLowerCase())
}

function errorMessage(body: unknown) {
  if (
    body && typeof body === 'object' && 'error' in body
    && body.error && typeof body.error === 'object' && 'message' in body.error
    && typeof body.error.message === 'string'
  ) {
    return body.error.message
  }
  return 'Could not save thumbnail'
}

function ThumbnailFrame(
  { file, sourceFolder }:
  { file: Filesystem, sourceFolder: string },
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragRef = useRef<DragStart | null>(null)
  const [imageSize, setImageSize] = useState<ImageSize | null>(null)
  const [zoom, setZoom] = useState(1)
  const [positionX, setPositionX] = useState(0.5)
  const [positionY, setPositionY] = useState(0.5)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  const thumbnailDimensions = config.resizeDimensions.thumb
  const crop = useMemo(() => {
    if (!imageSize) return null
    return getThumbnailCrop({
      sourceWidth: imageSize.width,
      sourceHeight: imageSize.height,
      targetWidth: thumbnailDimensions.width,
      targetHeight: thumbnailDimensions.height,
      zoom,
      positionX,
      positionY,
    })
  }, [imageSize, positionX, positionY, thumbnailDimensions.height, thumbnailDimensions.width, zoom])

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !crop) return

    const rect = canvas.getBoundingClientRect()
    const devicePixelRatio = window.devicePixelRatio || 1
    canvas.width = Math.round(rect.width * devicePixelRatio)
    canvas.height = Math.round(rect.height * devicePixelRatio)

    const context = canvas.getContext('2d')
    if (!context) return
    context.scale(devicePixelRatio, devicePixelRatio)
    context.drawImage(
      image,
      crop.left,
      crop.top,
      crop.width,
      crop.height,
      0,
      0,
      rect.width,
      rect.height,
    )
  }, [crop])

  useEffect(() => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      imageRef.current = image
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.src = encodeURI(file.absolutePath)

    return () => {
      imageRef.current = null
    }
  }, [file.absolutePath])

  useEffect(() => {
    drawPreview()
  }, [drawPreview])

  const updatePositionFromPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    const canvas = canvasRef.current
    if (!drag || !canvas || !imageSize || !crop) return

    const rect = canvas.getBoundingClientRect()
    const panRange = getThumbnailCropPanRange(crop, imageSize.width, imageSize.height)
    const sourceDeltaX = ((event.clientX - drag.clientX) * crop.width) / rect.width
    const sourceDeltaY = ((event.clientY - drag.clientY) * crop.height) / rect.height

    setPositionX(panRange.x === 0
      ? 0.5
      : clamp(drag.positionX - (sourceDeltaX / panRange.x), 0, 1))
    setPositionY(panRange.y === 0
      ? 0.5
      : clamp(drag.positionY - (sourceDeltaY / panRange.y), 0, 1))
    setSaveState('idle')
    setSaveError(null)
  }

  const resetFraming = () => {
    setZoom(1)
    setPositionX(0.5)
    setPositionY(0.5)
    setSaveState('idle')
    setSaveError(null)
  }

  const save = async () => {
    setSaveState('saving')
    setSaveError(null)
    try {
      const response = await fetch('/api/admin/thumbs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_folder: sourceFolder,
          filename: file.filename,
          zoom,
          position_x: positionX,
          position_y: positionY,
        }),
      })
      const body: unknown = await response.json()
      if (!response.ok) {
        throw new Error(errorMessage(body))
      }
      setSaveState('saved')
    } catch (error) {
      setSaveState('error')
      setSaveError(error instanceof Error ? error.message : 'Could not save thumbnail')
    }
  }

  return (
    <article className={styles.card}>
      <h2 className={styles.filename}>{file.filename}</h2>
      <canvas
        ref={canvasRef}
        className={styles.preview}
        aria-label={`Thumbnail framing preview for ${file.filename}. Drag to pan.`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          dragRef.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            positionX,
            positionY,
          }
        }}
        onPointerMove={updatePositionFromPointer}
        onPointerUp={(event) => {
          if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
        }}
        onPointerCancel={() => { dragRef.current = null }}
      />
      <label className={styles.zoomLabel} htmlFor={`zoom-${file.id}`}>
        Zoom <span>{zoom.toFixed(1)}×</span>
      </label>
      <input
        id={`zoom-${file.id}`}
        className={styles.zoom}
        type="range"
        min="1"
        max={MAX_ZOOM}
        step="0.1"
        value={zoom}
        onChange={(event) => {
          setZoom(Number(event.target.value))
          setSaveState('idle')
          setSaveError(null)
        }}
      />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={resetFraming}
          sx={{
            color: '#d8dde3',
            borderColor: '#64707c',
            '&:hover': { backgroundColor: '#343b43', borderColor: '#8b99a7' },
          }}
        >
          Reset
        </Button>
        <Button
          size="sm"
          onClick={save}
          loading={saveState === 'saving'}
          disabled={!imageSize}
          sx={{
            backgroundColor: '#1475ba',
            color: '#fff',
            '&:hover': { backgroundColor: '#2490db' },
          }}
        >
          Save thumbnail
        </Button>
        {saveState === 'saved' && <span className={styles.saved}>Saved</span>}
      </Stack>
      {saveError && <p className={styles.error}>{saveError}</p>}
    </article>
  )
}

export default function ThumbnailFramerClient({ sourceFolder }: { sourceFolder?: string }) {
  const [files, setFiles] = useState<Filesystem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isOriginalsFolder = Boolean(sourceFolder && /\/originals\/?$/.test(sourceFolder))
  const photoFolder = sourceFolder ? getPhotoFolder(sourceFolder) : ''

  useEffect(() => {
    if (!isOriginalsFolder || !photoFolder) return

    let active = true
    setFiles(null)
    setError(null)
    fetch(`/api/admin/filesystems?path=${encodeURIComponent(photoFolder)}`)
      .then(async (response) => {
        const body = await response.json() as FilesystemResponseBody & { error?: { message: string } }
        if (!response.ok || body.error) {
          throw new Error(body.error?.message || 'Could not load resized photos')
        }
        return body.files.filter(isSupportedPhoto)
      })
      .then((nextFiles) => {
        if (active) setFiles(nextFiles)
      })
      .catch((nextError: unknown) => {
        if (active) setError(nextError instanceof Error ? nextError.message : 'Could not load resized photos')
      })

    return () => { active = false }
  }, [isOriginalsFolder, photoFolder])

  if (!sourceFolder) {
    return <p>Open an originals folder in Walk, then choose “Resize &amp; frame thumbs”.</p>
  }

  if (!isOriginalsFolder) {
    return <p>Thumbnail framing needs an <code>originals</code> folder selected in Walk.</p>
  }

  if (error) return <p className={styles.error}>{error}</p>
  if (!files) return <p>Loading resized photos…</p>
  if (files.length === 0) return <p>No resized JPEG photos are available. Run the Walk resize step first.</p>

  return (
    <section>
      <header className={styles.header}>
        <h1>Frame thumbnails</h1>
        <p>Drag each preview to pan, use zoom for a tighter crop, then save that 185 × 45 JPEG thumbnail.</p>
      </header>
      <div className={styles.grid}>
        {files.map(file => <ThumbnailFrame key={file.id} file={file} sourceFolder={sourceFolder} />)}
      </div>
    </section>
  )
}
