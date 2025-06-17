import { describe, test, expect, vi } from 'vitest'
import { moveRaws } from '../rename'
import path from 'path'

vi.mock('../fs', async () => {
  return {
    readdir: vi.fn(),
    rename: vi.fn(),
    mkdir: vi.fn(),
  }
})

import * as fs from '../fs'


describe('moveRaws function', () => {
  let originalPath: string
  let filesOnDisk: string[]
  let errors: string[]
  let formatErrorMessage: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
    originalPath = '/'
    filesOnDisk = ['image.heic', 'photo.heif', 'document.txt']
    errors = []
    formatErrorMessage = vi.fn((err, msg) => `${msg}: ${err.message}`)
  })


  test("should create 'raws' folder and move HEIC/HEIF files", async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.mkdir).toHaveBeenCalledWith(path.join(originalPath, 'raws'), { recursive: true })
    expect(fs.rename).toHaveBeenCalledTimes(2)
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'image.heic'), path.join(originalPath, 'raws/image.heic'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'photo.heif'), path.join(originalPath, 'raws/photo.heif'))
    expect(errors).toHaveLength(0)
  })

  test('should handle rename errors', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockRejectedValue(new Error('Permission denied'))

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(errors).toHaveLength(2)
    expect(formatErrorMessage).toHaveBeenCalledTimes(2)
    expect(errors[0]).toContain('Error moving HEIF file: image.heic')
  })

  test('should not move non-HEIF files', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    filesOnDisk = ['document.txt', 'photo.jpg'] // No HEIC/HEIF files

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.rename).not.toHaveBeenCalled()
    expect(errors).toHaveLength(0)
  })
})
