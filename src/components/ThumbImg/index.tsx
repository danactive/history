import { MouseEvent, useEffect, useState } from 'react'

import config from '../../../src/models/config'
import Img from '../Img'
import styles from './styles.module.css'

function getViewed(viewed: boolean, multiSelected: boolean, editingThumb: boolean) {
  if (viewed) {
    const highlightClass = multiSelected || editingThumb ? styles.highlightMulti : styles.highlight
    return `${highlightClass} ${styles.imgButton}`
  }
  return styles.imgButton
}

function ThumbImg({
  onClick,
  caption,
  href,
  src,
  viewed: globalViewed = false,
  multiSelected = false,
  editingThumb = false,
}: {
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLUListElement>) => void;
  caption: string;
  href?: string;
  src: string;
  viewed: boolean;
  multiSelected?: boolean;
  editingThumb?: boolean;
}) {
  // Keep visuals (local state for immediate feedback) but never reset globally
  const [viewed, setViewed] = useState(globalViewed)

  useEffect(() => {
    if (globalViewed && !viewed) setViewed(true)
  }, [globalViewed, viewed])

  const handleClick = (event: MouseEvent<HTMLAnchorElement | HTMLUListElement>) => {
    event.preventDefault()
    if (!viewed) setViewed(true)
    onClick?.(event)
  }

  const { width, height } = config.resizeDimensions.thumb

  return (
    <li className={styles.bullet}>
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
    </li>
  )
}

export default ThumbImg
