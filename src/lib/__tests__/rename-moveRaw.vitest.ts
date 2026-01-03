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

  test('should handle mkdir errors gracefully', async () => {
    vi.mocked(fs.mkdir).mockRejectedValue(new Error('Cannot create directory'))
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    await expect(moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })).rejects.toThrow('Cannot create directory')
  })

  test('should handle partial rename failures', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    // First two succeed, rest fail
    vi.mocked(fs.rename)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValue(new Error('Disk full'))

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    // 2 succeeded, 3 failed (clip.raw, movie.mov, video.mp4)
    expect(fs.rename).toHaveBeenCalledTimes(5)
    expect(errors).toHaveLength(3)
    expect(errors[0]).toContain('Error moving raw file: clip.raw')
    expect(errors[1]).toContain('Error moving raw file: movie.mov')
    expect(errors[2]).toContain('Error moving video file: video.mp4')
  })

  test('should handle case-insensitive file extensions', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    filesOnDisk = ['IMAGE.HEIC', 'Photo.HeIf', 'VIDEO.MP4', 'VIDEO.ORIG.MP4']

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.rename).toHaveBeenCalledTimes(3) // HEIC, HeIf, MP4 (not ORIG.MP4)
    // Extensions are lowercased in destination
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'IMAGE.HEIC'), path.join(originalPath, 'raws/IMAGE.heic'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'Photo.HeIf'), path.join(originalPath, 'raws/Photo.heif'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'VIDEO.MP4'), path.join(originalPath, 'videos/VIDEO.mp4'))
    expect(fs.rename).not.toHaveBeenCalledWith(path.join(originalPath, 'VIDEO.ORIG.MP4'), expect.any(String))
  })

  test('should skip .orig.mp4 files with different cases', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    filesOnDisk = ['video.orig.mp4', 'VIDEO.ORIG.MP4', 'Video.Orig.Mp4', 'normal.mp4']

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    // Only normal.mp4 should be moved
    expect(fs.rename).toHaveBeenCalledTimes(1)
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'normal.mp4'), path.join(originalPath, 'videos/normal.mp4'))
  })

  test('should handle empty filesOnDisk array', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    filesOnDisk = []

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.mkdir).toHaveBeenCalledTimes(2)
    expect(fs.rename).not.toHaveBeenCalled()
    expect(errors).toHaveLength(0)
  })

  test('should preserve base filename and extension when moving', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    filesOnDisk = ['my-photo-2024.heic', 'vacation.mov']

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.rename).toHaveBeenCalledWith(
      path.join(originalPath, 'my-photo-2024.heic'),
      path.join(originalPath, 'raws/my-photo-2024.heic')
    )
    expect(fs.rename).toHaveBeenCalledWith(
      path.join(originalPath, 'vacation.mov'),
      path.join(originalPath, 'raws/vacation.mov')
    )
  })

  test('should handle files with multiple dots in filename', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    filesOnDisk = ['my.photo.2024.heic', 'file.name.with.dots.mp4']

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.rename).toHaveBeenCalledWith(
      path.join(originalPath, 'my.photo.2024.heic'),
      path.join(originalPath, 'raws/my.photo.2024.heic')
    )
    expect(fs.rename).toHaveBeenCalledWith(
      path.join(originalPath, 'file.name.with.dots.mp4'),
      path.join(originalPath, 'videos/file.name.with.dots.mp4')
    )
  })

  test('should create directories relative to originalPath parent', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    originalPath = '/galleries/personal/album/originals'
    filesOnDisk = ['photo.heic']

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    // Should create raws and videos folders in parent directory
    expect(fs.mkdir).toHaveBeenCalledWith('/galleries/personal/album/raws', { recursive: true })
    expect(fs.mkdir).toHaveBeenCalledWith('/galleries/personal/album/videos', { recursive: true })
    expect(fs.rename).toHaveBeenCalledWith(
      '/galleries/personal/album/originals/photo.heic',
      '/galleries/personal/album/raws/photo.heic'
    )
  })

  test('should handle mixed file types correctly', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.rename).mockResolvedValue(undefined)

    filesOnDisk = [
      'photo1.jpg',       // Not raw, should not move
      'photo2.heic',      // Raw, should move to raws
      'video1.mp4',       // Video, should move to videos
      'video2.orig.mp4',  // Original video, should NOT move
      'document.txt',     // Not media, should not move
      'raw.raw',          // Raw, should move to raws
    ]

    await moveRaws({ originalPath, filesOnDisk, errors, formatErrorMessage })

    expect(fs.rename).toHaveBeenCalledTimes(3) // heic, mp4, raw
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'photo2.heic'), path.join(originalPath, 'raws/photo2.heic'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'video1.mp4'), path.join(originalPath, 'videos/video1.mp4'))
    expect(fs.rename).toHaveBeenCalledWith(path.join(originalPath, 'raw.raw'), path.join(originalPath, 'raws/raw.raw'))
  })
})
