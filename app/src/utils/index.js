// eslint-disable-next-line import/prefer-default-export
export function getExt(filenames) {
  if (!filenames) return null
  const filename = Array.isArray(filenames) ? filenames[0] : filenames
  const extDot = filename.lastIndexOf('.') + 1
  const extension = filename.substring(extDot)
  return extension.toLowerCase()
}
