import { type ParsedUrlQuery } from 'node:querystring'

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
  export interface Params extends ParsedUrlQuery {
    gallery: NonNullable<AlbumMeta['gallery']>
  }
}
