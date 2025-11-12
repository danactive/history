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
    mediumType: 'image',
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
