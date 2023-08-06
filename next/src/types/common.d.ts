export type AlbumMeta = {
  gallery?: string,
  geo: {
    zoom: number
  },
  albumName?: string,
  albumVersion?: string,
  markerZoom?: never,
  clusterMaxZoom?: string,
}

export type Item = {
  id: string,
  filename: string,
  city: string,
  location: string,
  caption: string,
  description: string | null,
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

export type Album = {
  album: {
    meta?: AlbumMeta,
    items: Item[]
  }
}
