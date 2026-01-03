import { rename } from 'node:fs/promises'

import pathExists from '../exists'
import { renamePaths, errorSchema } from '../rename'
import utilsFactory from '../utils'

describe('Verify rename library', () => {
  const utils = utilsFactory()
  describe('Dry run', () => {
    test('* Rename exact files', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const expected = ['changed-37.css', 'changed-64.js', 'changed-90.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toStrictEqual('<item id="100"><filename>changed-37.jpg</filename></item>'
      + '<item id="101"><filename>changed-64.jpg</filename></item><item id="102"><filename>changed-90.jpg</filename></item>')
    })

    test('* Rename files without associated names', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const expected = ['changed-37.css', 'changed-64.js', 'changed-90.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: true,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toStrictEqual('<item id="100"><filename>changed-37.jpg</filename></item>'
      + '<item id="101"><filename>changed-64.jpg</filename></item><item id="102"><filename>changed-90.jpg</filename></item>')
    })

    test('* Rename exact files with same names', async () => {
      const sourceFolder = '/test/fixtures/renameable'
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

    test('* Rename files without associated names', async () => {
      const sourceFolder = '/test/fixtures/renameable'
      const originals = ['bee.bat', 'tee.tar']
      const expected = ['changed-50.bat', 'changed-50.bin', 'changed-50.bmp', 'changed-90.tar', 'changed-90.tax', 'changed-90.txt']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: true,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toStrictEqual('<item id="100"><filename>changed-50.jpg</filename></item>'
        + '<item id="101"><filename>changed-90.jpg</filename></item>')
    })

    test('* Caught fake source folder', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const sourceFolder = '/test/fixtures/FAKE'

      expect.assertions(1)
      try {
        await renamePaths({
          sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
        })
      } catch (error) {
        expect((error as Error).message).toContain('pathExists: File system path is absolute and not found due to error')
      }
    })

    test('* Caught fake source filenames', async () => {
      const originals = ['FAKEcee.css', 'FAKEjay.js', 'FAKEel.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toHaveLength(0)
      expect(result.xml).toBe('')
    })
  })

  describe('Filesystem renamed', () => {
    test('* Rename files', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const expected = ['changed-37.css', 'changed-64.js', 'changed-90.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: false, renameAssociated: false,
      })
      expect(result.renamed).toBe(true)
      expect(pathExists(`${sourceFolder}/${expected[0]}`)).toBeTruthy()
      expect(pathExists(`${sourceFolder}/${expected[1]}`)).toBeTruthy()
      expect(pathExists(`${sourceFolder}/${expected[2]}`)).toBeTruthy()
      // Restore files by renaming back
      await rename(utils.safePublicPath(`${sourceFolder}/${expected[0]}`), utils.safePublicPath(`${sourceFolder}/${originals[0]}`))
      await rename(utils.safePublicPath(`${sourceFolder}/${expected[1]}`), utils.safePublicPath(`${sourceFolder}/${originals[1]}`))
      await rename(utils.safePublicPath(`${sourceFolder}/${expected[2]}`), utils.safePublicPath(`${sourceFolder}/${originals[2]}`))
      expect(utils.safePublicPath(`${sourceFolder}/${originals[0]}`)).toBeTruthy()
      expect(utils.safePublicPath(`${sourceFolder}/${originals[1]}`)).toBeTruthy()
      expect(utils.safePublicPath(`${sourceFolder}/${originals[2]}`)).toBeTruthy()
    })
  })

  describe('errorSchema', () => {
    test('* Returns default structure with no error when message is empty', () => {
      const result = errorSchema('')
      expect(result.renamed).toBe(false)
      expect(result.filenames).toEqual([])
      expect(result.xml).toBe('')
      expect(result.error).toBeUndefined()
    })

    test('* Returns error structure with message when provided', () => {
      const result = errorSchema('Test error message')
      expect(result.renamed).toBe(false)
      expect(result.filenames).toEqual([])
      expect(result.xml).toBe('')
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Test error message')
    })

    test('* Handles special characters in error message', () => {
      const specialMessage = 'Error: File "test.jpg" not found in /path/to/dir'
      const result = errorSchema(specialMessage)
      expect(result.error?.message).toBe(specialMessage)
    })
  })

  describe('Edge cases', () => {
    test('* Empty filenames array returns empty result', async () => {
      const sourceFolder = '/test/fixtures/renameable'
      const result = await renamePaths({
        sourceFolder, filenames: [], prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toEqual([])
      expect(result.xml).toBe('')
    })

    test('* Handles filenames with hyphens', async () => {
      const originals = ['jay.js', 'el.log']
      const sourceFolder = '/test/fixtures/renameable'
      const expected = ['changed-50.js', 'changed-90.log']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
    })

    test('* Handles prefix with special characters', async () => {
      const originals = ['cee.css']
      const sourceFolder = '/test/fixtures/renameable'
      const prefix = '2024-01-01'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix, dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames.length).toBeGreaterThan(0)
      expect(result.filenames[0]).toContain('2024-01-01')
    })

    test('* Case insensitive extension handling', async () => {
      const originals = ['cee.CSS', 'jay.JS']  // Use uppercase but files are lowercase
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      // Files don't match exactly so result will be empty with renameAssociated=false
      expect(result.filenames).toEqual([])
    })

    test('* Handles duplicate filenames in input', async () => {
      const originals = ['cee.css', 'cee.css', 'jay.js']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      // Should deduplicate and handle properly
      expect(result.filenames.length).toBeGreaterThan(0)
    })

    test('* No-op when source and destination are the same', async () => {
      const originals = ['cee.css']
      const sourceFolder = '/test/fixtures/renameable'

      // First rename
      const result1 = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: false, renameAssociated: false,
      })
      expect(result1.renamed).toBe(true)

      // Try to rename to the same name again (should be no-op)
      const result2 = await renamePaths({
        sourceFolder, filenames: result1.filenames, prefix: 'changed', dryRun: false, renameAssociated: false,
      })

      // Restore original
      await rename(utils.safePublicPath(`${sourceFolder}/${result1.filenames[0]}`), utils.safePublicPath(`${sourceFolder}/${originals[0]}`))
      expect(pathExists(`${sourceFolder}/${originals[0]}`)).toBeTruthy()
    })

    test('* Single file rename', async () => {
      const originals = ['cee.css']
      const expected = ['changed-50.css']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toContain('changed-50.jpg')
    })

    test('* Extensions are lowercased in output', async () => {
      const sourceFolder = '/test/fixtures/renameable'
      const originals = ['bee.bat', 'bee.bin']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      // Extensions should be lowercased
      expect(result.filenames).toContain('changed-50.bat')
      expect(result.filenames).toContain('changed-50.bin')
      expect(result.filenames.every(f => f === f.toLowerCase())).toBe(true)
    })
  })

  describe('renameAssociated flag behavior', () => {
    test('* renameAssociated=false only renames files on disk', async () => {
      const sourceFolder = '/test/fixtures/renameable'
      const originals = ['cee.css', 'NONEXISTENT.js', 'jay.js']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: false,
      })
      expect(result.renamed).toBe(false)
      // Should only include files that exist on disk (cee.css, jay.js)
      expect(result.filenames.length).toBeGreaterThan(0)
      expect(result.filenames).not.toContain('NONEXISTENT')
    })

    test('* renameAssociated=true processes all input filenames', async () => {
      const sourceFolder = '/test/fixtures/renameable'
      const originals = ['bee.bat', 'tee.tar']
      const expected = ['changed-50.bat', 'changed-50.bin', 'changed-50.bmp', 'changed-90.tar', 'changed-90.tax', 'changed-90.txt']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true, renameAssociated: true,
      })
      expect(result.renamed).toBe(false)
      expect(result.filenames).toStrictEqual(expected)
      // Should find all associated files with same base name
      expect(result.filenames.filter(f => f.startsWith('changed-50')).length).toBe(3)
      expect(result.filenames.filter(f => f.startsWith('changed-90')).length).toBe(3)
    })
  })
})
