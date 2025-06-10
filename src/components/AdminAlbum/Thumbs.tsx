import { type Dispatch, type SetStateAction } from 'react'
import useSWR from 'swr'

import { type AlbumResponseBody } from '../../lib/album'
import type { Gallery, GalleryAlbum } from "../../types/common"
import styles from '../AlbumPage/styles.module.css'
import ThumbImg from '../ThumbImg'
import { ItemState } from './AdminAlbumClient'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AdminAlbumThumbs(
  { gallery, album, setItem }:
  { gallery: Gallery, album: GalleryAlbum, setItem: Dispatch<SetStateAction<ItemState>> },
) {
  const { data, error, isLoading } = useSWR<AlbumResponseBody>(`/api/galleries/${gallery}/albums/${album.name}`, fetcher)

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
  if (!data) return <div>no data</div>

  return (
    <>
      <ul className={styles.thumbWrapper}>
        {data.album.items.map((item, index) => (
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
