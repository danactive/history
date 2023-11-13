import path from 'node:path'

import utilsFactory from '../lib/utils'

const { IMAGE_BASE_URL = '' } = process.env

type Filesystem = {
  id: string;
  label: string;
  ext: string;
  name: string;
  filename: string;
  path: string;
  absolutePath: string; // Temporary until next folder moves to root
  mediumType: string;
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
    mediumType: mediumType || 'folder',
    id: filePath,
    path: filePath,
    absolutePath: `${IMAGE_BASE_URL}${filePath}`,
    ext: fileExt,
    name: fileName,
  }
}

export { type Filesystem }
export default transform
