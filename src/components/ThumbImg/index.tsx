import {
  memo,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

import config from '../../../src/models/config'
import Img from '../Img'
import styles from './styles.module.css'

export type ThumbImgProps = {
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLUListElement>) => void;
  onSelectIndex?: (index: number) => void;
  onSelectWithEvent?: (index: number, event: MouseEvent<HTMLAnchorElement | HTMLUListElement>) => void;
  selectIndex?: number;
  caption: string;
  href?: string;
  src: string;
  viewed: boolean;
  multiSelected?: boolean;
  editingThumb?: boolean;
  captionAction?: ReactNode;
  style?: CSSProperties;
}

type ThumbImgListProps<T> = {
  items: T[];
  className?: string;
  getKey: (item: T, index: number) => string;
  getThumbProps: (item: T, index: number) => ThumbImgProps;
  virtualize?: boolean;
}

const THUMB_TRACK_WIDTH = 207
// The optional album action grows a tile to 128px; including its 6px top and
// bottom margins keeps rows from overlapping on the all-items page.
const THUMB_ROW_HEIGHT = 140
const THUMB_OVERSCAN_ROWS = 3
const INITIAL_VIRTUAL_ITEM_COUNT = 80

function getViewed(viewed: boolean, multiSelected: boolean, editingThumb: boolean) {
  if (viewed) {
    const highlightClass = multiSelected || editingThumb ? styles.highlightMulti : styles.highlight
    return `${highlightClass} ${styles.imgButton}`
  }
  return styles.imgButton
}

function ThumbImg({
  onClick,
  onSelectIndex,
  onSelectWithEvent,
  selectIndex,
  caption,
  href,
  src,
  viewed: globalViewed = false,
  multiSelected = false,
  editingThumb = false,
  captionAction,
  style,
}: ThumbImgProps) {
  // Keep visuals (local state for immediate feedback) but never reset globally
  const [viewed, setViewed] = useState(globalViewed)

  useEffect(() => {
    if (globalViewed && !viewed) setViewed(true)
  }, [globalViewed, viewed])

  const handleClick = (event: MouseEvent<HTMLAnchorElement | HTMLUListElement>) => {
    event.preventDefault()
    if (!viewed) setViewed(true)
    if (onSelectWithEvent != null && selectIndex != null) {
      onSelectWithEvent(selectIndex, event)
    } else if (onSelectIndex != null && selectIndex != null) {
      onSelectIndex(selectIndex)
    } else {
      onClick?.(event)
    }
  }

  const { width, height } = config.resizeDimensions.thumb

  return (
    <li className={`${styles.bullet} ${captionAction ? styles.bulletWithAction : ''}`} style={style}>
      <a
        className={getViewed(
          editingThumb ? globalViewed : (globalViewed || viewed),
          multiSelected,
          editingThumb,
        )}
        href={href}
        onClick={handleClick}
      >
        <Img
          src={src}
          alt={caption}
          width={width}
          height={height}
        />
      </a>
      <span className={styles.caption}>{caption}</span>
      {captionAction ? <span className={styles.captionAction}>{captionAction}</span> : null}
    </li>
  )
}

function StaticThumbImgList<T>({ items, className, getKey, getThumbProps }: ThumbImgListProps<T>) {
  return (
    <ul className={className}>
      {items.map((item, index) => (
        <ThumbImg key={getKey(item, index)} {...getThumbProps(item, index)} />
      ))}
    </ul>
  )
}

function VirtualThumbImgList<T>({ items, className, getKey, getThumbProps }: ThumbImgListProps<T>) {
  const listRef = useRef<HTMLUListElement>(null)
  const [columns, setColumns] = useState(1)
  const [visibleRange, setVisibleRange] = useState(() => ({
    start: 0,
    end: Math.min(items.length, INITIAL_VIRTUAL_ITEM_COUNT),
  }))

  const updateVisibleRange = useCallback(() => {
    const list = listRef.current
    if (!list) return

    const rect = list.getBoundingClientRect()
    const nextColumns = Math.max(1, Math.floor(rect.width / THUMB_TRACK_WIDTH))
    const listTop = rect.top + window.scrollY
    const startRow = Math.max(0, Math.floor((window.scrollY - listTop) / THUMB_ROW_HEIGHT) - THUMB_OVERSCAN_ROWS)
    const visibleRows = Math.ceil(window.innerHeight / THUMB_ROW_HEIGHT) + (THUMB_OVERSCAN_ROWS * 2)
    const nextStart = Math.min(items.length, startRow * nextColumns)
    const nextEnd = Math.min(items.length, nextStart + (visibleRows * nextColumns))

    setColumns(previousColumns => previousColumns === nextColumns ? previousColumns : nextColumns)
    setVisibleRange(previousRange => (
      previousRange.start === nextStart && previousRange.end === nextEnd
        ? previousRange
        : { start: nextStart, end: nextEnd }
    ))
  }, [items.length])

  useEffect(() => {
    updateVisibleRange()

    let frame: number | null = null
    const scheduleUpdate = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        updateVisibleRange()
      })
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(scheduleUpdate)
    if (listRef.current && observer) observer.observe(listRef.current)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      observer?.disconnect()
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [updateVisibleRange])

  const rows = Math.ceil(items.length / columns)
  const visibleItems = items.slice(visibleRange.start, visibleRange.end)

  return (
    <ul
      ref={listRef}
      className={className}
      style={{ position: 'relative', height: rows * THUMB_ROW_HEIGHT }}
    >
      {visibleItems.map((item, visibleIndex) => {
        const index = visibleRange.start + visibleIndex
        const row = Math.floor(index / columns)
        const column = index % columns

        return (
          <ThumbImg
            key={getKey(item, index)}
            {...getThumbProps(item, index)}
            style={{
              position: 'absolute',
              top: row * THUMB_ROW_HEIGHT,
              left: column * THUMB_TRACK_WIDTH,
            }}
          />
        )
      })}
    </ul>
  )
}

export function ThumbImgList<T>({ virtualize = false, ...props }: ThumbImgListProps<T>) {
  return virtualize
    ? <VirtualThumbImgList {...props} />
    : <StaticThumbImgList {...props} />
}

export default memo(ThumbImg)
