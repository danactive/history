import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  readFile: vi.fn(),
  rename: vi.fn(),
  rm: vi.fn(),
  writeFile: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  __esModule: true,
  default: mocks,
}))
vi.mock('../curation/lock', () => ({ acquireLock: vi.fn(async () => async () => {}) }))

import { AlbumRevisionConflict, InvalidAlbumXmlError, writeAlbum } from '../xml'
import { digest } from '../curation/files'

const validXml = '<?xml version="1.0" encoding="UTF-8"?><album><item id="1" /></album>'

describe('writeAlbum', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.access.mockResolvedValue(undefined)
    mocks.writeFile.mockResolvedValue(undefined)
    mocks.rename.mockResolvedValue(undefined)
    mocks.rm.mockResolvedValue(undefined)
  })

  test('atomically replaces the selected existing album with the exact XML', async () => {
    await writeAlbum('demo', 'sample', validXml)

    expect(mocks.access).toHaveBeenCalledWith('public/galleries/demo/sample.xml', expect.any(Number))
    expect(mocks.writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/^public\/galleries\/demo\/\.sample\.xml\.[\w-]+\.tmp$/),
      validXml,
      'utf8',
    )
    expect(mocks.rename).toHaveBeenCalledWith(
      mocks.writeFile.mock.calls[0][0],
      'public/galleries/demo/sample.xml',
    )
  })

  test('rejects malformed XML before touching the album file', async () => {
    await expect(writeAlbum('demo', 'sample', '<album>')).rejects.toThrow(InvalidAlbumXmlError)

    expect(mocks.access).not.toHaveBeenCalled()
    expect(mocks.writeFile).not.toHaveBeenCalled()
  })

  test('rejects non-album XML before touching the album file', async () => {
    await expect(writeAlbum('demo', 'sample', '<not-album />')).rejects.toThrow('album root element')

    expect(mocks.access).not.toHaveBeenCalled()
    expect(mocks.writeFile).not.toHaveBeenCalled()
  })

  test('rejects an album path traversal attempt', async () => {
    await expect(writeAlbum('demo', '../gallery', validXml)).rejects.toThrow('Album name is not valid')

    expect(mocks.access).not.toHaveBeenCalled()
  })

  test('removes a temporary file after a filesystem failure', async () => {
    mocks.rename.mockRejectedValueOnce(new Error('disk full'))

    await expect(writeAlbum('demo', 'sample', validXml)).rejects.toThrow('disk full')

    expect(mocks.rm).toHaveBeenCalledWith(mocks.writeFile.mock.calls[0][0], { force: true })
  })

  test('rejects an outdated source revision without replacing newer XML', async () => {
    mocks.readFile.mockResolvedValue('<album><item id="newer" /></album>')
    await expect(writeAlbum('demo', 'sample', validXml, digest(validXml))).rejects.toThrow(AlbumRevisionConflict)
    expect(mocks.rename).not.toHaveBeenCalled()
    expect(mocks.rm).toHaveBeenCalled()
  })

  test('saves when the revision matches the current file', async () => {
    mocks.readFile.mockResolvedValue(validXml)
    await writeAlbum('demo', 'sample', '<album />', digest(validXml))
    expect(mocks.rename).toHaveBeenCalled()
  })
})
