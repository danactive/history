import type { GeneratedGallery } from './generated'

type Gallery = GeneratedGallery

type AlbumMeta = {
  gallery?: Gallery,
  geo?: {
    zoom: number
  },
  albumName?: string,
  albumVersion?: string,
  markerZoom?: never,
  clusterMaxZoom?: string,
}

type XmlMeta = {
  gallery?: Gallery,
  albumName?: string,
  albumVersion?: string,
  markerZoom?: string | never,
  clusterMaxZoom?: string,
}

type ItemReferenceSource = 'facebook' | 'google' | 'instagram' | 'wikipedia' | 'youtube'

type XmlPerson = {
  $: {
    first: string,
    last: string,
    dob: string | null,
  }
}

type XmlPersons = {
  persons: { person: XmlPerson | XmlPerson[] }
}

type Person = XmlPerson['$'] & {
  full: string,
}

type PersonItem = {
  full: Person['full'],
  dob: Person['dob'],
}

type Item = {
  id: string,
  filename: string | string[],
  photoDate: string | null,
  city: string,
  location: string | null,
  caption: string,
  description: string | null,
  search: string | null,
  persons: PersonItem[] | null,
  title: string,
  coordinates: [number, number] | null,
  coordinateAccuracy: number | null,
  thumbPath: string,
  photoPath: string,
  mediaPath: string,
  videoPaths: string | string[] | null,
  reference: [string, string] | null,
}

type XmlCaseItem<TCamelCase extends boolean = true> = {
  $: {
    id: string,
  },
  type?: 'video' | 'photo',
  size?: { w: string, h: string },
  filename: string | string[],
  search?: string,
  geo?: {
    lat: string,
    lon: string,
    accuracy: string,
  },
  ref?: {
    name: string,
    source: ItemReferenceSource,
  }
} & (TCamelCase extends true ? {
  photoDate: string | null,
  photoCity: string,
  photoLoc?: string,
  thumbCaption: string,
  photoDesc?: string,
} : {
  photo_date: string | null,
  photo_city: string,
  photo_loc?: string,
  thumb_caption?: string,
  photo_desc?: string,
})

type XmlCaseAlbum<TCamelCase extends boolean = true> = {
  album: {
    meta?: XmlMeta,
    item?: XmlCaseItem<TCamelCase> | XmlCaseItem<TCamelCase>[]
  },
}

type Album = {
  album: {
    meta: AlbumMeta,
    items: Item[]
  }
}

type XmlGalleryAlbum = {
  albumName: string;
  albumH1: string;
  albumH2: string;
  albumVersion: string;
  filename: string;
  year: string;
  search?: string;
}

type XmlGallery = {
  gallery: {
    album: XmlGalleryAlbum | XmlGalleryAlbum[]
  }
}

type GalleryAlbum = {
  name: string;
  h1: string;
  h2: string;
  version: string;
  thumbPath: string;
  year: string;
  search: string | null;
}

interface ServerSideAlbumItem extends GalleryAlbum {
  corpus: string;
}

interface ServerSidePhotoItem extends Item {
  corpus: string;
}

interface ServerSideAllItem extends Item {
  album?: NonNullable<AlbumMeta['albumName']>;
  gallery?: Gallery;
  corpus: string;
  coordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'];
}

type IndexedKeywords = {
  label: string;
  value: string;
}

// https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/54659
declare module 'react-image-gallery' {
  interface ReactImageGalleryProps {
    useWindowKeyDown?: boolean;
  }
}

// SplitViewer fullscreenMap
// https://stackoverflow.com/questions/25993861/how-do-i-get-typescript-to-stop-complaining-about-functions-it-doesnt-know-abou
declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
  }

  interface HTMLElement {
    msRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  }
}

type XmlItem = XmlCaseItem<true>
type RawXmlItem = XmlCaseItem<false>
type XmlAlbum = XmlCaseAlbum<true>
type RawXmlAlbum = XmlCaseAlbum<false>

export type {
  Gallery,
  AlbumMeta,
  XmlMeta,
  Album,
  XmlGallery,
  XmlGalleryAlbum,
  GalleryAlbum,
  ServerSideAlbumItem,
  ServerSideAllItem,
  XmlItem,
  RawXmlItem,
  Person,
  PersonItem,
  XmlPerson,
  XmlPersons,
  XmlAlbum,
  RawXmlAlbum,
  Item,
  ItemReferenceSource,
  IndexedKeywords,
}
