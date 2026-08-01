import type { Metadata } from 'next'
import { Suspense } from 'react'

import AlbumPageComponent from '../../../src/components/Album/AlbumClient'
import { getAlbumData } from '../../../src/lib/album-page'
import getAlbums from '../../../src/lib/albums'
import getGalleries from '../../../src/lib/galleries'
import { buildClusteredPageData, resolveRouteInputs, type RouteProps } from '../../../src/lib/server/page-route'
import { parsePersonSearchParams, parseVisitedSearchParams, type PersonsSearchParams } from '../../../src/lib/server/search-params'
import type { Album } from '../../../src/types/pages'

export async function generateMetadata(
  { params }: { params: Promise<Album.Params> },
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

export default async function AlbumServer(props: RouteProps<Album.Params, PersonsSearchParams>) {
  const {
    params: { album, gallery },
    searchParams,
  } = await resolveRouteInputs(props.params, props.searchParams)
  const { visitedPlace } = parseVisitedSearchParams(searchParams)
  const { person } = parsePersonSearchParams(searchParams)

  const {
    items, meta, indexedKeywords, personOptions, tagOptions, totalItemCount, visitedPlace: scopedVisitedPlace, visitedFilterLabel,
    clusteredMarkers,
  } = buildClusteredPageData(await getAlbumData({ album, gallery, visitedPlace, selectedPerson: person }))
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlbumPageComponent
        gallery={gallery}
        album={album}
        items={items}
        totalItemCount={totalItemCount}
        meta={meta}
        indexedKeywords={indexedKeywords}
        personOptions={personOptions}
        tagOptions={tagOptions}
        clusteredMarkers={clusteredMarkers}
        visitedPlace={scopedVisitedPlace}
        visitedFilterLabel={visitedFilterLabel}
      />
    </Suspense>
  )
}
