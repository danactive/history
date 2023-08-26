import indexKeywords from '../search'

describe('Search hook', () => {
  describe('No multiples', () => {
    test('No search', () => {
      const actual = indexKeywords([{}])
      const expected = { indexedKeywords: [] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('One word', () => {
      const keyword = 'keyword'
      const actual = indexKeywords([{ search: keyword }])
      const expected = { indexedKeywords: [{ label: `${keyword} (1)`, value: keyword }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
  })
  describe('Multiples', () => {
    test('Duplicate', () => {
      const keyword = 'keyword'
      const actual = indexKeywords([{ search: keyword }, { search: keyword }])
      const expected = { indexedKeywords: [{ label: `${keyword} (2)`, value: keyword }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('Duplicate plus another', () => {
      const keyword = 'keyword'
      const keyword2 = 'keyword2'
      const actual = indexKeywords([{ search: keyword }, { search: keyword }, { search: keyword2 }])
      const expected = { indexedKeywords: [{ label: `${keyword} (2)`, value: keyword }, { label: `${keyword2} (1)`, value: keyword2 }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('Order some most to least', () => {
      const keyword2 = 'keyword'
      const keyword1 = 'keyword2'
      const actual = indexKeywords([{ search: keyword2 }, { search: keyword1 }, { search: keyword1 }])
      const expected = { indexedKeywords: [{ label: `${keyword1} (2)`, value: keyword1 }, { label: `${keyword2} (1)`, value: keyword2 }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('Order many most to least', () => {
      const keyword2 = 'keyword'
      const keyword1 = 'keyword2'
      const items = []
      const oneCount = 9999
      const twoCount = 100000
      for (let j = 0; j < oneCount; j += 1) items.push({ search: keyword1 })
      for (let i = 0; i < twoCount; i += 1) items.push({ search: keyword2 })
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
})
