import { Item } from '../../types/common'
import indexKeywords from '../search'

describe('Search hook', () => {
  const mockItem: Item = {
    id: '0',
    filename: '2023-08-23-00.jpg',
    photoDate: '2023-08-23',
    city: 'North Vancouver',
    location: 'Canada',
    caption: 'Mock caption',
    description: null,
    search: null,
    persons: null,
    title: 'Mock title',
    coordinates: null,
    coordinateAccuracy: null,
    thumbPath: './',
    photoPath: './',
    mediaPath: './',
    videoPaths: './',
    reference: null,
  }
  describe('No multiples', () => {
    test('No search', () => {
      const actual = indexKeywords([mockItem])
      const expected = { indexedKeywords: [] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('One word', () => {
      const keyword = 'keyword'
      const actual = indexKeywords([{
        ...mockItem,
        search: keyword,
      }])
      const expected = { indexedKeywords: [{ label: `${keyword} (1)`, value: keyword }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
  })
  describe('Multiples', () => {
    test('Duplicate', () => {
      const keyword = 'keyword'
      const actual = indexKeywords([{
        ...mockItem,
        search: keyword,
      }, {
        ...mockItem,
        search: keyword,
      }])
      const expected = { indexedKeywords: [{ label: `${keyword} (2)`, value: keyword }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('Duplicate plus another', () => {
      const keyword = 'keyword'
      const keyword2 = 'keyword2'
      const actual = indexKeywords([{
        ...mockItem,
        search: keyword,
      }, {
        ...mockItem,
        search: keyword,
      }, {
        ...mockItem,
        search: keyword2,
      }])
      const expected = { indexedKeywords: [{ label: `${keyword} (2)`, value: keyword }, { label: `${keyword2} (1)`, value: keyword2 }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('Order some most to least', () => {
      const keyword2 = 'keyword'
      const keyword1 = 'keyword2'
      const actual = indexKeywords([{
        ...mockItem,
        search: keyword2,
      }, {
        ...mockItem,
        search: keyword1,
      }, {
        ...mockItem,
        search: keyword1,
      }])
      const expected = { indexedKeywords: [{ label: `${keyword1} (2)`, value: keyword1 }, { label: `${keyword2} (1)`, value: keyword2 }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('Order many most to least', () => {
      const keyword2 = 'keyword'
      const keyword1 = 'keyword2'
      const items = []
      const oneCount = 9999
      const twoCount = 100000
      for (let j = 0; j < oneCount; j += 1) items.push({ ...mockItem, search: keyword1 })
      for (let i = 0; i < twoCount; i += 1) items.push({ ...mockItem, search: keyword2 })
      const actual = indexKeywords(items)
      const expected = {
        indexedKeywords: [
          { label: `${keyword2} (${twoCount})`, value: keyword2 },
          { label: `${keyword1} (${oneCount})`, value: keyword1 },
        ],
      }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
  })

  describe('Numbers and alphabet', () => {
    test('Sort by count for years', () => {
      const keywordYear1 = '1999'
      const keywordYear23 = '2023'
      const keywordYear22 = '2022'
      const actual = indexKeywords([{
        ...mockItem,
        search: keywordYear23,
      }, {
        ...mockItem,
        search: keywordYear1,
      }, {
        ...mockItem,
        search: keywordYear23,
      }, {
        ...mockItem,
        search: keywordYear1,
      }, {
        ...mockItem,
        search: keywordYear1,
      }, {
        ...mockItem,
        search: keywordYear22,
      }, {
        ...mockItem,
        search: keywordYear22,
      }, {
        ...mockItem,
        search: keywordYear22,
      }, {
        ...mockItem,
        search: keywordYear23,
      }])
      const expected = {
        indexedKeywords: [
          { label: `${keywordYear23} (3)`, value: keywordYear23 },
          { label: `${keywordYear22} (3)`, value: keywordYear22 },
          { label: `${keywordYear1} (3)`, value: keywordYear1 },
        ],
      }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })

    test('Year latest, then asc', () => {
      const keywordYear1 = '1999'
      const keywordYear2 = '2023'
      const keywordAlpha = 'Apple'
      const keywordBeta = 'Banana'
      const actual = indexKeywords([{
        ...mockItem,
        search: keywordAlpha,
      }, {
        ...mockItem,
        search: keywordYear1,
      }, {
        ...mockItem,
        search: keywordBeta,
      }, {
        ...mockItem,
        search: keywordAlpha,
      }, {
        ...mockItem,
        search: keywordYear2,
      }])
      const expected = {
        indexedKeywords: [
          { label: `${keywordAlpha} (2)`, value: keywordAlpha },
          { label: `${keywordYear2} (1)`, value: keywordYear2 },
          { label: `${keywordYear1} (1)`, value: keywordYear1 },
          { label: `${keywordBeta} (1)`, value: keywordBeta },
        ],
      }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
  })
})
