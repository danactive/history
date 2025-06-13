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
      `<item id="061300"><filename>2025-06-13-23.jpg</filename></item>` +
      `<item id="061301"><filename>2025-06-13-37.jpg</filename></item>` +
      `<item id="061302"><filename>2025-06-13-50.jpg</filename></item>` +
      `<item id="061303"><filename>2025-06-13-64.jpg</filename></item>` +
      `<item id="061304"><filename>2025-06-13-77.jpg</filename></item>` +
      `<item id="061305"><filename>2025-06-13-90.jpg</filename></item>`,
    )
  })
})
