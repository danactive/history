import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mocks MUST be hoisted before any imports
vi.mock('heic-convert')
vi.mock('node:fs/promises')

import convert from 'heic-convert'
import { readFile, writeFile } from 'node:fs/promises'

vi.mocked(convert).mockImplementation(async () => new ArrayBuffer(8))
vi.mocked(readFile).mockImplementation(async () => Buffer.from('FAKE_HEIC'))
vi.mocked(writeFile).mockImplementation(async () => undefined)

import post, { errorSchema, type HeifResponseBody } from '../heifs'
import type { Filesystem } from '../filesystems'

const convertMock = vi.mocked(convert)
const readFileMock = vi.mocked(readFile)
const writeFileMock = vi.mocked(writeFile)

const fsEntry = (full: string): Filesystem => {
  const parts = full.split('.')
  const ext = parts.pop()!
  const base = parts.join('.')
  return {
    id: full,
    name: full,
    label: base,
    ext,
    filename: full,
    path: full,
    absolutePath: `public/${full}`,
    mediumType: ext === 'mov' ? 'video' : 'image',
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(convert).mockImplementation(async () => new ArrayBuffer(8))
  vi.mocked(readFile).mockImplementation(async () => Buffer.from('FAKE_HEIC'))
  vi.mocked(writeFile).mockImplementation(async () => undefined)
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('heifs.post()', () => {
  it('converts only HEIC without matching JPG', async () => {
    const files = [fsEntry('image1.heic'), fsEntry('image1.jpg'), fsEntry('image2.heic')]
    const res = await post(files, '/converted')
    expect(res.created).toEqual(['image2.jpg'])
    expect(convertMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledWith('public/image2.heic')
    expect(writeFileMock).toHaveBeenCalledWith('public/converted/image2.jpg', expect.any(Uint8Array))
  })

  it('empty created when no HEIC', async () => {
    const files = [fsEntry('a.jpg'), fsEntry('b.png')]
    const res = await post(files, '/out')
    expect(res.created).toEqual([])
    expect(convertMock).not.toHaveBeenCalled()
  })

  it('ignores video files (MOV) and only processes HEIC', async () => {
    const files = [
      fsEntry('photo1.jpg'),
      fsEntry('photo2.heic'),
      fsEntry('video1.mov'),
      fsEntry('video2.mov'),
      fsEntry('photo3.heic'),
      fsEntry('photo3.jpg'),
      fsEntry('photo4.heic'),
    ]
    const res = await post(files, '/mixed')
    // Only photo2.heic and photo4.heic should be converted (photo3 has JPG sibling, videos ignored)
    expect(res.created).toEqual(['photo2.jpg', 'photo4.jpg'])
    expect(convertMock).toHaveBeenCalledTimes(2)
    expect(readFileMock).toHaveBeenCalledWith('public/photo2.heic')
    expect(readFileMock).toHaveBeenCalledWith('public/photo4.heic')
    expect(writeFileMock).toHaveBeenCalledWith('public/mixed/photo2.jpg', expect.any(Uint8Array))
    expect(writeFileMock).toHaveBeenCalledWith('public/mixed/photo4.jpg', expect.any(Uint8Array))
  })

  it('real-world scenario: mixed JPG/HEIC pairs, standalone HEIC, and videos', async () => {
    const files: Filesystem[] = [
      {
        filename: '2025-03-20 14.59.57.jpg',
        label: '2025-03-20 14.59.57.jpg',
        mediumType: 'image',
        id: '/galleries/demo/todo/originals/2025-03-20 14.59.57.jpg',
        path: '/galleries/demo/todo/originals/2025-03-20 14.59.57.jpg',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 14.59.57.jpg',
        ext: 'jpg',
        name: '2025-03-20 14.59.57',
      },
      {
        filename: '2025-03-20 14.59.57.heic',
        label: '2025-03-20 14.59.57.heic',
        mediumType: 'image',
        id: '/galleries/demo/todo/originals/2025-03-20 14.59.57.heic',
        path: '/galleries/demo/todo/originals/2025-03-20 14.59.57.heic',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 14.59.57.heic',
        ext: 'heic',
        name: '2025-03-20 14.59.57',
      },
      {
        filename: '2025-03-20 15.52.40.jpg',
        label: '2025-03-20 15.52.40.jpg',
        mediumType: 'image',
        id: '/galleries/demo/todo/originals/2025-03-20 15.52.40.jpg',
        path: '/galleries/demo/todo/originals/2025-03-20 15.52.40.jpg',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 15.52.40.jpg',
        ext: 'jpg',
        name: '2025-03-20 15.52.40',
      },
      {
        filename: '2025-03-20 15.52.40.heic',
        label: '2025-03-20 15.52.40.heic',
        mediumType: 'image',
        id: '/galleries/demo/todo/originals/2025-03-20 15.52.40.heic',
        path: '/galleries/demo/todo/originals/2025-03-20 15.52.40.heic',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 15.52.40.heic',
        ext: 'heic',
        name: '2025-03-20 15.52.40',
      },
      {
        filename: '2025-03-20 16.15.17.jpg',
        label: '2025-03-20 16.15.17.jpg',
        mediumType: 'image',
        id: '/galleries/demo/todo/originals/2025-03-20 16.15.17.jpg',
        path: '/galleries/demo/todo/originals/2025-03-20 16.15.17.jpg',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 16.15.17.jpg',
        ext: 'jpg',
        name: '2025-03-20 16.15.17',
      },
      {
        filename: '2025-03-20 16.15.17.heic',
        label: '2025-03-20 16.15.17.heic',
        mediumType: 'image',
        id: '/galleries/demo/todo/originals/2025-03-20 16.15.17.heic',
        path: '/galleries/demo/todo/originals/2025-03-20 16.15.17.heic',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 16.15.17.heic',
        ext: 'heic',
        name: '2025-03-20 16.15.17',
      },
      {
        filename: '2025-03-20 16.19.12.mov',
        label: '2025-03-20 16.19.12.mov',
        mediumType: 'video',
        id: '/galleries/demo/todo/originals/2025-03-20 16.19.12.mov',
        path: '/galleries/demo/todo/originals/2025-03-20 16.19.12.mov',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 16.19.12.mov',
        ext: 'mov',
        name: '2025-03-20 16.19.12',
      },
      {
        filename: '2025-03-20 16.19.12.heic',
        label: '2025-03-20 16.19.12.heic',
        mediumType: 'image',
        id: '/galleries/demo/todo/originals/2025-03-20 16.19.12.heic',
        path: '/galleries/demo/todo/originals/2025-03-20 16.19.12.heic',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 16.19.12.heic',
        ext: 'heic',
        name: '2025-03-20 16.19.12',
      },
      {
        filename: '2025-03-20 16.56.11.mov',
        label: '2025-03-20 16.56.11.mov',
        mediumType: 'video',
        id: '/galleries/demo/todo/originals/2025-03-20 16.56.11.mov',
        path: '/galleries/demo/todo/originals/2025-03-20 16.56.11.mov',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 16.56.11.mov',
        ext: 'mov',
        name: '2025-03-20 16.56.11',
      },
      {
        filename: '2025-03-20 17.33.28.mov',
        label: '2025-03-20 17.33.28.mov',
        mediumType: 'video',
        id: '/galleries/demo/todo/originals/2025-03-20 17.33.28.mov',
        path: '/galleries/demo/todo/originals/2025-03-20 17.33.28.mov',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 17.33.28.mov',
        ext: 'mov',
        name: '2025-03-20 17.33.28',
      },
      {
        filename: '2025-03-20 17.55.41.mov',
        label: '2025-03-20 17.55.41.mov',
        mediumType: 'video',
        id: '/galleries/demo/todo/originals/2025-03-20 17.55.41.mov',
        path: '/galleries/demo/todo/originals/2025-03-20 17.55.41.mov',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 17.55.41.mov',
        ext: 'mov',
        name: '2025-03-20 17.55.41',
      },
      {
        filename: '2025-03-20 18.41.09.heic',
        label: '2025-03-20 18.41.09.heic',
        mediumType: 'image',
        id: '/galleries/demo/todo/originals/2025-03-20 18.41.09.heic',
        path: '/galleries/demo/todo/originals/2025-03-20 18.41.09.heic',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 18.41.09.heic',
        ext: 'heic',
        name: '2025-03-20 18.41.09',
      },
      {
        filename: '2025-03-20 20.30.18.heic',
        label: '2025-03-20 20.30.18.heic',
        mediumType: 'image',
        id: '/galleries/demo/todo/originals/2025-03-20 20.30.18.heic',
        path: '/galleries/demo/todo/originals/2025-03-20 20.30.18.heic',
        absolutePath: '/galleries/demo/todo/originals/2025-03-20 20.30.18.heic',
        ext: 'heic',
        name: '2025-03-20 20.30.18',
      },
    ]

    const res = await post(files, '/galleries/demo/todo/originals')

    // Expected conversions:
    // - 2025-03-20 14.59.57.heic → SKIP (has .jpg sibling)
    // - 2025-03-20 15.52.40.heic → SKIP (has .jpg sibling)
    // - 2025-03-20 16.15.17.heic → SKIP (has .jpg sibling)
    // - 2025-03-20 16.19.12.heic → CONVERT (has .mov but no .jpg)
    // - 2025-03-20 18.41.09.heic → CONVERT (no sibling)
    // - 2025-03-20 20.30.18.heic → CONVERT (no sibling)
    expect(res.created.sort()).toEqual([
      '2025-03-20 16.19.12.jpg',
      '2025-03-20 18.41.09.jpg',
      '2025-03-20 20.30.18.jpg',
    ])
    expect(convertMock).toHaveBeenCalledTimes(3)
  })

  it('envelope success', async () => {
    const files = [fsEntry('only.heic')]
    const res = await post(files, '/dest', true)
    expect(res.status).toBe(200)
    expect(res.body.created).toEqual(['only.jpg'])
  })

  it('quality and format passed', async () => {
    const files = [fsEntry('fmt.heic')]
    await post(files, '/dest')
    expect(convertMock).toHaveBeenCalledTimes(1)
    const arg = convertMock.mock.calls[0][0]
    expect(arg.format).toBe('JPEG')
    expect(arg.quality).toBe(0.8)
    expect(Buffer.isBuffer(arg.buffer)).toBe(true)
  })

  it('error path non-envelope: readFile throws', async () => {
    readFileMock.mockRejectedValueOnce(new Error('read fail'))
    const files = [fsEntry('bad.heic')]
    await expect(post(files, '/dest')).rejects.toThrow('read fail')
  })

  it('error path non-envelope: convert throws', async () => {
    convertMock.mockRejectedValueOnce(new Error('invalid HEIC'))
    const files = [fsEntry('corrupt.heic')]
    await expect(post(files, '/dest')).rejects.toThrow('invalid HEIC')
  })

  it('error path non-envelope: writeFile throws', async () => {
    writeFileMock.mockRejectedValueOnce(new Error('ENOSPC: no space left'))
    const files = [fsEntry('disk.heic')]
    await expect(post(files, '/dest')).rejects.toThrow('ENOSPC')
  })

  it('error path envelope: readFile throws (returns 500)', async () => {
    readFileMock.mockRejectedValueOnce(new Error('read fail env'))
    const files = [fsEntry('bad2.heic')]
    const res = await post(files, '/dest', true)
    expect(res.status).toBe(500)
    expect(res.body.created).toEqual([])
    expect(res.body.error?.message).toBe('read fail env')
  })

  it('error path envelope: convert throws (returns 500)', async () => {
    convertMock.mockRejectedValueOnce(new Error('conversion failed'))
    const files = [fsEntry('bad3.heic')]
    const res = await post(files, '/dest', true)
    expect(res.status).toBe(500)
    expect(res.body.error?.message).toBe('conversion failed')
  })

  it('error path envelope: writeFile throws (returns 500)', async () => {
    writeFileMock.mockRejectedValueOnce(new Error('write denied'))
    const files = [fsEntry('bad4.heic')]
    const res = await post(files, '/dest', true)
    expect(res.status).toBe(500)
    expect(res.body.error?.message).toBe('write denied')
  })

  it('error path envelope: non-Error object throws (returns 404)', async () => {
    // Use an object (not primitive string) to avoid 'in' operator error
    readFileMock.mockRejectedValueOnce({ code: 'UNKNOWN', detail: 'weird error' })
    const files = [fsEntry('weird.heic')]
    const res = await post(files, '/dest', true)
    expect(res.status).toBe(404)
    expect(res.body.error?.message).toBe('No HEIF files were found')
  })

  it('errorSchema empty message', () => {
    const out = errorSchema('')
    expect(out.created).toEqual([])
    expect(out.error).toBeUndefined()
  })

  it('errorSchema with message', () => {
    const out = errorSchema('boom')
    expect(out.created).toEqual([])
    expect(out.error?.message).toBe('boom')
  })
})
