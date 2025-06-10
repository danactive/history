import { useState } from 'react';
import useSWR from 'swr';

import { type AlbumResponseBody } from '../../lib/album';
import type { Gallery, GalleryAlbum, Item } from "../../types/common";
import styles from '../AlbumPage/styles.module.css';
import ThumbImg from '../ThumbImg';

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AdminAlbumAlbum({ gallery, album }: { gallery: Gallery, album: GalleryAlbum }) {
  const { data, error, isLoading } = useSWR<AlbumResponseBody>(`/api/galleries/${gallery}/albums/${album.name}`, fetcher)
  const [image, setImage] = useState<Item['id'] | null>(null)
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
  if (!data) return <div>no data</div>

  return (
    <>
      {image}
      <ul className={styles.thumbWrapper}>
        {data.album.items.map((item, index) => (
          <ThumbImg
            onClick={() => setImage(item.id)}
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
