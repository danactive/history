import { type DraggableProvided } from '@hello-pangea/dnd'
import { CSSProperties, memo, useEffect, useRef, useState } from 'react'

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

const PENDING = 'pending'
const NOT_AVAILABLE = 'N/A'

const scoreCache: Record<string, string | typeof PENDING> = {}

function formatScore(score: number | undefined): string {
  return typeof score === 'number'
    ? `${Math.abs(score * 1000).toFixed(1)}%`
    : NOT_AVAILABLE
}

function DraggableThumb({ item }: { item: Filesystem }) {
  const [score, setScore] = useState<string>(() => scoreCache[item.absolutePath] ?? '…')
  const { filename, absolutePath } = item
  const cancelRef = useRef(false)

  // Fetch and cache logic
  useEffect(() => {
    cancelRef.current = false
    if (!absolutePath) return
    // Prevent multiple fetches; on load and drag causes unmount
    if (scoreCache[absolutePath] && scoreCache[absolutePath] !== PENDING) {
      setScore(scoreCache[absolutePath])
      return
    }
    if (scoreCache[absolutePath] === PENDING) return
    scoreCache[absolutePath] = PENDING

    async function fetchScore() {
      try {
        const res = await fetch('/api/admin/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: absolutePath }),
        })
        const data = await res.json()
        const scoreStr = formatScore(data.aesthetic_score)
        scoreCache[absolutePath] = scoreStr
        if (!cancelRef.current) setScore(scoreStr)
      } catch {
        if (!cancelRef.current) setScore(NOT_AVAILABLE)
        scoreCache[absolutePath] = NOT_AVAILABLE
      }
    }
    fetchScore()
    return () => { cancelRef.current = true }
  }, [absolutePath])

  // Sync state with cache if another instance sets it
  useEffect(() => {
    if (!absolutePath) return
    if (scoreCache[absolutePath] && scoreCache[absolutePath] !== PENDING && score !== scoreCache[absolutePath]) {
      setScore(scoreCache[absolutePath])
      return
    }
    const interval = setInterval(() => {
      if (scoreCache[absolutePath] && scoreCache[absolutePath] !== PENDING && score !== scoreCache[absolutePath]) {
        setScore(scoreCache[absolutePath])
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [absolutePath, score])

  return (
    <>
      <span key={`label-${filename}`}>
        <Link href={absolutePath} target="_blank" title="View original in new tab">
          {filename}
        </Link>
        &nbsp;<span title='Aesthetic score'>{score}</span>
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
      <DraggableThumb item={item} />
    </div>
  )
}

export default memo(PreviewImage)
