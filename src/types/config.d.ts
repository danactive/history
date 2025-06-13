import type { Gallery } from './common'

export type Dimension = {
  width: number
  height: number
}

export type Config = {
  apiPort: number
  nextPort: number
  pythonPort: number
  defaultAlbum: string
  defaultGallery: Gallery
  defaultZoom: number
  defaultDimensions: {
    video: Dimension
  }
  resizeDimensions: {
    photo: Dimension
    thumb: Dimension
    preview: Dimension
  }
  previewFolderName: string
  supportedFileTypes: {
    photo: string[]
    video: string[]
  }
  rawFileTypes: {
    photo: string[]
    video: string[]
  }
}
