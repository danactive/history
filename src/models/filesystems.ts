import path from 'node:path'

import utilsFactory from '../lib/utils'

type Filesystem = {
  id: string;
  label: string;
  ext: string;
  name: string;
  filename: string;
  path: string;
  absolutePath: string;
  mediumType: 'folder' | 'image' | 'video' | 'unknown' | 'text' | 'xml';
}

const utils = utilsFactory()

function transform(file: string, { destinationPath, globPath }: { destinationPath: string, globPath: string }): Filesystem {
  const fileExt = utils.type(file) // case-insensitive
  const fileName = path.basename(file, `.${fileExt}`)
  const mediumType = utils.mediumType(utils.mimeType(fileExt))
  const filePath = file.replace(globPath, destinationPath)
  const filename = (fileExt === '') ? fileName : `${fileName}.${fileExt}`

  return {
    filename,
    label: filename,
    mediumType,
    id: filePath,
    path: filePath,
    absolutePath: filePath,
    ext: fileExt,
    name: fileName,
  }
}

export { type Filesystem }
export default transform
