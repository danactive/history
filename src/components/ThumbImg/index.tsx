import { MouseEvent, useState, useEffect } from 'react'

import config from '../../../src/models/config'
import Img from '../Img'
import styles from './styles.module.css'

function getViewed(viewed: boolean) {
  if (viewed) {
    return `${styles.highlight} ${styles.imgButton}`
  }
  return styles.imgButton
}

function ThumbImg({
  onClick,
  caption,
  href,
  src,
  id,
  viewed: previewed = false,
}: {
  onClick?: () => void;
  caption: string;
  href?: string;
  src: string;
  id: string;
  viewed: boolean;
}) {
  // Keep visuals (local state for immediate feedback) but never reset globally
  const [viewed, setViewed] = useState(previewed)

  useEffect(() => {
    if (previewed && !viewed) setViewed(true)
  }, [previewed, viewed])

  const handleClick = (event: MouseEvent<HTMLAnchorElement | HTMLUListElement>) => {
    event.preventDefault()
    if (!viewed) setViewed(true)
    onClick?.()
  }

  const { width, height } = config.resizeDimensions.thumb

  return (
    <li className={styles.bullet}>
      <a className={getViewed(previewed || viewed)} href={href} onClick={handleClick} id={id}>
        <Img
          src={src}
          alt={caption}
          width={width}
          height={height}
          loading="lazy"
        />
      </a>
      <span className={styles.caption}>{caption}</span>
    </li>
  )
}

export default ThumbImg
