import { NextRequest, NextResponse } from 'next/server'
import { getAlbumData } from '../../../../../src/lib/album-page'
import { getAllData } from '../../../../../src/lib/all'
import { getVisitedPlaceFromSearchParams, type VisitedSearchParams } from '../../../../../src/lib/domains/visited'
import { getItemYearFromFilename, isYearToken } from '../../../../../src/lib/domains/years'
import { filterPersonsItems } from '../../../../../src/lib/persons'
import { getAgeFromSearchParams, getPersonFromSearchParams, getPersonsPageData } from '../../../../../src/lib/persons-page'
import { buildFilterMetadata } from '../../../../../src/lib/server/filter-metadata'
import { getTodayItems } from '../../../../../src/lib/today'
import type { Gallery, IndexedKeywords } from '../../../../../src/types/common'
import { matchCorpus, normalizeSearchValue } from '../../../../../src/utils/search'

type DomainsView = 'all' | 'album' | 'persons' | 'today'

type InspectableItem = {
  corpus: string
  search?: string | null
  year?: string | null
  photoDate?: string | null
  filename?: string | string[]
}

function errorBody(message: string) {
  return { error: { message } }
}

function hasFilename(item: InspectableItem): item is InspectableItem & { filename: string | string[] } {
  return 'filename' in item && Boolean(item.filename)
}

function hasExactSearchToken(item: InspectableItem, keyword: string) {
  if (!item.search) {
    return false
  }

  const normalizedKeyword = normalizeSearchValue(keyword)
  return item.search
    .split(',')
    .some((token) => normalizeSearchValue(token) === normalizedKeyword)
}

function getExactSearchYear(item: InspectableItem): string {
  if (hasFilename(item)) {
    return getItemYearFromFilename({
      filename: item.filename,
      photoDate: item.photoDate ?? null,
    })
  }

  const year = item.year?.trim() ?? ''
  return isYearToken(year) ? year : ''
}

function isSimpleKeyword(keyword: string) {
  const trimmed = keyword.trim()
  return Boolean(trimmed)
    && !trimmed.includes('&&')
    && !trimmed.includes('||')
    && !trimmed.includes('(')
    && !trimmed.includes(')')
}

function filterItemsByKeyword<ItemType extends InspectableItem>(
  items: ItemType[],
  keyword: string,
  indexedKeywords: IndexedKeywords[],
) {
  if (!keyword) {
    return items
  }

  if (isSimpleKeyword(keyword)) {
    if (isYearToken(keyword)) {
      return items.filter((item) => {
        const exactYear = getExactSearchYear(item)
        return exactYear ? exactYear === keyword : matchCorpus(item.corpus, keyword)
      })
    }

    const exactIndexedKeywordValues = new Set(indexedKeywords.map((option) => normalizeSearchValue(option.value)))
    if (exactIndexedKeywordValues.has(normalizeSearchValue(keyword))) {
      return items.filter((item) => hasExactSearchToken(item, keyword))
    }
  }

  return items.filter((item) => matchCorpus(item.corpus, keyword))
}

function buildKeywordDebug<ItemType extends InspectableItem>(
  items: ItemType[],
  indexedKeywords: IndexedKeywords[],
  keyword: string | null,
) {
  if (!keyword) {
    return null
  }

  const trimmedKeyword = keyword.trim()
  if (!trimmedKeyword) {
    return null
  }

  const normalizedKeyword = normalizeSearchValue(trimmedKeyword)
  const exactTokenCount = items.filter((item) => hasExactSearchToken(item, trimmedKeyword)).length
  const filteredCount = filterItemsByKeyword(items, trimmedKeyword, indexedKeywords).length
  const indexedOption = indexedKeywords.find((option) => normalizeSearchValue(option.value) === normalizedKeyword) ?? null

  return {
    keyword: trimmedKeyword,
    indexedOption,
    exactTokenCount,
    filteredCount,
  }
}

function getView(value: string | null): DomainsView {
  switch (value) {
    case 'album':
    case 'persons':
    case 'today':
      return value
    default:
      return 'all'
  }
}

function getVisitedParams(searchParams: URLSearchParams): VisitedSearchParams {
  return {
    visitedCountry: searchParams.get('visitedCountry') ?? undefined,
    visitedRegion: searchParams.get('visitedRegion') ?? undefined,
  }
}

export async function GET(request: NextRequest, props: { params: Promise<{ gallery: Gallery }> }) {
  const { gallery } = await props.params
  const { searchParams } = request.nextUrl
  const view = getView(searchParams.get('view'))
  const keyword = searchParams.get('keyword')
  const visitedPlace = getVisitedPlaceFromSearchParams(getVisitedParams(searchParams))

  try {
    if (view === 'album') {
      const album = searchParams.get('album')?.trim()
      if (!album) {
        return NextResponse.json(errorBody('album query param is required for view=album'), { status: 400 })
      }

      const data = await getAlbumData({ gallery, album, visitedPlace })
      const domains = buildFilterMetadata(data.items)

      return NextResponse.json({
        gallery,
        view,
        filters: {
          album,
          keyword: keyword ?? null,
          visitedPlace,
        },
        counts: {
          totalItemCount: data.totalItemCount ?? data.items.length,
          scopedItemCount: data.items.length,
        },
        domains,
        keywordDebug: buildKeywordDebug(data.items, domains.indexedKeywords, keyword),
      })
    }

    if (view === 'today') {
      const monthDay = searchParams.get('monthDay')?.trim()
      if (!monthDay) {
        return NextResponse.json(errorBody('monthDay query param is required for view=today'), { status: 400 })
      }

      const data = await getTodayItems(gallery, monthDay, visitedPlace)

      return NextResponse.json({
        gallery,
        view,
        filters: {
          monthDay,
          keyword: keyword ?? null,
          visitedPlace,
        },
        counts: {
          totalItemCount: data.totalItemCount ?? data.items.length,
          scopedItemCount: data.items.length,
        },
        domains: {
          indexedKeywords: data.indexedKeywords,
          locationOptions: data.locationOptions,
          personCounts: data.personCounts,
          personOptions: data.personOptions,
          yearOptions: data.yearOptions,
          tagOptions: data.tagOptions,
        },
        keywordDebug: buildKeywordDebug(data.items, data.indexedKeywords, keyword),
      })
    }

    if (view === 'persons') {
      const selectedAge = getAgeFromSearchParams({ age: searchParams.get('age') ?? undefined })
      const selectedPerson = getPersonFromSearchParams({ person: searchParams.get('person') ?? undefined })
      const data = await getPersonsPageData({
        gallery,
        selectedAge,
        selectedPerson,
        searchParams: {
          visitedCountry: searchParams.get('visitedCountry') ?? undefined,
          visitedRegion: searchParams.get('visitedRegion') ?? undefined,
          age: searchParams.get('age') ?? undefined,
          person: searchParams.get('person') ?? undefined,
        },
      })
      const visitedScopedItems = visitedPlace
        ? data.items.filter((item) => item.visitedPlace?.country === visitedPlace.country && item.visitedPlace?.region === visitedPlace.region)
        : data.items
      const filteredItems = filterPersonsItems(visitedScopedItems, selectedAge, selectedPerson)
      const domains = buildFilterMetadata(visitedScopedItems)

      return NextResponse.json({
        gallery,
        view,
        filters: {
          keyword: keyword ?? null,
          visitedPlace,
          age: selectedAge,
          person: selectedPerson,
        },
        counts: {
          totalItemCount: data.totalItemCount ?? data.items.length,
          scopedItemCount: visitedScopedItems.length,
          selectedItemCount: filteredItems.length,
        },
        domains,
        ageSummary: data.initialAgeSummary,
        keywordDebug: buildKeywordDebug(visitedScopedItems, domains.indexedKeywords, keyword),
      })
    }

    const data = await getAllData({ gallery, visitedPlace })
    const domains = buildFilterMetadata(data.items)

    return NextResponse.json({
      gallery,
      view,
      filters: {
        keyword: keyword ?? null,
        visitedPlace,
      },
      counts: {
        totalItemCount: data.totalItemCount ?? data.items.length,
        scopedItemCount: data.items.length,
      },
      domains,
      keywordDebug: buildKeywordDebug(data.items, domains.indexedKeywords, keyword),
    })
  } catch (error) {
    console.error('Failed to inspect domains:', error)
    return NextResponse.json(errorBody('Failed to inspect domains'), { status: 500 })
  }
}

function notSupported(req: Request) {
  return NextResponse.json(errorBody(`Method ${req.method} Not Allowed`), { status: 405 })
}

export {
  notSupported as DELETE, notSupported as HEAD, notSupported as OPTIONS, notSupported as PATCH, notSupported as POST,
  notSupported as PUT,
}

