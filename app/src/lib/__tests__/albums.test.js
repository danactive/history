import lib from '../album'

describe('Album library', () => {
  const gallery = 'demo'
  describe('jpgFilenameInsensitive', () => {
    const unit = lib.jpgFilenameInsensitive

    test('jpg', () => {
      const actual = unit('filename.jpg')
      const expected = 'filename.jpg'
      expect(actual).toBe(expected)
    })
    test('JPG', () => {
      const actual = unit('filename.JPG')
      const expected = 'filename.JPG'
      expect(actual).toBe(expected)
    })
    test('JPg', () => {
      const actual = unit('filename.JPg')
      const expected = 'filename.JPg'
      expect(actual).toBe(expected)
    })
    test('JPeG', () => {
      const actual = unit('filename.JPeG')
      const expected = 'filename.jpg'
      expect(actual).toBe(expected)
    })
    test('jpeg', () => {
      const actual = unit('filename.jpeg')
      const expected = 'filename.jpg'
      expect(actual).toBe(expected)
    })
    test('png', () => {
      const actual = unit('filename.png')
      const expected = 'filename.jpg'
      expect(actual).toBe(expected)
    })
  })

  test('getThumbPath', () => {
    const item = { filename: '2016-12-31-01.jpg' }
    const expectedPath = `/galleries/${gallery}/media/thumbs/2016/${item.filename}`
    expect(lib.getThumbPath(item, gallery)).toBe(expectedPath)
  })

  describe('getVideoPath', () => {
    test('Just filename', () => {
      const item = { filename: '2016-12-31-01.mp4' }
      const expectedPath = `/view/video?sources=${item.filename}&w=&h=&gallery=${gallery}`
      expect(lib.getVideoPath(item, gallery)).toBe(expectedPath)
    })

    test('All', () => {
      const item = { filename: '2016-12-31-01.mp4', size: { w: 1, h: 2 } }
      const expectedPath = `/view/video?sources=${item.filename}&w=${item.size.w}&h=${item.size.h}&gallery=${gallery}`
      expect(lib.getVideoPath(item, gallery)).toBe(expectedPath)
    })
  })

  describe('transformJsonSchema', () => {
    test('Blank', () => {
      const result = lib.transformJsonSchema()
      expect(result).toEqual({})
    })

    test('Meta', () => {
      const mock = { album: { meta: 'Self talk' } }
      const result = lib.transformJsonSchema(mock)
      expect(result).toEqual(mock)
    })

    test('Meta', () => {
      const mock = { album: { meta: 'Self talk' } }
      mock.album.item = [{ $: { id: 1 } }]
      const result = lib.transformJsonSchema(mock)
      expect(result.album.meta).toEqual(mock.album.meta)
      expect(result.album.items[0].$).toEqual(mock.album.item[0].$)
    })
  })
})
