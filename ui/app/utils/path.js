export function getExt(filename) {
  const extDot = filename.lastIndexOf('.') + 1;
  const extension = filename.substring(extDot);
  return extension.toLowerCase();
}
