import path from 'node:path'
import utilsFactory from '../utils'

describe('Utils library', () => {
  const gallery = 'demo'
  const lib = utilsFactory()

  describe('mimeType', () => {
    const unit = lib.mimeType

    test('txt', () => {
      const actual = unit('txt')
      const expected = 'text/plain'
      expect(actual).toBe(expected)
    })

    test('supported image', () => {
      const actual = unit('jpg')
      const expected = 'image'
      expect(actual).toBe(expected)
    })

    test('RAW', () => {
      const actual = unit('raw')
      const expected = 'image/raw'
      expect(actual).toBe(expected)
    })

    test('afphoto', () => {
      const actual = unit('afphoto')
      const expected = 'unknown'
      expect(actual).toBe(expected)
    })

    test('xml', () => {
      const actual = unit('sample.xml')
      const expected = 'application/xml'
      expect(actual).toBe(expected)
    })
  })

  describe('mediumType', () => {
    const unit = lib.mediumType

    test('image', () => {
      const actual = unit('photo')
      const expected = 'image'
      expect(actual).toBe(expected)
    })

    test('video', () => {
      const actual = unit('video')
      const expected = 'video'
      expect(actual).toBe(expected)
    })

    test('unknown', () => {
      const actual = unit('unknown')
      const expected = 'unknown'
      expect(actual).toBe(expected)
    })

    test('xml', () => {
      const actual = unit('application/xml')
      const expected = 'xml'
      expect(actual).toBe(expected)
    })
  })

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

  test('* File - Glob', async () => {
    expect.assertions(14)
    const expectedHtm = path.join(__dirname, '../../../public/test/fixtures/renameable/aitch.htm')
    const expectedHtml = path.join(__dirname, '../../../public/test/fixtures/renameable/aitch.html')

    let files = await lib.glob('public/test/fixtures/renameable/*.fake')
    expect(files.length).toBe(0)
    expect(files.length).toBe([].length)

    files = await lib.glob('public/test/fixtures/renameable/*.htm')
    expect(files.length).toBe(1)
    expect(path.resolve(files[0])).toBe(expectedHtm)

    files = await lib.glob('public/test/fixtures/renameable/*.html')
    expect(files.length).toBe(1)
    expect(path.resolve(files[0])).toBe(expectedHtml)

    files = await lib.glob('public/test/fixtures/renameable/*.htm*')
    expect(files.length).toBe(2)
    expect(path.resolve(files[0])).toBe(expectedHtm)
    expect(path.resolve(files[1])).toBe(expectedHtml)

    files = await lib.glob('public/test/fixtures/renameable/aitch.*')
    expect(files.length).toBe(2)
    expect(path.resolve(files[0])).toBe(expectedHtm)
    expect(path.resolve(files[1])).toBe(expectedHtml)

    files = await lib.glob('public/test/fixtures/renameable/*.*')
    expect(path.resolve(files[0])).toBe(expectedHtm)
    expect(path.resolve(files[1])).toBe(expectedHtml)
  })
})
