import config from '../models/config'
import type { Walk } from '../types/pages'
import type { Filesystem } from '../lib/filesystems'

export function isImage(file: Partial<Filesystem>) {
  return (
    file.ext
    && file.mediumType === 'image'
    && config.supportedFileTypes.photo.includes(file.ext.toLowerCase())
  )
}

/**
 * Append a parent directory navigation item to the beginning of the itemFiles array.
 * @param {string[]} itemFiles filesystem items
 * @param {string} path blank for root
 * @returns {string[]}
 */
export function addParentDirectoryNav(itemFiles: Walk.ItemFile[], path: string | null | undefined) {
  const file: Walk.ItemFile = {
    path: 'harddrive',
    filename: '..',
    label: '..',
    name: 'UpDirectory',
    mediumType: 'folder',
    id: 'item-up-directory',
    ext: '',
    absolutePath: '',
  }

  if (path && path !== '' && path !== '/') {
    // Remove leading/trailing slashes, split, pop last segment
    const segments = path.replace(/^\/|\/$/g, '').split('/')
    segments.pop()
    // If no segments left, parent is root
    const parentPath = segments.length === 0 ? '/' : `/${segments.join('/')}`
    return [
      { ...file, path: parentPath },
      ...itemFiles,
    ]
  }

  return [...itemFiles]
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

export function associateMedia(items: Walk.ItemFile | Walk.ItemFile[]) {
  // `data` is an array of objects, `key` is the key (or property accessor) to group by
  // reduce runs this anonymous function on each element of `data` (the `item` parameter,
  // returning the `storage` parameter at the end
  const groupBy = (data: Walk.ItemFile[], key: NonNullable<keyof typeof data[0]>) => data.reduce((out: Map<string, Walk.ItemFile[]>, item) => {
    // get the first instance of the key by which we're grouping
    const groupKey = item[key]

    if (groupKey === undefined) { return out }
    // set `storage` for this instance of group to the outer scope (if not empty) or initialize it

    const groupKeyStr = String(groupKey)
    if (!out.has(groupKeyStr)) {
      out.set(groupKeyStr, [])
    }

    // add this item to its group within `storage`
    out.get(groupKeyStr)!.push(item)

    // return the updated storage to the reduce function, which will then loop through the next
    return out
  }, new Map<string, Walk.ItemFile[]>())

  if (items instanceof Array) {
    return {
      grouped: groupBy(items, 'name'),
      flat: items,
    }
  }

  throw new Error('Flat only')
}

export function getJpgLike(fileGroup: Walk.ItemFile[]) {
  // Prefer JPG
  const isJpgLikeExt = (file: Walk.ItemFile) => file.ext === 'JPG' || file.ext === 'jpg'
  const withJpg = fileGroup.find(isJpgLikeExt)
  if (withJpg) {
    return {
      ext: withJpg.ext,
      index: fileGroup.findIndex(isJpgLikeExt),
    }
  }

  // Then JPEG
  const isJpegLikeExt = (file: Walk.ItemFile) => file.ext === 'JPEG' || file.ext === 'jpeg'
  const withJpeg = fileGroup.find(isJpegLikeExt)
  if (withJpeg) {
    return {
      ext: withJpeg.ext,
      index: fileGroup.findIndex(isJpegLikeExt),
    }
  }

  // Then MP4 (for video)
  const isMp4 = (file: Walk.ItemFile) => file.ext === 'MP4' || file.ext === 'mp4'
  const withMp4 = fileGroup.find(isMp4)
  if (withMp4) {
    return {
      ext: withMp4.ext,
      index: fileGroup.findIndex(isMp4),
    }
  }

  // Then MOV (for video)
  const isMov = (file: Walk.ItemFile) => file.ext === 'MOV' || file.ext === 'mov'
  const withMov = fileGroup.find(isMov)
  if (withMov) {
    return {
      ext: withMov.ext,
      index: fileGroup.findIndex(isMov),
    }
  }

  return null
}

export function mergeMedia(items: ReturnType<typeof associateMedia>) {
  return Array.from(items.grouped.entries()).map(([name, fileGroup]): Walk.ItemFile => {
    // try to find the "jpg-like" item in the group
    const jpgLike = getJpgLike(fileGroup)

    // if not found in the group, look it up in the flat list by name
    if (jpgLike === null) {
      const foundJpgLike = items.flat.find((file) => file.name === name)
      if (!foundJpgLike) {
        throw new ReferenceError('Missing found JPG-like item')
      }
      return foundJpgLike
    }

    const found = items.flat.find(
      (file) => file.filename === fileGroup[jpgLike.index].filename,
    )

    if (!found) {
      throw new ReferenceError('Missing found item')
    }

    // Build label in alphabetical order of ext
    const sortedGroup = [...fileGroup].sort((a, b) => a.ext.localeCompare(b.ext))
    return {
      ...found,
      label: sortedGroup.reduce(
        (acc: string, next: Walk.ItemFile) => `${acc} +${next.ext}`,
        name,
      ),
    }
  })
}

export function organizeByMedia(items: Walk.ItemFile[]) {
  return mergeMedia(associateMedia(items))
}
