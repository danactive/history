import type { Gallery } from '../types/common'
import getAlbum from './album'
import getAlbums from './albums'
import type { CountryVisit } from './visited-core'
import { buildVisitedDataFromItems } from './visited-core'

export {
  buildVisitedDataFromItems,
  buildVisitedKeywordOptions,
  buildVisitedRegionCountryIndex,
  formatVisitedPlace,
  formatVisitedYears,
  getVisitedPlace,
  matchesVisitedPlace,
} from './visited-core'
export type { CountryVisit, RegionVisit, VisitedPlace } from './visited-core'

export async function getVisitedData(gallery: Gallery): Promise<CountryVisit[]> {
  const { [gallery]: { albums } } = await getAlbums(gallery)
  const albumItems = await Promise.all(albums.map(async (album) => {
    const { album: { items } } = await getAlbum(gallery, album.name)
    return items
  }))

  return buildVisitedDataFromItems(albumItems.flat())
}
