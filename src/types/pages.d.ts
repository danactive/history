import { type ParsedUrlQuery } from 'node:querystring'

import type { Filesystem } from './lib/filesystems'

import type {
  AlbumMeta,
  IndexedKeywords,
  ServerSideAlbumItem,
  ServerSidePhotoItem,
} from './common'

export namespace Gallery {
  export type ComponentProps = {
    gallery: NonNullable<AlbumMeta['gallery']>;
    albums: ServerSideAlbumItem[];
    indexedKeywords: IndexedKeywords[];
  }
  export interface Params {
    gallery: NonNullable<AlbumMeta['gallery']>
  }
}

export namespace Album {
  export type ComponentProps = {
    items: ServerSidePhotoItem[];
    meta?: object;
    indexedKeywords: IndexedKeywords[];
  }

  export interface Params extends ParsedUrlQuery {
    gallery: NonNullable<AlbumMeta['gallery']>
    album: NonNullable<AlbumMeta['albumName']>
  }
}

export namespace Walk {
  export type ItemFile = Partial<Filesystem> & {
    id: Filesystem['id'];
    path: Filesystem['path'];
    label: string;
    grouped?: string;
    flat?: string;
  }
}
