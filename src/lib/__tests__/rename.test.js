import { renamePaths } from '../rename'

describe('Verify rename library', () => {
  describe('Dry run', () => {
    test('* Rename files', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const expected = ['changed-37.css', 'changed-64.js', 'changed-90.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true,
      })
      expect(result).toStrictEqual(expected)
    })

    test('* Rename files with associated names', async () => {
      const sourceFolder = '/test/fixtures/renameable'
      const originals = ['bee.bat', 'bee.bin', 'bee.bmp', 'tee.tar', 'tee.tax', 'tee.txt']
      const expected = ['changed-50.bat', 'changed-50.bin', 'changed-50.bmp', 'changed-90.tar', 'changed-90.tax', 'changed-90.txt']

      const result = await renamePaths({
        sourceFolder, filenames: originals, prefix: 'changed', dryRun: true,
      })
      expect(result).toStrictEqual(expected)
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
      expect(result).toHaveLength(0)
    })
  })
})
