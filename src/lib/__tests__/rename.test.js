import { rename } from 'node:fs/promises'

import { renamePaths } from '../rename'
import pathExists from '../exists'
import utilsFactory from '../utils'

describe('Verify rename library', () => {
  const utils = utilsFactory()
  describe('Dry run', () => {
    test('* Rename files', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const expected = ['changed-37.css', 'changed-64.js', 'changed-90.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true,
      })
      expect(result.renamed).toBe(false);
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toStrictEqual('<item id=\"100\"><filename>changed-37.jpg</filename></item><item id=\"101\"><filename>changed-64.jpg</filename></item><item id=\"102\"><filename>changed-90.jpg</filename></item>')
    })

    test('* Rename files with associated names', async () => {
      const sourceFolder = '/test/fixtures/renameable'
      const originals = ['bee.bat', 'bee.bin', 'bee.bmp', 'tee.tar', 'tee.tax', 'tee.txt']
      const expected = ['changed-50.bat', 'changed-50.bin', 'changed-50.bmp', 'changed-90.tar', 'changed-90.tax', 'changed-90.txt']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true,
      })
      expect(result.renamed).toBe(false);
      expect(result.filenames).toStrictEqual(expected)
      expect(result.xml).toStrictEqual('<item id=\"100\"><filename>changed-50.jpg</filename></item><item id=\"101\"><filename>changed-90.jpg</filename></item>')
    })

    test('* Caught fake source folder', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const sourceFolder = '/test/fixtures/FAKE'

      expect.assertions(1)
      try {
        await renamePaths({
          sourceFolder, filenames: originals, prefix: 'changed', dryRun: true,
        })
      } catch (error) {
        expect(error.message).toContain('pathExists: File system path is absolute and not found due to error')
      }
    })

    test('* Caught fake source filenames', async () => {
      const originals = ['FAKEcee.css', 'FAKEjay.js', 'FAKEel.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true,
      })
      expect(result.renamed).toBe(false);
      expect(result.filenames).toHaveLength(0)
      expect(result.xml).toBe("");
    })
  })

  describe('Filesystem renamed', () => {
    test('* Rename files', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const expected = ['changed-37.css', 'changed-64.js', 'changed-90.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed',
      })
      expect(result.renamed).toBe(true);
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
})
