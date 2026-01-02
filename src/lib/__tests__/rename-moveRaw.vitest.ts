import { describe, test, expect, vi } from 'vitest'
import { moveRaws } from '../rename'
import path from 'node:path'

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
    filesOnDisk = [
      'image.heic', 'photo.heif', 'clip.raw', 'movie.mov',
      'document.txt', 'photo.jpg', 'video.mp4', 'video.orig.mp4',
    ]
    errors = []
    formatErrorMessage = vi.fn((err, msg) => `${msg}: ${err.message}`)
  })


  test("should create 'raws' and 'videos' folder and move all configured raw and video files", async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.mkdir).toHaveBeenCalledWith(path.join(originalPath, 'raws'), { recursive: true })
    expect(fs.mkdir).toHaveBeenCalledWith(path.join(originalPath, 'videos'), { recursive: true })
    // 4 raw + 1 mp4 = 5 moves (movie.mov is raw, video.orig.mp4 should NOT be moved)
    expect(fs.rename).toHaveBeenCalledTimes(5)
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'image.heic'), path.join(originalPath, 'raws/image.heic'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'photo.heif'), path.join(originalPath, 'raws/photo.heif'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'clip.raw'), path.join(originalPath, 'raws/clip.raw'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'movie.mov'), path.join(originalPath, 'raws/movie.mov'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'video.mp4'), path.join(originalPath, 'videos/video.mp4'))
    // .orig.mp4 should NOT be moved
    expect(fs.rename).not.toHaveBeenCalledWith(path.join(originalPath, 'video.orig.mp4'), expect.any(String))
    expect(errors).toHaveLength(0)
  })

  test('should handle rename errors', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockRejectedValue(new Error('Permission denied'))

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    // 4 raw files + 1 video file should trigger errors
    expect(errors).toHaveLength(5)
    expect(formatErrorMessage).toHaveBeenCalledTimes(5)
    expect(errors[0]).toContain('Error moving raw file: image.heic')
    expect(errors[1]).toContain('Error moving raw file: photo.heif')
    expect(errors[2]).toContain('Error moving raw file: clip.raw')
    expect(errors[3]).toContain('Error moving raw file: movie.mov')
    expect(errors[4]).toContain('Error moving video file: video.mp4')
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
