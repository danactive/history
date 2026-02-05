import { getAllItems, allPageItemMapper } from './get-all-items'
import type { All } from '../types/pages'

export async function getAllData({ gallery }: All.Params): Promise<All.ItemData> {
  return getAllItems(gallery, allPageItemMapper, true)
}
