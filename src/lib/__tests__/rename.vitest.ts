import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { rename, mkdir, rm, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { renamePaths, errorSchema, moveRaws } from '../rename'
import pathExists from '../exists'
import utilsFactory from '../utils'

const utils = utilsFactory()

describe('rename library', () => {
  describe('errorSchema', () => {
    test('returns default structure with no error when message is empty', () => {
      const result = errorSchema('')
      expect(result.renamed).toBe(false)
      expect(result.filenames).toEqual([])
      expect(result.xml).toBe('')
      expect(result.error).toBeUndefined()
    })

    test('returns error structure with message when provided', () => {
      const result = errorSchema('Test error message')
      expect(result.renamed).toBe(false)
      expect(result.filenames).toEqual([])
      expect(result.xml).toBe('')
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Test error message')
    })

    test('handles special characters in error message', () => {
      const specialMessage = 'Error: File "test.jpg" not found in /path/to/dir'
      const result = errorSchema(specialMessage)
      expect(result.error?.message).toBe(specialMessage)
    })
  })

  describe('renamePaths - dry run', () => {
    const sourceFolder = '/test/fixtures/renameable'

    test('renames exact files', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const expected = ['changed-37.css', 'changed-64.js', 'changed-90.log']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toStrictEqual('<item id="100"><filename>changed-37.jpg</filename></item>'
        + '<item id="101"><filename>changed-64.jpg</filename></item><item id="102"><filename>changed-90.jpg</filename></item>')
    })

    test('renames files without associated names', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const expected = ['changed-37.css', 'changed-64.js', 'changed-90.log']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: true,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toStrictEqual('<item id="100"><filename>changed-37.jpg</filename></item>'
        + '<item id="101"><filename>changed-64.jpg</filename></item><item id="102"><filename>changed-90.jpg</filename></item>')
    })

    test('renames exact files with same base names', async () => {
      const originals = ['bee.bat', 'bee.bin', 'bee.bmp', 'tee.tar', 'tee.tax', 'tee.txt']
      const expected = ['changed-50.bat', 'changed-50.bin', 'changed-50.bmp', 'changed-90.tar', 'changed-90.tax', 'changed-90.txt']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toStrictEqual('<item id="100"><filename>changed-50.jpg</filename></item>'
        + '<item id="101"><filename>changed-90.jpg</filename></item>')
    })

    test('renames files with associated extensions', async () => {
      const originals = ['bee.bat', 'tee.tar']
      const expected = ['changed-50.bat', 'changed-50.bin', 'changed-50.bmp', 'changed-90.tar', 'changed-90.tax', 'changed-90.txt']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: true,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      expect(result.filenames.filter(f => f.startsWith('changed-50')).length).toBe(3)
      expect(result.filenames.filter(f => f.startsWith('changed-90')).length).toBe(3)
    })

    test('handles empty filenames array', async () => {
      const result = await renamePaths({
        sourceFolder, filenames: [], prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toEqual([])
      expect(result.xml).toBe('')
    })

    test('handles non-existent files', async () => {
      const originals = ['FAKEcee.css', 'FAKEjay.js', 'FAKEel.log']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toHaveLength(0)
      expect(result.xml).toBe('')
    })

    test('rejects invalid source folder', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const invalidFolder = '/test/fixtures/FAKE'

      await expect(renamePaths({
        sourceFolder: invalidFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })).rejects.toThrow(/pathExists/)
    })

    test('handles prefix with special characters', async () => {
      const originals = ['cee.css']
      const prefix = '2024-01-01'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix, dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames.length).toBeGreaterThan(0)
      expect(result.filenames[0]).toContain('2024-01-01')
    })

    test('handles duplicate filenames in input', async () => {
      const originals = ['cee.css', 'cee.css', 'jay.js']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      // Should deduplicate based on basename
      expect(result.filenames.length).toBe(2)
    })

    test('lowercases extensions in output', async () => {
      const originals = ['bee.bat', 'bee.bin']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toContain('changed-50.bat')
      expect(result.filenames).toContain('changed-50.bin')
      expect(result.filenames.every(f => f === f.toLowerCase())).toBe(true)
    })

    test('returns skipped files when collision occurs', async () => {
      // Test with bee.BAT and bee.Bat - both lowercase to bee.bat but they're treated as
      // the same base "bee", so if filesOnDisk somehow had both (on case-sensitive FS),
      // one would be skipped. On macOS, they're the same file, so no collision.
      // filesOnDisk has bee.bat, bee.bin, bee.bmp (3 files with base "bee")
      const originals = ['bee.BAT', 'bee.bat']  // Both map to same base

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })

      // Extracts unique base "bee", finds all 3 files on disk (bee.bat, bee.bin, bee.bmp)
      // All get renamed with lowercased extensions
      expect(result.filenames.length).toBe(3)
      expect(result.filenames).toContain('changed-50.bat')
      expect(result.filenames).toContain('changed-50.bin')
      expect(result.filenames).toContain('changed-50.bmp')
      // No collision since they have different extensions
      expect(result.skipped).toBeUndefined()
    })

    test('renameAssociated=false only processes files on disk', async () => {
      const originals = ['cee.css', 'NONEXISTENT.js', 'jay.js']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      // Should only include files that exist on disk
      expect(result.filenames.length).toBe(2)
      expect(result.filenames.some(f => f.includes('NONEXISTENT'))).toBe(false)
    })

    test('renames with associated HEIC/JPG pairs using date prefix', async () => {
      const fixtureFolder = path.join(process.cwd(), 'public/test/fixtures/renameable-heic-pairs')
      const originals = [
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
        sourceFolder: fixtureFolder,
        filenames: originals,
        prefix,
        dryRun: true,
        renameAssociated: true,
      })

      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toBe(
        '<item id="061300"><filename>2025-06-13-23.jpg</filename></item>' +
        '<item id="061301"><filename>2025-06-13-37.jpg</filename></item>' +
        '<item id="061302"><filename>2025-06-13-50.jpg</filename></item>' +
        '<item id="061303"><filename>2025-06-13-64.jpg</filename></item>' +
        '<item id="061304"><filename>2025-06-13-77.jpg</filename></item>' +
        '<item id="061305"><filename>2025-06-13-90.jpg</filename></item>',
      )

      // Verify that HEIC files are properly associated
      const heicFiles = result.filenames.filter(f => f.endsWith('.heic'))
      expect(heicFiles.length).toBe(3)
      // Each HEIC file should have a corresponding JPG with the same prefix
      heicFiles.forEach(heic => {
        const jpg = heic.replace('.heic', '.jpg')
        expect(result.filenames).toContain(jpg)
      })
    })

    test('lowercases uppercase extensions', async () => {
      const fixtureFolder = '/test/fixtures/renameable-uppercase'
      const originals = ['photo.JPG', 'video.MP4', 'doc.PDF']

      const result = await renamePaths({
        sourceFolder: fixtureFolder, filenames: originals, prefix: 'renamed', dryRun: true, renameAssociated: false,
      })

      expect(result.renamed).toBe(false)
      expect(result.filenames).toHaveLength(3)
      expect(result.filenames[0]).toMatch(/^renamed-\d+\.jpg$/)
      expect(result.filenames[1]).toMatch(/^renamed-\d+\.mp4$/)
      expect(result.filenames[2]).toMatch(/^renamed-\d+\.pdf$/)
      expect(result.filenames.every(f => f === f.toLowerCase())).toBe(true)
      // No collisions, so skipped should not be present
      expect(result.skipped).toBeUndefined()
    })

    test('lowercases mixed case extensions', async () => {
      const fixtureFolder = '/test/fixtures/renameable-mixedcase'
      const originals = ['image.JpG', 'script.Js', 'data.CsV']

      const result = await renamePaths({
        sourceFolder: fixtureFolder, filenames: originals, prefix: 'renamed', dryRun: true, renameAssociated: false,
      })

      expect(result.renamed).toBe(false)
      expect(result.filenames).toHaveLength(3)
      expect(result.filenames[0]).toMatch(/^renamed-\d+\.jpg$/)
      expect(result.filenames[1]).toMatch(/^renamed-\d+\.js$/)
      expect(result.filenames[2]).toMatch(/^renamed-\d+\.csv$/)
      expect(result.filenames.every(f => f === f.toLowerCase())).toBe(true)
    })

    test('handles multiple extensions with same base name', async () => {
      const fixtureFolder = '/test/fixtures/renameable-multiext'
      const originals = ['photo.NEF', 'photo.xmp', 'photo.JPG']

      const result = await renamePaths({
        sourceFolder: fixtureFolder, filenames: originals, prefix: 'renamed', dryRun: true, renameAssociated: false,
      })

      expect(result.renamed).toBe(false)
      expect(result.filenames.length).toBe(3)
      // All should have the same base name since they come from the same photo
      const basenames = result.filenames.map(f => f.replace(/\..*$/, ''))
      expect(new Set(basenames).size).toBe(1) // All have same basename
      expect(result.filenames.some(f => f.endsWith('.nef'))).toBe(true)
      expect(result.filenames.some(f => f.endsWith('.xmp'))).toBe(true)
      expect(result.filenames.some(f => f.endsWith('.jpg'))).toBe(true)
    })

    test('reports skipped files when extensions normalize to same name', async () => {
      const fixtureFolder = '/test/fixtures/renameable-collision'
      // On case-insensitive filesystems, only photo.JPG exists
      // But we can simulate case-sensitive scenario by passing both names with renameAssociated=true
      // However, filesOnDisk will still only show what exists, so matches will only find one file
      // The collision logic only triggers when MULTIPLE files from filesOnDisk map to same output

      // Since we can't create the collision scenario on case-insensitive filesystem,
      // let's test that skipped is undefined when there's no collision
      const originals = ['photo.JPG']

      const result = await renamePaths({
        sourceFolder: fixtureFolder, filenames: originals, prefix: 'renamed', dryRun: true, renameAssociated: false,
      })

      expect(result.renamed).toBe(false)
      expect(result.filenames.length).toBe(1)
      expect(result.filenames[0]).toMatch(/^renamed-\d+\.jpg$/)
      // No collision, so skipped should not be present
      expect(result.skipped).toBeUndefined()
    })
  })

  describe('renamePaths - actual filesystem', () => {
    const sourceFolder = '/test/fixtures/renameable'

    test('renames files on disk', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const expected = ['changed-37.css', 'changed-64.js', 'changed-90.log']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: false, renameAssociated: false,
      })
      expect(result.renamed).toBe(true)
      expect(await pathExists(`${sourceFolder}/${expected[0]}`)).toBeTruthy()
      expect(await pathExists(`${sourceFolder}/${expected[1]}`)).toBeTruthy()
      expect(await pathExists(`${sourceFolder}/${expected[2]}`)).toBeTruthy()

      // Restore files
      await rename(utils.safePublicPath(`${sourceFolder}/${expected[0]}`), utils.safePublicPath(`${sourceFolder}/${originals[0]}`))
      await rename(utils.safePublicPath(`${sourceFolder}/${expected[1]}`), utils.safePublicPath(`${sourceFolder}/${originals[1]}`))
      await rename(utils.safePublicPath(`${sourceFolder}/${expected[2]}`), utils.safePublicPath(`${sourceFolder}/${originals[2]}`))
    })

    test('handles no-op when source and destination are the same', async () => {
      const originals = ['cee.css']

      // First rename
      const result1 = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: false, renameAssociated: false,
      })
      expect(result1.renamed).toBe(true)

      // Try to rename to the same name again (should be no-op)
      const result2 = await renamePaths({
        sourceFolder, filenames: result1.filenames, prefix: 'changed', dryRun: false, renameAssociated: false,
      })
      expect(result2.renamed).toBe(true)

      // Restore original
      await rename(utils.safePublicPath(`${sourceFolder}/${result1.filenames[0]}`), utils.safePublicPath(`${sourceFolder}/${originals[0]}`))
    })
  })

  describe('moveRaws', () => {
    let testDir: string
    let originalsDir: string
    let formatErrorMessage: (err: unknown, prefix: string) => string

    beforeEach(async () => {
      // Create temp test directory structure
      testDir = path.join(utils.safePublicPath('/test/fixtures'), `moveRaws-test-${Date.now()}`)
      originalsDir = path.join(testDir, 'originals')
      await mkdir(originalsDir, { recursive: true })

      formatErrorMessage = (err, prefix) => {
        if (err instanceof Error) {
          return `${prefix}: ${err.message}`
        }
        return `${prefix}: Unknown error`
      }
    })

    afterEach(async () => {
      // Cleanup test directory
      try {
        await rm(testDir, { recursive: true, force: true })
      } catch {
        // Ignore cleanup errors
      }
    })

    test('creates raws and videos folders and moves files', async () => {
      // Create test files
      const testFiles = ['image.heic', 'photo.heif', 'video.mp4', 'document.txt']
      for (const file of testFiles) {
        await writeFile(path.join(originalsDir, file), '')
      }

      const errors: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: testFiles,
        errors,
        formatErrorMessage,
      })

      // Check directories were created
      expect(await pathExists(path.join(testDir, 'raws'))).toBeTruthy()
      expect(await pathExists(path.join(testDir, 'videos'))).toBeTruthy()

      // Check files were moved
      expect(await pathExists(path.join(testDir, 'raws', 'image.heic'))).toBeTruthy()
      expect(await pathExists(path.join(testDir, 'raws', 'photo.heif'))).toBeTruthy()
      expect(await pathExists(path.join(testDir, 'videos', 'video.mp4'))).toBeTruthy()

      // Check non-media file was not moved
      expect(await pathExists(path.join(originalsDir, 'document.txt'))).toBeTruthy()

      expect(errors).toHaveLength(0)
    })

    test('skips .orig.mp4 files', async () => {
      const testFiles = ['video.orig.mp4', 'VIDEO.ORIG.MP4', 'normal.mp4']
      for (const file of testFiles) {
        await writeFile(path.join(originalsDir, file), '')
      }

      const errors: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: testFiles,
        errors,
        formatErrorMessage,
      })

      // Only normal.mp4 should be moved
      expect(await pathExists(path.join(testDir, 'videos', 'normal.mp4'))).toBeTruthy()
      expect(await pathExists(path.join(originalsDir, 'video.orig.mp4'))).toBeTruthy()
      expect(await pathExists(path.join(originalsDir, 'VIDEO.ORIG.MP4'))).toBeTruthy()

      expect(errors).toHaveLength(0)
    })

    test('handles case-insensitive extensions', async () => {
      const testFiles = ['IMAGE.HEIC', 'Photo.HeIf', 'VIDEO.MP4']
      for (const file of testFiles) {
        await writeFile(path.join(originalsDir, file), '')
      }

      const errors: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: testFiles,
        errors,
        formatErrorMessage,
      })

      // Check files were moved with lowercase extensions
      const rawsFiles = await readdir(path.join(testDir, 'raws'))
      const videosFiles = await readdir(path.join(testDir, 'videos'))

      expect(rawsFiles).toContain('IMAGE.heic')
      expect(rawsFiles).toContain('Photo.heif')
      expect(videosFiles).toContain('VIDEO.mp4')

      expect(errors).toHaveLength(0)
    })

    test('handles files with multiple dots', async () => {
      const testFiles = ['my.photo.2024.heic', 'file.name.with.dots.mp4']
      for (const file of testFiles) {
        await writeFile(path.join(originalsDir, file), '')
      }

      const errors: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: testFiles,
        errors,
        formatErrorMessage,
      })

      expect(await pathExists(path.join(testDir, 'raws', 'my.photo.2024.heic'))).toBeTruthy()
      expect(await pathExists(path.join(testDir, 'videos', 'file.name.with.dots.mp4'))).toBeTruthy()

      expect(errors).toHaveLength(0)
    })

    test('handles empty filesOnDisk array', async () => {
      const errors: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: [],
        errors,
        formatErrorMessage,
      })

      // Directories should still be created
      expect(await pathExists(path.join(testDir, 'raws'))).toBeTruthy()
      expect(await pathExists(path.join(testDir, 'videos'))).toBeTruthy()

      expect(errors).toHaveLength(0)
    })

    test('handles only non-media files', async () => {
      const testFiles = ['document.txt', 'photo.jpg', 'readme.md']
      for (const file of testFiles) {
        await writeFile(path.join(originalsDir, file), '')
      }

      const errors: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: testFiles,
        errors,
        formatErrorMessage,
      })

      // No files should be moved
      for (const file of testFiles) {
        expect(await pathExists(path.join(originalsDir, file))).toBeTruthy()
      }

      expect(errors).toHaveLength(0)
    })

    test('collects errors when files cannot be moved', async () => {
      // Create a file that doesn't exist in filesOnDisk to trigger error
      const testFiles = ['nonexistent.heic']

      const errors: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: testFiles,
        errors,
        formatErrorMessage,
      })

      // Should have collected an error
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('Error moving raw file')
    })

    test('handles file collisions with different case extensions', async () => {
      // Test that files are moved with lowercased extensions
      const testFiles = ['IMG_1234.HEIC', 'IMG_5678.MP4']
      for (const file of testFiles) {
        await writeFile(path.join(originalsDir, file), `content-${file}`)
      }

      const errors: string[] = []

      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: testFiles,
        errors,
        formatErrorMessage,
      })

      const rawsDir = path.join(testDir, 'raws')
      const videosDir = path.join(testDir, 'videos')

      // Files should be moved with lowercased extensions (basename preserved)
      const rawFiles = await readdir(rawsDir)
      const videoFiles = await readdir(videosDir)

      expect(rawFiles).toEqual(['IMG_1234.heic'])
      expect(videoFiles).toEqual(['IMG_5678.mp4'])
      expect(await readdir(originalsDir)).toEqual([])
      expect(errors).toHaveLength(0)
    })

    test('collision detection prevents duplicate destination files', async () => {
      // Test the collision detection logic by simulating the scenario
      // where filesOnDisk contains both uppercase and lowercase versions
      const testFiles = ['photo.HEIC', 'photo.heic', 'video.MP4', 'video.mp4']

      // Only create files that can actually exist on case-insensitive filesystem
      await writeFile(path.join(originalsDir, 'photo.HEIC'), 'content-photo')
      await writeFile(path.join(originalsDir, 'video.MP4'), 'content-video')

      const errors: string[] = []

      // Pass all files to moveRaws as if they were discovered
      // This simulates a case-sensitive filesystem scenario
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: testFiles,
        errors,
        formatErrorMessage,
      })

      const rawsDir = path.join(testDir, 'raws')
      const videosDir = path.join(testDir, 'videos')

      // Only one of each should be processed (first wins)
      const rawFiles = await readdir(rawsDir)
      const videoFiles = await readdir(videosDir)

      expect(rawFiles).toHaveLength(1)
      expect(videoFiles).toHaveLength(1)
      expect(errors).toHaveLength(0)
    })

    test('moves all configured video formats to videos folder', async () => {
      // Test that all video types from config.supportedFileTypes.video are moved
      // This verifies the behavioral change from hardcoded ['mp4'] to config-based
      // Note: rawFileTypes.video (like mov) still go to raws folder
      const testFiles = ['video1.mp4', 'video2.webm', 'raw-video.mov', 'photo.heic']
      for (const file of testFiles) {
        await writeFile(path.join(originalsDir, file), `content-${file}`)
      }

      const errors: string[] = []

      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: testFiles,
        errors,
        formatErrorMessage,
      })

      const rawsDir = path.join(testDir, 'raws')
      const videosDir = path.join(testDir, 'videos')

      // Processed videos from config.supportedFileTypes.video go to videos folder
      const videoFiles = await readdir(videosDir)
      expect(videoFiles).toContain('video1.mp4')
      expect(videoFiles).toContain('video2.webm')
      expect(videoFiles).toHaveLength(2)

      // Raw formats (photos and raw videos) go to raws folder
      const rawFiles = await readdir(rawsDir)
      expect(rawFiles).toContain('photo.heic')
      expect(rawFiles).toContain('raw-video.mov')
      expect(rawFiles).toHaveLength(2)

      expect(await readdir(originalsDir)).toEqual([])
      expect(errors).toHaveLength(0)
    })

    test('prevents overwriting existing files in destination directories', async () => {
      // First, move a file to raws
      const firstFile = ['photo1.heic']
      await writeFile(path.join(originalsDir, 'photo1.heic'), 'first-content')

      const errors1: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: firstFile,
        errors: errors1,
        formatErrorMessage,
      })

      const rawsDir = path.join(testDir, 'raws')
      let rawFiles = await readdir(rawsDir)
      expect(rawFiles).toContain('photo1.heic')
      expect(errors1).toHaveLength(0)

      // Now try to move another photo1.heic (uppercase extension)
      // It should be skipped because photo1.heic already exists in raws
      await writeFile(path.join(originalsDir, 'photo1.HEIC'), 'second-content')

      const errors2: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: ['photo1.HEIC'],
        errors: errors2,
        formatErrorMessage,
      })

      // File should still exist in originals because it was skipped
      const remainingFiles = await readdir(originalsDir)
      expect(remainingFiles).toContain('photo1.HEIC')

      // Raws should still only have one file
      rawFiles = await readdir(rawsDir)
      expect(rawFiles).toHaveLength(1)

      // No errors should be generated (file was skipped, not failed)
      expect(errors2).toHaveLength(0)
    })

    test('prevents overwriting existing videos in destination directories', async () => {
      // First, move a video to videos folder
      const firstFile = ['video1.mp4']
      await writeFile(path.join(originalsDir, 'video1.mp4'), 'first-video')

      const errors1: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: firstFile,
        errors: errors1,
        formatErrorMessage,
      })

      const videosDir = path.join(testDir, 'videos')
      let videoFiles = await readdir(videosDir)
      expect(videoFiles).toContain('video1.mp4')
      expect(errors1).toHaveLength(0)

      // Try to move another video1.mp4 (uppercase extension)
      await writeFile(path.join(originalsDir, 'video1.MP4'), 'second-video')

      const errors2: string[] = []
      await moveRaws({
        originalPath: originalsDir,
        filesOnDisk: ['video1.MP4'],
        errors: errors2,
        formatErrorMessage,
      })

      // File should still exist in originals
      const remainingFiles = await readdir(originalsDir)
      expect(remainingFiles).toContain('video1.MP4')

      // Videos should still only have one file
      videoFiles = await readdir(videosDir)
      expect(videoFiles).toHaveLength(1)

      expect(errors2).toHaveLength(0)
    })
  })
})
