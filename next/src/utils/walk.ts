import config from '../../../config.json'
import { type ItemFile } from '../../pages/admin/walk'
import type { Filesystem } from '../lib/filesystems'

export function isImage(file: Filesystem) {
  return (
    file.mediumType === 'image'
    && config.supportedFileTypes.photo.includes(file.ext.toLowerCase())
  )
}

/**
 * Read hash in URL
 * @param find it's always "path"
 * @param from URL with path is located
 */
export function parseHash(find: 'path', from: string) {
  const found = RegExp(`[#&]${find}(=([^&#]*)|&|#|$)`).exec(from)
  return found?.[2] ?? null
}

export function addParentDirectoryNav(itemFiles: ItemFile[], path: string) {
  const file: ItemFile = {
    filename: '..',
    content: '..',
    name: 'UpDirectory',
    mediumType: 'folder',
    id: 'item-up-directory',
  }

  if (path) {
    if (path.lastIndexOf('/') > -1) {
      const splitPath = path.split('/')
      splitPath.pop()
      itemFiles.unshift({
        ...file,
        path: splitPath.join('/'),
      })
    } else {
      itemFiles.unshift({
        ...file,
        path: '',
      })
    }
  }

  return itemFiles
}

export function isAnyImageOrVideo(file: Filesystem) {
  const images = file.mediumType === 'image'
    && (config.supportedFileTypes.photo.includes(file.ext.toLowerCase())
      || config.rawFileTypes.photo.includes(file.ext.toLowerCase()))
  const videos = file.mediumType === 'video'
    && (config.supportedFileTypes.video.includes(file.ext.toLowerCase())
      || config.rawFileTypes.video.includes(file.ext.toLowerCase()))
  return images || videos
}

export function associateMedia(items: ItemFile[]) {
  // `data` is an array of objects, `key` is the key (or property accessor) to group by
  // reduce runs this anonymous function on each element of `data` (the `item` parameter,
  // returning the `storage` parameter at the end
  const groupBy = (data: object[], key: keyof typeof items) => data.reduce((storage, item) => {
    // get the first instance of the key by which we're grouping
    const group = item[key]

    // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
    // eslint-disable-next-line no-param-reassign
    storage[group] = storage[group] || []

    // add this item to its group within `storage`
    storage[group].push(item)

    // return the updated storage to the reduce function, which will then loop through the next
    return storage
  }, {}) // {} is the initial value of the storage

  if (items instanceof Array) {
    return {
      grouped: groupBy(items, 'name'),
      flat: items,
    }
  }

  return { flat: items }
}

export function generateImageFilenames(fullCount = 6, extSet = 'jpgraw') {
  const halfCount = Math.floor(fullCount / 2)

  const docs = (setCount = halfCount) => [...Array(setCount).keys()].map((k) => ({
    id: `item-doc-${k}`,
    content: `Document${k + 1}.DOC`,
    filename: `Document${k + 1}.DOC`,
    name: `Document${k + 1}`,
    mediumType: 'text',
    ext: 'DOC',
  }))

  const jpgs = (setCount = halfCount) => [...Array(setCount).keys()].map((k) => ({
    id: `item-jpg-${k}`,
    content: `DSC0372${k + 1}.JPG`,
    filename: `DSC0372${k + 1}.JPG`,
    name: `DSC0372${k + 1}`,
    mediumType: 'image',
    ext: 'JPG',
  }))

  const jpegs = (setCount = halfCount) => [...Array(setCount).keys()].map((k) => ({
    id: `item-jpeg-${k}`,
    content: `DSC0372${k + 1}.JPEG`,
    filename: `DSC0372${k + 1}.JPEG`,
    name: `DSC0372${k + 1}`,
    mediumType: 'image',
    ext: 'JPEG',
  }))

  const raws = (setCount = halfCount) => [...Array(setCount).keys()].map((k) => ({
    id: `item-raw-${k}`,
    content: `DSC0372${k + 1}.RAW`,
    filename: `DSC0372${k + 1}.RAW`,
    name: `DSC0372${k + 1}`,
    mediumType: 'image',
    ext: 'RAW',
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

export function getJpgLike(fileGroup: typeof associateMedia) {
  const isJpgLikeExt = (file = { ext: '' }) => file.ext === 'JPG' || file.ext === 'jpg'
  const withJpg = fileGroup.find(isJpgLikeExt)
  if (withJpg) {
    return {
      ext: withJpg.ext,
      index: fileGroup.findIndex(isJpgLikeExt),
    }
  }

  const isJpegLikeExt = (file = { ext: '' }) => file.ext === 'JPEG' || file.ext === 'jpeg'
  const withJpeg = fileGroup.find(isJpegLikeExt)
  if (withJpeg) {
    return {
      ext: withJpeg.ext,
      index: fileGroup.findIndex(isJpegLikeExt),
    }
  }

  return null
}

export function mergeMedia(items: typeof associateMedia) {
  const merged = Object.keys(items.grouped).map((name) => {
    const fileGroup = items.grouped[name]

    const jpgLike = getJpgLike(fileGroup)

    if (jpgLike === null) {
      return items.flat.find((file) => file.name === name)
    }

    // TODO danctive only group if in config supportedFileTypes (ie JPG + RAW, but not JPG + FAKE)
    const found = items.flat.find(
      (file) => file.filename === fileGroup[jpgLike.index].filename,
    )
    return {
      ...found,
      content: fileGroup.reduce((acc, next) => `${acc} +${next.ext}`, name),
    }
  })

  return merged
}

export function organizeByMedia(items: ItemFile[]) {
  return mergeMedia(associateMedia(items))
}
