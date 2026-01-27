import { MouseEvent, useState, useEffect } from 'react'

import config from '../../../src/models/config'
import Img from '../Img'
import styles from './styles.module.css'

function getViewed(viewed: boolean, multiSelected: boolean) {
  if (viewed) {
    return `${multiSelected ? styles.highlightMulti : styles.highlight} ${styles.imgButton}`
  }
  return styles.imgButton
}

function ThumbImg({
  onClick,
  caption,
  href,
  src,
  id,
  viewed: globalViewed = false,
  multiSelected = false,
}: {
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLUListElement>) => void;
  caption: string;
  href?: string;
  src: string;
  id: string;
  viewed: boolean;
  multiSelected?: boolean;
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
      <a className={getViewed(globalViewed || viewed, multiSelected)} href={href} onClick={handleClick} id={id}>
        <Img
          src={src}
          alt={caption}
          width={width}
          height={height}
          priority={false}
        />
      </a>
      <span className={styles.caption}>{caption}</span>
    </li>
  )
}

export default ThumbImg
