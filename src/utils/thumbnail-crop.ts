export type ThumbnailCrop = {
  left: number
  top: number
  width: number
  height: number
}

export type ThumbnailCropOptions = {
  sourceWidth: number
  sourceHeight: number
  targetWidth: number
  targetHeight: number
  zoom: number
  positionX: number
  positionY: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

/**
 * Return the source rectangle for a cover-style thumbnail crop. Positions are
 * normalized so the browser preview and Sharp use the same framing values.
 */
export function getThumbnailCrop({
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
  zoom,
  positionX,
  positionY,
}: ThumbnailCropOptions): ThumbnailCrop {
  const targetAspect = targetWidth / targetHeight
  const sourceAspect = sourceWidth / sourceHeight
  const safeZoom = Math.max(1, zoom)

  const baseWidth = sourceAspect >= targetAspect
    ? sourceHeight * targetAspect
    : sourceWidth
  const baseHeight = baseWidth / targetAspect
  const width = Math.max(1, Math.min(sourceWidth, baseWidth / safeZoom))
  const height = Math.max(1, Math.min(sourceHeight, baseHeight / safeZoom))
  const maxLeft = sourceWidth - width
  const maxTop = sourceHeight - height

  return {
    left: Math.round(clamp(positionX, 0, 1) * maxLeft),
    top: Math.round(clamp(positionY, 0, 1) * maxTop),
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  }
}

export function getThumbnailCropPanRange(crop: ThumbnailCrop, sourceWidth: number, sourceHeight: number) {
  return {
    x: Math.max(0, sourceWidth - crop.width),
    y: Math.max(0, sourceHeight - crop.height),
  }
}
