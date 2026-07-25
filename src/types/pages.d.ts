import type { Filesystem } from '../lib/filesystems'
import type { ClusteredMarkers } from '../lib/generate-clusters'
import type { AgeSummaryValue } from '../utils/person-age'
import type {
  AlbumMeta,
  Gallery as GalleryName,
  IndexedKeywords,
  ServerSideAlbumItem,
  ServerSideAllItem,
  ServerSidePhotoItem,
  ServerSideTodayItem,
  VisitedPlace,
} from './common'

export type ServerPageDataBase<TItem> = {
  items: TItem[];
  indexedKeywords: IndexedKeywords[];
  totalItemCount?: number;
  visitedPlace?: VisitedPlace | null;
  visitedFilterLabel?: string | null;
}

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
    gallery: GalleryName;
    album?: NonNullable<AlbumMeta['albumName']>;
    monthDay?: string;
    items: ServerSidePhotoItem[];
    totalItemCount?: number;
    meta?: object;
    indexedKeywords: IndexedKeywords[];
    clusteredMarkers: ClusteredMarkers;
    visitedPlace?: VisitedPlace | null;
    visitedFilterLabel?: string | null;
  }

  export type ItemData = ServerPageDataBase<ServerSidePhotoItem> & {
    gallery: GalleryName;
    album?: NonNullable<AlbumMeta['albumName']>;
    monthDay?: string;
    meta?: object;
  }

  export interface Params {
    gallery: GalleryName;
    album: NonNullable<AlbumMeta['albumName']>
  }
}

export namespace Today {
  export type ItemData = ServerPageDataBase<ServerSideTodayItem>
}

export namespace Persons {
  export type ItemData = ServerPageDataBase<ServerSideAllItem> & {
    gallery: GalleryName,
    initialAgeSummary?: { ages: { age: AgeSummaryValue; count: number }[] };
    initialSelectedAge?: number | 'unknown' | null;
    initialSelectedPerson?: string | null;
  }
}

export namespace Walk {
  export type ItemFile = Filesystem
  export interface Params {
    path?: string[];
  }
}

export namespace All {
  export type ComponentProps = {
    gallery: Gallery,
    items: ServerSideAllItem[];
    totalItemCount?: number;
    indexedKeywords: IndexedKeywords[];
    clusteredMarkers: ClusteredMarkers;
    initialAgeSummary?: { ages: { age: AgeSummaryValue; count: number }[] };
    initialSelectedAge?: number | 'unknown' | null;
    initialSelectedPerson?: string | null;
    visitedPlace?: VisitedPlace | null;
    visitedFilterLabel?: string | null;
    trailingAction?: React.ReactNode;
  }

  export type ItemData = ServerPageDataBase<ServerSideAllItem> & {
    gallery: GalleryName,
    initialAgeSummary?: { ages: { age: AgeSummaryValue; count: number }[] };
    initialSelectedAge?: number | 'unknown' | null;
    initialSelectedPerson?: string | null;
    trailingAction?: React.ReactNode;
  }

  export interface Params {
    gallery: GalleryName,
    visitedPlace?: VisitedPlace | null
  }
}
