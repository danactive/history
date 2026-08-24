import { type DraggableProvided } from '@hello-pangea/dnd'
import { CSSProperties, memo } from 'react'
import useSWR from 'swr'

import config from '../../../src/models/config'
import { normalizePhotoScore, type PhotoScore } from '../../models/scores'
import { type Filesystem } from '../../lib/filesystems'
import Img from '../Img'
import Link from '../Link'
import styles from './styles.module.css'

function getDraggingStyle(isDragging: boolean) {
  if (isDragging) {
    return `${styles.container} ${styles.draggingOn}`
  }
  return `${styles.container} ${styles.draggingOff}`
}

const NOT_AVAILABLE = 'N/A'

// Module-level cache to persist across remounts
const scoreCache: Record<string, PhotoScore> = {}

function formatScore(score: number | null): string {
  return score === null ? NOT_AVAILABLE : `${score.toFixed(1)}/10`
}

function formatOverallScore(score: PhotoScore): string {
  return `${score.overall_score.toFixed(1)}%`
}

function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? `${weight}%` : `${weight.toFixed(1)}%`
}

function formatOverallExplanation(score: PhotoScore): string {
  const components = [
    {
      label: 'technical quality',
      baseWeight: 40,
      available: true,
    },
    {
      label: 'composition',
      baseWeight: 35,
      available: score.composition_score !== null,
    },
    {
      label: 'visual aesthetic',
      baseWeight: 25,
      available: score.aesthetic_score !== null,
    },
  ]
  const availableComponents = components.filter(component => component.available)
  const availableWeight = availableComponents.reduce((sum, component) => sum + component.baseWeight, 0)
  const explanation = availableComponents
    .map((component) => {
      const effectiveWeight = component.baseWeight / availableWeight * 100
      return `${component.label} (${formatWeight(effectiveWeight)})`
    })
    .join(' + ')

  if (availableComponents.length === components.length) {
    return `Overall = ${explanation}`
  }

  const unavailableComponents = components
    .filter(component => !component.available)
    .map(component => component.label)
    .join(' and ')
  return `Overall = ${explanation}; ${unavailableComponents} unavailable, so the available characteristics are reweighted.`
}

function scoreTitle(score: PhotoScore): string {
  return [
    `Overall score: ${formatOverallScore(score)}`,
    formatOverallExplanation(score),
    `Technical quality: ${formatScore(score.technical_score)}`,
    `Composition: ${formatScore(score.composition_score)}`,
    `Visual aesthetic: ${formatScore(score.aesthetic_score)}`,
    `Sharpness: ${formatScore(score.sharpness_score)}`,
    `Exposure: ${formatScore(score.exposure_score)}`,
    `Resolution: ${formatScore(score.resolution_score)} (${score.image_width} × ${score.image_height})`,
    ...score.notes,
  ].join('\n')
}

// SWR fetcher that uses the cache
const fetchScore = async (absolutePath: string) => {
  if (scoreCache[absolutePath]) {
    return scoreCache[absolutePath]
  }
  const res = await fetch('/api/admin/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: absolutePath }),
  })
  if (!res.ok) throw new Error('Failed to fetch')
  const data = normalizePhotoScore(await res.json())
  scoreCache[absolutePath] = data
  return data
}

function DraggableThumb({
  item,
  displayScore,
  scoreTitle,
}: {
  item: Filesystem,
  displayScore: string,
  scoreTitle?: string,
}) {
  const { filename, absolutePath } = item

  return (
    <>
      <span key={`label-${filename}`}>
        <Link href={absolutePath} target="_blank" title="View original in new tab">
          {filename}
        </Link>
        {' '}
        <span title={scoreTitle ?? 'Photo analysis'}>{displayScore}</span>
      </span>
      <Img
        key={`thumbnail-${filename}`}
        alt="No preview yet"
        src={absolutePath}
        width={config.resizeDimensions.preview.width}
        height={config.resizeDimensions.preview.height}
      />
    </>
  )
}

function getStyle(provided: DraggableProvided, style?: CSSProperties) {
  if (!style) {
    return provided.draggableProps.style
  }

  return {
    ...provided.draggableProps.style,
    ...style,
  }
}

function PreviewImage(
  {
    item,
    isDragging,
    provided,
    style,
    index,
  }:
  {
    item: Filesystem,
    isDragging: boolean,
    provided: DraggableProvided,
    style?: CSSProperties,
    index: number,
  },
) {
  const { data: scoreData, error, isLoading } = useSWR(
    item.absolutePath ? ['/api/admin/scores', item.absolutePath] : null,
    ([, path]) => fetchScore(path),
    { revalidateOnFocus: false },
  )

  const displayScore = isLoading
    ? '…'
    : error || !scoreData
      ? NOT_AVAILABLE
      : formatOverallScore(scoreData)
  const analysisTitle = scoreData ? scoreTitle(scoreData) : undefined

  return (
    <div
      className={getDraggingStyle(isDragging)}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getStyle(provided, style)}
      data-is-dragging={isDragging}
      data-index={index}
      title={analysisTitle}
    >
      <DraggableThumb
        item={item}
        displayScore={displayScore}
        scoreTitle={analysisTitle}
      />
    </div>
  )
}

export default memo(PreviewImage)
