import { type DraggableProvided } from '@hello-pangea/dnd'
import { CSSProperties, memo } from 'react'
import useSWR from 'swr'

import config from '../../../src/models/config'
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
const scoreCache: Record<string, { display: string, breakdown: string }> = {}

function formatScore(
  overall: number | undefined,
  interest: number | undefined,
  thirds: number | undefined,
): string {
  const percent = (value: number) => `${Math.round(value * 10)}%`
  if (typeof overall === 'number') {
    return `${Math.round(overall)}%`
  }
  const hasInterest = typeof interest === 'number'
  const hasThirds = typeof thirds === 'number'
  if (hasInterest && hasThirds) {
    return percent((interest * 0.8) + (thirds * 0.2))
  }
  if (hasInterest) {
    return percent(interest)
  }
  if (hasThirds) {
    return percent(thirds)
  }
  return NOT_AVAILABLE
}

function buildBreakdown(data: Record<string, unknown>): string {
  const lines: string[] = []
  const interest = data.visual_interest_score as number | undefined
  const thirds = data.rule_of_thirds_score as number | undefined
  const sharp = data.sharpness_score as number | undefined
  const overall = data.overall_score as number | undefined
  const model = data.model_scores as Record<string, number> | undefined

  if (typeof interest === 'number' && typeof thirds === 'number') {
    const comp = (interest * 0.8) + (thirds * 0.2)
    lines.push(`Composition = interest(80%) + thirds(20%) = ${comp.toFixed(2)}`)
  }
  if (typeof sharp === 'number') {
    const factor = 0.9 + (sharp / 20)
    lines.push(`Sharpness = ${sharp.toFixed(2)}, factor = ${factor.toFixed(2)}`)
  }
  if (model?.overall != null) {
    const scaled = model.overall * 2
    lines.push(`Overall aesthetic (0–5→0–10) = ${scaled.toFixed(2)}`)
    lines.push('Blend: 70% model + 30% composition')
  }
  if (typeof overall === 'number') {
    lines.push(`Overall % = ${overall.toFixed(1)}%`)
  }
  return lines.join('\n') || 'No breakdown available'
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
  const data = await res.json()
  const display = formatScore(
    data.overall_score,
    data.visual_interest_score,
    data.rule_of_thirds_score,
  )
  const breakdown = buildBreakdown(data)
  scoreCache[absolutePath] = { display, breakdown }
  return { display, breakdown }
}

function DraggableThumb({
  item,
  displayScore,
  scoreBreakdown,
}: {
  item: Filesystem,
  displayScore: string,
  scoreBreakdown?: string,
}) {
  const { filename, absolutePath } = item

  return (
    <>
      <span key={`label-${filename}`}>
        <Link href={absolutePath} target="_blank" title="View original in new tab">
          {filename}
        </Link>
        &nbsp;<span title={scoreBreakdown ?? 'Composition scores'}>{displayScore}</span>
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

  let displayScore = '…'
  let scoreBreakdown: string | undefined
  if (isLoading) displayScore = '…'
  else if (error) displayScore = NOT_AVAILABLE
  else if (scoreData) {
    displayScore = typeof scoreData === 'string' ? scoreData : scoreData.display
    scoreBreakdown = typeof scoreData === 'string' ? undefined : scoreData.breakdown
  }

  return (
    <div
      className={getDraggingStyle(isDragging)}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getStyle(provided, style)}
      data-is-dragging={isDragging}
      data-index={index}
    >
      <DraggableThumb item={item} displayScore={displayScore} scoreBreakdown={scoreBreakdown} />
    </div>
  )
}

export default memo(PreviewImage)
