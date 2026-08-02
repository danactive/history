import type { Metadata } from 'next'
import { Suspense } from 'react'

import GalleryPageComponent from '../../src/components/GalleryPage'
import getAlbums from '../../src/lib/albums'
import { filterItemsByQuery, getFilterQueryContext, parseFilterQuery } from '../../src/lib/filter-query'
import { buildFilterMetadata } from '../../src/lib/server/filter-metadata'
import {
  generateGalleryStaticParams,
  resolveRouteInputs,
  type GalleryRouteProps,
} from '../../src/lib/server/page-route'
import { getQueryFromSearchParams, type QuerySearchParams } from '../../src/lib/server/search-params'
import type { Gallery as GalleryName, ServerSideAlbumItem } from '../../src/types/common'
import type { Gallery } from '../../src/types/pages'

export const metadata: Metadata = {
  title: 'Albums - History App',
}

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

async function getAlbumsData(gallery: GalleryName, searchParams?: QuerySearchParams): Promise<Gallery.ComponentProps> {
  const { [gallery]: { albums } } = await getAlbums(gallery)
  const preparedAlbums = albums.map((album): ServerSideAlbumItem => ({
    ...album,
    corpus: [album.h1, album.h2, album.year, album.search].join(' '),
  }))
  const baseMetadata = buildFilterMetadata(preparedAlbums)
  const query = getQueryFromSearchParams(searchParams)
  const filteredAlbums = filterItemsByQuery(
    preparedAlbums,
    parseFilterQuery(query, getFilterQueryContext(baseMetadata)),
  )
  const { indexedKeywords, personOptions, tagOptions } = buildFilterMetadata(filteredAlbums)

  return {
    gallery,
    albums: filteredAlbums,
    indexedKeywords,
    personOptions,
    tagOptions,
  }
}

export default async function GalleryServer({
  params,
  searchParams,
}: GalleryRouteProps<QuerySearchParams>) {
  const {
    params: { gallery },
    searchParams: resolvedSearchParams,
  } = await resolveRouteInputs(params, searchParams)

  const {
    albums,
    indexedKeywords,
    personOptions,
    tagOptions,
  } = await getAlbumsData(gallery, resolvedSearchParams)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryPageComponent
        albums={albums}
        gallery={gallery}
        indexedKeywords={indexedKeywords}
        personOptions={personOptions}
        tagOptions={tagOptions}
      />
    </Suspense>
  )
}
