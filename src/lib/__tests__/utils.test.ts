import utilsFactory from '../utils'

describe('Utils library', () => {
  const gallery = 'demo'
  const lib = utilsFactory()

  describe('filenameAsJpg', () => {
    const unit = lib.filenameAsJpg

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
      const expected = 'filename.JPeG'
      expect(actual).toBe(expected)
    })
    test('jpeg', () => {
      const actual = unit('filename.jpeg')
      const expected = 'filename.jpeg'
      expect(actual).toBe(expected)
    })
    test('png', () => {
      const actual = unit('filename.png')
      const expected = 'filename.jpg'
      expect(actual).toBe(expected)
    })
    test('heif', () => {
      const actual = unit('filename.heic.heif')
      const expected = 'filename.heic.jpg'
      expect(actual).toBe(expected)
    })
  })

  test('thumbPath', () => {
    const item = { filename: '2016-12-31-01.jpg' }
    const expectedPath = `/galleries/${gallery}/media/thumbs/2016/${item.filename}`
    expect(lib.thumbPath(item.filename, gallery)).toBe(expectedPath)
  })

  test('videoPaths', () => {
    const videoFilenames = ['2016-12-31-01.mov', '2023-08-29-01.mp4']
    const expectedPath = [
      `/galleries/${gallery}/media/videos/2016/${videoFilenames[0]}`,
      `/galleries/${gallery}/media/videos/2023/${videoFilenames[1]}`,
    ]
    expect(lib.getVideoPaths(videoFilenames, gallery)).toStrictEqual(expectedPath)
  })
})
