const lib = require('../search')

describe('Seach hook', () => {
  describe('No multiples', () => {
    test('No search', () => {
      const actual = lib.indexKeywords([{}])
      const expected = { indexedKeywords: [] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('One word', () => {
      const keyword = 'keyword'
      const actual = lib.indexKeywords([{ search: keyword }])
      const expected = { indexedKeywords: [{ label: keyword, value: keyword }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
  })
  describe('Multiples', () => {
    test('Duplicate', () => {
      const keyword = 'keyword'
      const actual = lib.indexKeywords([{ search: keyword }, { search: keyword }])
      const expected = { indexedKeywords: [{ label: keyword, value: keyword }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
    test('Duplicate plus another', () => {
      const keyword = 'keyword'
      const keyword2 = 'keyword2'
      const actual = lib.indexKeywords([{ search: keyword }, { search: keyword }, { search: keyword2 }, { search: keyword2 }])
      const expected = { indexedKeywords: [{ label: keyword, value: keyword }, { label: keyword2, value: keyword2 }] }
      expect(actual.indexedKeywords).toStrictEqual(expected.indexedKeywords)
    })
  })
})
