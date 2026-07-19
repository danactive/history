import config from '../../../src/models/config'
import type { Gallery, ServerSideAlbumItem } from '../../types/common'
import Img from '../Img'
import Link from '../Link'
import styles from './styles.module.css'

interface InputProps {
  items: ServerSideAlbumItem[],
  gallery: Gallery,
}

function Galleries({ items, gallery }: InputProps) {
  const { width, height } = config.resizeDimensions.thumb
  return items.map((album) => (
    <div data-type="gallery" key={album.name} className={styles.albums}>
      <Link href={`/${gallery}/${album.name}`}>
        <Img src={album.thumbPath} alt={album.name} width={width} height={height} />
      </Link>
      <h1 className={styles.h1}>{album.h1}</h1>
      <h2 className={styles.h2}>{album.h2}</h2>
      <h3 className={styles.h3}>{album.year}</h3>
    </div>
  ))
}

export default Galleries
