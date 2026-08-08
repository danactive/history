import type { Metadata } from 'next'
import { Suspense } from 'react'

import AlbumPageComponent from '../../../src/components/Album/AlbumClient'
import { getAlbumData } from '../../../src/lib/album-page'
import { parseMapBoundsParam } from '../../../src/lib/map-filter-query'
import getAlbums from '../../../src/lib/albums'
import getGalleries from '../../../src/lib/galleries'
import {
  buildClusteredPageData,
  resolveRouteInputs,
  type AlbumRouteParams,
  type RouteParamsProps,
  type RouteProps,
} from '../../../src/lib/server/page-route'
import { getQueryFromSearchParams, type QuerySearchParams } from '../../../src/lib/server/search-params'

export async function generateMetadata(
  { params }: RouteParamsProps<AlbumRouteParams>,
): Promise<Metadata> {
  const album = (await params).album
  return { title: `Album ${album} - History App` }
}

async function buildStaticPaths() {
  const { galleries } = await getGalleries()
  const groups = await Promise.all(galleries.map(async (gallery) => {
    const { [gallery]: { albums } } = await getAlbums(gallery)
    return albums.map(({ name: album }) => ({ gallery, album }))
  }))
  return groups.flat()
}

export async function generateStaticParams() {
  return buildStaticPaths()
}

export default function AlbumServer(props: RouteProps<AlbumRouteParams, QuerySearchParams>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlbumServerContent {...props} />
    </Suspense>
  )
}

async function AlbumServerContent(props: RouteProps<AlbumRouteParams, QuerySearchParams>) {
  const {
    params: { album, gallery },
    searchParams,
  } = await resolveRouteInputs(props.params, props.searchParams)
  const query = getQueryFromSearchParams(searchParams)
  const mapBounds = parseMapBoundsParam(searchParams.bbox)

  const {
    items, meta, indexedKeywords, personOptions, tagOptions, activeFacetCounts, totalItemCount,
    clusteredMarkers,
  } = buildClusteredPageData(await getAlbumData({ album, gallery, query, mapBounds }))
  return (
    <AlbumPageComponent
      gallery={gallery}
      album={album}
      items={items}
      totalItemCount={totalItemCount}
      meta={meta}
      indexedKeywords={indexedKeywords}
      personOptions={personOptions}
      tagOptions={tagOptions}
      activeFacetCounts={activeFacetCounts}
      clusteredMarkers={clusteredMarkers}
    />
  )
}
