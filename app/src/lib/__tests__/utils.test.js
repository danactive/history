const utilsFactory = require('../utils')

describe('Album library', () => {
  const gallery = 'demo'
  const lib = utilsFactory(() => {})

  describe('jpgFilenameInsensitive', () => {
    const unit = lib.jpgFilenameInsensitive

    test('jpg', () => {
      const actual = unit('filename.jpg')
      const expected = 'filename.jpg'
      expect(actual)
        .toBe(expected)
    })
    test('JPG', () => {
      const actual = unit('filename.JPG')
      const expected = 'filename.JPG'
      expect(actual)
        .toBe(expected)
    })
    test('JPg', () => {
      const actual = unit('filename.JPg')
      const expected = 'filename.JPg'
      expect(actual)
        .toBe(expected)
    })
    test('JPeG', () => {
      const actual = unit('filename.JPeG')
      const expected = 'filename.jpg'
      expect(actual)
        .toBe(expected)
    })
    test('jpeg', () => {
      const actual = unit('filename.jpeg')
      const expected = 'filename.jpg'
      expect(actual)
        .toBe(expected)
    })
    test('png', () => {
      const actual = unit('filename.png')
      const expected = 'filename.jpg'
      expect(actual)
        .toBe(expected)
    })
  })

  test('thumbPath', () => {
    const item = { filename: '2016-12-31-01.jpg' }
    const expectedPath = `/galleries/${gallery}/media/thumbs/2016/${item.filename}`
    expect(lib.thumbPath(item, gallery))
      .toBe(expectedPath)
  })
})
