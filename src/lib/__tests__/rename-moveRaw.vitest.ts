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
    filesOnDisk = ['image.heic', 'photo.heif', 'clip.raw', 'movie.mov', 'document.txt', 'photo.jpg']
    errors = []
    formatErrorMessage = vi.fn((err, msg) => `${msg}: ${err.message}`)
  })


  test("should create 'raws' folder and move all configured raw files", async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.mkdir).toHaveBeenCalledWith(path.join(originalPath, 'raws'), { recursive: true })
    expect(fs.rename).toHaveBeenCalledTimes(4)
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'image.heic'), path.join(originalPath, 'raws/image.heic'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'photo.heif'), path.join(originalPath, 'raws/photo.heif'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'clip.raw'), path.join(originalPath, 'raws/clip.raw'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'movie.mov'), path.join(originalPath, 'raws/movie.mov'))
    expect(errors).toHaveLength(0)
  })

  test('should handle rename errors', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockRejectedValue(new Error('Permission denied'))

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    // Only raw files should trigger errors
    expect(errors).toHaveLength(4)
    expect(formatErrorMessage).toHaveBeenCalledTimes(4)
    expect(errors[0]).toContain('Error moving raw file: image.heic')
  })

  test('should not move files not in config', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    filesOnDisk = ['document.txt', 'photo.jpg'] // No raw files

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.rename).not.toHaveBeenCalled()
    expect(errors).toHaveLength(0)
  })
})
