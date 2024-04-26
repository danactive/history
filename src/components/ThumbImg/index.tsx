import { MouseEvent, useState } from 'react'

import config from '../../../config.json'
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
  onClick?: Function;
  caption: string,
  href?: string,
  src: string,
  id: string,
  viewed: boolean,
}) {
  const [viewed, setViewed] = useState(previewed)
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
        <Img src={src} alt="Preview thumbnail (scaled down dimensions)" width={width} height={height} />
      </a>
      <span className={styles.caption}>{caption}</span>
    </li>
  )
}

export default ThumbImg
