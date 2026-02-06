import path from 'node:path'
import { describe, expect, test } from 'vitest'

import pathExists from '../exists'

describe('Exists library', () => {
  describe('Expect result', () => {
    const successTest = async (testPath: string) => {
      expect.hasAssertions()
      try {
        const verifiedPath = await pathExists(testPath)

        const normalTestPath = path.normalize(testPath)
        expect(verifiedPath.endsWith(normalTestPath)).toBeTruthy()
      } catch (error) {
        expect(error).toBeUndefined()
      }
    }

    test('* Real relative file exists', async () => {
      const testPath = 'test/fixtures/exists.txt'
      await successTest(testPath)
    })

    test('* Real relative folder exists', async () => {
      const testPath = 'test/fixtures'
      await successTest(testPath)
    })

    test('* Real absolute file exists', async () => {
      const testPath = '/test/fixtures/exists.txt'
      await successTest(testPath)
    })

    test('* Real absolute folder exists', async () => {
      const testPath = '/test/fixtures'
      await successTest(testPath)
    })

    test('* Real root absolute file exists', async () => {
      const testPath = path.join(process.cwd(), 'public/test/fixtures/exists.txt')
      await successTest(testPath)
    })

    test('* Real root absolute folder exists', async () => {
      const testPath = path.join(process.cwd(), 'public/test/fixtures')
      await successTest(testPath)
    })
  })

  describe('Expect result', () => {
    const failureTest = async (testPath: string | null) => {
      expect.hasAssertions()
      try {
        const verifiedPath = await pathExists(testPath)
        expect(verifiedPath).toBeUndefined()
      } catch (error) {
        expect((error as Error).message).toContain('pathExists')
      }
    }

    test('* Fake absolute path does not exists', async () => {
      const testPath = '/test/fixtures/fakeFolder'
      await failureTest(testPath)
    })

    test('* Safe path throws error', async () => {
      await failureTest(null)
    })
  })
})
