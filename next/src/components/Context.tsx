import { createContext } from 'react'
import { type AlbumMeta } from '../types/common'

const AlbumContext = createContext<AlbumMeta | undefined>(undefined)
export default AlbumContext
