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
const scoreCache: Record<string, string> = {}

function formatScore(score: number | undefined): string {
  return typeof score === 'number'
    ? `${Math.abs(score * 100).toFixed(1)}%`
    : NOT_AVAILABLE
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
  const scoreStr = formatScore(data.aesthetic_score)
  scoreCache[absolutePath] = scoreStr
  return scoreStr
}

function DraggableThumb({
  item,
  displayScore,
}: {
  item: Filesystem,
  displayScore: string,
}) {
  const { filename, absolutePath } = item

  return (
    <>
      <span key={`label-${filename}`}>
        <Link href={absolutePath} target="_blank" title="View original in new tab">
          {filename}
        </Link>
        &nbsp;<span title='Aesthetic score'>{displayScore}</span>
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
  const { data: score, error, isLoading } = useSWR(
    item.absolutePath ? ['/api/admin/scores', item.absolutePath] : null,
    ([, path]) => fetchScore(path),
    { revalidateOnFocus: false },
  )

  let displayScore = '…'
  if (isLoading) displayScore = '…'
  else if (error) displayScore = NOT_AVAILABLE
  else if (score) displayScore = score

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
      <DraggableThumb item={item} displayScore={displayScore} />
    </div>
  )
}

export default memo(PreviewImage)
