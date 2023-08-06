export function getExt(filenames) {
  if (!filenames) return null
  const filename = Array.isArray(filenames) ? filenames[0] : filenames
  const extDot = filename.lastIndexOf('.') + 1
  const extension = filename.substring(extDot)
  return extension.toLowerCase()
}

export function removeUndefinedFields <T>(obj: T): T {
  const acc: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) acc[key] = obj[key]
  }
  return acc as T
}
