import type { Filesystem } from '../lib/filesystems'
import type { ClusteredMarkers } from '../lib/generate-clusters'

import type {
  AlbumMeta,
  Gallery as GalleryName,
  IndexedKeywords,
  ServerSideAlbumItem,
  ServerSideAllItem,
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
    clusteredMarkers: ClusteredMarkers;
  }

  export type ItemData = Omit<Album.ComponentProps, 'clusteredMarkers'>

  export interface Params {
    gallery: GalleryName;
    album: NonNullable<AlbumMeta['albumName']>
  }
}

export namespace Walk {
  export type ItemFile = Filesystem
}

export namespace All {
  export type ComponentProps = {
    items: ServerSideAllItem[];
    indexedKeywords: IndexedKeywords[];
    clusteredMarkers: ClusteredMarkers;
    initialAgeSummary?: { ages: { age: number; count: number }[] };
  }

  export type ItemData = Omit<All.ComponentProps, 'clusteredMarkers'>

  export interface Params {
    gallery: GalleryName
  }
}
