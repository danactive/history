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

type XmlMeta = {
  gallery?: string,
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

type XmlItem = {
  $: {
    id: string,
  },
  type?: 'video' | 'photo',
  size?: { w: string, h: string },
  filename: string | string[],
  photoCity: string,
  photoLoc?: string,
  thumbCaption: string,
  photoDesc?: string,
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
}

type XmlAlbum = {
  album: {
    meta?: XmlMeta,
    item?: XmlItem | XmlItem[]
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

interface ServerSideAllItem extends Item {
  album?: NonNullable<AlbumMeta['albumName']>;
  gallery?: NonNullable<AlbumMeta['gallery']>;
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

export type {
  AlbumMeta,
  XmlMeta,
  Album,
  XmlGallery,
  XmlGalleryAlbum,
  GalleryAlbum,
  ServerSideAlbumItem,
  ServerSideAllItem,
  XmlItem,
  Person,
  PersonItem,
  XmlPerson,
  XmlPersons,
  XmlAlbum,
  Item,
  ItemReferenceSource,
  IndexedKeywords,
}
