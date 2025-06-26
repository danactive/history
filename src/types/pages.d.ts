import { type ParsedUrlQuery } from 'node:querystring'

import type { Filesystem } from '../lib/filesystems'

import type {
  AlbumMeta,
  Gallery as GalleryName,
  IndexedKeywords,
  ServerSideAllItem,
  ServerSideAlbumItem,
  ServerSidePhotoItem,
} from './common'

export namespace Gallery {
  export type ComponentProps = {
    gallery: GalleryName;
    albums: ServerSideAlbumItem[];
    indexedKeywords: IndexedKeywords[];
  }
  export interface Params {
    gallery: GalleryName
  }
}

export namespace Album {
  export type ComponentProps = {
    items: ServerSidePhotoItem[];
    meta?: object;
    indexedKeywords: IndexedKeywords[];
  }

  export interface Params {
    gallery: GalleryName;
    album: NonNullable<AlbumMeta['albumName']>
  }
}

export namespace Walk {
  export type ItemFile = Filesystem //& {
  //   grouped?: string;
  //   flat?: string;
  // }
}

export namespace All {
  export type ComponentProps = {
    items: ServerSideAllItem[];
    indexedKeywords: IndexedKeywords[];
  }

  export interface Params {
    gallery: GalleryName
  }
}
