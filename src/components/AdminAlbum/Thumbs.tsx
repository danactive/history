import { type Dispatch, type SetStateAction } from 'react'

import { AlbumResponseBody } from '../../lib/album'
import styles from '../AlbumPage/styles.module.css'
import ThumbImg from '../ThumbImg'
import { ItemState } from './AdminAlbumClient'

export default function AdminAlbumThumbs(
  { album, setItem }:
  { album: AlbumResponseBody['album'] | undefined, setItem: Dispatch<SetStateAction<ItemState>> },
) {
  if (!album) return <div>Loading...</div>

  return (
    <>
      <ul className={styles.thumbWrapper}>
        {album.items.map((item) => (
          <ThumbImg
            onClick={() => setItem(item)}
            src={item.thumbPath}
            caption={item.caption}
            key={item.filename.toString()}
            id={`select${item.id}`}
            viewed={false}
          />
        ))}
      </ul>
    </>
  )
}
