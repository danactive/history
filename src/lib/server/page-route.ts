import type { ClusteredMarkers } from '../generate-clusters'
import { generateClusters } from '../generate-clusters'
import getGalleries from '../galleries'
import type { Item } from '../../types/common'
import type { Gallery } from '../../types/common'

export type RouteProps<TParams, TSearchParams> = {
  params: Promise<TParams>
  searchParams?: Promise<TSearchParams>
}

export type GalleryRouteProps<TSearchParams> = RouteProps<{ gallery: Gallery }, TSearchParams>

export async function generateGalleryStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ gallery }))
}

export async function resolveSearchParams<TSearchParams>(
  searchParams?: Promise<TSearchParams>,
): Promise<TSearchParams> {
  return searchParams ?? Promise.resolve({} as TSearchParams)
}

export async function resolveRouteInputs<TParams, TSearchParams>(
  params: Promise<TParams>,
  searchParams?: Promise<TSearchParams>,
): Promise<{ params: TParams, searchParams: TSearchParams }> {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, resolveSearchParams(searchParams)])

  return {
    params: resolvedParams,
    searchParams: resolvedSearchParams,
  }
}

export function buildClusteredPageData<TItem extends Item, TData extends { items: TItem[] }>(
  data: TData,
): TData & { clusteredMarkers: ClusteredMarkers } {
  return {
    ...data,
    clusteredMarkers: generateClusters(data.items),
  }
}
