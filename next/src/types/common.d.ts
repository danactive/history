type AlbumMeta = {
  gallery?: string,
  geo?: {
    zoom: number
  },
  albumName?: string,
  albumVersion?: string,
  markerZoom?: never,
  clusterMaxZoom?: string,
}

type DirtyMeta = {
  gallery?: string,
  albumName?: string,
  albumVersion?: string,
  markerZoom?: string | never,
  clusterMaxZoom?: string,
}

type Item = {
  id: string,
  filename: string,
  city: string,
  location: string,
  caption: string,
  description: string | undefined,
  search: string | null,
  title: string,
  coordinates: [number, number] | null,
  coordinateAccuracy: number | null,
  thumbPath: string,
  photoPath: string,
  mediaPath: string,
  videoPaths: string,
  reference: [string, string] | null,
}

type DirtyItem = {
  $: {
    id: string,
  },
  type?: 'video' | 'photo',
  size?: { w: string, h: string },
  filename: string | string[],
  photoCity: string,
  thumbCaption: string,
  photoDesc: string,
  geo?: {
    lat: string,
    lon: string,
    accuracy: string,
  },
  ref?: {
    name: string,
    source: string,
  }
}

type DirtyAlbum = {
  album?: {
    meta?: DirtyMeta,
    item?: DirtyItem | DirtyItem[]
  },
}

type Album = {
  album: {
    meta?: AlbumMeta,
    items: Item[]
  }
}

// https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/54659
declare module 'react-image-gallery' {
  interface ReactImageGalleryProps {
    useWindowKeyDown?: boolean;
  }
}

export type {
  AlbumMeta,
  DirtyMeta,
  Album,
  DirtyItem,
  DirtyAlbum,
  Item,
}
