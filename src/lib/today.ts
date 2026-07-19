import getAlbum from './album'
import getAlbums from './albums'
import indexKeywords, { addGeographyToSearch, addYearToSearch, getItemYearFromFilename } from './search'
import { countValuesByFrequency } from './storytelling-ranking'
import { buildVisitedDataFromItems, formatVisitedPlace } from './visited'
import config from '../models/config'
import type { AlbumMeta, Gallery, IndexedKeywords, Item } from '../types/common'

interface ServerSideTodayItem extends Item {
  album?: NonNullable<AlbumMeta['albumName']>;
  corpus: string;
  coordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'];
}

type CountedOption = {
  label: string
  value: string
  count: number
}

function splitTodayKeywords(items: ServerSideTodayItem[], indexedKeywords: IndexedKeywords[]) {
  const visitedData = buildVisitedDataFromItems(items.map((item) => ({
    city: item.city,
    filename: item.filename,
    photoDate: item.photoDate ?? null,
  })))
  const locationOptions = visitedData
    .flatMap((country) => {
      const countryOption = {
        label: `${country.country} (${country.count})`,
        value: country.filter.country,
        visitedPlace: country.filter,
        count: country.count,
      }
      const regionOptions = country.regions
        .filter(region => region.count >= config.visitedRegionSearchMinCount)
        .map((region) => ({
          label: `${formatVisitedPlace(region.filter)} (${region.count})`,
          value: formatVisitedPlace(region.filter),
          visitedPlace: region.filter,
          count: region.count,
        }))

      return [countryOption, ...regionOptions]
    })
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))

  const locationValues = new Set(locationOptions.map(option => option.value))
  const personCounts = countValuesByFrequency(
    items.flatMap(item => item.persons?.map(person => person.full) ?? []),
    items.length,
  )
  const personOptions: CountedOption[] = personCounts.map(({ name, count }) => ({
    label: `${name} (${count})`,
    value: name,
    count,
  }))
  const personValues = new Set(personOptions.map(option => option.value))
  const yearOptions = indexedKeywords.filter(option => /^\d{4}$/.test(option.value))
  const tagOptions = indexedKeywords.filter(
    option => !/^\d{4}$/.test(option.value) && !locationValues.has(option.value) && !personValues.has(option.value),
  )

  return {
    locationOptions,
    personCounts,
    personOptions,
    yearOptions,
    tagOptions,
  }
}

export async function getTodayItems(gallery: Gallery, monthDay: string) {
  const { [gallery]: { albums } } = await getAlbums(gallery)

  const prepareItems = (
    { albumName, albumCoordinateAccuracy, items }:
    {
      albumName: AlbumMeta['albumName'],
      albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'],
      items: Item[],
    },
  ) => items.map((item) => {
    const year = getItemYearFromFilename(item)
    const search = addYearToSearch(addGeographyToSearch(item), item)
    return {
      ...item,
      album: albumName,
      corpus: [item.description, item.caption, item.location, item.city, search, year]
        .join(' ')
        .trim(),
      coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
      search,
    }
  })

  const items = (await albums.reduce(async (previousPromise, album) => {
    const previousItems = await previousPromise
    const { album: { items: albumItems, meta } } = await getAlbum(gallery, album.name)
    const itemsMatchDate = albumItems.filter((item) => item?.filename?.toString().substring?.(5, 10) === monthDay)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = prepareItems({
      albumName: album.name,
      albumCoordinateAccuracy,
      items: itemsMatchDate,
    })
    return previousItems.concat(preparedItems.reverse())
  }, Promise.resolve([] as ServerSideTodayItem[]))).reverse()

  const { indexedKeywords } = indexKeywords(items)
  const { locationOptions, personCounts, personOptions, yearOptions, tagOptions } = splitTodayKeywords(items, indexedKeywords)

  return { items, indexedKeywords, locationOptions, personCounts, personOptions, yearOptions, tagOptions }
}
