import type { Walk } from '../../types/pages'
import { type Filesystem } from '../../lib/filesystems'
import {
  isImage,
  addParentDirectoryNav,
  associateMedia,
  isAnyImageOrVideo,
  mergeMedia,
  getJpgLike,
} from '../walk'

function generateImageFilenames(fullCount = 6, extSet = 'jpgraw'): Walk.ItemFile[] {
  const halfCount = Math.floor(fullCount / 2)

  const docs = (setCount = halfCount): Walk.ItemFile[] => [...Array(setCount).keys()].map((k) => ({
    id: `item-doc-${k}`,
    path: 'harddrive-docs',
    label: `Document${k + 1}.DOC`,
    filename: `Document${k + 1}.DOC`,
    name: `Document${k + 1}`,
    mediumType: 'text',
    ext: 'DOC',
    absolutePath: `harddrive-docs/Document${k + 1}.DOC`,
  }))

  const jpgs = (setCount = halfCount): Walk.ItemFile[] => [...Array(setCount).keys()].map((k) => ({
    id: `item-jpg-${k}`,
    path: 'harddrive-jpgs',
    label: `DSC0372${k + 1}.JPG`,
    filename: `DSC0372${k + 1}.JPG`,
    name: `DSC0372${k + 1}`,
    mediumType: 'image',
    ext: 'JPG',
    absolutePath: `harddrive-jpgs/DSC0372${k + 1}.JPG`,
  }))

  const jpegs = (setCount = halfCount): Walk.ItemFile[] => [...Array(setCount).keys()].map((k) => ({
    id: `item-jpeg-${k}`,
    path: 'harddrive-jpegs',
    label: `DSC0372${k + 1}.JPEG`,
    filename: `DSC0372${k + 1}.JPEG`,
    name: `DSC0372${k + 1}`,
    mediumType: 'image',
    ext: 'JPEG',
    absolutePath: `harddrive-jpegs/DSC0372${k + 1}.JPEG`,
  }))

  const raws = (setCount = halfCount): Walk.ItemFile[] => [...Array(setCount).keys()].map((k) => ({
    id: `item-raw-${k}`,
    path: 'harddrive-raws',
    label: `DSC0372${k + 1}.RAW`,
    filename: `DSC0372${k + 1}.RAW`,
    name: `DSC0372${k + 1}`,
    mediumType: 'image',
    ext: 'RAW',
    absolutePath: `harddrive-raws/DSC0372${k + 1}.RAW`,
  }))

  if (extSet === 'jpgraw' || extSet === 'rawjpg') {
    return raws().concat(jpgs())
  }

  if (extSet === 'jpgdoc' || extSet === 'docjpg') {
    return docs().concat(jpgs())
  }

  if (extSet === 'docraw' || extSet === 'rawdoc') {
    return docs().concat(raws())
  }

  if (extSet === 'jpeg') {
    return jpegs(fullCount)
  }

  return jpgs(fullCount)
}

describe('Walk - util', () => {
  const mockFile: Filesystem = {
    id: 'identity',
    label: 'label',
    mediumType: 'unknown',
    ext: 'Extension',
    name: 'Name',
    filename: 'Filename',
    path: 'Path',
    absolutePath: 'Absolute Path',
  }
  describe('isImage', () => {
    test('detect JPG', () => {
      expect(isImage({ ...mockFile, mediumType: 'image', ext: 'JPEG' })).toEqual(true)
      expect(isImage({ ...mockFile, mediumType: 'image', ext: 'jpeg' })).toEqual(true)
      expect(isImage({ ...mockFile, mediumType: 'image', ext: 'JPG' })).toEqual(true)
      expect(isImage({ ...mockFile, mediumType: 'image', ext: 'jpg' })).toEqual(true)
    })

    test('ignore RAW', () => {
      expect(isImage({ ...mockFile, mediumType: 'image', ext: 'RAW' })).toEqual(false)
      expect(isImage({ ...mockFile, mediumType: 'image', ext: 'ARW' })).toEqual(false)
    })
  })

  describe('addParentDirectoryNav', () => {
    const mockFileFolder: Walk.ItemFile = {
      filename: '..',
      label: '..',
      path: '..',
      mediumType: 'folder',
      id: 'item-up-directory',
      name: 'UpDirectory',
      ext: '',
      absolutePath: '',
    }
    let dummyFile: Walk.ItemFile

    beforeEach(() => {
      dummyFile = {
        id: 'testid.js',
        label: 'Label',
        ext: 'js',
        path: 'harddrive',
        mediumType: 'unknown',
        absolutePath: 'harddrive/Label.js',
        filename: 'Label.js',
        name: 'Label',
      }
    })

    test('hide when at root folder', () => {
      expect(addParentDirectoryNav([dummyFile], '')).toEqual([dummyFile])
      expect(addParentDirectoryNav([dummyFile], '/')).toEqual([dummyFile])
      expect(addParentDirectoryNav([dummyFile], null)).toEqual([dummyFile])
      expect(addParentDirectoryNav([dummyFile], undefined)).toEqual([dummyFile])
    })

    test('one level deep', () => {
      const expectedFile = { ...mockFileFolder, path: '/' }
      expect(addParentDirectoryNav([dummyFile], '/galleries')).toEqual([
        expectedFile,
        dummyFile,
      ])
    })

    test('two levels deep', () => {
      const expectedFile = { ...mockFileFolder, path: '/galleries' }
      expect(addParentDirectoryNav([dummyFile], '/galleries/demo')).toEqual([
        expectedFile,
        dummyFile,
      ])
    })

    test('three levels deep', () => {
      const expectedFile = { ...mockFileFolder, path: '/galleries/demo' }
      expect(
        addParentDirectoryNav([dummyFile], '/galleries/demo/thumbs'),
      ).toEqual([expectedFile, dummyFile])
    })
  })

  describe('isAnyImageOrVideo', () => {
    test('images', () => {
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'image', ext: 'JPEG' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'image', ext: 'jpeg' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'image', ext: 'JPG' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'image', ext: 'jpg' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'image', ext: 'RAW' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'image', ext: 'ARW' })).toEqual(
        true,
      )
    })

    test('videos', () => {
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'video', ext: 'mp4' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'video', ext: 'webm' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'video', ext: 'avi' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'video', ext: 'mov' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'video', ext: 'm2ts' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ ...mockFile, mediumType: 'video', ext: 'mts' })).toEqual(
        true,
      )
    })
  })

  describe('associateMedia', () => {
    test('JPG and RAW', () => {
      const expected = new Map([
        ['DSC03721', [
          {
            label: 'DSC03721.RAW',
            filename: 'DSC03721.RAW',
            name: 'DSC03721',
            id: 'item-raw-0',
            path: 'harddrive-raws',
            mediumType: 'image',
            ext: 'RAW',
            absolutePath: 'harddrive-raws/DSC03721.RAW',
          },
          {
            label: 'DSC03721.JPG',
            filename: 'DSC03721.JPG',
            name: 'DSC03721',
            id: 'item-jpg-0',
            path: 'harddrive-jpgs',
            mediumType: 'image',
            ext: 'JPG',
            absolutePath: 'harddrive-jpgs/DSC03721.JPG',
          },
        ]],
        ['DSC03722', [
          {
            label: 'DSC03722.RAW',
            filename: 'DSC03722.RAW',
            name: 'DSC03722',
            id: 'item-raw-1',
            path: 'harddrive-raws',
            mediumType: 'image',
            ext: 'RAW',
            absolutePath: 'harddrive-raws/DSC03722.RAW',
          },
          {
            label: 'DSC03722.JPG',
            filename: 'DSC03722.JPG',
            name: 'DSC03722',
            id: 'item-jpg-1',
            path: 'harddrive-jpgs',
            mediumType: 'image',
            ext: 'JPG',
            absolutePath: 'harddrive-jpgs/DSC03722.JPG',
          },
        ]],
        ['DSC03723', [
          {
            label: 'DSC03723.RAW',
            filename: 'DSC03723.RAW',
            name: 'DSC03723',
            id: 'item-raw-2',
            path: 'harddrive-raws',
            mediumType: 'image',
            ext: 'RAW',
            absolutePath: 'harddrive-raws/DSC03723.RAW',
          },
          {
            label: 'DSC03723.JPG',
            filename: 'DSC03723.JPG',
            name: 'DSC03723',
            id: 'item-jpg-2',
            path: 'harddrive-jpgs',
            mediumType: 'image',
            ext: 'JPG',
            absolutePath: 'harddrive-jpgs/DSC03723.JPG',
          },
        ]],
        ['DSC03724', [
          {
            label: 'DSC03724.RAW',
            filename: 'DSC03724.RAW',
            name: 'DSC03724',
            id: 'item-raw-3',
            path: 'harddrive-raws',
            mediumType: 'image',
            ext: 'RAW',
            absolutePath: 'harddrive-raws/DSC03724.RAW',
          },
          {
            label: 'DSC03724.JPG',
            filename: 'DSC03724.JPG',
            name: 'DSC03724',
            id: 'item-jpg-3',
            path: 'harddrive-jpgs',
            mediumType: 'image',
            ext: 'JPG',
            absolutePath: 'harddrive-jpgs/DSC03724.JPG',
          },
        ]],
      ])
      const generated = generateImageFilenames(8, 'jpgraw')
      const received = associateMedia(generated)
      expect(received.grouped).toEqual(expected)
      expect(received.flat).toEqual(generated)
    })

    test('check immutability', () => {
      const generated = generateImageFilenames(8, 'jpgraw')
      associateMedia(generated)
      expect(generateImageFilenames(8, 'jpgraw')).toEqual(generated)
    })

    test('MOV and MP4', () => {
      const movs: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-mov-${k}`,
        path: 'harddrive-movs',
        label: `VID${k + 1}.MOV`,
        filename: `VID${k + 1}.MOV`,
        name: `VID${k + 1}`,
        mediumType: 'video',
        ext: 'MOV',
        absolutePath: `harddrive-movs/VID${k + 1}.MOV`,
      }))
      const mp4s: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-mp4-${k}`,
        path: 'harddrive-mp4s',
        label: `VID${k + 1}.MP4`,
        filename: `VID${k + 1}.MP4`,
        name: `VID${k + 1}`,
        mediumType: 'video',
        ext: 'MP4',
        absolutePath: `harddrive-mp4s/VID${k + 1}.MP4`,
      }))
      const files = movs.concat(mp4s)
      const expected = new Map([
        ['VID1', [movs[0], mp4s[0]]],
        ['VID2', [movs[1], mp4s[1]]],
      ])
      const received = associateMedia(files)
      expect(received.grouped).toEqual(expected)
      expect(received.flat).toEqual(files)
    })

    test('JPG, MOV and MP4', () => {
      const movs: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-mov-${k}`,
        path: 'harddrive-movs',
        label: `VID${k + 1}.MOV`,
        filename: `VID${k + 1}.MOV`,
        name: `VID${k + 1}`,
        mediumType: 'video',
        ext: 'MOV',
        absolutePath: `harddrive-movs/VID${k + 1}.MOV`,
      }))
      const mp4s: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-mp4-${k}`,
        path: 'harddrive-mp4s',
        label: `VID${k + 1}.MP4`,
        filename: `VID${k + 1}.MP4`,
        name: `VID${k + 1}`,
        mediumType: 'video',
        ext: 'MP4',
        absolutePath: `harddrive-mp4s/VID${k + 1}.MP4`,
      }))
      const jpgs: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-jpg-${k}`,
        path: 'harddrive-jpgs',
        label: `VID${k + 1}.JPG`,
        filename: `VID${k + 1}.JPG`,
        name: `VID${k + 1}`,
        mediumType: 'image',
        ext: 'JPG',
        absolutePath: `harddrive-jpgs/VID${k + 1}.JPG`,
      }))
      const files = movs.concat(mp4s).concat(jpgs)
      const expected = new Map([
        ['VID1', [movs[0], mp4s[0], jpgs[0]]],
        ['VID2', [movs[1], mp4s[1], jpgs[1]]],
      ])
      const received = associateMedia(files)
      expect(received.grouped).toEqual(expected)
      expect(received.flat).toEqual(files)
    })
  })

  describe('mergeMedia', () => {
    test('JPG and RAW', () => {
      const generated = generateImageFilenames(8, 'jpgraw')
      const received = mergeMedia(associateMedia(generated))
      const expected: Filesystem[] = [
        {
          label: 'DSC03721 +JPG +RAW',
          filename: 'DSC03721.JPG',
          id: 'item-jpg-0',
          path: 'harddrive-jpgs',
          mediumType: 'image',
          ext: 'JPG',
          name: 'DSC03721',
          absolutePath: 'harddrive-jpgs/DSC03721.JPG',
        },
        {
          label: 'DSC03722 +JPG +RAW',
          filename: 'DSC03722.JPG',
          id: 'item-jpg-1',
          path: 'harddrive-jpgs',
          mediumType: 'image',
          ext: 'JPG',
          name: 'DSC03722',
          absolutePath: 'harddrive-jpgs/DSC03722.JPG',
        },
        {
          label: 'DSC03723 +JPG +RAW',
          filename: 'DSC03723.JPG',
          id: 'item-jpg-2',
          path: 'harddrive-jpgs',
          mediumType: 'image',
          ext: 'JPG',
          name: 'DSC03723',
          absolutePath: 'harddrive-jpgs/DSC03723.JPG',
        },
        {
          label: 'DSC03724 +JPG +RAW',
          filename: 'DSC03724.JPG',
          id: 'item-jpg-3',
          path: 'harddrive-jpgs',
          mediumType: 'image',
          ext: 'JPG',
          name: 'DSC03724',
          absolutePath: 'harddrive-jpgs/DSC03724.JPG',
        },
      ]
      expect(received).toEqual(expected)
    })

    test('check immutability', () => {
      const generated = generateImageFilenames(8, 'jpgraw')
      mergeMedia(associateMedia(generated))
      expect(generateImageFilenames(8, 'jpgraw')).toEqual(generated)
    })

    test('DOC and RAW', () => {
      const generated = generateImageFilenames(8, 'docraw')
      const received = mergeMedia(associateMedia(generated))
      expect(received).toEqual(generated)
    })

    test('with Up Directory nav', () => {
      const generated = generateImageFilenames(8, 'docraw')
      addParentDirectoryNav(generated, 'fake')
      const received = mergeMedia(associateMedia(generated))
      expect(received).toEqual(generated)
    })

    test('MOV and MP4', () => {
      const movs: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-mov-${k}`,
        path: 'harddrive-movs',
        label: `VID${k + 1}.MOV`,
        filename: `VID${k + 1}.MOV`,
        name: `VID${k + 1}`,
        mediumType: 'video',
        ext: 'MOV',
        absolutePath: `harddrive-movs/VID${k + 1}.MOV`,
      }))
      const mp4s: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-mp4-${k}`,
        path: 'harddrive-mp4s',
        label: `VID${k + 1}.MP4`,
        filename: `VID${k + 1}.MP4`,
        name: `VID${k + 1}`,
        mediumType: 'video',
        ext: 'MP4',
        absolutePath: `harddrive-mp4s/VID${k + 1}.MP4`,
      }))
      const files = movs.concat(mp4s)
      const received = mergeMedia(associateMedia(files))
      const expected: Filesystem[] = [
        {
          ...mp4s[0],
          label: 'VID1 +MOV +MP4',
        },
        {
          ...mp4s[1],
          label: 'VID2 +MOV +MP4',
        },
      ]
      expect(received).toEqual(expected)
    })

    test('JPG, MOV and MP4', () => {
      const movs: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-mov-${k}`,
        path: 'harddrive-movs',
        label: `VID${k + 1}.MOV`,
        filename: `VID${k + 1}.MOV`,
        name: `VID${k + 1}`,
        mediumType: 'video',
        ext: 'MOV',
        absolutePath: `harddrive-movs/VID${k + 1}.MOV`,
      }))
      const mp4s: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-mp4-${k}`,
        path: 'harddrive-mp4s',
        label: `VID${k + 1}.MP4`,
        filename: `VID${k + 1}.MP4`,
        name: `VID${k + 1}`,
        mediumType: 'video',
        ext: 'MP4',
        absolutePath: `harddrive-mp4s/VID${k + 1}.MP4`,
      }))
      const jpgs: Filesystem[] = [...Array(2).keys()].map((k) => ({
        id: `item-jpg-${k}`,
        path: 'harddrive-jpgs',
        label: `VID${k + 1}.JPG`,
        filename: `VID${k + 1}.JPG`,
        name: `VID${k + 1}`,
        mediumType: 'image',
        ext: 'JPG',
        absolutePath: `harddrive-jpgs/VID${k + 1}.JPG`,
      }))
      const files = movs.concat(mp4s).concat(jpgs)
      const received = mergeMedia(associateMedia(files))
      const expected: Filesystem[] = [
        {
          ...jpgs[0],
          label: 'VID1 +JPG +MOV +MP4',
        },
        {
          ...jpgs[1],
          label: 'VID2 +JPG +MOV +MP4',
        },
      ]
      expect(received).toEqual(expected)
    })
  })

  describe('getJpgLike', () => {
    test('JPG', () => {
      const fileGroup = associateMedia(generateImageFilenames(2, 'jpgraw')).grouped.get('DSC03721')
      if (!fileGroup) {
        fail('Mock data is bad')
      }
      const received = getJpgLike(fileGroup)
      expect(received?.ext).toEqual('JPG')
      expect(received?.index).toEqual(1)
    })

    test('JPEG', () => {
      const fileGroup = associateMedia(generateImageFilenames(1, 'jpeg')).grouped.get('DSC03721')
      if (!fileGroup) {
        fail('Mock data is bad')
      }
      const received = getJpgLike(fileGroup)
      expect(received?.ext).toEqual('JPEG')
      expect(received?.index).toEqual(0)
    })

    test('check immutability', () => {
      const fileGroup = associateMedia(generateImageFilenames(1, 'jpeg')).grouped.get('DSC03721')
      if (!fileGroup) {
        fail('Mock data is bad')
      }
      const generated = generateImageFilenames(1, 'jpeg')
      getJpgLike(fileGroup)
      expect(generateImageFilenames(1, 'jpeg')).toEqual(generated)
    })
  })
})
