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
  resetToken,
}: {
  onClick?: Function;
  caption: string;
  href?: string;
  src: string;
  id: string;
  viewed: boolean;
  resetToken?: number | string; // changes force reset
}) {
  const [viewed, setViewed] = useState(previewed)

  useEffect(() => {
    // Sync internal state to external viewed flag (allows reset to false)
    setViewed(previewed)
  }, [previewed, resetToken])

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    setViewed(true)
    onClick?.()
  }

  if (previewed && !viewed) {
    setViewed(true)
  }

  const { width, height } = config.resizeDimensions.thumb

  return (
    <li className={styles.bullet}>
      <a className={getViewed(viewed)} href={href} onClick={handleClick} id={id}>
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
