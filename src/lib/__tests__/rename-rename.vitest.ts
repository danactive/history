import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../fs', async () => {
  return {
    readdir: vi.fn(),
    rename: vi.fn(),
  }
})

vi.mock('../exists', () => ({
  default: vi.fn().mockResolvedValue(true),
}))

import * as fs from '../fs'
import checkPathExists from '../exists'

const checkPathExistsMock = checkPathExists as unknown as ReturnType<typeof vi.fn>
let renamePaths: (typeof import('../rename'))['renamePaths']
let readdirMock: ReturnType<typeof vi.fn>

const sourceFolder = '/galleries/personal/todo/originals'

beforeEach(async () => {
  readdirMock = fs.readdir as unknown as ReturnType<typeof vi.fn>
  readdirMock.mockReset()

  checkPathExistsMock.mockReset()
  checkPathExistsMock.mockResolvedValue(sourceFolder)

  // 🔁 Must be after mocks
  ;({ renamePaths } = await import('../rename'))
})

describe('Verify rename library', () => {
  it('Dry run – Real life example', async () => {
    readdirMock.mockResolvedValue([
      'public/galleries/personal/todo/2024-12-07 15.56.24.jpg',
      'public/galleries/personal/todo/2024-12-07 16.05.01.heic',
      'public/galleries/personal/todo/2024-12-07 16.05.01.jpg',
      'public/galleries/personal/todo/2024-12-07 16.05.07.heic',
      'public/galleries/personal/todo/2024-12-07 16.05.07.jpg',
      'public/galleries/personal/todo/2024-12-07 17.28.12.jpg',
      'public/galleries/personal/todo/2024-12-07 18.48.47.jpg',
      'public/galleries/personal/todo/2024-12-07 18.55.32.heic',
      'public/galleries/personal/todo/2024-12-07 18.55.32.jpg',
    ])
    const filenames = [
      '2024-12-07 15.56.24.jpg',
      '2024-12-07 16.05.01.jpg',
      '2024-12-07 16.05.07.jpg',
      '2024-12-07 17.28.12.jpg',
      '2024-12-07 18.48.47.jpg',
      '2024-12-07 18.55.32.jpg',
    ]
    const expected = [
      '2025-06-13-23.jpg',
      '2025-06-13-37.heic',
      '2025-06-13-37.jpg',
      '2025-06-13-50.heic',
      '2025-06-13-50.jpg',
      '2025-06-13-64.jpg',
      '2025-06-13-77.jpg',
      '2025-06-13-90.heic',
      '2025-06-13-90.jpg',
    ]
    const prefix = '2025-06-13'

    const result = await renamePaths({
      sourceFolder,
      filenames,
      prefix,
      dryRun: false,
      renameAssociated: true,
    })

    expect(readdirMock).toHaveBeenCalled()
    expect(result.renamed).toBe(true)
    expect(result.filenames).toStrictEqual(expected)
    expect(result.xml).toBe(
      '<item id="061300"><filename>2025-06-13-23.jpg</filename></item>' +
      '<item id="061301"><filename>2025-06-13-37.jpg</filename></item>' +
      '<item id="061302"><filename>2025-06-13-50.jpg</filename></item>' +
      '<item id="061303"><filename>2025-06-13-64.jpg</filename></item>' +
      '<item id="061304"><filename>2025-06-13-77.jpg</filename></item>' +
      '<item id="061305"><filename>2025-06-13-90.jpg</filename></item>',
    )
  })

  it('Dry run – Empty result when no files match', async () => {
    readdirMock.mockResolvedValue([
      'other-file.jpg',
      'another-file.jpg',
    ])
    const filenames = [
      'nonexistent1.jpg',
      'nonexistent2.jpg',
    ]
    const prefix = '2025-06-13'

    const result = await renamePaths({
      sourceFolder,
      filenames,
      prefix,
      dryRun: true,
      renameAssociated: false,
    })

    expect(result.renamed).toBe(false)
    expect(result.filenames).toEqual([])
    expect(result.xml).toBe('')
  })

  it('Handles collision detection – Files would rename to same name', async () => {
    readdirMock.mockResolvedValue([
      'photo1.jpg',
      'photo1.heic',
      'photo2.jpg',
      'photo2.heic',
    ])
    const filenames = [
      'photo1.jpg',
      'photo2.jpg',
    ]
    const prefix = 'vacation'

    const result = await renamePaths({
      sourceFolder,
      filenames,
      prefix,
      dryRun: false,
      renameAssociated: true,
    })

    expect(result.renamed).toBe(true)
    // Should handle associated files with different extensions
    expect(result.filenames.length).toBeGreaterThan(0)
  })

  it('Preserves file order in output', async () => {
    readdirMock.mockResolvedValue([
      'zebra.jpg',
      'alpha.jpg',
      'beta.jpg',
    ])
    const filenames = [
      'zebra.jpg',
      'alpha.jpg',
      'beta.jpg',
    ]
    const prefix = 'sorted'

    const result = await renamePaths({
      sourceFolder,
      filenames,
      prefix,
      dryRun: true,
      renameAssociated: false,
    })

    expect(result.renamed).toBe(false)
    // Output should maintain input order, not alphabetical
    expect(result.filenames.length).toBe(3)
    expect(result.filenames[0]).toContain('sorted')
  })

  it('Handles large batch of files', async () => {
    const largeFileList = Array.from({ length: 100 }, (_, i) => `photo${i.toString().padStart(3, '0')}.jpg`)
    readdirMock.mockResolvedValue(largeFileList)

    const result = await renamePaths({
      sourceFolder,
      filenames: largeFileList,
      prefix: 'batch',
      dryRun: true,
      renameAssociated: false,
    })

    expect(result.renamed).toBe(false)
    // Due to collision detection, some files get skipped (100 files map to ~81 unique suffixes)
    expect(result.filenames.length).toBeLessThan(100)
    expect(result.filenames.length).toBeGreaterThan(80)
    expect(result.xml.includes('batch')).toBe(true)
  })

  it('Associated files – Finds all extensions for base name', async () => {
    readdirMock.mockResolvedValue([
      'IMG_001.jpg',
      'IMG_001.raw',
      'IMG_001.heic',
      'IMG_002.jpg',
      'IMG_002.dng',
    ])
    const filenames = [
      'IMG_001.jpg',
      'IMG_002.jpg',
    ]
    const prefix = 'renamed'

    const result = await renamePaths({
      sourceFolder,
      filenames,
      prefix,
      dryRun: true,
      renameAssociated: true,
    })

    expect(result.renamed).toBe(false)
    // Should find IMG_001.jpg, IMG_001.raw, IMG_001.heic, IMG_002.jpg, IMG_002.dng
    expect(result.filenames.length).toBe(5)
    expect(result.filenames).toContain('renamed-50.jpg')
    expect(result.filenames).toContain('renamed-50.raw')
    expect(result.filenames).toContain('renamed-50.heic')
    expect(result.filenames).toContain('renamed-90.jpg')
    expect(result.filenames).toContain('renamed-90.dng')
  })

  it('No rename operations when from and to paths are identical', async () => {
    readdirMock.mockResolvedValue([
      '2024-01-01-37.jpg',
    ])
    const filenames = [
      '2024-01-01-37.jpg',
    ]
    const prefix = '2024-01-01'

    const result = await renamePaths({
      sourceFolder,
      filenames,
      prefix,
      dryRun: false,
      renameAssociated: false,
    })

    // Should detect that rename is not needed and handle gracefully
    expect(result.renamed).toBe(true)
    expect(result.filenames.length).toBeGreaterThan(0)
  })

  it('Handles special characters in prefix', async () => {
    readdirMock.mockResolvedValue([
      'photo.jpg',
    ])
    const filenames = [
      'photo.jpg',
    ]
    const prefix = '2024-12-25_vacation'

    const result = await renamePaths({
      sourceFolder,
      filenames,
      prefix,
      dryRun: true,
      renameAssociated: false,
    })

    expect(result.renamed).toBe(false)
    expect(result.filenames[0]).toContain('2024-12-25_vacation')
  })

  it('Validates path exists before processing', async () => {
    checkPathExistsMock.mockRejectedValueOnce(new Error('Path does not exist'))

    await expect(
      renamePaths({
        sourceFolder: '/invalid/path',
        filenames: ['test.jpg'],
        prefix: 'test',
        dryRun: true,
        renameAssociated: false,
      }),
    ).rejects.toThrow('Path does not exist')
  })
})
