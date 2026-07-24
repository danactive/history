import { memo, MouseEvent, ReactNode, useEffect, useState } from 'react'

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
}

type ThumbImgListProps<T> = {
  items: T[];
  className?: string;
  getKey: (item: T, index: number) => string;
  getThumbProps: (item: T, index: number) => ThumbImgProps;
}

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
    <li className={`${styles.bullet} ${captionAction ? styles.bulletWithAction : ''}`}>
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

export function ThumbImgList<T>({ items, className, getKey, getThumbProps }: ThumbImgListProps<T>) {
  return (
    <ul className={className}>
      {items.map((item, index) => (
        <ThumbImg key={getKey(item, index)} {...getThumbProps(item, index)} />
      ))}
    </ul>
  )
}

export default memo(ThumbImg)
