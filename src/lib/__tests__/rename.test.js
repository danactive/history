import path from 'node:path'

import pathExists from '../exists'
import utilFactory from '../utils'
import { reassignAssociated, renamePaths } from '../rename'

describe('Verify rename library', () => {
  const utils = utilFactory()

  /*
  *     ######                                        ######
  *     #     # ###### #    #   ##   #    # ######    #     #   ##   ##### #    #  ####
  *     #     # #      ##   #  #  #  ##  ## #         #     #  #  #    #   #    # #
  *     ######  #####  # #  # #    # # ## # #####     ######  #    #   #   ######  ####
  *     #   #   #      #  # # ###### #    # #         #       ######   #   #    #      #
  *     #    #  #      #   ## #    # #    # #         #       #    #   #   #    # #    #
  *     #     # ###### #    # #    # #    # ######    #       #    #   #   #    #  ####
  *
  */
  describe('Dry run', () => {
    test('* Rename real source folder', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const future = ['changed-37.css', 'changed-64.js', 'changed-90.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({ sourceFolder, filenames: originals, prefix: 'changed', dryRun: true })
      expect(result).toStrictEqual(future)
    })

    test('* Caught fake source folder', async () => {
      const originals = ['cee.css', 'jay.js', 'el.log']
      const sourceFolder = '/test/fixtures/FAKE'

      expect.assertions(1)
      try {
        await renamePaths({ sourceFolder, filenames: originals, prefix: 'changed', dryRun: true })
      } catch (error) {
        expect(error.message).toContain('pathExists: File system path is absolute and not found due to error')
      }
    })

    test('* Caught fake source filenames', async () => {
      const originals = ['FAKEcee.css', 'FAKEjay.js', 'FAKEel.log']
      const sourceFolder = '/test/fixtures/renameable'

      const result = await renamePaths({ sourceFolder, filenames: originals, prefix: 'changed', dryRun: true })
        expect(result).toHaveLength(0)
    })

  })

  //   test('* Rename associated is false so one filename', async () => {
  //     const originals = ['bee.bat']
  //     const temps = ['rename_grouped.bat']
  //     const sourceFolder = '/test/fixtures/renameable'

  //     const runTest = async ({ filenames, futureFilenames }) => {
  //       try {
  //         const result = await renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: false })
  //         const uniqueResult = new Set(result)

  //         futureFilenames.forEach((filename) => {
  //           const publicPath = utils.safePublicPath(path.join(sourceFolder, filename))
  //           expect(uniqueResult.has(publicPath)).toBe(true)
  //         })

  //         await pathExists(`${sourceFolder}/bee.bin`)
  //         expect('Associated bee.bin file remains untouched').toBe('Associated bee.bin file remains untouched')

  //         await pathExists(`${sourceFolder}/bee.bmp`)
  //         expect('Associated bee.bmp file remains untouched').toBe('Associated bee.bmp file remains untouched')
  //       } catch (error) {
  //         throw new Error(`Rename failed ${error}`)
  //       }
  //     }

  //     await runTest({ filenames: originals, futureFilenames: temps })
  //     await runTest({ filenames: temps, futureFilenames: originals })
  //   })

  //   test('* Rename associated is true so six filenames', async () => {
  //     const originals = ['bee.bat', 'tee.txt']
  //     const temps = ['rename_grouped.bat', 'rename_associated.txt']
  //     const sourceFolder = '/test/fixtures/renameable'
  //     const expectedTemp = ['rename_grouped.bat', 'rename_grouped.bin', 'rename_grouped.bmp',
  //       'rename_associated.tar', 'rename_associated.tax', 'rename_associated.txt']
  //     const expectedOriginal = ['bee.bat', 'bee.bin', 'bee.bmp', 'tee.tar', 'tee.tax', 'tee.txt']

  //     const runTest = async ({ expectedFilenames, filenames, futureFilenames }) => {
  //       try {
  //         const result = await renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: true })
  //         const uniqueResult = new Set(result)

  //         expectedFilenames.forEach(async (filename) => {
  //           const fullPath = utils.safePublicPath(path.join(sourceFolder, filename))
  //           expect(uniqueResult.has(fullPath)).toBe(true)
  //           await pathExists(`${sourceFolder}/${filename}`)
  //           expect(`Associated ${filename} file renamed with associated`).toBe(`Associated ${filename} file renamed with associated`)
  //         })
  //       } catch (error) {
  //         throw new Error(`Rename failed ${error}`)
  //       }
  //     }

  //     await runTest({ filenames: originals, futureFilenames: temps, expectedFilenames: expectedTemp })
  //     await runTest({ filenames: temps, futureFilenames: originals, expectedFilenames: expectedOriginal })
  //   })

  //   test('* Preview associated is true so six filenames', async () => {
  //     const originals = ['bee.bat', 'tee.txt']
  //     const sourceFolder = '/test/fixtures/renameable'
  //     const expectedTemp = ['rename_grouped.bat', 'rename_grouped.bin', 'rename_grouped.bmp',
  //       'rename_associated.tar', 'rename_associated.tax', 'rename_associated.txt']
  //     const expectedOriginal = ['bee.bat', 'bee.bin', 'bee.bmp', 'tee.tar', 'tee.tax', 'tee.txt']

  //     try {
  //       const result = await renamePaths(sourceFolder, originals, expectedTemp, { preview: true, renameAssociated: true })
  //       const uniqueResult = new Set(result)

  //       expectedOriginal.forEach((filename) => {
  //         const fullPath = utils.safePublicPath(path.join(sourceFolder, filename))
  //         expect(uniqueResult.has(fullPath)).toBe(false)
  //       })

  //       await pathExists(`${sourceFolder}/${expectedOriginal[0]}`)
  //       expect(`Associated ${expectedOriginal[0]} file remains untouched`).toBe(`Associated ${expectedOriginal[0]} file remains untouched`)

//       await pathExists(`${sourceFolder}/${expectedOriginal[2]}`)
//       expect(`Associated ${expectedOriginal[2]} file remains untouched`).toBe(`Associated ${expectedOriginal[2]} file remains untouched`)
//     } catch (error) {
//       throw new Error(`Rename failed ${error}`)
//     }
//   })
})
